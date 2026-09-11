"use client";

import { useState, useEffect } from "react";
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
import {
  Pencil,
  Trash2,
  Search,
  Building2,
  Layers,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreHorizontal as Ellipsis,
} from "lucide-react";
import { Area } from "@/types/area";
import { Puesto } from "@/types/puestos";

type AreaCompat = Area | Puesto;

function getIdAreaCompat(a: AreaCompat): number {
  return (a as Area).idArea ?? (a as Puesto).idPuesto ?? 0;
}
function getNombreAreaCompat(a: AreaCompat): string {
  return (a as Area).nombreArea ?? (a as Puesto).nombrePuesto ?? (a as any).area ?? "";
}
function getDescripcionCompat(a: AreaCompat): string | undefined {
  return (a as Area).descripcion ?? (a as Puesto).descripcion ?? (a as any).area;
}

interface PuestoTableProps {
  puestos: AreaCompat[];
  onEdit: (puesto: AreaCompat) => void;
  onDelete: (puesto: AreaCompat) => void;
  getStatusColor: (activo: boolean) => string;
  busqueda: string;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Paginación con truncado — mismo patrón que PracticanteTable
// ---------------------------------------------------------------------------
function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) {
    pages.push("...");
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) {
    pages.push("...");
  }
  pages.push(total);
  return pages;
}

// Skeletons para filas de la tabla — 5 columnas espejo
const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell className="text-center">
          <Skeleton className="h-4 w-6 mx-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-6 w-20 mx-auto rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-20 ml-auto" />
        </TableCell>
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = puestos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = puestos.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [puestos, busqueda]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageRange = getPageRange(currentPage, totalPages);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-t border-gray-100">
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems} áreas
        </p>
        <div className="flex items-center gap-1 order-1 sm:order-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Anterior</span>
          </Button>
          {pageRange.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-gray-300"
              >
                <Ellipsis className="h-4 w-4" />
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`h-8 w-8 p-0 text-sm ${
                  currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                }`}
              >
                {page}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Siguiente</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Lista de Áreas
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {totalItems} áreas
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider w-10 text-center">
                  #
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  Nombre del Área
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider hidden md:table-cell">
                  Descripción
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {busqueda ? (
                        <>
                          <Search className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">No se encontraron áreas</p>
                          <p className="text-xs text-gray-500 mt-1">Intenta con otro término de búsqueda</p>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">No hay áreas registradas</p>
                          <p className="text-xs text-gray-500 mt-1">Comienza creando tu primera área</p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((puesto, index) => {
                  const globalIndex = startIndex + index + 1;
                  return (
                    <TableRow key={getIdAreaCompat(puesto)} className="hover:bg-slate-50 h-11">
                      <TableCell className="text-center text-xs text-slate-500">
                        {globalIndex}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                        {getNombreAreaCompat(puesto)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-slate-600 max-w-[320px] truncate">
                        {getDescripcionCompat(puesto) || "Sin descripción"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getStatusColor(puesto.activo)} rounded-full px-2 py-0.5 text-xs`}>
                          {puesto.activo ? "ACTIVO" : "INACTIVO"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            onClick={() => onEdit(puesto)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete(puesto)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <div className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-100 cursor-pointer text-gray-600">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                                <span className="sr-only">Más acciones</span>
                              </div>
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && renderPagination()}
      </CardContent>
    </Card>
  );
}
