"use client";

import {
  Calendar,
  CalendarDays,
  NotebookText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TipoReporte = "DIARIO" | "SEMANAL" | "MENSUAL" | null;

interface ReporteStepTipoProps {
  value: TipoReporte;
  onChange: (tipo: TipoReporte) => void;
}

const OPCIONES = [
  {
    tipo: "DIARIO" as const,
    icon: Calendar,
    titulo: "Diario",
    descripcion: "Asistencia de un día específico",
  },
  {
    tipo: "SEMANAL" as const,
    icon: CalendarDays,
    titulo: "Semanal",
    descripcion: "Resumen de una semana completa",
  },
  {
    tipo: "MENSUAL" as const,
    icon: NotebookText,
    titulo: "Mensual",
    descripcion: "Resumen de todo un mes",
  },
];

// Color único: emerald (verde)
const COLORS = {
  gradient: "from-emerald-500 via-emerald-600 to-teal-700",
  borderActive: "border-emerald-300",
  bgActive: "bg-emerald-50/40",
  iconActive: "text-emerald-700",
  ringActive: "ring-emerald-100",
  checkBg: "bg-emerald-600",
  labelColor: "text-emerald-700",
  dotColor: "bg-emerald-600",
  borderSeparator: "border-emerald-200/70",
};

export function ReporteStepTipo({ value, onChange }: ReporteStepTipoProps) {
  return (
    <div className="space-y-4">
      {/* ═══════════ PREGUNTA ═══════════ */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
          ¿Qué tipo de reporte necesitás?
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
          <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
          Paso 1
        </span>
      </div>

      {/* ═══════════ OPCIONES ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPCIONES.map((op) => {
          const isSelected = value === op.tipo;
          const Icon = op.icon;

          return (
            <button
              key={op.tipo}
              type="button"
              role="button"
              aria-pressed={isSelected}
              onClick={() => onChange(op.tipo)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                isSelected
                  ? `${COLORS.borderActive} ${COLORS.bgActive} ring-2 ${COLORS.ringActive} shadow-sm`
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 hover:-translate-y-0.5 hover:shadow-sm",
              )}
            >
              {/* Check en la esquina */}
              {isSelected && (
                <span
                  className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full ${COLORS.checkBg} shadow-sm`}
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-white"
                    strokeWidth={3}
                  />
                </span>
              )}

              {/* Ícono */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
                    isSelected
                      ? `bg-gradient-to-br ${COLORS.gradient} shadow-md shadow-slate-900/10 group-hover:scale-105`
                      : "bg-slate-100 border border-slate-200",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? "text-white" : "text-slate-500",
                    )}
                    strokeWidth={2.4}
                  />
                </div>
                {isSelected && <div className="w-5 h-5" />}
              </div>

              {/* Título */}
              <p
                className={cn(
                  "text-[14px] font-bold tracking-tight leading-tight transition-colors",
                  isSelected ? COLORS.labelColor : "text-slate-900",
                )}
              >
                {op.titulo}
              </p>

              {/* Descripción */}
              <p className="text-[11.5px] text-slate-500 mt-1 leading-snug">
                {op.descripcion}
              </p>

              {/* Indicador "Seleccionado" */}
              {isSelected && (
                <div
                  className={`mt-3 pt-3 border-t ${COLORS.borderSeparator} flex items-center gap-1.5`}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", COLORS.dotColor)}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      COLORS.labelColor,
                    )}
                  >
                    Seleccionado
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}