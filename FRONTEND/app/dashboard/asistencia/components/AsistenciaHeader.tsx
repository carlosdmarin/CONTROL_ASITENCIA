"use client";

import { ChevronLeft, ChevronRight, CalendarDays, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AsistenciaHeaderProps {
  fecha: Date;
  onPrev: () => void;
  onNext: () => void;
  onFechaChange: (iso: string) => void;
  loading?: boolean;
}

export default function AsistenciaHeader({
  fecha,
  onPrev,
  onNext,
  onFechaChange,
  loading = false,
}: AsistenciaHeaderProps) {
  const fechaFormateada = fecha.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });

  const isToday = new Date().toDateString() === fecha.toDateString();
  const iso = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

  const handleHoy = () => {
    const hoy = new Date();
    const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
    onFechaChange(hoyISO);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 sm:px-5 py-4">
        {/* ─── Izquierda: ícono + título + fecha ─── */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
              <CalendarDays className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
            </div>
            {isToday && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
                Asistencia Diaria
              </h1>
              {isToday && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Hoy
                </span>
              )}
            </div>
            {loading ? (
              <Skeleton className="h-4 w-52 mt-1" />
            ) : (
              <p className="text-[12.5px] text-slate-500 capitalize mt-0.5">
                {fechaFormateada}
              </p>
            )}
          </div>
        </div>

        {/* ─── Derecha: navegación ─── */}
        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-44 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </>
          ) : (
            <>
              {/* Botón prev */}
              <button
                type="button"
                onClick={onPrev}
                aria-label="Día anterior"
                className="h-10 w-10 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
              </button>

              {/* Selector de fecha */}
              <div className="relative group">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
                  strokeWidth={2.4}
                />
                <input
                  type="date"
                  value={iso}
                  onChange={(e) => onFechaChange(e.target.value)}
                  className="h-10 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[12.5px] font-medium text-slate-700 tabular-nums cursor-pointer hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Botón next */}
              <button
                type="button"
                onClick={onNext}
                aria-label="Día siguiente"
                className="h-10 w-10 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
              </button>

              {/* Botón "Hoy" como acción separada */}
              {!isToday && (
                <button
                  type="button"
                  onClick={handleHoy}
                  className="h-10 px-3.5 rounded-lg border border-blue-200 bg-blue-50 text-[12.5px] font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                  Hoy
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}