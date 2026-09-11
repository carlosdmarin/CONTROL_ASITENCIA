"use client";

import { Search, MapPin, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PracticanteFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroSituacion: string;
  onFiltroSituacionChange: (value: string) => void;
  filtroSede: string;
  onFiltroSedeChange: (value: string) => void;
  sedes: string[];
}

export default function PracticanteFilters({
  busqueda,
  onBusquedaChange,
  filtroSituacion,
  onFiltroSituacionChange,
  filtroSede,
  onFiltroSedeChange,
  sedes,
}: PracticanteFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-[380px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, documento o sede..."
            className="pl-9 h-10 bg-white border-slate-200 rounded-xl"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto items-center">
          <Select value={filtroSede} onValueChange={(v: any) => onFiltroSedeChange(v)}>
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
          <Select value={filtroSituacion} onValueChange={(v: any) => onFiltroSituacionChange(v)}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-white border-slate-200 rounded-xl">
              <Filter className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="ACTIVO">Activos</SelectItem>
              <SelectItem value="INACTIVO">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}