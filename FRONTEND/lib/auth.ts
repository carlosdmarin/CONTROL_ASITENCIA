// lib/auth.ts - Utilidad simple para recuperar sesión via cookie HttpOnly
// No lee document.cookie para practiqr_token (HttpOnly). Usa credentials:"include".

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export type AuthUser = {
  id: number;
  nombre: string;
  usuario: string;
  rol: string;
  documento?: string;
};

export type MeResponse = {
  authenticated: boolean;
  user?: AuthUser;
};

export async function fetchMe(): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 401) {
      return { authenticated: false };
    }
    if (!res.ok) return null;
    const data = await res.json();
    return data as MeResponse;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
