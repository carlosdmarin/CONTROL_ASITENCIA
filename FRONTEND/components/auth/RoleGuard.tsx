"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getHomeForRole, isAllowed } from "@/lib/role";

type Props = {
  allowedRoles: ("PRACTICANTE" | "VIGILANTE" | "RRHH")[];
  children: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children }: Props) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.status === "loading") return;
    if (auth.status === "unauthenticated") {
      const returnTo = pathname || "/";
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (auth.status === "authenticated") {
      const rol = auth.user.rol;
      if (!allowedRoles.includes(rol as any)) {
        router.replace(getHomeForRole(rol));
      }
    }
  }, [auth.status, (auth as any).user?.rol, pathname, router, allowedRoles]);

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
          <p className="text-sm text-slate-500">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    // Evita parpadeo: mientras redirect se ejecuta no muestra contenido protegido
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
          <p className="text-sm text-slate-500">Redirigiendo a login…</p>
        </div>
      </div>
    );
  }

  // Authenticated pero rol no permitido → no renderizar contenido mientras redirige
  const rol = (auth as any).user?.rol as string;
  if (!allowedRoles.includes(rol as any)) {
    // isAllowed double-check, pero allowedRoles ya cubre
    if (!isAllowed(pathname || "", rol)) {
      return (
        <div className="flex min-h-[60dvh] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
            <p className="text-sm text-slate-500">Redirigiendo…</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
