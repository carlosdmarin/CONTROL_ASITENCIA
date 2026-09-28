"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Users,
  Pencil,
  FileCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreHorizontal as Ellipsis,
  Search,
  MapPin,
  Radio,
  BriefcaseBusiness,
  Clock,
  CheckCircle2,
  ClockAlert,
  XCircle,
  MinusCircle,
  Coffee,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import {
  AsistenciaDiaria,
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
  getSituacionLabel,
} from "@/types/asistencia";
import { toast } from "sonner";
import AsistenciaDetalleDialog from "./AsistenciaDetalleDialog";
import AsistenciaCorregirDialog from "./AsistenciaCorregirDialog";
import AsistenciaJustificarDialog from "./AsistenciaJustificarDialog";

type AsistenciaRow = AsistenciaDiaria & {
  documento?: string;
  sede?: string;
  oficina?: string;
  jornada?: string;
};

interface AsistenciaTableProps {
  asistencias: AsistenciaRow[];
  rawData?: AsistenciaDiariaResponse[];
  filas?: Array<{ ui: AsistenciaRow; raw: AsistenciaDiariaResponse }>;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function AsistenciaTable({
  asistencias,
  rawData = [],
  filas,
  loading = false,
  onRefresh,
}: AsistenciaTableProps) {
  // ===================== ESTADOS DE DIALOGS =====================
  const [justificarOpen, setJustificarOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const [verOpen, setVerOpen] = useState(false);

  const [selectedJustificar, setSelectedJustificar] =
    useState<AsistenciaDiariaResponse | null>(null);
  const [selectedEditar, setSelectedEditar] =
    useState<AsistenciaDiariaResponse | null>(null);
  const [selectedVer, setSelectedVer] =
    useState<AsistenciaDiariaResponse | null>(null);

  // ===================== PAGINACIÓN =====================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const effectiveFilas = useMemo(() => {
    if (filas && filas.length >= 0) return filas;
    return asistencias
      .map((ui, i) => ({ ui, raw: rawData[i] as AsistenciaDiariaResponse }))
      .filter((f) => f.raw);
  }, [filas, asistencias, rawData]);

