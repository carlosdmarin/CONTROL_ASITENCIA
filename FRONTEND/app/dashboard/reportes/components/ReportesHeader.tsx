"use client";

import { FileText } from "lucide-react";

interface ReportesHeaderProps {
  /** Opcional: total de reportes/practicantes disponibles */
  total?: number;
}

export function ReportesHeader({ total }: ReportesHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-5 py-4">
        {/* ─── Izquierda: ícono + título + subtítulo ─── */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
              <FileText className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
                Reportes
              </h1>
              {typeof total === "number" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {total} {total === 1 ? "practicante" : "practicantes"}
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              Genera reportes de tus practicantes en segundos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}