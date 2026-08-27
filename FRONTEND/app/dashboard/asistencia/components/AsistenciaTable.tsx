"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Clock } from "lucide-react";
import { AsistenciaDiaria } from "../types";

interface AsistenciaTableProps {
  asistencias: AsistenciaDiaria[];
  loading?: boolean;
}

export default function AsistenciaTable({ asistencias, loading = false }: AsistenciaTableProps) {
  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { label: string; className: string; icon?: string }> = {
      'PRESENTE': { 
        label: 'Presente', 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      'TARDANZA': { 
        label: 'Tardanza', 
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
      },
      'AUSENTE': { 
        label: 'Ausente', 
        className: 'bg-red-100 text-red-700 border-red-200' 
      },
      'EN_JORNADA': { 
        label: 'En jornada', 
        className: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
    };
    return config[estado] || { label: estado, className: 'bg-gray-100 text-gray-700' };
  };

  // Skeletons para filas de la tabla
  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Registro de Asistencia
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {asistencias.length} practicantes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-50/80">
              <TableHead className="font-semibold">Practicante</TableHead>
              <TableHead className="font-semibold">Área</TableHead>
              <TableHead className="font-semibold text-center">Entrada</TableHead>
              <TableHead className="font-semibold text-center">Salida</TableHead>
              <TableHead className="font-semibold text-center">Horas</TableHead>
              <TableHead className="font-semibold text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : (
              asistencias.map((asistencia) => {
                const estado = getEstadoBadge(asistencia.estado);
                return (
                  <TableRow key={asistencia.id} className="hover:bg-slate-50 h-12">
                    <TableCell className="font-medium">
                      {asistencia.practicante}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {asistencia.area}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {asistencia.entrada || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {asistencia.salida || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {asistencia.horas || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={estado.className}>
                        {estado.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}