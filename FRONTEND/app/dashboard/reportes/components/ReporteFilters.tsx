"use client";

import { Search, MapPin, SlidersHorizontal, X, CircleDot } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReporteFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroSituacion?: string;
  onFiltroSituacionChange?: (value: string) => void;
  filtroSede?: string;
  onFiltroSedeChange?: (value: string) => void;
  sedes?: string[];
}

export default function ReporteFilters({
  busqueda,
  onBusquedaChange,
  filtroSituacion = "TODOS",
  onFiltroSituacionChange,
  filtroSede = "todas",
  onFiltroSedeChange,
  sedes = [],
}: ReporteFiltersProps) {
  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    (filtroSituacion && filtroSituacion !== "TODOS") ||
    (filtroSede && filtroSede !== "todas");

  const limpiarFiltros = () => {
    onBusquedaChange("");
    onFiltroSituacionChange?.("TODOS");
    onFiltroSedeChange?.("todas");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header del panel */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <SlidersHorizontal
              className="h-3.5 w-3.5 text-slate-600"
              strokeWidth={2.4}
            />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
              Búsqueda y filtros
            </h3>
            {hayFiltrosActivos && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <CircleDot className="h-2.5 w-2.5" strokeWidth={2.5} />
                Activos
              </span>
            )}
          </div>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Contenido: búsqueda + filtros */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              strokeWidth={2.2}
            />
            <Input
              placeholder="Buscar por nombre, DNI, sede o área..."
              className="h-10 w-full pl-9 pr-9 bg-slate-50 border-slate-200 rounded-xl text-[13px] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:border-blue-500 focus-visible:bg-white transition-colors"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => onBusquedaChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-2 items-center shrink-0">
            {onFiltroSedeChange && (
              <Select
                value={filtroSede}
                onValueChange={(v) => onFiltroSedeChange(v ?? "todas")}
              >
                <SelectTrigger
                  className={`w-full sm:w-44 h-10 rounded-xl text-[13px] transition-colors ${
                    filtroSede !== "todas"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin
                      className={`h-3.5 w-3.5 shrink-0 ${
                        filtroSede !== "todas"
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                      strokeWidth={2.4}
                    />
                    <SelectValue placeholder="Todas las sedes" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las sedes</SelectItem>
                  {sedes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {onFiltroSituacionChange && (
              <Select
                value={filtroSituacion}
                onValueChange={(v) => onFiltroSituacionChange(v ?? "TODOS")}
              >
                <SelectTrigger
                  className={`w-full sm:w-44 h-10 rounded-xl text-[13px] transition-colors ${
                    filtroSituacion !== "TODOS"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <SlidersHorizontal
                      className={`h-3.5 w-3.5 shrink-0 ${
                        filtroSituacion !== "TODOS"
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                      strokeWidth={2.4}
                    />
                    <SelectValue placeholder="Todos los estados" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}