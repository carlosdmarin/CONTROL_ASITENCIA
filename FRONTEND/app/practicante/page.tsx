"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown, Info } from "lucide-react";
import Link from "next/link";
import { CarnetPracti } from "@/app/practicante/components/CarnetPracti";
import { CarnetSkeleton } from "@/app/practicante/components/CarnetSkeleton";
import { Practicante } from "@/types/practicante";

export default function PracticantePage() {
  const auth = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [practicanteFull, setPracticanteFull] = useState<Practicante | null>(null);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.user) return;
    const build = () => `PRACTIQR|${auth.user!.id}|${new Date().toISOString()}`;
    setQrValue(build());
    const id = setInterval(() => setQrValue(build()), 30000);
    return () => clearInterval(id);
  }, [auth.status, (auth as any).user?.id]);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.user) return;
    let mounted = true;
    import("@/lib/api/practicantes")
      .then(({ practicantesApi }) => practicantesApi.getById(auth.user!.id))
      .then((data) => {
        if (mounted) setPracticanteFull(data);
      })
      .catch(() => {
        if (!mounted) return;
        setPracticanteFull({
          idPracticante: auth.user!.id,
          nombreCompleto: auth.user!.nombre,
          documento: auth.user!.documento || auth.user!.usuario,
          sede: "",
          oficina: "",
          idOficina: 0,
          nombreOficina: "",
          tipoInstituto: "",
          cargo: "",
          situacion: "ACTIVO",
          horasSemanalesRequeridas: 0,
          fechaInicioPracticas: new Date().toISOString(),
        });
      });
    return () => {
      mounted = false;
    };
  }, [auth.status, (auth as any).user?.id]);

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
      </div>
    );
  }

  const user = auth.status === "authenticated" ? auth.user : null;

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">QR</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Mi espacio</h1>
            <p className="text-xs text-slate-500">{user?.nombre || "Practicante"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (loggingOut) return;
            setLoggingOut(true);
            try {
              await logout();
            } finally {
              window.location.href = "/login";
            }
          }}
          disabled={loggingOut}
          aria-label="Cerrar sesión"
          className="h-9 gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">
            {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </span>
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* SALUDO COMPACTO + CARNET PRINCIPAL */}
        <div className="text-center mb-4">
          <p className="text-sm text-slate-500">Hola, <span className="font-semibold text-slate-800">{user?.nombre}</span></p>
          <p className="text-xs text-slate-400">PractiQR · Tu carnet está listo para mostrar al vigilante</p>
        </div>

        <div className="flex justify-center" aria-live="polite" aria-busy={!practicanteFull || !qrValue}>
          {practicanteFull && qrValue ? (
            <CarnetPracti
              practicante={practicanteFull}
              qrValue={qrValue}
              editableFoto={false}
            />
          ) : (
            <CarnetSkeleton />
          )}
        </div>

        {/* BOTÓN VER INFORMACIÓN */}
        <div className="flex justify-center mt-6">
          <Link
            href="/practicante/informacion"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all duration-150"
          >
            <Info className="h-4 w-4 text-slate-500" />
            Ver información
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5 rotate-[-90deg]" />
          </Link>
        </div>
      </main>
    </div>
  );
}
