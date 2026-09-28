"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ClockAlert, LogIn, LogOut, Sparkles, Zap } from "lucide-react";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ActividadItem {
  usuario: string;
  accion: string;
  hora: string;
  tipo: string;
}

interface ActividadRecienteProps {
  loading: boolean;
  actividades: ActividadItem[];
}

export default function ActividadReciente({
  loading,
  actividades,
}: ActividadRecienteProps) {
  const total = actividades.length;

  return (
    <Card className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Fondo decorativo con halo */}
      <div
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* ─── Header ─── */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-900/20">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                Actividad reciente
              </h3>
              {total > 0 && !loading && (
                <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {total} {total === 1 ? "evento" : "eventos"}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              Últimas marcaciones de hoy
            </p>
          </div>
        </div>
      </div>

      {/* ─── Lista ─── */}
      <CardContent className="relative z-10 p-0 flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-14 rounded-md" />
              </div>
            ))}
          </div>
        ) : actividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-slate-400" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Sin actividad reciente
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
              Las marcaciones del día aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="relative p-3">
            {/* Línea conectora vertical */}
            <span
              className="absolute left-[27px] top-7 bottom-7 w-px bg-gradient-to-b from-emerald-200 via-slate-200 to-transparent"
              aria-hidden
            />

            <div className="space-y-0.5">
              {actividades.map((act, index) => {
                const isEntrada = act.tipo === "entrada";
                const isTardanza = act.tipo === "tardanza";
                const isSalida = act.tipo === "salida";
                const isLast = index === actividades.length - 1;

                // Configuración por tipo
                const config = isTardanza
                  ? {
                      badgeBg: "bg-gradient-to-br from-amber-500 to-orange-600",
                      icon: ClockAlert,
                      label: "Tardanza",
                      ringColor: "ring-amber-100",
                      labelColor: "text-amber-700 bg-amber-50 border-amber-100",
                    }
                  : isEntrada
                    ? {
                        badgeBg:
                          "bg-gradient-to-br from-emerald-500 to-emerald-600",
                        icon: LogIn,
                        label: "Entrada",
                        ringColor: "ring-emerald-100",
                        labelColor:
                          "text-emerald-700 bg-emerald-50 border-emerald-100",
                      }
                    : {
                        badgeBg: "bg-gradient-to-br from-blue-500 to-blue-600",
                        icon: LogOut,
                        label: "Salida",
                        ringColor: "ring-blue-100",
                        labelColor: "text-blue-700 bg-blue-50 border-blue-100",
                      };

                const Icon = config.icon;

                return (
                  <div
                    key={index}
                    className={`group relative flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-white/80 transition-all duration-200 ${
                      isLast ? "" : ""
                    }`}
                  >
                    {/* ─── Avatar con badge superpuesto ─── */}
                    <div className="relative shrink-0 z-10">
                      <div className="relative">
                        <div
                          className={`h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-sm ring-2 ${config.ringColor} flex items-center justify-center`}
                        >
                          <span className="text-[11.5px] font-bold text-slate-700 tracking-tight">
                            {iniciales(act.usuario)}
                          </span>
                        </div>
                        {/* Badge de tipo */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-sm ${config.badgeBg}`}
                        >
                          <Icon
                            className="h-2.5 w-2.5 text-white"
                            strokeWidth={3}
                          />
                        </span>
                      </div>
                    </div>

                    {/* ─── Contenido ─── */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold truncate text-slate-900 leading-tight">
                          {act.usuario}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0 text-[9.5px] font-bold uppercase tracking-wider shrink-0 ${config.labelColor}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {act.accion}
                      </p>
                    </div>

                    {/* ─── Hora ─── */}
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-[12.5px] font-bold text-slate-700 font-mono tabular-nums leading-none">
                        {act.hora}
                      </span>
                      {index === 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                          <Zap className="h-2 w-2" strokeWidth={3} />
                          Último
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}