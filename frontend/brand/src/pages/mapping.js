// src/pages/mapping.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardHeader from "../components/DashboardHeader";
import { getToken } from "../utils/auth";
import ImportModal from "../components/ImportModal";

export default function MappingPage() {
  const router = useRouter();
  const { fileId } = router.query;

  const [mappingProgress, setMappingProgress] = useState(0);
  const [mappingDone, setMappingDone] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [error, setError] = useState("");

  const requiredFields = [
    { key: "fullName", label: "Full Name" },
    { key: "companyName", label: "Company Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "language", label: "Language" },
  ];

  useEffect(() => {
    if (!fileId) return;

    fetch(`http://localhost:5000/upload/preview/${fileId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHeaders(data.headers || []);
        setSampleRows(data.sampleRows || []);
      })
      .catch(() => setError("Failed to load CSV preview"));
  }, [fileId]);

  const handleMappingChange = (crmField, csvColumn) => {
    setMapping({
      ...mapping,
      [crmField]: csvColumn,
    });
  };

  useEffect(() => {
    if (headers.length === 0) return;

    const fetchAutoMapping = async () => {
      setMappingProgress(0);
      setMappingDone(false);

      const progressInterval = setInterval(() => {
        setMappingProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 300);

      try {
        const res = await fetch("http://localhost:5000/api/auto-map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers,
            schema: requiredFields.map(({ key, label }) => ({ key, label })),
          }),
        });

        const data = await res.json();

        if (data.mapping) {
          const reversed = {};
          for (const [uploaded, internal] of Object.entries(data.mapping)) {
            reversed[internal] = uploaded;
          }
          setMapping(reversed);
        }

        setMappingProgress(100);
        setMappingDone(true);
      } catch (err) {
        console.error("Auto-mapping failed:", err);
      } finally {
        clearInterval(progressInterval);
      }
    };

    fetchAutoMapping();
  }, [headers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="p-6 max-w-3xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Map CSV Columns
          </h1>
          <p className="text-gray-700 mt-1">
            Match your CSV columns to the required CRM fields
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-700 mb-4 bg-red-100 p-3 rounded-md border border-red-300">
            {error}
          </p>
        )}

        {/* Progress Bar */}
        {mappingProgress > 0 && !mappingDone && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Auto-mapping in progress...</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${mappingProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {mappingDone && (
          <div className="mb-6 transition-all duration-500">
            <p className="text-green-700 font-medium">✅ Mapping complete!</p>
          </div>
        )}

        {/* Mapping Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
            Required Field Mapping
          </h2>

          <div className="space-y-4">
            {requiredFields.map((field) => (
              <div
                key={field.key}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4"
              >
                <div className="font-medium text-gray-900 w-40">
                  {field.label}
                </div>

                <select
                  className="border border-gray-300 rounded-md p-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                  value={mapping[field.key] || ""}
                  onChange={(e) =>
                    handleMappingChange(field.key, e.target.value)
                  }
                >
                  <option value="">-- Select Column --</option>
                  {headers.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Rows Preview */}
        {sampleRows.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
              Sample Data Preview
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="border p-2 text-left text-gray-900">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {headers.map((h) => (
                        <td key={h} className="border p-2 text-gray-800">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Continue Button (only after mapping is done) */}
        {mappingDone && (
          <div className="mt-4">
            <button
              onClick={() => {
                localStorage.setItem("csvMapping", JSON.stringify(mapping));
                setShowImportModal(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-sm transition cursor-pointer"
            >
              Continue to Import
            </button>
          </div>
        )}



      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          fileId={fileId}
          mapping={mapping}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
