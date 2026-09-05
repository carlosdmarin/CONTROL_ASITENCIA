"use client";

import { useState } from "react";
import React from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Users,
  Pencil,
  FileCheck,
  Eye,
  Save,
  FileSearchCorner,
  X,
  SquareArrowRightEnter,
  AlertTriangle,
  CheckCircle,
  FileText,
  Info,
  Clock,
  User,
  CalendarDays,
  BadgeCheck,
  AlertCircle,
  Edit,
  ArrowLeftFromLine,
  EyeOff,
  CheckCircle2, // Presente
  ClockAlert, // Tardanza
  XCircle, // Ausente
  MinusCircle, // Sin marcar
  Coffee, // Descanso
  FileCheck2, // Justificado
  ShieldCheck, // Tardanza justificada
  ShieldOff,
  Icon,
  Shield,
} from "lucide-react";
import {
  AsistenciaDiaria,
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
  isTardanza,
  isAusente,
  getSituacionLabel,
} from "@/types/asistencia";
import { asistenciasApi } from "@/lib/api/asistencias";
import { toast } from "sonner";

interface AsistenciaTableProps {
  asistencias: AsistenciaDiaria[];
  rawData?: AsistenciaDiariaResponse[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function AsistenciaTable({
  asistencias,
  rawData = [],
  loading = false,
  onRefresh,
}: AsistenciaTableProps) {
  const [justificarOpen, setJustificarOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const [verOpen, setVerOpen] = useState(false);
  const [selected, setSelected] = useState<AsistenciaDiariaResponse | null>(
    null,
  );
  const [verData, setVerData] = useState<AsistenciaDiariaResponse | null>(null);
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [tipoJust, setTipoJust] = useState("TARDANZA_JUSTIFICADA");
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaSalidaAnticipada, setHoraSalidaAnticipada] = useState("");
  const [saving, setSaving] = useState(false);

  const getEstadoBadge = (
    estado: string,
  ): { label: string; className: string; icon: React.ElementType } => {
    const n = normalizeEstadoDia(estado);
    // Estado solo 5 valores canónicos; JUSTIFICADO legacy se normaliza a AUSENTE para columna Estado
    const s = n === "JUSTIFICADO" ? "AUSENTE" : n;
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

  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-12 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-12 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-20 mx-auto rounded-full" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-24 mx-auto rounded-full" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-20 mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  // Helper: situaciones existentes como Set (soporta situaciones[] y situacion legacy)
  const getSituacionesExistentes = (
    r: AsistenciaDiariaResponse | undefined | null,
  ): Set<string> => {
    if (!r) return new Set();
    const arr = ((r as any).situaciones as string[] | undefined) || [];
    const fromArray = arr.filter(Boolean);
    const single = (r as any).situacion as string | undefined;
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
    return getOpcionesParaRegistro(selected);
  };

  const openJustificar = (idx: number) => {
    const r = rawData[idx];
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
    setSelected(r);
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

  const openEditar = (idx: number) => {
    const r = rawData[idx];
    if (!r) return;
    if (isDescanso(r)) {
      toast.info("No se puede editar en día de descanso");
      return;
    }
    if (isJustificado(r)) {
      toast.info("No se puede editar una asistencia justificada");
      return;
    }
    setSelected(r);
    setHoraEntrada(r.entradaReal ? r.entradaReal.substring(0, 5) : "");
    setHoraSalida(r.salidaReal ? r.salidaReal.substring(0, 5) : "");
    setEditarOpen(true);
  };

  const openVer = (idx: number) => {
    const r = rawData[idx];
    if (!r) return;
    setVerData(r);
    setVerOpen(true);
  };

  const handleJustificar = async () => {
    if (!selected?.idAsistencia) return;
    if (!motivo.trim()) {
      toast.error("El motivo es obligatorio");
      return;
    }
    if (tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA") {
      if (!selected.entradaReal) {
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
    setSaving(true);
    try {
      await asistenciasApi.justificar(
        selected.idAsistencia!,
        motivo,
        observacion,
        tipoJust,
        tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA"
          ? horaSalidaAnticipada
          : null,
      );
      toast.success("Justificación guardada");
      setJustificarOpen(false);
      setHoraSalidaAnticipada("");
      onRefresh?.();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const fecha = selected.fecha;
      await asistenciasApi.corregirManual(
        selected.idPracticante,
        fecha,
        horaEntrada || null,
        horaSalida || null,
      );
      toast.success("Corrección guardada, estado recalculado");
      setEditarOpen(false);
      onRefresh?.();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold ">Practicante</TableHead>
                  <TableHead className="font-semibold text-center">
                    Entrada
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Salida
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Horas
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Estado
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Situación
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : (
                  asistencias.map((asistencia, index) => {
                    const raw = rawData[index];
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
                    return (
                      <TableRow key={index} className="hover:bg-slate-50 h-12">
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {asistencia.practicante}
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
                          <Badge
                            className={`${estado.className} inline-flex items-center gap-1`}
                          >
                            <estado.icon className="h-3 w-3" />
                            {estado.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1 items-center">
                            {(() => {
                              const rawSit = (raw as any)?.situaciones as
                                | string[]
                                | undefined;
                              const rawSingle = (raw as any)?.situacion as
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
                                    className={`${sit.className} inline-flex items-center gap-1`}
                                  >
                                    <sit.icon className="h-3 w-3" />
                                    {sit.label}
                                  </Badge>
                                );
                              });
                            })()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
                              disabled={editarDisabled}
                              title={
                                descanso
                                  ? "No editable: descanso"
                                  : justificado
                                    ? "No editable: justificado"
                                    : "Editar horas"
                              }
                              onClick={() => openEditar(index)}
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 disabled:opacity-50"
                              disabled={!puedeJustificar}
                              title={
                                !puedeJustificar
                                  ? descanso
                                    ? "No justificable: descanso"
                                    : !raw?.idAsistencia
                                      ? "Sin registro para justificar"
                                      : opcionesDisponiblesRow.length === 0
                                        ? "No quedan situaciones pendientes por justificar"
                                        : "No justificable"
                                  : "Justificar"
                              }
                              onClick={() => openJustificar(index)}
                            >
                              <FileCheck className="h-3 w-3" />
                              Justificar
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                              disabled={!puedeVer}
                              title={
                                !puedeVer
                                  ? "Sin justificación"
                                  : "Ver justificación"
                              }
                              onClick={() => openVer(index)}
                            >
                              <Eye className="h-3 w-3" />
                              Ver
                            </Button>
                          </div>
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
      {/* ============================================================ */}
      {/* DIALOG 1: JUSTIFICAR ASISTENCIA (REDISEÑO PROFESIONAL)      */}
      {/* ============================================================ */}
      <Dialog open={justificarOpen} onOpenChange={setJustificarOpen}>
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

          {selected && (
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
                        {selected.nombreCompleto}
                      </span>
                      <div className="text-sm text-slate-500">
                        Practicante · Información del registro
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  {/* Lado derecho: datos en grid de 3 columnas */}
                  <div className="grid grid-cols-3 gap-6 flex-1">
                    <div className="gap-10">
                      <div className="flex items-center gap-1.5 text-xs mb-3 font-semibold text-slate-500 uppercase">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                        Fecha
                      </div>
                      <span className="text-base font-medium text-slate-800">
                        {selected.fecha}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs  mb-3 font-semibold text-slate-500 uppercase r">
                        <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
                        Estado actual
                      </div>
                      <Badge
                        className={getEstadoBadge(selected.estadoDia).className}
                      >
                        {getEstadoBadge(selected.estadoDia).label}
                      </Badge>
                    </div>
                    {selected.entradaReal && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase ">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          Entrada real
                        </div>
                        <span className="text-base font-mono font-medium text-slate-800">
                          {selected.entradaReal.substring(0, 5)}
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
                          onValueChange={(v: any) => setTipoJust(v)}
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
                                  {selected.entradaReal?.substring(0, 5) || "—"}
                                </span>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">
                                  Estado actual
                                </div>
                                <span className="text-sm font-medium text-slate-800">
                                  {selected.estadoDia}
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
                  disabled={saving || !motivo.trim()}
                  className="gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {saving ? (
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
      {/* ============================================================ */}
      {/* DIALOG 2: CORREGIR MARCACIÓN MANUAL (RH) - REDISEÑO         */}
      {/* ============================================================ */}
      <Dialog open={editarOpen} onOpenChange={setEditarOpen}>
        <DialogContent className="max-w-4xl sm:max-w-4xl p-0 overflow-hidden">
          {/* HEADER: con badge RH y fondo ámbar sutil */}
          <DialogHeader className="border-b border-slate-200 bg-gradient-to-r from-amber-50/50 to-white px-8 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl w-20 h-20 bg-orange-400 text-white shadow-sm flex items-center justify-center">
                <Edit className="h-13 w-13" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    Gestión de asistencia
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-mono uppercase px-2 py-0"
                  >
                    RH
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
                  Corregir marcación manual
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  Ajuste manual de la marcación de asistencia del practicante.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selected && (
            <div className="px-8 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* ============================================================
            SECCIÓN: IDENTIFICACIÓN DEL PRACTICANTE (estilo imagen)
            ============================================================ */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Lado izquierdo: avatar + nombre + subtítulo */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center">
                      <User className="h-12 w-12" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-800">
                        {selected.nombreCompleto}
                      </span>
                      <div className="text-sm text-slate-500">
                        Practicante · Información del registro
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  {/* Lado derecho: datos en grid de 4 columnas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-slate-500 uppercase ">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                        Fecha
                      </div>
                      <span className="text-base text-[12px] font-medium text-slate-800">
                        {selected.fecha}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center mb-2 gap-1.5 text-[10px] font-semibold text-slate-500 uppercase ">
                        <BadgeCheck className="h-3.5 w-3.5 text-[10px] text-indigo-600" />
                        Estado
                      </div>
                      <Badge
                        className={getEstadoBadge(selected.estadoDia).className}
                      >
                        {getEstadoBadge(selected.estadoDia).label}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] mb-2 font-semibold text-slate-500 uppercase ">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        Entrada
                      </div>
                      <span className="text-[12px] font-mono font-medium bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 inline-block">
                        {selected.entradaEsperada?.substring(0, 5) || "—"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] mb-2 font-semibold text-slate-500 uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5 text-red-600" />
                        Salida
                      </div>
                      <span className="text-[12px] font-mono  font-medium bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 inline-block">
                        {selected.salidaEsperada?.substring(0, 5) || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================
            SECCIÓN: REGISTRO DE MARCACIÓN (con valores actuales)
            ============================================================ */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Registro de marcación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Entrada */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center  mb-2">
                      <SquareArrowRightEnter className="h-4 w-4 text-blue-500"></SquareArrowRightEnter>
                      <Label
                        htmlFor="hora-entrada"
                        className="text-xs font-semibold pl-2 text-blue-500 uppercase tracking-wider"
                      >
                        Entrada
                      </Label>
                    </div>
                    <Input
                      id="hora-entrada"
                      type="time"
                      value={horaEntrada}
                      onChange={(e) => setHoraEntrada(e.target.value)}
                      className="w-full h-11 font-mono border-slate-300 focus:border-amber-500 focus:ring-amber-200"
                      placeholder="--:--"
                    />
                  </div>

                  {/* Salida */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center  mb-2">
                      <ArrowLeftFromLine className="h-4 w-4 text-red-500"></ArrowLeftFromLine>
                      <Label
                        htmlFor="hora-salida"
                        className="text-xs font-semibold pl-2 text-red-500 uppercase tracking-wider"
                      >
                        Salida
                      </Label>
                    </div>
                    <Input
                      id="hora-salida"
                      type="time"
                      value={horaSalida}
                      onChange={(e) => setHoraSalida(e.target.value)}
                      className="w-full h-11 font-mono border-slate-300 focus:border-amber-500 focus:ring-amber-200"
                      placeholder="--:--"
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================
            SECCIÓN: OBSERVACIONES (opcional)
            ============================================================ */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="observacion-correccion"
                  className="text-sm font-semibold text-slate-700"
                >
                  Observaciones{" "}
                  <span className="text-slate-400">(opcional)</span>
                </Label>
                <Textarea
                  id="observacion-correccion"
                  value={observacion} // Asumo que existe un estado 'observacion' en tu lógica (si no, puedes usar el mismo que usas en justificación o crear uno específico)
                  onChange={(e) => setObservacion(e.target.value)} // Asegúrate de tener este setter
                  placeholder="Explique el motivo de la corrección realizada."
                  rows={2}
                  className="w-full resize-y min-h-11 border-slate-300 focus:border-amber-500 focus:ring-amber-200"
                />
                {observacion && (
                  <p className="text-xs text-slate-500 mt-1">
                    Información adicional que considere relevante.
                  </p>
                )}
              </div>

              {/* ============================================================
            NOTA INFORMATIVA (estilo imagen)
            ============================================================ */}
              <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  Esta acción será registrada en el historial del sistema con su
                  usuario y fecha.
                </p>
              </div>

              {/* ============================================================
            FOOTER: con botón principal específico
            ============================================================ */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setEditarOpen(false)}
                  className="gap-2 h-11 px-6"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditar}
                  disabled={saving}
                  className="gap-2 h-11 px-6 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar corrección
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* ============================================================ */}
      {/* DIALOG 3: VER JUSTIFICACIÓN - COPIA EXACTA DE LA IMAGEN     */}
      {/* ============================================================ */}
      <Dialog open={verOpen} onOpenChange={setVerOpen}>
        <DialogContent className="max-w-4xl sm:max-w-6xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          {/* HEADER */}
          <DialogHeader className="relative border-b border-slate-200 px-6 sm:px-8 pt-6 pb-5 shrink-0">
            <div className="flex items-start gap-3.5">
              <div className="w-20 h-20 rounded-lg bg-blue-900 flex items-center justify-center text-white shrink-0">
                <FileSearchCorner className="h-13 w-13" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-blue-900">
                  Gestión de asistencia
                </span>
                <DialogTitle className="text-xl font-semibold text-slate-900 leading-tight mt-0.5">
                  Detalle de justificación
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  Detalle completo de las justificaciones y marcaciones del día.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {verData ? (
            hasJustificacion(verData) ? (
              <>
                {/* CONTENIDO SCROLLEABLE */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)] gap-6 items-start">
                    {/* ============================================================
                  COLUMNA IZQUIERDA: panel único (practicante + marcación)
                  ============================================================ */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                      {/* Practicante */}
                      <div className="p-5">
                        <span className="text-xs font-medium text-slate-500">
                          Información del practicante
                        </span>

                        <div className="flex items-center gap-3 mt-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-slate-900 break-words leading-snug">
                              {verData.nombreCompleto}
                            </div>
                            <div className="text-xs text-slate-500">
                              Practicante
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-500">Fecha</span>
                            <span className="text-slate-800 font-medium ml-auto">
                              {verData.fecha}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-500">
                              Estado del día
                            </span>
                            <Badge
                              className={`ml-auto ${getEstadoBadge(verData.estadoDia).className}`}
                            >
                              {getEstadoBadge(verData.estadoDia).label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Registro de marcación */}
                      {(verData.entradaReal || verData.salidaReal) && (
                        <div className="border-t border-slate-200 bg-white p-5">
                          <span className="text-xs font-medium text-slate-500">
                            Registro de marcación
                          </span>

                          <div className="grid grid-cols-2 gap-4 mt-3 mb-4">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                <Clock className="h-3.5 w-3.5 text-green-600" />
                                Entrada real
                              </div>
                              <div className="text-lg font-mono font-semibold text-slate-900">
                                {verData.entradaReal?.substring(0, 5) || "—"}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                <Clock className="h-3.5 w-3.5 text-red-500" />
                                Salida real
                              </div>
                              <div className="text-lg font-mono font-semibold text-slate-900">
                                {verData.salidaReal?.substring(0, 5) || "—"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 pt-3 border-t border-slate-100">
                            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                              El horario mostrado corresponde a la marcación del
                              lector QR
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ============================================================
                  COLUMNA DERECHA: JUSTIFICACIONES REGISTRADAS
                  ============================================================ */}
                    <div>
                      {(() => {
                        const detalles = (verData as any).situacionesDetalle as
                          | any[]
                          | undefined;
                        const list =
                          detalles && detalles.length > 0
                            ? detalles
                            : [
                                {
                                  tipo:
                                    verData.justificacionTipo ||
                                    verData.situacion ||
                                    "OTRO",
                                  motivo: verData.justificacionMotivo,
                                  observacion: verData.justificacionObservacion,
                                  horaEntradaRegistrada: verData.entradaReal,
                                  horaSalidaAnticipada: (verData as any)
                                    .horaSalidaAnticipadaAutorizada,
                                  fechaRegistro: verData.justificacionFecha,
                                },
                              ];

                        // Definimos el tipo para el mapa de colores
                        type TipoColorMap = {
                          [key: string]: {
                            bg: string;
                            text: string;
                            border: string;
                            iconLarge: React.ReactNode;
                            iconBg: string;
                            iconText: string;
                          };
                        };

                        const tipoColorMap: TipoColorMap = {
                          SALIDA_ANTICIPADA_JUSTIFICADA: {
                            bg: "bg-green-100",
                            text: "text-green-700",
                            border: "border-green-200",
                            iconLarge: (
                              <ArrowLeftFromLine className="h-8 w-8" />
                            ),
                            iconBg: "bg-green-100",
                            iconText: "text-green-700",
                          },
                          JUSTIFICACION_FALTA: {
                            bg: "bg-red-100",
                            text: "text-red-700",
                            border: "border-red-200",
                            iconLarge: <XCircle className="h-6 w-6" />,
                            iconBg: "bg-red-100",
                            iconText: "text-red-700",
                          },
                          JUSTIFICACION_TARDANZA: {
                            bg: "bg-amber-100",
                            text: "text-amber-700",
                            border: "border-amber-200",
                            iconLarge: <AlertTriangle className="h-6 w-6" />,
                            iconBg: "bg-amber-100",
                            iconText: "text-amber-700",
                          },
                          JUSTIFICACION_ASISTENCIA: {
                            bg: "bg-green-100",
                            text: "text-green-700",
                            border: "border-green-200",
                            iconLarge: <CheckCircle className="h-6 w-6" />,
                            iconBg: "bg-green-100",
                            iconText: "text-green-700",
                          },
                          OTRO: {
                            bg: "bg-blue-100",
                            text: "text-blue-700",
                            border: "border-blue-200",
                            iconLarge: <FileText className="h-6 w-6" />,
                            iconBg: "bg-blue-100",
                            iconText: "text-blue-700",
                          },
                        };

                        const getTipoLabel = (tipo: string) => {
                          if (tipo === "JUSTIFICACION_TARDANZA")
                            return "Tardanza justificada";
                          if (tipo === "SALIDA_ANTICIPADA_JUSTIFICADA")
                            return "Salida anticipada justificada";
                          if (tipo === "JUSTIFICACION_FALTA")
                            return "Falta justificada";
                          if (tipo === "JUSTIFICACION_ASISTENCIA")
                            return "Asistencia justificada";
                          return tipo || "Otro";
                        };

                        return (
                          <>

                            <div className="space-y-3 mt-0">
                              {list.map((d: any, idx: number) => {
                                const tipoKey = d.tipo?.toUpperCase() || "OTRO";
                                const colors =
                                  tipoColorMap[tipoKey] || tipoColorMap["OTRO"];
                                const tipoLabel = getTipoLabel(d.tipo);

                                return (
                                  <div
                                    key={idx}
                                    className="rounded-xl border border-slate-200 p-5"
                                  >
                                    {/* Fila superior: tipo + fecha */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span
                                          className={`shrink-0 ${colors.iconText}`}
                                        >
                                          {colors.iconLarge}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={`${colors.bg} ${colors.text} ${colors.border} text-xs font-medium px-2.5 py-0.5 whitespace-normal text-left border`}
                                        >
                                          {tipoLabel}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                                        {d.fechaRegistro
                                          ? new Date(
                                              d.fechaRegistro,
                                            ).toLocaleString("es-PE")
                                          : verData.justificacionFecha
                                            ? new Date(
                                                verData.justificacionFecha,
                                              ).toLocaleString("es-PE")
                                            : "—"}
                                      </span>
                                    </div>

                                    {/* Motivo: dato protagonista */}
                                    {d.motivo && (
                                      <div className="mb-3">
                                        <div className="text-xs text-slate-400 mb-0.5">
                                          Motivo
                                        </div>
                                        <p className="text-[15px] font-medium text-slate-900 break-words leading-snug">
                                          {d.motivo}
                                        </p>
                                      </div>
                                    )}

                                    {/* Horarios: compactos, en línea */}
                                    {(() => {
                                      const horaSalidaAutorizada =
                                        (d as any).horaSalidaAnticipadaAutorizada ??
                                        (d as any).horaSalidaAnticipada;
                                      const hasHoraSalida = Boolean(horaSalidaAutorizada);
                                      return (d.horaEntradaRegistrada ||
                                        hasHoraSalida) ? (
                                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm mb-3">
                                        {d.horaEntradaRegistrada && (
                                          <div className="flex items-baseline gap-1.5">
                                            <span className="text-xs text-slate-400">
                                              Entrada registrada
                                            </span>
                                            <span className="font-mono font-medium text-slate-800">
                                              {String(
                                                d.horaEntradaRegistrada,
                                              ).substring(0, 5)}
                                            </span>
                                          </div>
                                        )}
                                        {hasHoraSalida && (
                                          <div className="flex items-baseline gap-1.5">
                                            <span className="text-xs text-slate-400">
                                              Salida autorizada
                                            </span>
                                            <span className="font-mono font-medium text-blue-700">
                                              {String(
                                                horaSalidaAutorizada,
                                              ).substring(0, 5)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      ) : null;
                                    })()}

                                    {/* Observación: secundaria, separada por hairline */}
                                    {d.observacion && (
                                      <div className="pt-3 border-t border-slate-100">
                                        <div className="text-xs text-slate-400 mb-0.5">
                                          Observaciones
                                        </div>
                                        <p className="text-sm text-slate-600 break-words leading-relaxed">
                                          {d.observacion}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end px-6 sm:px-8 py-4 border-t border-slate-200 bg-white shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setVerOpen(false)}
                    className="gap-2 h-10 px-6"
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </Button>
                </div>
              </>
            ) : (
              // Sin justificación
              <div className="px-8 py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <EyeOff className="h-8 w-8" />
                </div>
                <p className="text-base font-medium text-slate-700">
                  No existe justificación para esta asistencia.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  El registro de asistencia no cuenta con una justificación
                  asociada.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setVerOpen(false)}
                  className="mt-6 gap-2 h-10 px-6"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
            )
          ) : (
            // Sin datos
            <div className="px-8 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <p className="text-base font-medium text-slate-700">
                Sin datos disponibles
              </p>
              <p className="text-sm text-slate-500 mt-1">
                No se pudo cargar la información de la justificación.
              </p>
              <Button
                variant="outline"
                onClick={() => setVerOpen(false)}
                className="mt-6 gap-2 h-10 px-6"
              >
                <X className="h-4 w-4" />
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
