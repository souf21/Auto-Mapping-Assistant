// src/routes/uploadRoutes.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const auth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadCsv");
const Customer = require("../models/Customer");

const Papa = require("papaparse");
const XLSX = require("xlsx");
const xml2js = require("xml2js");

const router = express.Router();

/* -------------------------------------------------------
   FILE TYPE DETECTION
------------------------------------------------------- */
function detectExtension(file) {
  
  return path.extname(file.originalname).toLowerCase().replace(".", "");
}

/* -------------------------------------------------------
   PARSERS
------------------------------------------------------- */

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(filePath), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data || [],
        });
      },
      error: reject,
    });
  });
}

function parseTSV(filePath) {
  return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(filePath), {
      header: true,
      skipEmptyLines: true,
      delimiter: "\t",
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data || [],
        });
      },
      error: reject,
    });
  });
}

async function parseJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return {
      headers: parsed[0] ? Object.keys(parsed[0]) : [],
      rows: parsed,
    };
  }

  // JSON object with nested array
  const firstKey = Object.keys(parsed)[0];
  const arr = parsed[firstKey];

  if (!Array.isArray(arr)) {
    throw new Error("JSON must contain an array of objects");
  }

  return {
    headers: arr[0] ? Object.keys(arr[0]) : [],
    rows: arr,
  };
}

async function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error("Excel file contains no sheets");
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  return {
    headers: rows[0] ? Object.keys(rows[0]) : [],
    rows,
  };
}

async function parseXML(filePath) {
  const xmlContent = fs.readFileSync(filePath, "utf8");
  const parsed = await xml2js.parseStringPromise(xmlContent);

  const rootKey = Object.keys(parsed)[0];
  const root = parsed[rootKey];

  // Find the first array inside the root (customer, client, row, item, etc.)
  const arrayKey = Object.keys(root).find(
    (key) => Array.isArray(root[key])
  );

  if (!arrayKey) {
    throw new Error("XML structure not supported: no list of items found");
  }

  const items = root[arrayKey];

  const rows = items.map((node) => {
    const obj = {};
    for (const key of Object.keys(node)) {
      obj[key] = node[key]?.[0] ?? "";
    }
    return obj;
  });

  return {
    headers: rows[0] ? Object.keys(rows[0]) : [],
    rows,
  };
}


async function parseFile(file) {
  const ext = detectExtension(file);

  switch (ext) {
    case "csv":
      return parseCSV(file.path);
    case "tsv":
      return parseTSV(file.path);
    case "json":
      return parseJSON(file.path);
    case "xlsx":
    case "xls":
      return parseExcel(file.path);
    case "xml":
      return parseXML(file.path);
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

/* -------------------------------------------------------
   UPLOAD + PARSE
------------------------------------------------------- */

router.post("/file", auth, upload.single("file"), async (req, res, next) => {
  console.log("UPLOAD ROUTE HIT"); console.log("req.file =", req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parsed = await parseFile(req.file);

    if (!parsed.headers.length) {
      return res.status(400).json({ message: "Could not detect headers" });
    }

    const fileId = path.basename(req.file.path);

    // Move file to tmp folder
    const storePath = path.join(__dirname, "..", "uploads", "tmp", fileId);
    fs.renameSync(req.file.path, storePath);

    return res.json({
      fileId,
      headers: parsed.headers,
      sampleRows: parsed.rows.slice(0, 5),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(400).json({ message: err.message });
  }
});

/* -------------------------------------------------------
   PREVIEW
------------------------------------------------------- */

router.get("/preview/:fileId", auth, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const filePath = path.join(__dirname, "..", "uploads", "tmp", fileId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const parsed = await parseFile({ path: filePath, originalname: fileId });

    return res.json({
      fileId,
      headers: parsed.headers,
      sampleRows: parsed.rows.slice(0, 5),
    });
  } catch (err) {
    console.error("Preview error:", err);
    return res.status(400).json({ message: err.message });
  }
});

/* -------------------------------------------------------
   IMPORT
------------------------------------------------------- */

router.post("/import", auth, async (req, res) => {
  try {
    const { fileId, mapping } = req.body;

    if (!fileId || !mapping) {
      return res.status(400).json({ message: "Missing fileId or mapping" });
    }

    const filePath = path.join(__dirname, "..", "uploads", "tmp", fileId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const parsed = await parseFile({ path: filePath, originalname: fileId });
    const rows = parsed.rows;

    let successCount = 0;
    let errorRows = [];
    let duplicateRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const customer = {
        fullName: row[mapping.fullName],
        companyName: row[mapping.companyName],
        email: row[mapping.email],
        phoneNumber: row[mapping.phone],
        fullAddress: row[mapping.address],
        language: row[mapping.language],
        brandId: req.brand.id,
      };

      if (
        !customer.fullName ||
        !customer.companyName ||
        !customer.email ||
        !customer.phoneNumber ||
        !customer.fullAddress ||
        !customer.language
      ) {
        errorRows.push({ row: i + 1, reason: "Missing required fields" });
        continue;
      }

      const existing = await Customer.findOne({
        email: customer.email,
        brandId: req.brand.id,
      });

      if (existing) {
        duplicateRows.push({ row: i + 1, email: customer.email });
        continue;
      }

      await Customer.create(customer);
      successCount++;
    }

    return res.json({
      successCount,
      errorRows,
      duplicateRows,
      totalRows: rows.length,
    });
  } catch (err) {
    console.error("Import error:", err);
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
