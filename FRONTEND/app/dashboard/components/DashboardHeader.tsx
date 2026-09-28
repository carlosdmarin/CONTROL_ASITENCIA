"use client";

import { Zap, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardHeaderProps {
  loading: boolean;
  totalPracticantes: number;
  presentesHoy: number;
  periodo: string;
  onPeriodoChange: (v: string | null) => void;
}

export default function DashboardHeader({
  loading,
  totalPracticantes,
  presentesHoy,
  periodo,
  onPeriodoChange,
}: DashboardHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-5 py-4">
        {/* ─── Izquierda: ícono + título + subtítulo ─── */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
              <Zap className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            {!loading && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
                Dashboard
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                En vivo
              </span>
            </div>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              {loading ? (
                "Cargando resumen del sistema…"
              ) : (
                <>
                  <span className="font-medium text-slate-700">
                    {totalPracticantes}
                  </span>{" "}
                  practicantes
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="font-medium text-slate-700">
                    {presentesHoy}
                  </span>{" "}
                  presentes hoy
                </>
              )}
            </p>
          </div>
        </div>

        {/* ─── Derecha: controles agrupados ─── */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-2 rounded-lg text-[12.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <CalendarDays
              className="h-3.5 w-3.5 text-slate-500"
              strokeWidth={2.4}
            />
            {new Date().toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Button>
        </div>
      </div>
    </div>
  );
}