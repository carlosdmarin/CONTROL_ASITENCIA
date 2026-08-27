"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AsistenciaHeaderProps {
  loading?: boolean;
}

export default function AsistenciaHeader({ loading = false }: AsistenciaHeaderProps) {
  // Datos mock de fecha
  const fechaActual = new Date(2026, 7, 26); // 26 de agosto de 2026
  const fechaFormateada = fechaActual.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asistencia Diaria</h1>
        <div className="flex items-center gap-2 mt-1">
          {loading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <span className="text-sm text-gray-500 capitalize">
              {fechaFormateada}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Botón día anterior */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Selector de fecha */}
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {loading ? (
            <Skeleton className="h-10 w-48 rounded-md" />
          ) : (
            <input
              type="date"
              value="2026-08-26"
              className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled
            />
          )}
        </div>

        {/* Botón día siguiente */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          disabled={loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Badge de hoy */}
        {loading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
            Hoy
          </Badge>
        )}
      </div>
    </div>
  );
}