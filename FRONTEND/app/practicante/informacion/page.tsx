"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Practicante } from "@/types/practicante";
import { ArrowLeft, Clock3, FileText } from "lucide-react";

function getInitials(name?: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Fila simple tipo ficha: label arriba, valor abajo, sin icono ni card propia */
function DataRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

export default function InformacionPage() {
  const auth = useAuth();
  const [practicanteFull, setPracticanteFull] = useState<Practicante | null>(
    null,
  );
  const [horario, setHorario] = useState<any[] | null>(null);
  const [loadingHorario, setLoadingHorario] = useState(false);

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

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.user) return;
    const id = auth.user.id;
    setLoadingHorario(true);
    import("@/lib/api/practicantes")
      .then(({ practicantesApi }) => practicantesApi.getHorario(id))
      .then(setHorario)
      .catch(() => setHorario([]))
      .finally(() => setLoadingHorario(false));
  }, [auth.status, (auth as any).user?.id]);

  if (auth.status === "loading" || !practicanteFull) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
      </div>
    );
  }

  const user = auth.status === "authenticated" ? auth.user : null;

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200/70">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/practicante"
            aria-label="Volver"
            className="h-9 w-9 rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-150 flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 leading-tight">
              Información del practicante
            </h1>
            <p className="text-xs text-slate-500 leading-tight">
              Tus datos registrados en PractiQR
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-10 space-y-8 animate-page-enter">
        {/* HERO — tratado como credencial, no como card genérica */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-cyan-900 via-sky-900 to-slate-900 text-white p-6 sm:p-8">
          {/* línea punteada evocando el borde perforado de un carnet físico */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold">
                {getInitials(practicanteFull.nombreCompleto)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-white/50">Practicante</p>
              <h2 className="text-lg font-semibold tracking-tight truncate">
                {practicanteFull.nombreCompleto}
              </h2>
              <p className="text-sm text-white/70 truncate">
                {practicanteFull.cargo || "Sin cargo asignado"}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-sm">
            <div>
              <p className="text-[11px] text-white/50">Sede</p>
              <p className="font-medium">{practicanteFull.sede || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/50">Oficina</p>
              <p className="font-medium">
                {practicanteFull.nombreOficina ||
                  practicanteFull.oficina ||
                  "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Datos — ficha de filas, no grid de cards repetidas */}
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Datos personales
          </h3>
          <div className="divide-y divide-slate-200/70">
            <DataRow
              label="Documento"
              value={practicanteFull.documento || user?.documento}
            />
            <DataRow label="Usuario" value={user?.usuario} />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Formación académica
          </h3>
          <div className="divide-y divide-slate-200/70">
            <DataRow
              label="Centro de estudios"
              value={practicanteFull.tipoInstituto}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Periodo de prácticas
          </h3>
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <p className="text-[11px] text-slate-500">Inicio</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(practicanteFull.fechaInicioPracticas)}
              </p>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex-1 text-right">
              <p className="text-[11px] text-slate-500">Fin</p>
              <p className="text-sm font-medium text-slate-900">
                {formatDate(practicanteFull.fechaFinPracticas)}
              </p>
            </div>
          </div>
        </section>

        {/* Horario — tabla real, es información tabular */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
            <Clock3 className="h-4 w-4 text-slate-400" /> Horario
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {loadingHorario ? (
              <p className="text-xs text-slate-400 px-4 py-4">
                Cargando horario…
              </p>
            ) : !horario || horario.length === 0 ? (
              <p className="text-xs text-slate-500 px-4 py-4">
                Sin horario registrado. Consulta con RRHH.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {horario.slice(0, 6).map((b: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        {b.diaSemana || b.dia || "Día"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600">
                        {b.horaInicio || b.horaEntrada || ""} –{" "}
                        {b.horaFin || b.horaSalida || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Asistencia */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4">
          <p className="text-xs leading-relaxed text-slate-600">
            La marcación se realiza con el vigilante mediante tu QR. Si
            necesitas justificar una falta, contacta a RRHH.
          </p>
          <Link
            href="/practicante"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors duration-150"
          >
            <FileText className="h-3 w-3" />
            Volver al carnet
          </Link>
        </section>
      </main>
    </div>
  );
}
