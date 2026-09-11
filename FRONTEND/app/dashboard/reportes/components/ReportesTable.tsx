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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal as Ellipsis,
} from "lucide-react";
import {
  Search,
  Users,
  ClipboardList,
  MapPin,
  Eye,
  NotepadText,
} from "lucide-react";
import { Practicante } from "@/types/practicante";

interface ReportesPracticantesTableProps {
  practicantes: Practicante[];
  busqueda: string;
  loading?: boolean;
  getStatusColor: (status: string) => string;
  onViewReporte?: (practicante: Practicante) => void;
}

const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-slate-100 text-slate-700 border-slate-200",
];
function getAvatarColor(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

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

const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell className="text-center">
          <Skeleton className="h-4 w-6 mx-auto" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20 mx-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16 mx-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16 mx-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-16 rounded-full" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-6 w-16 mx-auto rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-20 ml-auto" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

export function ReportesPracticantesTable({
  practicantes,
  busqueda,
  loading = false,
  getStatusColor,
  onViewReporte,
}: ReportesPracticantesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = practicantes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = practicantes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [practicantes, busqueda]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageRange = getPageRange(currentPage, totalPages);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-t border-gray-100">
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems}
        </p>
        <div className="flex items-center gap-1 order-1 sm:order-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 transition-colors duration-150"
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
                  currentPage === page
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : ""
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
            className="h-8 w-8 p-0 transition-colors duration-150"
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
            <ClipboardList className="h-4 w-4" />
            Lista de practicantes
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {totalItems} practicantes
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
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider min-w-[200px]">
                  Practicante
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  DNI
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  Sede
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  Área
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  Cargo
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">
                  Acción
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {busqueda ? (
                        <>
                          <Search className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">
                            No se encontraron practicantes
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Intenta con otro término de búsqueda
                          </p>
                        </>
                      ) : (
                        <>
                          <Users className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">
                            No hay practicantes registrados
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Comienza creando tu primer practicante
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((practicante, index) => {
                  const globalIndex = startIndex + index + 1;
                  return (
                    <TableRow
                      key={practicante.idPracticante}
                      className="hover:bg-slate-50 h-11 transition-colors duration-150"
                    >
                      <TableCell className="text-center text-xs text-slate-500">
                        {globalIndex}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 text-xs font-medium border">
                            <AvatarFallback
                              className={getAvatarColor(
                                practicante.idPracticante,
                                practicante.nombreCompleto,
                              )}
                            >
                              {getInitials(practicante.nombreCompleto)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                            {practicante.nombreCompleto}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {practicante.documento}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          {practicante.sede || practicante.agencia || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                          {practicante.nombreArea ||
                            practicante.area ||
                            practicante.puesto ||
                            "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-white border-slate-200 text-slate-700 text-xs font-medium"
                        >
                          {practicante.cargo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${getStatusColor(practicante.situacion)} rounded-full px-2 py-0.5 text-xs`}
                        >
                          {practicante.situacion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {" "}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-full border-blue-200 bg-white p-0 text-blue-700 hover:bg-blue-50"
                                onClick={() => onViewReporte?.(practicante)}
                              >
                                <NotepadText className="h-3.5 w-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent
                            className="bg-blue-700 text-white [&>svg]:fill-blue-700 [&>svg]:bg-blue-700"
                          >
                            <p>Generar reporte</p>
                          </TooltipContent>
                        </Tooltip>
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

// Compatibilidad: mantener export antiguo si algún archivo lo importa como PracticanteTable
export const PracticanteTable = ReportesPracticantesTable;
