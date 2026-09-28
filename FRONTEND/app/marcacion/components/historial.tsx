"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Eye,
  X,
  Radio,
  User,
  IdCard,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  FileText,
  Sparkles,
  CalendarDays,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { asistenciasApi } from "@/lib/api/asistencias";
import type { MarcacionHistorial } from "@/types/asistencia";

const POR_PAGINA = 10;
const FILTRO_TODOS = "TODOS";

interface HistorialProps {
  onBack?: () => void;
}

/* ═══════════ HELPERS ═══════════ */

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "—";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearHora(hora?: string | null) {
  if (!hora) return "—";
  return hora.slice(0, 5);
}

function formatearFechaHora(fechaHora?: string | null) {
  if (!fechaHora) return "—";
  const [fecha, hora = ""] = fechaHora.split("T");
  return `${formatearFecha(fecha)} ${hora.slice(0, 8)}`.trim();
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-400 via-amber-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-cyan-400 via-sky-500 to-blue-600",
];

function getAvatarGradient(id: number | string, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInitials(nombreCompleto: string) {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
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

/* ═══════════ SKELETON ═══════════ */

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
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-7 w-24 rounded-md" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-4 w-20 mx-auto" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-4 w-14 mx-auto" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-6 w-20 mx-auto rounded-md" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-6 w-20 mx-auto rounded-full" />
        </TableCell>
        <TableCell className="text-right pr-5">
          <Skeleton className="h-9 w-9 ml-auto rounded-lg" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

/* ═══════════ COMPONENTE PRINCIPAL ═══════════ */

export default function Historial({ onBack }: HistorialProps) {
  const [marcaciones, setMarcaciones] = useState<MarcacionHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>(FILTRO_TODOS);
  const [pagina, setPagina] = useState(1);
  const [detalle, setDetalle] = useState<MarcacionHistorial | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await asistenciasApi.getHistorialMarcacionesSede();
      setMarcaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cargar el historial de marcaciones",
      );
      setMarcaciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const hayFiltros = busqueda.trim() !== "" || tipoFiltro !== FILTRO_TODOS;

  const filtradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return marcaciones.filter((m) => {
      if (tipoFiltro !== FILTRO_TODOS && m.tipoMarcacion !== tipoFiltro)
        return false;
      if (!term) return true;
      const nombre = (m.nombreCompleto ?? "").toLowerCase();
      const documento = (m.documento ?? "").toLowerCase();
      return nombre.includes(term) || documento.includes(term);
    });
  }, [marcaciones, busqueda, tipoFiltro]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, tipoFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const startIndex = (paginaActual - 1) * POR_PAGINA;
  const endIndex = startIndex + POR_PAGINA;
  const visibles = filtradas.slice(startIndex, endIndex);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPaginas) return;
    setPagina(p);
  };

  const renderPagination = () => {
    if (totalPaginas <= 1) return null;
    const pageRange = getPageRange(paginaActual, totalPaginas);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50/50">
        <p className="text-[11.5px] text-slate-500 order-2 sm:order-1">
          Mostrando{" "}
          <span className="font-semibold text-slate-700">
            {startIndex + 1}–{Math.min(endIndex, filtradas.length)}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-slate-700">
            {filtradas.length}
          </span>
        </p>
        <div className="flex items-center gap-1 order-1 sm:order-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="h-8 w-8 p-0 border-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Anterior</span>
          </Button>
          {pageRange.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-slate-300"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={paginaActual === p ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(p)}
                aria-current={paginaActual === p ? "page" : undefined}
                className={`h-8 w-8 p-0 text-xs font-medium ${
                  paginaActual === p
                    ? "bg-blue-700 hover:bg-blue-800 text-white border-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
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
    <div className="min-h-[100dvh] bg-slate-50">
      {/* ═══════════ HEADER RESPONSIVE ═══════════ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 pt-[max(0px,env(safe-area-inset-top))]">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            {/* ─── Bloque izquierdo: volver + ícono + título ─── */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  aria-label="Volver"
                  className="h-11 w-11 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0"
                >
                  <ArrowLeft className="h-9 w-9" strokeWidth={2.4} />
                </Button>
              )}

              <div className="relative shrink-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                  <Calendar
                    className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                    strokeWidth={2.2}
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {/* Título + badge en la misma línea */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[14px] sm:text-[15px] font-bold text-slate-900 tracking-tight leading-tight uppercase">
                    <span className="hidden sm:inline">
                      Historial de marcaciones
                    </span>
                    <span className="sm:hidden">Historial</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider shrink-0">
                    <Radio className="h-2.5 w-2.5" />
                    En vivo
                  </span>
                </div>

                {/* Subtítulo + conteo en mobile */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-[11px] sm:text-[12px] text-slate-500 truncate">
                    <span className="hidden sm:inline">
                      Marcaciones de tu sede
                    </span>
                    <span className="sm:hidden">
                      {!cargando && !error
                        ? `${filtradas.length} ${filtradas.length === 1 ? "marcación" : "marcaciones"}`
                        : "Marcaciones de tu sede"}
                    </span>
                  </p>
                  {/* Conteo en desktop al lado del subtítulo */}
                  {!cargando && !error && (
                    <>
                      <span className="hidden sm:inline text-slate-300">·</span>
                      <span className="hidden sm:inline text-[12px] text-slate-500 font-medium tabular-nums">
                        {filtradas.length}{" "}
                        {filtradas.length === 1 ? "marcación" : "marcaciones"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Badge derecho (solo desktop) ─── */}
            {!cargando && !error && (
              <Badge
                variant="outline"
                className="hidden sm:inline-flex gap-1.5 bg-white border-slate-200 text-slate-700 rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {filtradas.length}{" "}
                {filtradas.length === 1 ? "marcación" : "marcaciones"}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ CONTENIDO ═══════════ */}
      <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* ─── PANEL DE FILTROS ─── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <SlidersHorizontal
                    className="h-3.5 w-3.5 text-slate-600"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
                    Búsqueda y filtros
                  </h3>
                  {hayFiltros && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Activos
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {hayFiltros && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda("");
                      setTipoFiltro(FILTRO_TODOS);
                    }}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-3 w-3" strokeWidth={2.6} />
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void cargar()}
                  disabled={cargando}
                  aria-label="Actualizar historial"
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${cargando ? "animate-spin" : ""}`}
                    strokeWidth={2.6}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                    strokeWidth={2.2}
                  />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o documento..."
                    aria-label="Buscar marcaciones por nombre o documento"
                    disabled={cargando}
                    className="pl-9 pr-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-[13px] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:border-blue-500 focus-visible:bg-white transition-colors"
                  />
                  {busqueda && (
                    <button
                      type="button"
                      onClick={() => setBusqueda("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </button>
                  )}
                </div>

                <Select
                  value={tipoFiltro}
                  onValueChange={(v) => setTipoFiltro(v ?? FILTRO_TODOS)}
                  disabled={cargando}
                >
                  <SelectTrigger
                    className={`w-full sm:w-48 h-10 rounded-xl text-[13px] transition-colors ${
                      tipoFiltro !== FILTRO_TODOS
                        ? "bg-blue-50 border-blue-200 text-blue-800"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                    }`}
                    aria-label="Filtrar por tipo de marcación"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <SlidersHorizontal
                        className={`h-3.5 w-3.5 shrink-0 ${
                          tipoFiltro !== FILTRO_TODOS
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                        strokeWidth={2.4}
                      />
                      <SelectValue placeholder="Todos los tipos" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTRO_TODOS}>
                      Todos los tipos
                    </SelectItem>
                    <SelectItem value="ENTRADA">Entradas</SelectItem>
                    <SelectItem value="SALIDA">Salidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ─── TABLA ─── */}
          <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0">
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
                        Documento
                      </TableHead>
                      <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">
                        Fecha
                      </TableHead>
                      <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Hora
                      </TableHead>
                      <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Tipo
                      </TableHead>
                      <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Estado
                      </TableHead>
                      <TableHead className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 text-right pr-5">
                        Acción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* CARGANDO */}
                    {cargando && <TableSkeleton />}

                    {/* ERROR */}
                    {!cargando && error && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-72 text-center">
                          <div className="flex flex-col items-center justify-center px-4 py-8">
                            <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                              <AlertCircle
                                className="h-6 w-6 text-rose-600"
                                strokeWidth={2}
                              />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                              No se pudo cargar el historial
                            </p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                              {error}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void cargar()}
                              className="mt-5 gap-2 border-slate-200 hover:bg-slate-50"
                            >
                              <RefreshCw
                                className="h-3.5 w-3.5"
                                strokeWidth={2.4}
                              />
                              Reintentar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* SIN MARCACIONES */}
                    {!cargando && !error && marcaciones.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-72 text-center">
                          <div className="flex flex-col items-center justify-center px-4 py-8">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                              <CalendarX2
                                className="h-6 w-6 text-slate-400"
                                strokeWidth={2}
                              />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                              Todavía no hay marcaciones
                            </p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">
                              No se han registrado entradas ni salidas en tu
                              sede hoy
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* SIN RESULTADOS DEL FILTRO */}
                    {!cargando &&
                      !error &&
                      marcaciones.length > 0 &&
                      filtradas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="h-72 text-center">
                            <div className="flex flex-col items-center justify-center px-4 py-8">
                              <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                                <Search
                                  className="h-6 w-6 text-slate-400"
                                  strokeWidth={2}
                                />
                              </div>
                              <p className="text-sm font-semibold text-slate-800">
                                Sin coincidencias
                              </p>
                              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                No hay marcaciones que coincidan con la búsqueda
                                o el filtro aplicado
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                    {/* DATOS */}
                    {!cargando &&
                      !error &&
                      visibles.map((m, i) => {
                        const globalIndex = startIndex + i + 1;
                        const isEntrada = m.tipoMarcacion === "ENTRADA";
                        const gradient = getAvatarGradient(
                          m.idMarcacion,
                          m.nombreCompleto ?? "?",
                        );
                        const nombreDisplay = toTitleCase(
                          m.nombreCompleto ?? "",
                        );

                        return (
                          <TableRow
                            key={m.idMarcacion}
                            className="h-[64px] border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150 group"
                          >
                            {/* Nº */}
                            <TableCell className="text-center">
                              <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                {String(globalIndex).padStart(2, "0")}
                              </span>
                            </TableCell>

                            {/* Practicante */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[13px] font-bold shadow-sm shrink-0`}
                                >
                                  {getInitials(nombreDisplay || "?")}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight tracking-tight">
                                    {nombreDisplay || "—"}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                                    DNI {m.documento ?? "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Documento */}
                            <TableCell>
                              <span className="font-mono text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                                {m.documento ?? "—"}
                              </span>
                            </TableCell>

                            {/* Fecha */}
                            <TableCell className="text-center">
                              <span className="font-mono text-[12px] text-slate-600 tabular-nums">
                                {formatearFecha(m.fecha)}
                              </span>
                            </TableCell>

                            {/* Hora */}
                            <TableCell className="text-center">
                              <span className="font-mono text-[12.5px] font-semibold text-slate-800 tabular-nums">
                                {formatearHora(m.horaMarcacion)}
                              </span>
                            </TableCell>

                            {/* Tipo */}
                            <TableCell className="text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
                                  isEntrada
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-blue-50 border-blue-200 text-blue-700"
                                }`}
                              >
                                {isEntrada ? (
                                  <LogIn
                                    className="h-3 w-3"
                                    strokeWidth={2.6}
                                  />
                                ) : (
                                  <LogOut
                                    className="h-3 w-3"
                                    strokeWidth={2.6}
                                  />
                                )}
                                {m.tipoMarcacion === "ENTRADA"
                                  ? "ENTRADA"
                                  : "SALIDA"}
                              </span>
                            </TableCell>

                            {/* Estado */}
                            <TableCell className="text-center">
                              {m.estado ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  {String(m.estado).toUpperCase()}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-[12px]">
                                  —
                                </span>
                              )}
                            </TableCell>

                            {/* Acción */}
                            <TableCell className="text-right pr-5">
                              <button
                                onClick={() => setDetalle(m)}
                                aria-label={`Ver detalle de ${m.nombreCompleto ?? "marcación"}`}
                                className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                              >
                                <Eye
                                  className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110"
                                  strokeWidth={2.4}
                                />
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>

              {!cargando && renderPagination()}

              {/* FOOTER */}
              {!cargando && !error && filtradas.length > 0 && (
                <div className="flex items-center justify-between bg-slate-50/60 border-t border-slate-100 px-6 py-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Inbox className="h-3.5 w-3.5" />
                    <span>
                      <span className="font-semibold text-slate-700">
                        {filtradas.length}
                      </span>{" "}
                      {filtradas.length === 1 ? "marcación" : "marcaciones"} en
                      total
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
        </div>
      </div>

      {/* ═══════════ DIALOG DETALLE ═══════════ */}
      <Dialog
        open={detalle !== null}
        onOpenChange={(open) => !open && setDetalle(null)}
      >
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-md max-h-[92vh] p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
          {/* Header */}
          <DialogHeader className="relative bg-white border-b border-slate-200 px-6 py-5 pr-14 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                  <FileText className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                    Detalle de marcación
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                    Historial
                  </span>
                </div>
                <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                  {toTitleCase(detalle?.nombreCompleto ?? "") || "Practicante"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          {detalle && (
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 sm:p-6 space-y-4">
                {/* Card: Practicante */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <User
                        className="h-3.5 w-3.5 text-blue-700"
                        strokeWidth={2.4}
                      />
                    </div>
                    <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight">
                      Practicante
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                          detalle.idMarcacion,
                          detalle.nombreCompleto ?? "?",
                        )} flex items-center justify-center text-white text-[15px] font-bold shadow-sm shrink-0`}
                      >
                        {getInitials(
                          toTitleCase(detalle.nombreCompleto ?? "") || "?",
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight">
                          {toTitleCase(detalle.nombreCompleto ?? "") || "—"}
                        </p>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 mt-1">
                          <IdCard
                            className="h-3 w-3 text-slate-400"
                            strokeWidth={2.4}
                          />
                          {detalle.documento ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card: Marcación */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Clock
                        className="h-3.5 w-3.5 text-emerald-700"
                        strokeWidth={2.4}
                      />
                    </div>
                    <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight">
                      Marcación
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <DetailRow
                      icon={CalendarDays}
                      label="Fecha"
                      value={formatearFecha(detalle.fecha)}
                      mono
                    />
                    <DetailRow
                      icon={Clock}
                      label="Hora"
                      value={formatearHora(detalle.horaMarcacion)}
                      mono
                    />
                    <DetailRow
                      icon={
                        detalle.tipoMarcacion === "ENTRADA" ? LogIn : LogOut
                      }
                      label="Tipo"
                      value={detalle.tipoMarcacion ?? "—"}
                    />
                  </div>
                </div>

                {/* Card: Detalles */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                    <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-violet-700"
                        strokeWidth={2.4}
                      />
                    </div>
                    <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight">
                      Detalles del registro
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <DetailRow
                      icon={FileText}
                      label="Método"
                      value={detalle.metodoRegistro ?? "—"}
                    />
                    <DetailRow
                      icon={CalendarDays}
                      label="Registrada"
                      value={formatearFechaHora(detalle.fechaRegistro)}
                      mono
                    />
                    <DetailRow
                      icon={CheckCircle2}
                      label="Estado"
                      value={detalle.estado ?? "—"}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="p-4 sm:px-6 sm:py-5 shrink-0 border-t border-slate-100 bg-white flex flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDetalle(null)}
              className="w-full sm:w-auto h-10 border-slate-200 hover:bg-slate-50 text-[13px] rounded-xl"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════ HELPERS ═══════════ */

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
          {label}
        </p>
        <p
          className={`text-[13px] font-medium text-slate-800 mt-1.5 break-words ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
