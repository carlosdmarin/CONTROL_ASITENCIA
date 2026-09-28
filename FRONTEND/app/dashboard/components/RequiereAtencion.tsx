"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClockAlert,
  MinusCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
  isTardanza,
  isAusente,
} from "@/types/asistencia";
import { Practicante } from "@/types/practicante";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface RequiereAtencionProps {
  loading: boolean;
  atencion: AsistenciaDiariaResponse[];
  practicantes: Practicante[];
}

export default function RequiereAtencion({
  loading,
  atencion,
  practicantes,
}: RequiereAtencionProps) {
  const total = atencion.length;

  return (
    <Card className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-md shadow-amber-900/20">
              <AlertTriangle
                className="h-5 w-5 text-white"
                strokeWidth={2.4}
              />
            </div>
            {!loading && total > 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white px-1">
                <span className="text-[9px] font-bold text-white leading-none tabular-nums">
                  {total > 9 ? "9+" : total}
                </span>
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                Requiere atención
              </h3>
              {!loading && total > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {total} {total === 1 ? "pendiente" : "pendientes"}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              Practicantes con falta, tardanza o sin marcar
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/asistencia"
          className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Ver todos
          <ArrowRight className="h-3 w-3" strokeWidth={2.6} />
        </Link>
      </div>

      {/* ─── Lista ─── */}
      <CardContent className="p-0 flex-1">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-slate-100 bg-slate-50/50"
              />
            ))}
          </div>
        ) : atencion.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle2
                className="h-7 w-7 text-emerald-600"
                strokeWidth={2.2}
              />
            </div>
            <p className="text-sm font-semibold text-slate-800">Todo al día</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
              Ningún practicante activo requiere atención hoy
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 space-y-2">
              {atencion.slice(0, 5).map((a) => {
                const n = normalizeEstadoDia(a.estadoDia);
                const practicanteInfo = practicantes.find(
                  (p) => p.idPracticante === a.idPracticante,
                );
                const oficina =
                  practicanteInfo?.nombreOficina ||
                  practicanteInfo?.oficina ||
                  "—";

                const config =
                  n === "AUSENTE" || isAusente(a.estadoDia)
                    ? {
                        bg: "bg-gradient-to-r from-rose-50/80 via-rose-50/40 to-white",
                        border: "border-rose-100",
                        hoverBorder: "hover:border-rose-200",
                        accentIcon: "bg-rose-100 border-rose-200 text-rose-600",
                        badgeBg: "bg-rose-500",
                        badgeText: "text-white",
                        label: "Falta",
                        icon: XCircle,
                      }
                    : n === "TARDANZA" || isTardanza(a.estadoDia)
                      ? {
                          bg: "bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white",
                          border: "border-amber-100",
                          hoverBorder: "hover:border-amber-200",
                          accentIcon:
                            "bg-amber-100 border-amber-200 text-amber-600",
                          badgeBg: "bg-amber-500",
                          badgeText: "text-white",
                          label: "Tardanza",
                          icon: ClockAlert,
                        }
                      : {
                          bg: "bg-gradient-to-r from-slate-50/80 via-slate-50/40 to-white",
                          border: "border-slate-200",
                          hoverBorder: "hover:border-slate-300",
                          accentIcon:
                            "bg-slate-100 border-slate-200 text-slate-500",
                          badgeBg: "bg-slate-500",
                          badgeText: "text-white",
                          label: "Sin marcar",
                          icon: MinusCircle,
                        };

                const Icon = config.icon;

                return (
                  <Link
                    key={a.idPracticante}
                    href="/dashboard/asistencia"
                    className={`group flex items-center gap-3 p-3 rounded-xl border ${config.border} ${config.hoverBorder} ${config.bg} hover:shadow-sm transition-all duration-200`}
                  >
                    {/* Ícono de severidad a la izquierda */}
                    <div
                      className={`h-10 w-10 rounded-xl border ${config.accentIcon} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.4} />
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold truncate text-slate-900 leading-tight">
                          {a.nombreCompleto}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {oficina}
                      </p>
                    </div>

                    {/* Info horario */}
                    <div className="hidden md:flex flex-col items-end shrink-0 gap-0.5">
                      {a.entradaReal ? (
                        <>
                          <span className="font-mono text-[12px] font-bold text-slate-800 tabular-nums leading-none">
                            {a.entradaReal.substring(0, 5)}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 tabular-nums leading-none">
                            / {a.entradaEsperada?.substring(0, 5) ?? "—"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                            Esperada
                          </span>
                          <span className="font-mono text-[12px] font-bold text-slate-700 tabular-nums leading-none mt-0.5">
                            {a.entradaEsperada?.substring(0, 5) ?? "—"}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-md ${config.badgeBg} ${config.badgeText} px-2 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0`}
                    >
                      {config.label}
                    </span>

                    {/* Chevron que se mueve al hover */}
                    <ArrowRight
                      className="h-4 w-4 text-slate-300 shrink-0 group-hover:translate-x-0.5 group-hover:text-slate-500 transition-all"
                      strokeWidth={2.4}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Footer "ver todos" */}
            {atencion.length > 5 && (
              <Link
                href="/dashboard/asistencia"
                className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-slate-600 hover:text-slate-900 py-3 border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                Ver {atencion.length - 5} más de {atencion.length}
                <ArrowRight className="h-3 w-3" strokeWidth={2.6} />
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}