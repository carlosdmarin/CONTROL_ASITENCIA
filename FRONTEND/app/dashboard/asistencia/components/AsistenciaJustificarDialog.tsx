"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCheck,
  X,
  Save,
  Clock,
  CalendarDays,
  BadgeCheck,
  SquareArrowRightEnter,
  ArrowLeftFromLine,
  CheckCircle2,
  ClockAlert,
  XCircle,
  MinusCircle,
  Coffee,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
} from "@/types/asistencia";
import { asistenciasApi } from "@/lib/api/asistencias";
import React from "react";

interface AsistenciaJustificarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asistencia: AsistenciaDiariaResponse | null;
  onSuccess?: () => void;
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

const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

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

export default function AsistenciaJustificarDialog({
  open,
  onOpenChange,
  asistencia,
  onSuccess,
}: AsistenciaJustificarDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [tipoJust, setTipoJust] = useState("TARDANZA_JUSTIFICADA");
  const [horaSalidaAnticipada, setHoraSalidaAnticipada] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (open && asistencia) {
      setMotivo("");
      setObservacion("");
      setHoraSalidaAnticipada("");
    }
  }, [open, asistencia]);

  // Helper: opciones disponibles según estado + situaciones ya registradas
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

  const opcionesDisponibles = getOpcionesParaRegistro(asistencia);

  // Auto-seleccionar la primera opción cuando cambia la asistencia
  useEffect(() => {
    if (open && opcionesDisponibles.length > 0) {
      setTipoJust(opcionesDisponibles[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, asistencia?.idAsistencia]);

  const handleJustificar = async () => {
    if (!asistencia?.idAsistencia) return;
    if (!motivo.trim()) {
      toast.error("El motivo es obligatorio");
      return;
    }
    if (tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA") {
      if (!asistencia.entradaReal) {
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
        asistencia.idAsistencia!,
        motivo,
        observacion,
        tipoJust,
        tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA"
          ? horaSalidaAnticipada
          : null,
      );
      toast.success("Justificación guardada");
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al justificar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const estadoConfig = asistencia
    ? getEstadoBadge(asistencia.estadoDia)
    : null;
  const gradient = asistencia
    ? getAvatarGradient(asistencia.idPracticante, asistencia.nombreCompleto)
    : AVATAR_GRADIENTS[0];

  const esSalidaAnticipada = tipoJust === "SALIDA_ANTICIPADA_JUSTIFICADA";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-3xl max-h-[92vh] p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <DialogHeader className="relative bg-white border-b border-slate-200 px-6 sm:px-7 py-5 pr-14 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <FileCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  Justificar asistencia
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Gestión de asistencia
                </span>
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                Registrá una justificación para la asistencia seleccionada
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {asistencia && (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 sm:p-6 space-y-5">
              {/* ═══════════ CARD: PRACTICANTE ═══════════ */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <BadgeCheck
                        className="h-3.5 w-3.5 text-blue-700"
                        strokeWidth={2.4}
                      />
                    </div>
                    <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">
                      Practicante
                    </h3>
                  </div>
                  {estadoConfig && (
                    <Badge
                      className={`${estadoConfig.className} border inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide`}
                    >
                      {React.createElement(estadoConfig.icon, {
                        className: "h-3 w-3",
                        strokeWidth: 2.6,
                      })}
                      {estadoConfig.label}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[15px] font-bold shadow-sm shrink-0`}
                    >
                      {getInitials(asistencia.nombreCompleto)}
                    </div>

                    {/* Info principal */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight">
                        {asistencia.nombreCompleto}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Practicante
                      </p>

                      {/* Chips de datos */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px]">
                          <CalendarDays
                            className="h-3 w-3 text-slate-400"
                            strokeWidth={2.4}
                          />
                          <span className="font-mono font-semibold text-slate-700 tabular-nums">
                            {asistencia.fecha}
                          </span>
                        </span>
                        {asistencia.entradaReal && (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px]">
                            <Clock
                              className="h-3 w-3 text-emerald-500"
                              strokeWidth={2.4}
                            />
                            <span className="text-slate-400">Entrada</span>
                            <span className="font-mono font-semibold text-slate-700 tabular-nums">
                              {asistencia.entradaReal.substring(0, 5)}
                            </span>
                          </span>
                        )}
                        {asistencia.entradaEsperada && (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px]">
                            <Clock
                              className="h-3 w-3 text-slate-400"
                              strokeWidth={2.4}
                            />
                            <span className="text-slate-400">Esperada</span>
                            <span className="font-mono font-semibold text-slate-700 tabular-nums">
                              {asistencia.entradaEsperada.substring(0, 5)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════ CARD: FORMULARIO ═══════════ */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileCheck
                      className="h-3.5 w-3.5 text-blue-700"
                      strokeWidth={2.4}
                    />
                  </div>
                  <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">
                    Información de la justificación
                  </h3>
                </div>

                <div className="p-4 space-y-5">
                  {/* Paso 1: Tipo */}
                  <div className="flex gap-3.5">
                    <div className="shrink-0">
                      <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-[12px] font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Label className="text-[12.5px] font-medium text-slate-700">
                        Tipo de justificación
                      </Label>
                      <Select
                        value={tipoJust}
                        onValueChange={(v) =>
                          setTipoJust((v as string) ?? "TARDANZA_JUSTIFICADA")
                        }
                      >
                        <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesDisponibles.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-slate-400">
                        Seleccioná el tipo de justificación que corresponde
                      </p>
                    </div>
                  </div>

                  {/* Paso 2: Motivo */}
                  <div className="flex gap-3.5">
                    <div className="shrink-0">
                      <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-[12px] font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Label className="text-[12.5px] font-medium text-slate-700">
                        Motivo de la justificación{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Se malogró su motocicleta, trámite personal..."
                        className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all"
                      />
                      <p className="text-[11px] text-slate-400">
                        Explicá brevemente el motivo de la justificación
                      </p>
                    </div>
                  </div>

                  {/* Paso 3 (condicional): Salida anticipada */}
                  {esSalidaAnticipada && (
                    <div className="flex gap-3.5">
                      <div className="shrink-0">
                        <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-[12px] font-bold">
                          3
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <Label className="text-[12.5px] font-medium text-slate-700">
                          Hora de salida anticipada autorizada
                        </Label>
                        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Entrada
                              </p>
                              <p className="text-[13px] font-mono font-semibold text-slate-800 mt-1 tabular-nums">
                                {asistencia.entradaReal?.substring(0, 5) || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Estado
                              </p>
                              <p className="text-[13px] font-semibold text-slate-800 mt-1 truncate">
                                {estadoConfig?.label || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                Autorizada
                              </p>
                              <Input
                                type="time"
                                value={horaSalidaAnticipada}
                                onChange={(e) =>
                                  setHoraSalidaAnticipada(e.target.value)
                                }
                                className="w-full h-9 font-mono text-[12.5px] font-semibold mt-1 border-blue-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paso 3 o 4: Observación */}
                  <div className="flex gap-3.5">
                    <div className="shrink-0">
                      <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-[12px] font-bold">
                        {esSalidaAnticipada ? 4 : 3}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Label className="text-[12.5px] font-medium text-slate-700">
                        Observación adicional{" "}
                        <span className="text-[11px] text-slate-400 font-normal">
                          (opcional)
                        </span>
                      </Label>
                      <Textarea
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        placeholder="Detalles adicionales (opcional)"
                        rows={2}
                        className="w-full resize-y min-h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════ BANNER INFORMATIVO ═══════════ */}
              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3.5">
                <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                  <ShieldCheck
                    className="h-4 w-4 text-blue-600"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-blue-900">
                    La justificación quedará registrada
                  </p>
                  <p className="text-[11.5px] text-blue-700 mt-0.5 leading-snug">
                    El estado del día se recalculará automáticamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ FOOTER ═══════════ */}
        <div className="p-4 sm:px-6 sm:py-5 shrink-0 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none h-10 gap-1.5 border-slate-200 hover:bg-slate-50 text-[13px]"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
            Cancelar
          </Button>
          <Button
            onClick={handleJustificar}
            disabled={saving || !motivo.trim()}
            className="flex-1 sm:flex-none h-10 gap-1.5 bg-blue-700 hover:bg-blue-800 text-white shadow-sm text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" strokeWidth={2.4} />
                Registrar justificación
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}