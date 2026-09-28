"use client";

import { ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VigilantesHeaderProps {
  onOpenCreate: () => void;
  /** Opcional: cantidad total de vigilantes (para el badge) */
  total?: number;
}

export default function VigilantesHeader({
  onOpenCreate,
  total,
}: VigilantesHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-5 py-4">
        {/* ─── Izquierda: ícono + título + subtítulo ─── */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
                Vigilantes
              </h1>
              {typeof total === "number" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {total} {total === 1 ? "registro" : "registros"}
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              Administra los usuarios encargados del control de asistencia
            </p>
          </div>
        </div>

        {/* ─── Derecha: acción primaria ─── */}
        <Button
          onClick={onOpenCreate}
          className="w-full sm:w-auto shrink-0 h-10 gap-2 bg-blue-700 hover:bg-blue-800 shadow-sm hover:shadow-md transition-all text-[13px] font-semibold justify-center"
        >
          <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2.4} />
          Nuevo vigilante
        </Button>
      </div>
    </div>
  );
}