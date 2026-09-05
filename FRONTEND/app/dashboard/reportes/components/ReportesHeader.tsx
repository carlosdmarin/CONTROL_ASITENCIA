// app/reportes/components/ReportesHeader.tsx
import {NotebookText } from "lucide-react";

export function ReportesHeader() {
  return (
     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* ====== IZQUIERDA: Título ====== */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <NotebookText className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-gray-500">
            Saca reportes de tus practicantes en segundos
          </p>
        </div>
      </div>

    </div>
  );
}