"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  X,
  Save,
  Clock,
  CalendarDays,
  BadgeCheck,
  Info,
  SquareArrowRightEnter,
  ArrowLeftFromLine,
  CheckCircle2,
  ClockAlert,
  XCircle,
  MinusCircle,
  Coffee,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
} from "@/types/asistencia";
import { asistenciasApi } from "@/lib/api/asistencias";
import React from "react";

interface AsistenciaCorregirDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asistencia: AsistenciaDiariaResponse | null;
  onSuccess?: () => void;
}

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
    config[s] ||
    config[estado] || {
      label: s,
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

export default function AsistenciaCorregirDialog({
  open,
  onOpenChange,
  asistencia,
  onSuccess,
}: AsistenciaCorregirDialogProps) {
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && asistencia) {
      setHoraEntrada(
        asistencia.entradaReal ? asistencia.entradaReal.substring(0, 5) : "",
      );
      setHoraSalida(
        asistencia.salidaReal ? asistencia.salidaReal.substring(0, 5) : "",
      );
    }
  }, [open, asistencia]);

  const handleEditar = async () => {
    if (!asistencia) return;
    setSaving(true);
    try {
      const fecha = asistencia.fecha;
      await asistenciasApi.corregirManual(
        asistencia.idPracticante,
        fecha,
        horaEntrada || null,
        horaSalida || null,
      );
      toast.success("Corrección guardada, estado recalculado");
      onOpenChange(false);
      onSuccess?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al corregir";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-3xl max-h-[92vh] p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <DialogHeader className="relative bg-white border-b border-slate-200 px-6 sm:px-7 py-5 pr-14 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-900/20">
                <Edit className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  Corregir marcación
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Gestión de asistencia
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.5 text-[9.5px] font-mono font-bold uppercase tracking-wider">
                  RH
                </span>
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                Ajuste manual de la marcación del practicante
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[15px] font-bold shadow-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      }}
                    >
                      <div
                        className={`h-full w-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[15px] font-bold`}
                      >
                        {getInitials(asistencia.nombreCompleto)}
                      </div>
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
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px]">
                          <Clock
                            className="h-3 w-3 text-emerald-500"
                            strokeWidth={2.4}
                          />
                          <span className="text-slate-400">Entrada esp.</span>
                          <span className="font-mono font-semibold text-slate-700 tabular-nums">
                            {asistencia.entradaEsperada?.substring(0, 5) || "—"}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px]">
                          <Clock
                            className="h-3 w-3 text-rose-500"
                            strokeWidth={2.4}
                          />
                          <span className="text-slate-400">Salida esp.</span>
                          <span className="font-mono font-semibold text-slate-700 tabular-nums">
                            {asistencia.salidaEsperada?.substring(0, 5) || "—"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════ CARD: REGISTRO DE MARCACIÓN ═══════════ */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Clock
                      className="h-3.5 w-3.5 text-emerald-700"
                      strokeWidth={2.4}
                    />
                  </div>
                  <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">
                    Registro de marcación
                  </h3>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Entrada */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="hora-entrada"
                        className="text-[12px] font-medium text-slate-700 flex items-center gap-1.5"
                      >
                        <div className="h-5 w-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <SquareArrowRightEnter
                            className="h-3 w-3 text-emerald-600"
                            strokeWidth={2.4}
                          />
                        </div>
                        Hora de entrada
                      </Label>
                      <Input
                        id="hora-entrada"
                        type="time"
                        value={horaEntrada}
                        onChange={(e) => setHoraEntrada(e.target.value)}
                        className="w-full h-11 font-mono text-[14px] font-semibold bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all"
                        placeholder="--:--"
                      />
                      <p className="text-[11px] text-slate-400">
                        Dejá vacío para registrar sin entrada
                      </p>
                    </div>

                    {/* Salida */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="hora-salida"
                        className="text-[12px] font-medium text-slate-700 flex items-center gap-1.5"
                      >
                        <div className="h-5 w-5 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center">
                          <ArrowLeftFromLine
                            className="h-3 w-3 text-rose-600"
                            strokeWidth={2.4}
                          />
                        </div>
                        Hora de salida
                      </Label>
                      <Input
                        id="hora-salida"
                        type="time"
                        value={horaSalida}
                        onChange={(e) => setHoraSalida(e.target.value)}
                        className="w-full h-11 font-mono text-[14px] font-semibold bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all"
                        placeholder="--:--"
                      />
                      <p className="text-[11px] text-slate-400">
                        Dejá vacío para registrar sin salida
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════ BANNER DE ADVERTENCIA ═══════════ */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5">
                <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle
                    className="h-4 w-4 text-amber-600"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-amber-900">
                    Esta acción recalculará el estado del día
                  </p>
                  <p className="text-[11.5px] text-amber-700 mt-0.5 leading-snug">
                    El cambio quedará registrado en el historial del sistema
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
            onClick={handleEditar}
            disabled={saving}
            className="flex-1 sm:flex-none h-10 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm text-[13px] font-semibold"
          >
            {saving ? (
              <>
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" strokeWidth={2.4} />
                Guardar corrección
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}