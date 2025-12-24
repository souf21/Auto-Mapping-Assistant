// src/pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";
import { register } from "../services/authService";

export default function Register() {
  const router = useRouter();

  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!brandName || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await register(brandName, email, password);
      localStorage.setItem("justRegistered", "true");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-5"
      >
        <h1 className="text-3xl font-semibold text-gray-900 text-center">
          Create Your Brand
        </h1>

        {error && (
          <p className="text-red-700 bg-red-100 border border-red-300 p-2 rounded-md text-sm">
            {error}
          </p>
        )}

        <input
          className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
          placeholder="Brand Name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
        />

        <input
          className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 w-full rounded-md shadow-sm transition cursor-pointer"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-700">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
