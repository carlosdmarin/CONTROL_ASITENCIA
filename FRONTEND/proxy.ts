import { NextResponse, NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No interceptar recursos internos de Next.js y estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_static") ||
    (pathname.includes(".") &&
      (pathname.endsWith(".ico") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".svg")))
  ) {
    return NextResponse.next();
  }

  // Con arquitectura SAME-ORIGIN (Next.js rewrites /api -> backend),
  // la cookie practiqr_token es first-party (dominio del frontend) y viaja
  // automáticamente con credentials:include. El proxy/middleware no autentica;
  // la fuente de verdad es useAuth() -> GET /api/auth/me y RoleGuard.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/marcacion/:path*", "/practicante/:path*", "/login"],
};
