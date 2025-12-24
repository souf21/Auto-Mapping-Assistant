import { useState } from "react";
import { getToken } from "../utils/auth";

export default function ImportModal({ fileId, mapping, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const startImport = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/upload/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ fileId, mapping }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import failed");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl border border-gray-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Import Customers</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-700 bg-red-100 border border-red-300 p-2 rounded-md mb-4">
            {error}
          </p>
        )}

        {/* BEFORE IMPORT */}
        {!result && (
          <>
            <p className="text-gray-700 mb-4">
              Click the button below to start importing your customers.
            </p>

            <button
              onClick={startImport}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-sm transition cursor-pointer"
            >
              {loading ? "Importing..." : "Start Import"}
            </button>
          </>
        )}

        {/* AFTER IMPORT */}
        {result && (
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Import Summary
                </h3>

                <div className="space-y-1 text-gray-800">
                <p>Total Rows: {result.totalRows}</p>
                <p>Successfully Imported: {result.successCount}</p>
                <p>Duplicates: {result.duplicateRows.length}</p>
                <p>Errors: {result.errorRows.length}</p>
                </div>

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                <button
                    onClick={onClose}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-md shadow-sm transition cursor-pointer"
                >
                    Close
                </button>

                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-sm transition cursor-pointer"
                >
                    Go to Dashboard
                </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
