"use client";

import { Calendar, CalendarDays, NotebookText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

export function ReporteStepTipo({ value, onChange }: ReporteStepTipoProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">¿Qué tipo de reporte necesitas?</h3>
        <p className="text-xs text-muted-foreground mt-1">Selecciona el período que deseas consultar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPCIONES.map((op) => {
          const isSelected = value === op.tipo;
          const Icon = op.icon;
          return (
            <Card
              key={op.tipo}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => onChange(op.tipo)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(op.tipo);
                }
              }}
              className={cn(
                "cursor-pointer transition-all border text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isSelected
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-200"
                  : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <CardContent className="p-4">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg mb-3",
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className={cn("text-sm font-semibold", isSelected ? "text-blue-900" : "text-slate-900")}>
                  {op.titulo}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{op.descripcion}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
