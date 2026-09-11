"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, FileCheck } from "lucide-react";
import { Practicante } from "@/types/practicante";

type TipoReporte = "DIARIO" | "SEMANAL" | "MENSUAL";

interface Props {
  practicante: Practicante | null;
  tipo: TipoReporte;
  periodoLabel: string;
}

function getInitials(nombre: string) {
  if (!nombre) return "?";
  const p = nombre.split(" ");
  return p.length >= 2 ? p[0][0] + p[1][0] : nombre[0];
}

const TIPO_LABEL: Record<TipoReporte, string> = {
  DIARIO: "Diario",
  SEMANAL: "Semanal",
  MENSUAL: "Mensual",
};

export function ReporteStepConfirmacion({ practicante, tipo, periodoLabel }: Props) {
  if (!practicante) return null;
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Revisa tu reporte</h3>
        <p className="text-xs text-muted-foreground mt-1">Verifica los datos antes de generar el reporte.</p>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Practicante</p>
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarFallback className="text-xs font-medium bg-white text-slate-700">
                {getInitials(practicante.nombreCompleto)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{practicante.nombreCompleto}</p>
              <p className="text-xs text-slate-500 truncate">
                DNI {practicante.documento} · {practicante.nombreArea || practicante.area || practicante.puesto || "Sin área"}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto text-xs">
              {practicante.cargo}
            </Badge>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <FileCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Tipo</p>
              <p className="text-sm font-medium text-slate-900">{TIPO_LABEL[tipo]}</p>
            </div>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">Reporte {TIPO_LABEL[tipo].toLowerCase()}</Badge>
        </div>

        <div className="p-4 flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Período</p>
            <p className="text-sm font-medium text-slate-900 capitalize">{periodoLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
