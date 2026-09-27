"use client";

import { ShieldCheck, UserPlus, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* ── Bloque izquierdo: ícono + título + subtítulo ── */}
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          <div className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center shadow-sm">
            <ShieldCheck
              className="h-6 w-6 sm:h-6.5 sm:w-6.5 text-blue-700"
              strokeWidth={2.2}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-slate-900 leading-tight">
              Vigilantes
            </h1>
            {typeof total === "number" && (
              <Badge
                variant="outline"
                className="gap-1.5 bg-white border-slate-200 text-slate-600 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              >
                <CircleDot className="h-3 w-3 text-blue-600" strokeWidth={2.5} />
                {total} {total === 1 ? "registro" : "registros"}
              </Badge>
            )}
          </div>
          <p className="text-[13px] text-slate-500 mt-1 leading-snug max-w-md">
            Administra los usuarios encargados del control de asistencia.
          </p>
        </div>
      </div>

      {/* ── Bloque derecho: acción primaria ── */}
      <Button
        onClick={onOpenCreate}
        className="
          w-full sm:w-auto shrink-0
          h-10 px-4 gap-2
          bg-blue-700 hover:bg-blue-800
          shadow-sm hover:shadow-md
          transition-all duration-200
          justify-center
        "
      >
        <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2.4} />
        Nuevo vigilante
      </Button>
    </div>
  );
}