"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AsistenciaHeaderProps {
  fecha: Date;
  onPrev: () => void;
  onNext: () => void;
  onFechaChange: (iso: string) => void;
  loading?: boolean;
}

export default function AsistenciaHeader({ fecha, onPrev, onNext, onFechaChange, loading = false }: AsistenciaHeaderProps) {
  const fechaFormateada = fecha.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isToday = new Date().toDateString() === fecha.toDateString();
  const iso = fecha.toISOString().split("T")[0];

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
        <Button variant="outline" size="icon" className="h-10 w-10" onClick={onPrev} disabled={loading}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {loading ? (
            <Skeleton className="h-10 w-48 rounded-md" />
          ) : (
            <input
              type="date"
              value={iso}
              onChange={(e) => onFechaChange(e.target.value)}
              className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm"
            />
          )}
        </div>

        <Button variant="outline" size="icon" className="h-10 w-10" onClick={onNext} disabled={loading}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {loading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          isToday && <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">Hoy</Badge>
        )}
      </div>
    </div>
  );
}
