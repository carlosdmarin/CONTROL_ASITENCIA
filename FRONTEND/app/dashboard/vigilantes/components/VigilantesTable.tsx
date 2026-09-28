"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal as Ellipsis,
  Search,
  Users,
  MapPin,
  KeyRound,
  ShieldCheck,
  ShieldPlus,
  UserRoundCog,
  AtSign,
  Radio,
  PowerOff,
  RotateCcw,
} from "lucide-react";

export type VigilanteMock = {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  usuario: string;
  sede: string;
  estado: "ACTIVO" | "INACTIVO";
};

interface VigilantesTableProps {
  vigilantes: VigilanteMock[];
  loading?: boolean;
  busqueda?: string;
  onChangePassword: (vigilante: VigilanteMock) => void;
  onToggleEstado?: (vigilante: VigilanteMock) => void;
  onCreate?: () => void;
}

const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

function toTitleCase(texto: string) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-400 via-amber-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-cyan-400 via-sky-500 to-blue-600",
];

function getAvatarGradient(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index} className="h-[64px] border-b border-slate-100">
        <TableCell className="text-center">
          <Skeleton className="h-4 w-6 mx-auto" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-6 w-24 mx-auto rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-9 w-20 ml-auto rounded-lg" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

export default function VigilantesTable({
  vigilantes,
  loading = false,
  busqueda = "",
  onChangePassword,
  onToggleEstado,
  onCreate,
}: VigilantesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = vigilantes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = vigilantes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [vigilantes, busqueda]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageRange = getPageRange(currentPage, totalPages);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50/50">
        <p className="text-[11.5px] text-slate-500 order-2 sm:order-1">
          Mostrando{" "}
          <span className="font-semibold text-slate-700">
            {startIndex + 1}–{Math.min(endIndex, totalItems)}
          </span>{" "}
          de <span className="font-semibold text-slate-700">{totalItems}</span>
        </p>
        <div className="flex items-center gap-1 order-1 sm:order-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Anterior</span>
          </Button>
          {pageRange.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-slate-300"
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
                className={`h-8 w-8 p-0 text-xs font-medium ${
                  currentPage === page
                    ? "bg-blue-700 hover:bg-blue-800 text-white border-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
            className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Siguiente</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
      {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
      <div className="relative border-b border-slate-200">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <UserRoundCog
                  className="h-5 w-5 text-white"
                  strokeWidth={2.2}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight uppercase">
                  Vigilantes
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  <Radio className="h-2.5 w-2.5" />
                  En vivo
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Control de acceso · {totalItems}{" "}
                {totalItems === 1 ? "operador" : "operadores"}
              </p>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-7 w-28 rounded-full" />
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 bg-white border-slate-200 text-slate-700 rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              {totalItems} {totalItems === 1 ? "vigilante" : "vigilantes"}
            </Badge>
          )}
        </div>
      </div>

      {/* ═══════════ TABLE ═══════════ */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60 hover:bg-slate-50/60 border-b border-slate-200">
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 w-12 text-center">
                  #
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 min-w-[240px]">
                  Vigilante
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Sede
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Estado
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-right pr-5">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center px-4 py-8">
                      {busqueda ? (
                        <>
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800">
                            Sin resultados
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">
                            No se encontraron vigilantes para{" "}
                            <span className="font-mono text-slate-700">
                              "{busqueda}"
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                            <ShieldCheck
                              className="h-6 w-6 text-blue-600"
                              strokeWidth={2}
                            />
                          </div>
                          <p className="text-sm font-semibold text-slate-800">
                            No hay vigilantes registrados
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Los usuarios creados para el control de asistencia
                            aparecerán aquí
                          </p>
                          {onCreate && (
                            <Button
                              className="mt-5 gap-2 bg-blue-700 hover:bg-blue-800 shadow-sm"
                              onClick={onCreate}
                            >
                              <ShieldPlus className="h-4 w-4" />
                              Crear vigilante
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((v, index) => {
                  const globalIndex = startIndex + index + 1;
                  const activo = v.estado === "ACTIVO";
                  const gradient = getAvatarGradient(v.id, v.nombreCompleto);
                  const nombreDisplay = toTitleCase(v.nombreCompleto);

                  return (
                    <TableRow
                      key={v.id}
                      className="h-[64px] border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150 group"
                    >
                      {/* Nº */}
                      <TableCell className="text-center">
                        <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                          {String(globalIndex).padStart(2, "0")}
                        </span>
                      </TableCell>

                      {/* Vigilante */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[13px] font-bold shadow-sm shrink-0`}
                          >
                            {getInitials(nombreDisplay)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight tracking-tight">
                              {nombreDisplay}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="inline-flex items-center gap-1 font-mono">
                                <AtSign className="h-3 w-3" />
                                {v.usuario}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono text-slate-400">
                                ID-{String(v.id).padStart(3, "0")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Sede — mini-card */}
                      <TableCell>
                        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                          <div className="h-6 w-6 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                            <MapPin
                              className="h-3 w-3 text-blue-700"
                              strokeWidth={2.4}
                            />
                          </div>
                          <span className="text-[12px] font-medium text-slate-700 truncate max-w-[160px]">
                            {v.sede || "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="text-center">
                        {activo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            ACTIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            INACTIVO
                          </span>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <button
                                  onClick={() => onChangePassword(v)}
                                  className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:text-blue-700 transition-all"
                                  aria-label={`Cambiar contraseña de ${v.usuario}`}
                                >
                                  <KeyRound
                                    className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110"
                                    strokeWidth={2.4}
                                  />
                                </button>
                              }
                            />
                            <TooltipContent className="bg-slate-900 text-white text-xs">
                              <p>Cambiar contraseña</p>
                            </TooltipContent>
                          </Tooltip>

                          {onToggleEstado &&
                            (activo ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <button
                                      onClick={() => onToggleEstado(v)}
                                      className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 hover:border-amber-200 hover:text-amber-700 transition-all"
                                      aria-label={`Desactivar ${v.usuario}`}
                                    >
                                      <PowerOff
                                        className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110"
                                        strokeWidth={2.4}
                                      />
                                    </button>
                                  }
                                />
                                <TooltipContent className="bg-slate-900 text-white text-xs">
                                  <p>Desactivar vigilante</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <button
                                      onClick={() => onToggleEstado(v)}
                                      className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 hover:text-emerald-700 transition-all"
                                      aria-label={`Activar ${v.usuario}`}
                                    >
                                      <RotateCcw
                                        className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110"
                                        strokeWidth={2.4}
                                      />
                                    </button>
                                  }
                                />
                                <TooltipContent className="bg-slate-900 text-white text-xs">
                                  <p>Activar vigilante</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
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

        {/* ═══════════ FOOTER ═══════════ */}
        {!loading && totalItems > 0 && (
          <div className="flex items-center justify-between bg-slate-50/60 border-t border-slate-100 px-6 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Users className="h-3.5 w-3.5" />
              <span>
                <span className="font-semibold text-slate-700">
                  {totalItems}
                </span>{" "}
                {totalItems === 1 ? "operador" : "operadores"} en el sistema
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Actualizado ahora
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}