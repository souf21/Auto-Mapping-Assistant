// src/pages/upload.js
import { useState } from "react";
import { useRouter } from "next/router";
import DashboardHeader from "../components/DashboardHeader";
import { getToken } from "../utils/auth";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setError("");
    const selected = e.target.files[0];

    if (!selected) return;

    const allowed = [".csv", ".tsv", ".json", ".xlsx", ".xls", ".xml", ".pdf"]; 
    const ext = selected.name.substring(selected.name.lastIndexOf(".")).toLowerCase(); 
    if (!allowed.includes(ext)) { 
      setError("Unsupported file type"); 
      return; 
    }

    setFile(selected);
  };

  const handleUpload = async () => {
  if (!file) {
    setError("Please select a file first");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/upload/file", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Upload failed");
    }

    const data = await res.json();

    router.push({
      pathname: "/mapping",
      query: { fileId: data.fileId },
    });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="p-6 max-w-2xl mx-auto">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Import Customers</h1>
          <p className="text-gray-500 mt-1">
            Upload a CSV file to begin importing your customer list
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload CSV File
          </h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Drag & Drop Upload Box */}
          <label
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                aria-hidden="true"
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a4 4 0 010 8h-1m-4 4v-8m0 0l-3 3m3-3l3 3"
                />
              </svg>

              <p className="text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-gray-400 text-sm mt-1">CSV file only</p>
            </div>

            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected File */}
          {file && (
            <p className="mt-4 text-gray-700">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-sm transition"
          >
            {loading ? "Uploading..." : "Continue to Mapping"}
          </button>
        </div>
      </div>
    </div>
  );
}
