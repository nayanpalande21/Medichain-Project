import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("medichain_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// RECORDS
export const addRecord = (data) => API.post("/records", data);
export const getMyRecords = () => API.get("/records");
export const getAllRecords = () => API.get("/records/all");
export const getRecord = (id) => API.get(`/records/${id}`);
export const updateRecord = (id, data) => API.put(`/records/${id}`, data);
export const deleteRecord = (id) => API.delete(`/records/${id}`);

// STATS
export const getStats = () => API.get("/stats");

export default API;