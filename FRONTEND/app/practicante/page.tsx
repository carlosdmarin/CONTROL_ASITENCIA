"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut, User, Clock, FileText, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function PracticantePage() {
  const auth = useAuth();
  const [horario, setHorario] = useState<any[] | null>(null);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.user) return;
    const id = auth.user.id;
    setLoadingHorario(true);
    // Intenta cargar horario vía API si existe
    import("@/lib/api/practicantes")
      .then(({ practicantesApi }) => practicantesApi.getHorario(id))
      .then(setHorario)
      .catch(() => setHorario([]))
      .finally(() => setLoadingHorario(false));
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

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-brand" />
              Bienvenido, {user?.nombre}
            </CardTitle>
            <CardDescription>
              Documento: <span className="font-mono font-medium text-slate-700">{user?.documento || user?.usuario}</span> · Usuario: {user?.usuario}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Desde aquí puedes consultar tu horario, tus asistencias y tu código QR para marcación.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                Mi horario
              </CardTitle>
              <CardDescription className="text-xs">Turnos programados</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHorario ? (
                <p className="text-xs text-slate-400">Cargando horario…</p>
              ) : !horario || horario.length === 0 ? (
                <p className="text-xs text-slate-500">Sin horario registrado. Consulta con RRHH.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {horario.slice(0, 6).map((b: any, i: number) => (
                    <li key={i} className="flex justify-between border-b last:border-0 py-1.5">
                      <span className="font-medium">{b.diaSemana || b.dia || "Día"}</span>
                      <span className="font-mono text-slate-600">
                        {b.horaInicio || b.horaEntrada || ""} - {b.horaFin || b.horaSalida || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Asistencia
              </CardTitle>
              <CardDescription className="text-xs">Tu control diario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-slate-600">
                La marcación se realiza con el vigilante mediante tu QR. Si necesitas justificar una falta, contacta a RRHH.
              </p>
              <Link href="/practicante" className="inline-flex text-xs font-medium text-brand hover:underline">
                <FileText className="h-3 w-3 mr-1" />
                Ver reportes (próximamente)
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-slate-700">¿Necesitas tu QR?</p>
            <p className="text-xs text-slate-500 mt-1">Solicita a RRHH la generación de tu código QR para marcación.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
