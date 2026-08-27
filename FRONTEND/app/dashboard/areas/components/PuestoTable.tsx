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
import { BriefcaseBusiness, Building2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Search } from "lucide-react";
import { Puesto } from "@/types/puestos";

interface PuestoTableProps {
  puestos: Puesto[];
  onEdit: (puesto: Puesto) => void;
  onDelete: (puesto: Puesto) => void;
  getStatusColor: (activo: boolean) => string;
  busqueda: string;
  loading?: boolean;
}

// Skeletons para filas de la tabla
const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
      </TableRow>
    ))}
  </>
);

export default function PuestoTable({
  puestos,
  onEdit,
  onDelete,
  getStatusColor,
  busqueda,
  loading = false,
}: PuestoTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Lista de Puestos
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {puestos.length} puestos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-50/80">
                <TableHead className="font-semibold">Nombre del Puesto</TableHead>
                <TableHead className="font-semibold">Área</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Descripción</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : puestos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {busqueda ? (
                        <>
                          <Search className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">
                            No se encontraron puestos
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Intenta con otro término de búsqueda
                          </p>
                        </>
                      ) : (
                        <>
                          <BriefcaseBusiness className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">
                            No hay puestos registrados
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Comienza creando tu primer puesto
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                puestos.map((puesto) => (
                  <TableRow key={puesto.idPuesto} className="hover:bg-slate-50 h-12">
                    <TableCell className="font-medium">
                      {puesto.nombrePuesto}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {puesto.area}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-600">
                      {puesto.descripcion || "Sin descripción"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(puesto.activo)}>
                        {puesto.activo ? "ACTIVO" : "INACTIVO"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => onEdit(puesto)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(puesto)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Más acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem>Historial</DropdownMenuItem>
                              <DropdownMenuItem>Reportes</DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
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