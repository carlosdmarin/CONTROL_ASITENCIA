"use client";

import { Search, Filter, Download, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AsistenciaFiltersProps {
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (v: string) => void;
  filtroSede?: string;
  onFiltroSedeChange?: (v: string) => void;
  sedes?: string[];
  loading?: boolean;
}

export default function AsistenciaFilters({
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroSede = "todas",
  onFiltroSedeChange,
  sedes = [],
  loading = false,
}: AsistenciaFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-[380px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          {loading ? (
            <Skeleton className="h-10 w-full rounded-xl" />
          ) : (
            <Input
              placeholder="Buscar practicante..."
              className="pl-9 h-10 bg-white border-slate-200 rounded-xl"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
          )}
        </div>

        <div className="flex gap-2 w-full lg:w-auto items-center">
          {loading ? (
            <>
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </>
          ) : (
            <>
              {onFiltroSedeChange && (
                <Select value={filtroSede} onValueChange={(v) => onFiltroSedeChange(v ?? "todas")}>
                  <SelectTrigger className="w-full sm:w-40 h-10 bg-white border-slate-200 rounded-xl">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Sede" />
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
              <Select value={filtroEstado} onValueChange={(v) => onFiltroEstadoChange(v ?? "todos")}>
                <SelectTrigger className="w-full sm:w-40 h-10 bg-white border-slate-200 rounded-xl">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="tardanza">Tardanza</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="sin_marcar">Sin marcar</SelectItem>
                  <SelectItem value="descanso">Descanso</SelectItem>
                  <SelectItem value="justificado">Justificado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 bg-white hidden sm:inline-flex" disabled aria-label="Exportar" title="Exportación próximamente">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}