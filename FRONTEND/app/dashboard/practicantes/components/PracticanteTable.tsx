"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoreHorizontal as Ellipsis } from "lucide-react";
import {
  Pencil,
  Trash2,
  Search,
  Users,
  MoreHorizontal,
  ClipboardList,
  QrCode,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Practicante } from "@/types/practicante";

interface PracticanteTableProps {
  practicantes: Practicante[];
  onEdit: (practicante: Practicante) => void;
  onDelete: (practicante: Practicante) => void;
  onShowQR?: (practicante: Practicante) => void;
  getStatusColor: (status: string) => string;
  busqueda: string;
  loading?: boolean;
  onShowDetail?: (practicante: Practicante) => void;
}

const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

// ---------------------------------------------------------------------------
// Paginación con truncado
// ---------------------------------------------------------------------------

/**
 * Genera la lista de "páginas" a mostrar, insertando el string "..." donde
 * corresponde saltar. Ejemplo con currentPage=6, totalPages=24:
 * [1, "...", 5, 6, 7, "...", 24]
 */
function getPageRange(current: number, total: number): (number | "...")[] {
  // Si hay pocas páginas, mostrar todas
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Siempre mostrar: [1, ..., current-1, current, current+1, ..., total]
  const pages: (number | "...")[] = [];

  // Siempre mostrar la primera página
  pages.push(1);

  // Si current está lejos de la primera página, mostrar "..."
  if (current > 3) {
    pages.push("...");
  }

  // Mostrar páginas alrededor de la actual (1 a la izquierda, 1 a la derecha)
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Si current está lejos de la última página, mostrar "..."
  if (current < total - 2) {
    pages.push("...");
  }

  // Siempre mostrar la última página
  pages.push(total);

  return pages;
}

// Skeletons para filas de la tabla
const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
        <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
        <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
      </TableRow>
    ))}
  </>
);

export function PracticanteTable({
  practicantes,
  onEdit,
  onDelete,
  onShowQR,
  getStatusColor,
  busqueda,
  loading = false,
  onShowDetail,
}: PracticanteTableProps) {
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
              <TableRow className="bg-gray-100 hover:bg-gray-50/80">
                <TableHead className="font-semibold w-12 text-center">#</TableHead>
                <TableHead className="font-semibold">Nombre completo</TableHead>
                <TableHead className="font-semibold">Documento</TableHead>
                <TableHead className="font-semibold">Sede</TableHead>
                <TableHead className="font-semibold">Cargo</TableHead>
                <TableHead className="font-semibold text-center">Horas</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
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
                    <TableRow key={practicante.idPracticante} className="hover:bg-slate-50 h-12">
                      <TableCell className="text-center text-sm text-gray-500">
                        {globalIndex}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 text-xs font-medium">
                            <AvatarFallback className="text-blue-700 bg-blue-200">
                              {getInitials(practicante.nombreCompleto)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{practicante.nombreCompleto}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{practicante.documento}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-black border-purple-200"
                        >
                          {practicante.sede || (practicante as any).agencia}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {practicante.cargo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 text-center">
                        {practicante.horasSemanalesRequeridas}h
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(practicante.situacion)}>
                          {practicante.situacion}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onShowQR && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              onClick={() => onShowQR(practicante)}
                              title="Ver QR"
                            >
                              <QrCode className="h-4 w-4" />
                              <span className="sr-only">QR</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onEdit(practicante)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete(practicante)}
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
                                {onShowQR && (
                                  <DropdownMenuItem onClick={() => onShowQR(practicante)}>
                                    <QrCode className="h-4 w-4 mr-2" /> Ver QR
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onShowDetail?.(practicante)}>
                                  <User className="h-4 w-4 mr-2" /> Ver detalles
                                </DropdownMenuItem>
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