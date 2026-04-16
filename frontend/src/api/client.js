// src/api/client.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("admin_token");
}

async function request(method, path, body, isFormData = false) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

export const api = {
  // Auth
  login: (username, password) => request("POST", "/auth/login", { username, password }),
  me: () => request("GET", "/auth/me"),
  changePassword: (currentPassword, newPassword) =>
    request("PATCH", "/auth/password", { currentPassword, newPassword }),

  // Store
  getStore: () => request("GET", "/store"),
  updateStore: (data) => request("PATCH", "/store", data),

  // Menu
  getMenu: (all = false) => request("GET", `/menu${all ? "?all=true" : ""}`),
  createMenuItem: (formData) => request("POST", "/menu", formData, true),
  updateMenuItem: (id, formData) => request("PATCH", `/menu/${id}`, formData, true),
  deleteMenuItem: (id) => request("DELETE", `/menu/${id}`),
  reorderMenu: (order) => request("PATCH", "/menu/bulk/reorder", { order }),

  // Orders
  createOrder: (data) => request("POST", "/orders", data),
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/orders${qs ? "?" + qs : ""}`);
  },
  getOrderStats: () => request("GET", "/orders/stats"),
  updateOrderStatus: (id, status) => request("PATCH", `/orders/${id}/status`, { status }),
};
