// src/components/DashboardHeader.js
import { useRouter } from "next/router";
import { logout } from "../utils/auth";

export default function DashboardHeader() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Left: Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          CRM Dashboard
        </h1>

        {/* Right: Logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white shadow-sm transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
