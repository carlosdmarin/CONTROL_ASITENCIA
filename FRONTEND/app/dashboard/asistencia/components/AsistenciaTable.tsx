// ===============================
// Esto le dice a Next.js que este componente debe correr en el navegador (cliente)
// ===============================
"use client";

// ============================================
// REACT HOOKS
// ============================================
import { useState, useEffect, useMemo } from "react";
// → useState: Guarda datos que cambian (ej: lista de asistencias, carga)
// → useEffect: Ejecuta código al cargar la página (ej: traer datos del backend)

// → La librería principal de React (necesaria para JSX)
import React from "react";

// ============================================
// COMPONENTES UI - SHADCN
// ============================================

// Cards
import {
  Card, // El contenedor principal
  CardContent, // Parte superior con titulo
  CardHeader, // Titulo del card
  CardTitle, // Contenido interno del card
} from "@/components/ui/card";

// TABLAS - Para mostrar datos en filas y columnas
import {
  Table, // Contenedor de la tabla
  TableBody, // Cuerpo de la tabla (datos)
  TableCell, // Celda individual (fila)
  TableHead, // Celda de encabezado (negrita)
  TableHeader, // Fila de encabezados
  TableRow, // Fila de la tabla
} from "@/components/ui/table";

// BADGE - Etiquetas pequeñas para estados (ENTRADA/SALIDA/PRESENTE/AUSENTE)
import { Badge } from "@/components/ui/badge";
// SKELETON - Esqueleto de carga (muestra líneas grises mientras carga)
import { Skeleton } from "@/components/ui/skeleton";
// BOTON - Para acciones del usuario (guardar, editar, cancelar)
import { Button } from "@/components/ui/button";
// INPUT - Campo de texto corto (nombre, DNI, etc.)
import { Input } from "@/components/ui/input";
// TEXTAREA - Campo de texto largo (observaciones, descripciones)
import { Textarea } from "@/components/ui/textarea";
// LABEL - Título/descripción arriba de los inputs
import { Label } from "@/components/ui/label";
// SEPARATOR - Línea divisoria horizontal
import { Separator } from "@/components/ui/separator";
// SELECT - Menú desplegable (ej: filtrar practicantes)
import {
  Select, // Contenedor del select
  SelectContent, // Opciones desplegables
  SelectItem, // Opción individual
  SelectTrigger, // Botón que abre el select
  SelectValue, // Valor seleccionado
} from "@/components/ui/select";
// DIALOG - Ventana modal (popup que aparece encima)
import {
  Dialog, // Contenedor del modal
  DialogContent, // Contenido del modal
  DialogHeader, // Encabezado del modal
  DialogTitle, // Título del modal
  DialogDescription, // Descripción del modal
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// ============================================
// 🎯 ICONOS - LUCIDE REACT
// ============================================
// → Cada ícono es un componente que puedes usar como <Calendar />
import {
  Calendar, // 📅 Calendario/fecha
  Users, // 👥 Usuarios/grupo
  Pencil, // ✏️ Editar
  FileCheck, // ✅ Documento verificado
  Eye, // 👁️ Ver/visualizar
  Save, // 💾 Guardar
  FileSearchCorner, // 🔍 Buscar en documento
  X, // ❌ Cerrar/eliminar
  AlertTriangle, // ⚠️ Advertencia
  CheckCircle, // ✅ Éxito/confirmado
  FileText, // 📄 Documento/texto
  Info, // ℹ️ Información
  Clock, // 🕐 Reloj/hora
  User, // 👤 Usuario individual
  CalendarDays, // 📆 Días del calendario
  BadgeCheck, // ✅ Verificado
  AlertCircle, // ⚠️ Alerta/círculo
  EyeOff, // 👁️‍🗨️ Ocultar
  CheckCircle2, // ✅ Presente
  ClockAlert, // ⏰ Tardanza
  XCircle, // ❌ Ausente
  MinusCircle, // ➖ Sin marcar
  Coffee, // ☕ Descanso
  ShieldCheck, // 🛡️ Tardanza justificada
  ShieldOff, // 🛡️ Sin protección
  ChevronLeft, // ◀️ Flecha izquierda
  ChevronRight, // ▶️ Flecha derecha
  MoreHorizontal, // ⋯ Más
  MoreHorizontal as Ellipsis, // … Más opciones
  Search, // 🔍 Buscar
  MapPin, // 📍 Sede
  Radio,
  BriefcaseBusiness,
} from "lucide-react";

// ============================================
// 📊 TIPOS Y UTILIDADES - ASISTENCIA
// ============================================
import {
  AsistenciaDiaria, // Tipo: Datos de asistencia de un día
  AsistenciaDiariaResponse, // Tipo: Respuesta del backend
  SituacionDetalle,
  normalizeEstadoDia, // Función: Normaliza el estado (PRESENTE/AUSENTE)
  getSituacionLabel, // Función: Traduce el estado a texto
} from "@/types/asistencia";

// ============================================
// 📡 API - COMUNICACIÓN CON BACKEND
// ============================================
import { asistenciasApi } from "@/lib/api/asistencias";
import AsistenciaDetalleDialog from "./AsistenciaDetalleDialog";
import AsistenciaCorregirDialog from "./AsistenciaCorregirDialog";

// ============================================
// 🔔 NOTIFICACIONES - SONNER
// ============================================
import { toast } from "sonner";
// → toast: Muestra notificaciones emergentes
//   - toast.success("✅ Mensaje")
//   - toast.error("❌ Error")
//   - toast.warning("⚠️ Advertencia")

// Props que recibe el componente de tabla de asistencia
type AsistenciaRow = AsistenciaDiaria & {
  documento?: string;
  sede?: string;
  area?: string;
  jornada?: string;
};
interface AsistenciaTableProps {
  asistencias: AsistenciaRow[]; // Lista de asistencias
  rawData?: AsistenciaDiariaResponse[]; // Datos crudos del backend (opcional)
  filas?: Array<{ ui: AsistenciaRow; raw: AsistenciaDiariaResponse }>; // Referencia estable ui+raw
  loading?: boolean; // ¿Está cargando? (opcional)
  onRefresh?: () => void; // Función para actualizar (opcional)
}

export default function AsistenciaTable({
  asistencias,
  rawData = [],
  filas,
  loading = false,
  onRefresh,
}: AsistenciaTableProps) {
  // ===================== ESTADOS PARA MODALES =======================

  //  Mostrar modal para justificar tardanza? true = sí, false = no;
  const [justificarOpen, setJustificarOpen] = useState(false);
  //  Mostrar modal para editar marcación? true = sí, false = no
  const [editarOpen, setEditarOpen] = useState(false);
  //  Mostrar modal para ver detalles? true = sí, false = no
  const [verOpen, setVerOpen] = useState(false);

  // ============================================
  // 📦 DATOS SELECCIONADOS (cuándo el usuario hace clic en una fila)
  // ============================================
  const [selectedJustificar, setSelectedJustificar] = useState<AsistenciaDiariaResponse | null>(null);
  const [selectedEditar, setSelectedEditar] = useState<AsistenciaDiariaResponse | null>(null);
  const [selectedVer, setSelectedVer] = useState<AsistenciaDiariaResponse | null>(null);

  // ============================================
  // ✏️ FORMULARIOS (lo que el usuario escribe)
  // ============================================
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [tipoJust, setTipoJust] = useState("TARDANZA_JUSTIFICADA");
  const [horaSalidaAnticipada, setHoraSalidaAnticipada] = useState("");
  const [savingJustificar, setSavingJustificar] = useState(false);

  // Paginación - mismo patrón que PracticanteTable (10 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Fuente estable: preferir filas unificadas para evitar desalineación por índices
  const effectiveFilas = useMemo(() => {
    if (filas && filas.length >= 0) return filas;
    // Fallback legacy: reconstruir desde asistencias/rawData paralelos
    return asistencias.map((ui, i) => ({ ui, raw: rawData[i] as AsistenciaDiariaResponse })).filter((f) => f.raw);
  }, [filas, asistencias, rawData]);
  const totalItems = effectiveFilas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFilas = effectiveFilas.slice(startIndex, endIndex);
  const currentAsistencias = currentFilas.map((f) => f.ui);
  const currentRawData = currentFilas.map((f) => f.raw);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Volver a página 1 cuando cambian filtros (asistencias filtradas)
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveFilas]);

  // Ajustar si totalPages disminuye y currentPage queda fuera de rango
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

  const getEstadoBadge = (
    estado: string,
  ): { label: string; className: string; icon: React.ElementType } => {
    const n = normalizeEstadoDia(estado);
    const s = n;
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
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
      },
      TARDANZA: {
        label: "Tardanza",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ClockAlert,
      },
      AUSENTE: {
        label: "Ausente",
        className: "bg-red-50 text-red-700 border-red-200",
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
      config[s] ||
      config[estado] || {
        label: s,
        className: "bg-gray-100 text-gray-700 border-gray-200",
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

  // ---------------------------------------------------------------------------
  // Paginación con truncado - mismo patrón que PracticanteTable
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

/** Normaliza el nombre a Title Case */
function toTitleCase(texto: string) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

/** Iniciales para el avatar */
function getInitials(nombre: string) {
  if (!nombre) return "?";
  const partes = nombre.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombre.charAt(0) || "?";
}

/** Gradientes — mismo que las otras 3 tablas */
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

  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  // Helper: situaciones existentes como Set (soporta situaciones[] y situacion legacy)
  const getSituacionesExistentes = (
    r: AsistenciaDiariaResponse | undefined | null,
  ): Set<string> => {
    if (!r) return new Set();
    const arr = (r.situaciones as string[] | undefined) || [];
    const fromArray = arr.filter(Boolean);
    const single = r.situacion as string | undefined;
    const combined = fromArray.length > 0 ? fromArray : single ? [single] : [];
    return new Set(combined.filter((s) => s && s !== "NINGUNA"));
  };

  // Helper central: calcula opciones disponibles según Estado y situaciones ya registradas
  const getOpcionesParaRegistro = (
    r: AsistenciaDiariaResponse | undefined | null,
  ): { value: string; label: string }[] => {
    if (!r) return [];
    const n = normalizeEstadoDia(r.estadoDia);
    if (n === "DESCANSO") return [];
    const existentes = getSituacionesExistentes(r);
    if (n === "SIN_MARCAR" || n === "AUSENTE") {
      if (existentes.has("INASISTENCIA_JUSTIFICADA")) return [];
      return [
        {
          value: "INASISTENCIA_JUSTIFICADA",
          label: "Inasistencia justificada",
        },
      ];
    }
    if (n === "PRESENTE") {
      if (existentes.has("SALIDA_ANTICIPADA_JUSTIFICADA")) return [];
      return [
        {
          value: "SALIDA_ANTICIPADA_JUSTIFICADA",
          label: "Salida anticipada justificada",
        },
      ];
    }
    if (n === "TARDANZA") {
      const opts: { value: string; label: string }[] = [];
      if (!existentes.has("TARDANZA_JUSTIFICADA"))
        opts.push({
          value: "TARDANZA_JUSTIFICADA",
          label: "Tardanza justificada",
        });
      if (!existentes.has("SALIDA_ANTICIPADA_JUSTIFICADA") && r.entradaReal)
        opts.push({
          value: "SALIDA_ANTICIPADA_JUSTIFICADA",
          label: "Salida anticipada justificada",
        });
      return opts;
    }
    return [];
  };

  const getOpcionesJustificacion = () => {
    return getOpcionesParaRegistro(selectedJustificar);
  };

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
    const opcionesDisponibles = getOpcionesParaRegistro(r);
    if (opcionesDisponibles.length === 0) {
      toast.info(
        "No quedan situaciones pendientes por justificar para este estado",
      );
      return;
    }
    setSelectedJustificar(r);
    setMotivo("");
    setObservacion("");
    setHoraSalidaAnticipada("");
    // Seleccionar por defecto la primera opción disponible (preserva orden: TARDANZA_JUSTIFICADA luego SALIDA)
    setTipoJust(opcionesDisponibles[0].value);
    setJustificarOpen(true);
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

  const handleJustificar = async () => {
    if (!selectedJustificar?.idAsistencia) return;
    if (!motivo.trim()) {
      toast.error("El motivo es obligatorio");
      return;
    }
    if (tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA") {
      if (!selectedJustificar.entradaReal) {
        toast.error(
          "No se puede registrar salida anticipada sin entrada registrada",
        );
        return;
      }
      if (!horaSalidaAnticipada) {
        toast.error("Hora de salida anticipada es obligatoria");
        return;
      }
    }
    setSavingJustificar(true);
    try {
      await asistenciasApi.justificar(
        selectedJustificar.idAsistencia!,
        motivo,
        observacion,
        tipoJust,
        tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA"
          ? horaSalidaAnticipada
          : null,
      );
      toast.success("Justificación guardada");
      setJustificarOpen(false);
      setSelectedJustificar(null);
      setHoraSalidaAnticipada("");
      onRefresh?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al justificar";
      toast.error(msg);
    } finally {
      setSavingJustificar(false);
    }
  };

  return (
      <>
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <div className="relative border-b border-slate-200">
          <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-orange-500 to-blue-700" />

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
                  Marcaciones del día · {totalItems}{" "}
                  {totalItems === 1 ? "registro" : "registros"}
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
                    Área
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
                          Intenta ajustar los filtros de búsqueda o la fecha seleccionada.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentFilas.map(({ ui: asistencia, raw }, index) => {
                    const estado = getEstadoBadge(asistencia.estado);
                    const justificado = isJustificado(raw);
                    const descanso = isDescanso(raw);
                    const opcionesDisponiblesRow = getOpcionesParaRegistro(raw);
                    const puedeJustificar =
                      !!raw &&
                      !descanso &&
                      !!raw.idAsistencia &&
                      opcionesDisponiblesRow.length > 0;
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
                                DNI: {documento && documento.trim() ? documento : "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Sede — mini-card azul */}
                        <TableCell>
                          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="h-6 w-6 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                              <MapPin className="h-3 w-3 text-blue-700" strokeWidth={2.4} />
                            </div>
                            <span className="text-[12px] font-medium text-slate-700 truncate max-w-[130px]">
                              {asistencia.sede || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Área — chip sutil */}
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-700 bg-slate-100 border border-slate-200/70 rounded-md px-2 py-1">
                            <BriefcaseBusiness className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {asistencia.area || "—"}
                            </span>
                          </span>
                        </TableCell>

                        {/* Jornada */}
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-slate-700 tabular-nums whitespace-nowrap">
                            <Clock className="h-3 w-3 text-slate-400 shrink-0" />
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
                            <span className="text-slate-300 text-[12px]">—</span>
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
                            <estado.icon className="h-3 w-3" strokeWidth={2.4} />
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
                                    <sit.icon className="h-3 w-3" strokeWidth={2.4} />
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
                              title={!puedeVer ? "Sin justificación" : "Ver detalle"}
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
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => openVer(raw)}
                                  disabled={!puedeVer}
                                  className="gap-2 text-[13px]"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" /> Ver detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditar(raw)}
                                  disabled={editarDisabled}
                                  className="gap-2 text-[13px]"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-slate-400" /> Corregir
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openJustificar(raw)}
                                  disabled={!puedeJustificar}
                                  className="gap-2 text-[13px]"
                                >
                                  <FileCheck className="h-3.5 w-3.5 text-slate-400" /> Justificar
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

      {/* ============================================================ */}
      {/* DIALOG 1: JUSTIFICAR ASISTENCIA (REDISEÑO PROFESIONAL)      */}
      {/* ============================================================ */}
      <Dialog open={justificarOpen} onOpenChange={(open) => { setJustificarOpen(open); if (!open) setSelectedJustificar(null); }}>
        <DialogContent className="max-w-4xl sm:max-w-4xl p-0 overflow-hidden">
          {/* HEADER: más elegante, con etiqueta de módulo */}
          <DialogHeader className="border-b border-blue-5 bg-gradient-to-r from-blue-50/50 to-white px-8 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl w-20 h-20 bg-blue-900 text-white shadow-sm flex items-center justify-center">
                <FileText className="h-15 w-15" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Gestión de asistencia
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
                  Justificar asistencia
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  Registre una justificación para la asistencia seleccionada.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedJustificar && (
            <div className="px-8 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* ============================================================
            SECCIÓN: IDENTIFICACIÓN DEL PRACTICANTE (estilo imagen)
            ============================================================ */}
              <div className="bg-white border border-slate-200 h-30 rounded-xl shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Lado izquierdo: avatar + nombre + subtítulo */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center">
                      <User className="h-12 w-12" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-800">
                        {selectedJustificar.nombreCompleto}
                      </span>
                      <div className="text-sm text-slate-500">
                        Practicante · Información del registro
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block" />
                  {/* Lado derecho: datos en grid de 3 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 flex-1">
                    <div className="gap-10">
                      <div className="flex items-center gap-1.5 text-xs mb-3 font-semibold text-slate-500 uppercase">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                        Fecha
                      </div>
                      <span className="text-base font-medium text-slate-800">
                        {selectedJustificar.fecha}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs  mb-3 font-semibold text-slate-500 uppercase r">
                        <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
                        Estado actual
                      </div>
                      <Badge
                        className={getEstadoBadge(selectedJustificar.estadoDia).className}
                      >
                        {getEstadoBadge(selectedJustificar.estadoDia).label}
                      </Badge>
                    </div>
                    {selectedJustificar.entradaReal && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase ">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          Entrada real
                        </div>
                        <span className="text-base font-mono font-medium text-slate-800">
                          {selectedJustificar.entradaReal.substring(0, 5)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ============================================================
            SECCIÓN: FORMULARIO CON JERARQUÍA Y LÍNEA VERTICAL
            ============================================================ */}
              <div className="space-y-6">
                {/* Título de sección */}
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Información de la justificación
                </h3>

                {/* Contenedor de pasos con línea vertical */}
                <div className="relative">
                  {/* PASO 1: Tipo de justificación */}
                  <div className="flex gap-4">
                    {/* Columna izquierda: número + línea vertical */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold z-10">
                        1
                      </div>
                      {/* Línea vertical que conecta con el siguiente paso */}
                      <div className="w-0.5 flex-1 bg-blue-200/70 min-h-[40px]" />
                    </div>

                    {/* Columna derecha: contenido del paso */}
                    <div className="flex-1 pb-6">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="tipo-justificacion"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Tipo de justificación
                        </Label>
                        <Select
                          value={tipoJust}
                          onValueChange={(v) => setTipoJust((v as string) ?? "TARDANZA_JUSTIFICADA")}
                        >
                          <SelectTrigger
                            id="tipo-justificacion"
                            className="w-full h-11"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getOpcionesJustificacion().map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {tipoJust && (
                          <p className="text-xs text-slate-500 mt-1">
                            Seleccione el tipo de justificación que corresponde.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PASO 2: Motivo */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold z-10">
                        2
                      </div>
                      {/* Línea vertical (solo si hay más pasos después) */}
                      {tipoJust !== "SALIDA_ANTICIPADA_JUSTIFICADA" && (
                        <div className="w-0.5 flex-1 bg-blue-200/70 min-h-[40px]" />
                      )}
                    </div>

                    <div className="flex-1 pb-6">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="motivo-justificacion"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Motivo de la justificación{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="motivo-justificacion"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          placeholder="Ej: Se malogró su motocicleta, trámite personal, problema de salud..."
                          className="w-full h-11"
                        />
                        {motivo && (
                          <p className="text-xs text-slate-500 mt-1">
                            Explique brevemente el motivo de la justificación.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PASO 3 (condicional): Salida anticipada */}
                  {tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA" && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold z-10">
                          3
                        </div>
                        <div className="w-0.5 flex-1 bg-blue-200/70 min-h-[40px]" />
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-slate-700">
                            Hora de salida anticipada autorizada
                          </Label>
                          <div className="bg-gradient-to-br from-blue-50/80 to-white border border-blue-200/70 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-xs text-slate-500">
                                  Entrada registrada
                                </div>
                                <span className="text-base font-mono font-medium text-slate-800">
                                  {selectedJustificar.entradaReal?.substring(0, 5) || "—"}
                                </span>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">
                                  Estado actual
                                </div>
                                <span className="text-sm font-medium text-slate-800">
                                  {selectedJustificar.estadoDia}
                                </span>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">
                                  Hora autorizada
                                </div>
                                <Input
                                  id="hora-salida-anticipada"
                                  type="time"
                                  value={horaSalidaAnticipada}
                                  onChange={(e) =>
                                    setHoraSalidaAnticipada(e.target.value)
                                  }
                                  className="w-full h-11 font-mono border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PASO 3 o 4: Observación */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold z-10">
                        {tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA" ? 4 : 3}
                      </div>
                      {/* No hay línea después del último paso */}
                    </div>

                    <div className="flex-1">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="observacion-justificacion"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Observación adicional (opcional)
                        </Label>
                        <Textarea
                          id="observacion-justificacion"
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          placeholder="Detalles adicionales (opcional)"
                          rows={2}
                          className="w-full resize-y min-h-11"
                        />
                        {observacion && (
                          <p className="text-xs text-slate-500 mt-1">
                            Información adicional que considere relevante.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================
            FOOTER: con botón principal renombrado
            ============================================================ */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setJustificarOpen(false)}
                  className="gap-2 h-11 px-6"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleJustificar}
                  disabled={savingJustificar || !motivo.trim()}
                  className="gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {savingJustificar ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Registrar justificación
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AsistenciaCorregirDialog open={editarOpen} onOpenChange={setEditarOpen} asistencia={selectedEditar} onSuccess={onRefresh} />
      <AsistenciaDetalleDialog open={verOpen} onOpenChange={setVerOpen} asistencia={selectedVer} />
    </>
  );
}
