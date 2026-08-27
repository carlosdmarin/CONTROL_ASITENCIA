"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Turno } from "../types";

interface TurnoTableProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onDelete: (turno: Turno) => void;
  busqueda: string; // ← PARA SABER SI HAY BÚSQUEDA ACTIVA
}

export default function TurnoTable({
  turnos,
  onEdit,
  onDelete,
  busqueda,
}: TurnoTableProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Lista de turnos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6 overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-50/80">
              <TableHead className="w-25 font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Horario</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {turnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center">
                    {busqueda ? (
                      <>
                        <Search className="h-10 w-10 text-gray-500 mb-3" />
                        <p className="text-sm font-medium text-gray-400">
                          No se encontraron turnos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Intenta con otro término de búsqueda
                        </p>
                      </>
                    ) : (
                      <>
                        <Clock className="h-10 w-10 text-gray-500 mb-3" />
                        <p className="text-sm font-medium text-gray-400">
                          No hay turnos registrados
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Comienza creando tu primer turno
                        </p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              turnos.map((turno) => (
                <TableRow key={turno.id} className="hover:bg-slate-100">
                  <TableCell className="font-medium text-sm text-gray-600">
                    {turno.id}
                  </TableCell>
                  <TableCell className="font-medium">{turno.nombre}</TableCell>
                  <TableCell>
                    {turno.horaInicio} - {turno.horaSalida}
                  </TableCell>
                  <TableCell>
                    <Badge className="gap-1.5 border-emerald-600/40 bg-emerald-600/10 text-emerald-500 shadow-none hover:bg-emerald-600/10 dark:bg-emerald-600/20">
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(turno)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(turno)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
