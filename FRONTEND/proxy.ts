import { NextResponse, NextRequest } from "next/server";

const PRIVATE_ROUTES = ["/dashboard", "/marcacion", "/practicante"];

function isPrivatePathname(pathname: string): boolean {
  return PRIVATE_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function isSafeReturnTo(value: string | null): boolean {
  if (!value) return false;
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("://");
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // No interceptar recursos internos de Next.js y estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_static") ||
    (pathname.includes(".") && (pathname.endsWith(".ico") || pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".svg")))
  ) {
    return NextResponse.next();
  }

  const isPrivate = isPrivatePathname(pathname);
  const isLogin = pathname === "/login";

  // Rutas públicas siempre pasan (excepto login y privadas)
  if (!isPrivate && !isLogin) {
    return NextResponse.next();
  }

  const token = request.cookies.get("practiqr_token")?.value;

  // Sin sesión e intenta entrar a privada -> redirect a login con returnTo
  if (isPrivate && !token) {
    const loginUrl = new URL("/login", request.url);
    const returnTo = pathname + search;
    if (isSafeReturnTo(returnTo)) {
      loginUrl.searchParams.set("returnTo", returnTo);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión: proxy NO decide rol (HttpOnly, backend autoridad).
  // Solo bloquea acceso sin cookie. El rol se valida en cliente vía /api/auth/me + RoleGuard.
  // Esto evita segunda implementación JWT y bucles.
  // /login con sesión se deja pasar, el propio /login hará redirect según rol (client).
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/marcacion/:path*", "/practicante/:path*", "/login"],
};
