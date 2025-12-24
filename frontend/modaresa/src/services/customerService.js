// src/services/customerService.js
import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000/customers";

export async function getCustomers() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (res.status === 401) {
    logout();
    window.location.href = "/login";
    return [];
  }

  if (!res.ok) {
    console.error("Failed to load customers");
    return [];
  }

  return res.json();
}

export async function createCustomer(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (res.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create customer");
  }

  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (res.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete customer");
  }
}
