"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EstadoFiltro = "todos" | "activos" | "inactivos";

interface PuestoFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  estado: EstadoFiltro;
  onEstadoChange: (value: EstadoFiltro) => void;
  totalFiltrados: number;
  total: number;
  loading?: boolean;
}

export default function PuestoFilters({
  busqueda,
  onBusquedaChange,
  estado,
  onEstadoChange,
  totalFiltrados,
  total,
  loading = false,
}: PuestoFiltersProps) {
  const showClear = busqueda.length > 0;

  return (
    <div className="flex flex-col gap-3 mb-5 ">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por puesto o área…"
            className="h-9 pl-9 pr-9 bg-white border-slate-200 placeholder:text-slate-400"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            disabled={loading}
          />
          {showClear && (
            <button
              onClick={() => onBusquedaChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200 w-fit">
          {([
            ["todos", "Todos"],
            ["activos", "Activos"],
            ["inactivos", "Inactivos"],
          ] as const).map(([value, label]) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              onClick={() => onEstadoChange(value)}
              className={`h-7 px-3 text-xs font-medium rounded-md ${
                estado === value
                  ? "bg-white shadow-sm text-slate-900 border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