  const totalItems = effectiveFilas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFilas = effectiveFilas.slice(startIndex, endIndex);
  const currentAsistencias = currentFilas.map((f) => f.ui);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveFilas]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // ===================== HELPERS =====================
  function getPageRange(current: number, total: number): (number | "...")[] {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }

  function toTitleCase(texto: string) {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  }

  function getInitials(nombre: string) {
    if (!nombre) return "?";
    const partes = nombre.split(" ");
    if (partes.length >= 2) {
      return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
    }
    return nombre.charAt(0) || "?";
  }

  const AVATAR_GRADIENTS = [
    "from-blue-500 via-blue-600 to-indigo-700",
    "from-emerald-500 via-teal-500 to-cyan-600",
    "from-orange-400 via-amber-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-600",
    "from-violet-500 via-purple-500 to-fuchsia-600",
    "from-cyan-400 via-sky-500 to-blue-600",
  ];

  function getAvatarGradient(id: number | null | undefined, nombre: string) {
    const str = `${id ?? 0}-${nombre}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++)
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  }

  const getEstadoBadge = (
    estado: string,
  ): { label: string; className: string; icon: React.ElementType } => {
    const n = normalizeEstadoDia(estado);
    const config: Record<
      string,
      { label: string; className: string; icon: React.ElementType }
    > = {
      SIN_MARCAR: {
        label: "Sin marcar",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: MinusCircle,
      },
      PRESENTE: {
        label: "Presente",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      },
      TARDANZA: {
        label: "Tardanza",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ClockAlert,
      },
      AUSENTE: {
        label: "Ausente",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
      },
      DESCANSO: {
        label: "Descanso",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: Coffee,
      },
      JUSTIFICADO: {
        label: "Justificado",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: ShieldCheck,
      },
    };
    return (
      config[n] ||
      config[estado] || {
        label: n,
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: MinusCircle,
      }
    );
  };

  const getSituacionBadge = (situacion?: string | null) => {
    const s = situacion || "NINGUNA";
    if (s === "NINGUNA")
      return {
        label: "Ninguna",
        className: "bg-slate-50 text-slate-500 border-slate-200",
        icon: MinusCircle,
      };
    if (s === "TARDANZA_JUSTIFICADA")
      return {
        label: "Tardanza justificada",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: ShieldCheck,
      };
    if (s === "SALIDA_ANTICIPADA_JUSTIFICADA")
      return {
        label: "Salida anticipada justificada",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      };
    if (s === "INASISTENCIA_JUSTIFICADA")
      return {
        label: "Inasistencia justificada",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: ShieldOff,
      };
    return {
      label: getSituacionLabel(s),
      className: "bg-slate-50 text-slate-600 border-slate-200",
      icon: FileCheck,
    };
  };

  const isJustificado = (r: AsistenciaDiariaResponse | undefined) => {
    if (!r) return false;
    return (
      Boolean(r.justificado) ||
      normalizeEstadoDia(r.estadoDia) === "JUSTIFICADO" ||
      r.estadoVisual === "TARDANZA_JUSTIFICADA" ||
      r.estadoVisual === "INASISTENCIA_JUSTIFICADA"
    );
  };

  const hasJustificacion = (r: AsistenciaDiariaResponse | undefined) => {
    if (!r) return false;
    return (
      Boolean(r.justificado) &&
      Boolean(
        r.justificacionMotivo || r.justificacionTipo || r.justificacionFecha,
      )
    );
  };

  const isDescanso = (r: AsistenciaDiariaResponse | undefined) => {
    if (!r) return false;
    return normalizeEstadoDia(r.estadoDia) === "DESCANSO";
  };

  // ===================== HANDLERS DE APERTURA =====================
  const openJustificar = (raw: AsistenciaDiariaResponse) => {
    const r = raw;
    if (!r || !r.idAsistencia) {
      toast.error(
        "No se puede justificar: aún no existe registro (SIN_MARCAR). Registre primero o use permiso previo.",
      );
      return;
    }
    if (isDescanso(r)) {
      toast.info("No se puede justificar en día de descanso");
      return;
    }
    setSelectedJustificar(r);
    setJustificarOpen(true);
  };

  const openEditar = (raw: AsistenciaDiariaResponse) => {
    const r = raw;
    if (!r) return;
    if (isDescanso(r)) {
      toast.info("No se puede editar en día de descanso");
      return;
    }
    if (isJustificado(r)) {
      toast.info("No se puede editar una asistencia justificada");
      return;
    }
    setSelectedEditar(r);
    setEditarOpen(true);
  };

  const openVer = (raw: AsistenciaDiariaResponse) => {
    const r = raw;
    if (!r) return;
    setSelectedVer(r);
    setVerOpen(true);
  };

  // ===================== SKELETON =====================
  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="h-[68px] border-b border-slate-100">
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
          <TableCell>
            <Skeleton className="h-7 w-28 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24 mx-auto" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 mx-auto rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-20 mx-auto rounded-full" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-20 mx-auto rounded-full" />
          </TableCell>
          <TableCell className="text-right pr-5">
            <Skeleton className="h-9 w-24 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  // ===================== RENDER PAGINACIÓN =====================
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

  // ===================== RENDER PRINCIPAL =====================
  return (
    <>
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <div className="relative border-b border-slate-200">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                  <Calendar className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight uppercase">
                    Registro de asistencia
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    <Radio className="h-2.5 w-2.5" />
                    En vivo
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Marcaciones del día
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
                {totalItems} {totalItems === 1 ? "practicante" : "practicantes"}
              </Badge>
            )}
          </div>
        </div>

        {/* ═══════════ TABLE ═══════════ */}
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 hover:bg-slate-50/60 border-b border-slate-200">
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 w-12 text-center">
                    #
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 min-w-[240px]">
                    Practicante
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    Sede
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    Oficina
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">
                    Jornada
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">
                    Entrada
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                    Tardanza
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                    Salida
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">
                    Tiempo trab.
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                    Estado
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                    Situación
                  </TableHead>
                  <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-right pr-5">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : currentAsistencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-72 text-center">
                      <div className="flex flex-col items-center justify-center px-4 py-8">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                          <Search className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          Sin registros para mostrar
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">
                          Intenta ajustar los filtros de búsqueda o la fecha
                          seleccionada.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentFilas.map(({ ui: asistencia, raw }, index) => {
                    const estado = getEstadoBadge(asistencia.estado);
                    const justificado = isJustificado(raw);
                    const descanso = isDescanso(raw);
                    const puedeJustificar = !!raw && !descanso && !!raw.idAsistencia;
                    const puedeVer = hasJustificacion(raw) && !descanso;
                    const editarDisabled = justificado || descanso;
                    const globalIndex = startIndex + index;
                    const rowKey = raw?.idAsistencia
                      ? String(raw.idAsistencia)
                      : `${raw?.idPracticante ?? globalIndex}-${raw?.fecha ?? globalIndex}`;
                    const gradient = getAvatarGradient(
                      raw?.idPracticante,
                      asistencia.practicante,
                    );
                    const documento = asistencia.documento;
                    const nombreDisplay = toTitleCase(asistencia.practicante);

                    return (
                      <TableRow
                        key={rowKey}
                        className="h-[68px] border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        {/* Nº */}
                        <TableCell className="text-center">
                          <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                            {String(globalIndex + 1).padStart(2, "0")}
                          </span>
                        </TableCell>

                        {/* Practicante */}
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
                              <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                                DNI:{" "}
                                {documento && documento.trim()
                                  ? documento
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Sede */}
                        <TableCell>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="h-6 w-6 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                              <MapPin
                                className="h-3 w-3 text-blue-700"
                                strokeWidth={2.4}
                              />
                            </div>
                            <span className="text-[12px] font-medium text-slate-700 truncate max-w-[130px]">
                              {asistencia.sede || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Oficina */}
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-700 bg-slate-100 border border-slate-200/70 rounded-md px-2 py-1">
                            <BriefcaseBusiness
                              className="h-3 w-3 text-slate-500 shrink-0"
                              strokeWidth={2.4}
                            />
                            <span className="truncate max-w-[140px]">
                              {asistencia.oficina || "—"}
                            </span>
                          </span>
                        </TableCell>

                        {/* Jornada */}
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-slate-700 tabular-nums whitespace-nowrap">
                            <Clock
                              className="h-3 w-3 text-slate-400 shrink-0"
                              strokeWidth={2.4}
                            />
                            {asistencia.jornada ||
                              (raw?.entradaEsperada && raw?.salidaEsperada
                                ? `${raw.entradaEsperada.substring(0, 5)} – ${raw.salidaEsperada.substring(0, 5)}`
                                : "—")}
                          </span>
                        </TableCell>

                        {/* Entrada */}
                        <TableCell className="text-center">
                          <span className="font-mono text-[12.5px] font-semibold text-slate-800 tabular-nums">
                            {asistencia.entrada || "—"}
                          </span>
                        </TableCell>

                        {/* Tardanza */}
                        <TableCell className="text-center">
                          {raw?.minutosTardanza && raw.minutosTardanza > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
                              +{raw.minutosTardanza} MIN
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[12px]">
                              —
                            </span>
                          )}
                        </TableCell>

                        {/* Salida */}
                        <TableCell className="text-center">
                          <span className="font-mono text-[12.5px] font-semibold text-slate-800 tabular-nums">
                            {asistencia.salida || "—"}
                          </span>
                        </TableCell>

                        {/* Tiempo trabajado */}
                        <TableCell className="text-center">
                          <span className="font-mono text-[12.5px] text-slate-700 tabular-nums">
                            {asistencia.horas || "—"}
                          </span>
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="text-center">
                          <Badge
                            className={`${estado.className} inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold tracking-wide rounded-full`}
                          >
                            <estado.icon
                              className="h-3 w-3"
                              strokeWidth={2.4}
                            />
                            {estado.label.toUpperCase()}
                          </Badge>
                        </TableCell>

                        {/* Situación */}
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1 items-center">
                            {(() => {
                              const rawSit = raw?.situaciones as
                                | string[]
                                | undefined;
                              const rawSingle = raw?.situacion as
                                | string
                                | undefined;
                              const list =
                                rawSit && rawSit.length > 0
                                  ? rawSit
                                  : [rawSingle || "NINGUNA"];
                              const filtered = list.filter(
                                (s) => s !== "NINGUNA",
                              );
                              const displayList =
                                filtered.length > 0
                                  ? filtered
                                  : (["NINGUNA"] as string[]);
                              return displayList.map((s, i) => {
                                const sit = getSituacionBadge(s);
                                return (
                                  <Badge
                                    key={i}
                                    className={`${sit.className} inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold tracking-wide rounded-full`}
                                  >
                                    <sit.icon
                                      className="h-3 w-3"
                                      strokeWidth={2.4}
                                    />
                                    {sit.label.toUpperCase()}
                                  </Badge>
                                );
                              });
                            })()}
                          </div>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="text-right pr-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={!puedeVer}
                              title={
                                !puedeVer ? "Sin justificación" : "Ver detalle"
                              }
                              aria-label="Ver detalle"
                              onClick={() => openVer(raw)}
                              className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-slate-500 transition-all"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              disabled={editarDisabled}
                              title={
                                descanso
                                  ? "No editable: descanso"
                                  : justificado
                                    ? "No editable: justificado"
                                    : "Corregir"
                              }
                              aria-label="Corregir"
                              onClick={() => openEditar(raw)}
                              className="h-9 w-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50 disabled:hover:border-blue-100 disabled:hover:text-blue-600 transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <div
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-500 hover:text-slate-700 transition-all"
                                  aria-label="Más acciones"
                                  role="button"
                                  tabIndex={0}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48"
                              >
                                <DropdownMenuItem
                                  onClick={() => openVer(raw)}
                                  disabled={!puedeVer}
                                  className="gap-2 text-[13px]"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />{" "}
                                  Ver detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditar(raw)}
                                  disabled={editarDisabled}
                                  className="gap-2 text-[13px]"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-400" />{" "}
                                  Corregir
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openJustificar(raw)}
                                  disabled={!puedeJustificar}
                                  className="gap-2 text-[13px]"
                                >
                                  <FileCheck className="h-3.5 w-3.5 text-slate-400" />{" "}
                                  Justificar
                                </DropdownMenuItem>
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

          {/* ═══════════ FOOTER ═══════════ */}
          {!loading && totalItems > 0 && (
            <div className="flex items-center justify-between bg-slate-50/60 border-t border-slate-100 px-6 py-2.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Users className="h-3.5 w-3.5" />
                <span>
                  <span className="font-semibold text-slate-700">
                    {totalItems}
                  </span>{" "}
                  {totalItems === 1 ? "registro" : "registros"} en total
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

      {/* ═══════════ DIALOGS (todos componentes externos) ═══════════ */}
      <AsistenciaJustificarDialog
        open={justificarOpen}
        onOpenChange={(open) => {
          setJustificarOpen(open);
          if (!open) setSelectedJustificar(null);
        }}
        asistencia={selectedJustificar}
        onSuccess={onRefresh}
      />
      <AsistenciaCorregirDialog
        open={editarOpen}
        onOpenChange={setEditarOpen}
        asistencia={selectedEditar}
        onSuccess={onRefresh}
      />
      <AsistenciaDetalleDialog
        open={verOpen}
        onOpenChange={setVerOpen}
        asistencia={selectedVer}
      />
    </>
  );
}