// src/middlewares/uploadCsv.js
const multer = require("multer");
const path = require("path");

// Storage config: save files to /uploads/tmp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "tmp"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Allow multiple file types
const allowedExtensions = [
  ".csv",
  ".tsv",
  ".json",
  ".xlsx",
  ".xls",
  ".xml",
  ".pdf" // optional, parser not implemented yet
];

const allowedMimeTypes = [
  "text/csv",
  "text/tab-separated-values",
  "application/json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/xml",
  "application/xml",
  "application/pdf"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
