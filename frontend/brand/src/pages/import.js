// src/pages/import.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardHeader from "../components/DashboardHeader";
import { getToken } from "../utils/auth";

export default function ImportPage() {
  const router = useRouter();
  const { fileId } = router.query;

  const [mapping, setMapping] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedMapping = localStorage.getItem("csvMapping");
    if (savedMapping) {
      setMapping(JSON.parse(savedMapping));
    }
  }, []);

  const startImport = async () => {
    if (!mapping) {
      setError("Mapping not found");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/upload/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          fileId,
          mapping,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Import failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="p-6 max-w-3xl mx-auto">

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 tracking-tight">
          Import Customers
        </h1>

        {/* Error */}
        {error && (
          <p className="text-red-700 bg-red-100 border border-red-300 p-3 rounded-md mb-6">
            {error}
          </p>
        )}

        {/* BEFORE IMPORT */}
        {!result && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
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
          </div>
        )}

        {/* AFTER IMPORT */}
        {result && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
              Import Summary
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">Total Rows</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {result.totalRows}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">Successfully Imported</p>
                <p className="text-2xl font-semibold text-green-700">
                  {result.successCount}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">Duplicates</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {result.duplicateRows.length}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">Errors</p>
                <p className="text-2xl font-semibold text-red-600">
                  {result.errorRows.length}
                </p>
              </div>

            </div>

            {/* Back Button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-sm transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
