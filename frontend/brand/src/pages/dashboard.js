// src/pages/dashboard.js
import { useEffect, useState } from "react";
import {
  getCustomers,
  deleteCustomer,
  createCustomer,
} from "../services/customerService";
import DashboardHeader from "../components/DashboardHeader";

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    fullAddress: "",
    language: "en",
  });

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      if (
        !form.fullName ||
        !form.companyName ||
        !form.email ||
        !form.phoneNumber ||
        !form.fullAddress ||
        !form.language
      ) {
        setFormError("All fields are required");
        setSaving(false);
        return;
      }

      if (!/\S+@\S+\.\S+/.test(form.email)) {
        setFormError("Invalid email format");
        setSaving(false);
        return;
      }

      if (form.phoneNumber.length < 6) {
        setFormError("Phone number is too short");
        setSaving(false);
        return;
      }

      await createCustomer(form);

      setForm({
        fullName: "",
        companyName: "",
        email: "",
        phoneNumber: "",
        fullAddress: "",
        language: "en",
      });

      setSuccessMessage("Customer added successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);

      loadCustomers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="p-6 max-w-5xl mx-auto">

        {/* Header + Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Customers</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your customer database
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              {showForm ? "Hide Form" : "Add Customer"}
            </button>

            <button
              onClick={() => (window.location.href = "/upload")}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white shadow-sm transition"
            >
              Import
            </button>
          </div>
        </div>

        {/* Collapsible Form */}
        {showForm && (
          <div className="mb-10 p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Add Customer
            </h2>

            {formError && <p className="text-red-500 mb-3">{formError}</p>}
            {successMessage && (
              <p className="text-green-600 mb-3">{successMessage}</p>
            )}

            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
              />

              <input
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name="companyName"
                placeholder="Company Name"
                value={form.companyName}
                onChange={handleChange}
              />

              <input
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />

              <input
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange}
              />

              <input
                className="border rounded-md p-2 md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name="fullAddress"
                placeholder="Full Address"
                value={form.fullAddress}
                onChange={handleChange}
              />

              <select
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                name="language"
                value={form.language}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white p-2 rounded-md md:col-span-2 hover:bg-gray-900 transition"
              >
                {saving ? "Saving..." : "Add Customer"}
              </button>
            </form>
          </div>
        )}

        {/* Customer List */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Customer List
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-500">No customers yet.</p>
        ) : (
          customers.map((c) => (
            <div
              key={c._id}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center mb-3 hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{c.fullName}</p>
                <p className="text-gray-600 text-sm">{c.email}</p>
                <p className="text-gray-400 text-xs">{c.companyName}</p>
              </div>

              <button
                onClick={() => handleDelete(c._id)}
                className="text-red-600 hover:text-red-800 font-medium transition"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
