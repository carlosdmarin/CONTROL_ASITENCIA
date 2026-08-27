"use client";

import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PracticanteFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
}

export default function PracticanteFilters({ 
  busqueda, 
  onBusquedaChange 
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
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtrar
        </Button>
      </div>
    </div>
  );
}