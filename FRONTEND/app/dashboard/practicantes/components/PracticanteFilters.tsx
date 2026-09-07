"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PracticanteFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  filtroSituacion: string;
  onFiltroSituacionChange: (value: string) => void;
}

export default function PracticanteFilters({ 
  busqueda, 
  onBusquedaChange,
  filtroSituacion,
  onFiltroSituacionChange
}: PracticanteFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, código o DNI..."
          className="pl-9 w-full h-10 bg-white"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto items-center">
        <Select value={filtroSituacion} onValueChange={(v: any) => onFiltroSituacionChange(v)}>
          <SelectTrigger className="w-[160px] h-10 bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVO">Activos</SelectItem>
            <SelectItem value="INACTIVO">Inactivos</SelectItem>
            <SelectItem value="TODOS">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}