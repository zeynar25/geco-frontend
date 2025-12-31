import { jwtDecode } from "jwt-decode";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getToken() {
  return localStorage.getItem("token");
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && Date.now() < decoded.exp * 1000) return false;
    return true;
  } catch {
    return true;
  }
}

export function ensureTokenValidOrAlert() {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    throw new Error("TOKEN_EXPIRED");
  }
  return token;
}

export async function safeFetch(url, options = {}) {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    throw new Error("TOKEN_EXPIRED");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { ...options, headers });
}

export function ensureTokenValidOrThrow() {
  return ensureTokenValidOrAlert();
}
