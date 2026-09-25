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

  // La cookie practiqr_token pertenece al dominio del backend
  // (https://returning-funny-officers-halo.trycloudflare.com) y no es visible
  // en el dominio del frontend. Por eso el proxy NO debe autenticar aquí.
  // La fuente de verdad es useAuth() -> GET /api/auth/me (con credentials:include)
  // y RoleGuard en cada layout privado.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/marcacion/:path*", "/practicante/:path*", "/login"],
};
