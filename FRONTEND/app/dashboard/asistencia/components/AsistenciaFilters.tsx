"use client";

import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AsistenciaFiltersProps {
  loading?: boolean;
}

export default function AsistenciaFilters({ loading = false }: AsistenciaFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        {loading ? (
          <Skeleton className="h-10 w-full rounded-md" />
        ) : (
          <Input
            placeholder="Buscar practicante..."
            className="pl-9 h-10 bg-white"
            disabled
          />
        )}
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        {loading ? (
          <>
            <Skeleton className="h-10 w-36 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </>
        ) : (
          <>
            <Select disabled>
              <SelectTrigger className="w-36 h-10 bg-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="presente">Presente</SelectItem>
                <SelectItem value="tardanza">Tardanza</SelectItem>
                <SelectItem value="ausente">Ausente</SelectItem>
                <SelectItem value="jornada">En jornada</SelectItem>
              </SelectContent>
            </Select>

            <Select disabled>
              <SelectTrigger className="w-36 h-10 bg-white">
                <ChevronDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="ti">TI</SelectItem>
                <SelectItem value="rrhh">RR. HH.</SelectItem>
                <SelectItem value="contabilidad">Contabilidad</SelectItem>
                <SelectItem value="sistemas">Sistemas</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}