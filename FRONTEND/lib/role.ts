// lib/role.ts - helpers de rol, sin duplicar JWT
export type Role = "PRACTICANTE" | "VIGILANTE" | "RRHH";

export function normalizeRole(rol?: string | null): Role | null {
  if (!rol) return null;
  const r = rol.toUpperCase().trim();
  if (r === "PRACTICANTE" || r === "VIGILANTE" || r === "RRHH") return r as Role;
  return null;
}

export function getHomeForRole(rol?: string | null): string {
  const r = normalizeRole(rol);
  switch (r) {
    case "RRHH":
      return "/dashboard";
    case "VIGILANTE":
      return "/marcacion";
    case "PRACTICANTE":
      return "/practicante";
    default:
      return "/login";
  }
}

export function isAllowed(pathname: string, rol?: string | null): boolean {
  const r = normalizeRole(rol);
  if (!r) return false;
  if (pathname === "/login") return false; // login no es permitido si ya hay sesión, se redirige
  if (pathname.startsWith("/dashboard")) return r === "RRHH";
  if (pathname.startsWith("/marcacion")) return r === "VIGILANTE";
  if (pathname.startsWith("/practicante")) return r === "PRACTICANTE";
  // reportes está bajo /dashboard/reportes → ya cubierto
  return false;
}
