"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Clock,
  CalendarDays,
  BadgeCheck,
  FileSearchCorner,
  EyeOff,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Coffee,
  ShieldCheck,
  FileText,
  ArrowLeftFromLine,
  X,
  LogIn,
  LogOut,
  MessageSquare,
  Sparkles,
  Info,
} from "lucide-react";
import {
  AsistenciaDiariaResponse,
  SituacionDetalle,
  normalizeEstadoDia,
} from "@/types/asistencia";

interface AsistenciaDetalleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asistencia: AsistenciaDiariaResponse | null;
}

const getEstadoBadge = (estado: string) => {
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
      icon: CheckCircle,
    },
    TARDANZA: {
      label: "Tardanza",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
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

const hasJustificacion = (r: AsistenciaDiariaResponse | undefined | null) => {
  if (!r) return false;
  return Boolean(
    r.justificado &&
      Boolean(r.justificacionMotivo || r.justificacionTipo || r.justificacionFecha),
  );
};

export default function AsistenciaDetalleDialog({
  open,
  onOpenChange,
  asistencia: verData,
}: AsistenciaDetalleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-5xl max-h-[92vh] p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <DialogHeader className="relative bg-white border-b border-slate-200 px-6 sm:px-8 py-5 pr-14 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <FileSearchCorner
                  className="h-5 w-5 text-white"
                  strokeWidth={2.2}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  Detalle de justificación
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Gestión de asistencia
                </span>
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                Detalle completo de la justificación registrada
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ═══════════ BODY ═══════════ */}
        {verData ? (
          hasJustificacion(verData) ? (
            <>
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 p-5 sm:p-6">
                  {/* ─── COLUMNA IZQUIERDA ─── */}
                  <aside className="space-y-5">
                    {/* Card: Practicante */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                          <User
                            className="h-3.5 w-3.5 text-blue-700"
                            strokeWidth={2.4}
                          />
                        </div>
                        <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">
                          Practicante
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white text-[15px] font-bold shadow-sm shrink-0">
                            {(verData.nombreCompleto || "?").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-slate-900 leading-tight break-words">
                              {verData.nombreCompleto}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Practicante
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card: Info del día */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <CalendarDays
                            className="h-3.5 w-3.5 text-slate-600"
                            strokeWidth={2.4}
                          />
                        </div>
                        <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">
                          Detalle del día
                        </h3>
                      </div>
                      <div className="p-4 space-y-3.5">
                        <DetailRow
                          icon={CalendarDays}
                          label="Fecha"
                          value={verData.fecha}
                          mono
                        />
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            <BadgeCheck
                              className="h-3.5 w-3.5 text-slate-500"
                              strokeWidth={2.2}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                              Estado del día
                            </p>
                            <div className="mt-1.5">
                              <Badge
                                className={`${getEstadoBadge(verData.estadoDia).className} border inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium`}
                              >
                                {React.createElement(
                                  getEstadoBadge(verData.estadoDia).icon,
                                  { className: "h-3 w-3", strokeWidth: 2.4 },
                                )}
                                {getEstadoBadge(verData.estadoDia).label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card: Marcación */}
                    {(verData.entradaReal || verData.salidaReal) && (
                      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                          <div className="grid grid-cols-2 gap-4">
                            <TimeBox
                              icon={LogIn}
                              label="Entrada"
                              value={verData.entradaReal?.substring(0, 5)}
                              color="emerald"
                            />
                            <TimeBox
                              icon={LogOut}
                              label="Salida"
                              value={verData.salidaReal?.substring(0, 5)}
                              color="rose"
                            />
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2">
                            <Info
                              className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5"
                              strokeWidth={2.2}
                            />
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              El horario corresponde a la marcación del lector QR
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </aside>

                  {/* ─── COLUMNA DERECHA: JUSTIFICACIONES ─── */}
                  <main>
                    {(() => {
                      const detalles = verData.situacionesDetalle as
                        | SituacionDetalle[]
                        | undefined;
                      const list: SituacionDetalle[] =
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
                                horaSalidaAnticipada:
                                  verData.horaSalidaAnticipadaAutorizada,
                                fechaRegistro: verData.justificacionFecha,
                              } as SituacionDetalle,
                            ];

                      type TipoColorMap = {
                        [key: string]: {
                          bg: string;
                          text: string;
                          border: string;
                          icon: React.ElementType;
                        };
                      };

                      const tipoColorMap: TipoColorMap = {
                        SALIDA_ANTICIPADA_JUSTIFICADA: {
                          bg: "bg-blue-50",
                          text: "text-blue-700",
                          border: "border-blue-100",
                          icon: ArrowLeftFromLine,
                        },
                        JUSTIFICACION_FALTA: {
                          bg: "bg-rose-50",
                          text: "text-rose-700",
                          border: "border-rose-100",
                          icon: XCircle,
                        },
                        JUSTIFICACION_TARDANZA: {
                          bg: "bg-amber-50",
                          text: "text-amber-700",
                          border: "border-amber-100",
                          icon: AlertTriangle,
                        },
                        JUSTIFICACION_ASISTENCIA: {
                          bg: "bg-emerald-50",
                          text: "text-emerald-700",
                          border: "border-emerald-100",
                          icon: CheckCircle,
                        },
                        OTRO: {
                          bg: "bg-slate-100",
                          text: "text-slate-700",
                          border: "border-slate-200",
                          icon: FileText,
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
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <ShieldCheck
                                  className="h-3.5 w-3.5 text-blue-700"
                                  strokeWidth={2.4}
                                />
                              </div>
                              <h3 className="text-[13px] font-bold text-slate-800 tracking-tight">
                                Justificaciones registradas
                              </h3>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              {list.length}{" "}
                              {list.length === 1 ? "registro" : "registros"}
                            </span>
                          </div>

                          <div className="p-4 space-y-3">
                            {list.map((d: SituacionDetalle, idx: number) => {
                              const tipoKey =
                                d.tipo?.toUpperCase() || "OTRO";
                              const colors =
                                tipoColorMap[tipoKey] || tipoColorMap["OTRO"];
                              const tipoLabel = getTipoLabel(d.tipo);
                              const Icon = colors.icon;

                              const horaSalidaAutorizada =
                                d.horaSalidaAnticipadaAutorizada ??
                                d.horaSalidaAnticipada;
                              const hasHoraSalida = Boolean(horaSalidaAutorizada);

                              return (
                                <div
                                  key={idx}
                                  className="rounded-xl border border-slate-200 overflow-hidden"
                                >
                                  {/* Header del item */}
                                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/60 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`h-8 w-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}
                                      >
                                        <Icon
                                          className={`h-4 w-4 ${colors.text}`}
                                          strokeWidth={2.4}
                                        />
                                      </div>
                                      <span
                                        className={`text-[12.5px] font-bold ${colors.text} truncate`}
                                      >
                                        {tipoLabel}
                                      </span>
                                    </div>
                                    <span className="text-[10.5px] text-slate-400 whitespace-nowrap shrink-0 font-mono tabular-nums">
                                      {d.fechaRegistro
                                        ? new Date(
                                            d.fechaRegistro,
                                          ).toLocaleString("es-PE", {
                                            timeZone: "America/Lima",
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : verData.justificacionFecha
                                          ? new Date(
                                              verData.justificacionFecha,
                                            ).toLocaleString("es-PE", {
                                              timeZone: "America/Lima",
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "—"}
                                    </span>
                                  </div>

                                  {/* Contenido del item */}
                                  <div className="p-4 space-y-3.5">
                                    {/* Motivo */}
                                    {d.motivo && (
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <MessageSquare
                                            className="h-3 w-3 text-slate-400"
                                            strokeWidth={2.4}
                                          />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Motivo
                                          </span>
                                        </div>
                                        <p className="text-[14px] font-medium text-slate-900 break-words leading-snug pl-[18px]">
                                          {d.motivo}
                                        </p>
                                      </div>
                                    )}

                                    {/* Horarios */}
                                    {(d.horaEntradaRegistrada ||
                                      hasHoraSalida) && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        {d.horaEntradaRegistrada && (
                                          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5">
                                            <LogIn
                                              className="h-3.5 w-3.5 text-emerald-600"
                                              strokeWidth={2.4}
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                              Entrada
                                            </span>
                                            <span className="font-mono text-[12.5px] font-semibold text-slate-800 tabular-nums">
                                              {String(
                                                d.horaEntradaRegistrada,
                                              ).substring(0, 5)}
                                            </span>
                                          </div>
                                        )}
                                        {hasHoraSalida && (
                                          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5">
                                            <LogOut
                                              className="h-3.5 w-3.5 text-blue-600"
                                              strokeWidth={2.4}
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                              Salida
                                            </span>
                                            <span className="font-mono text-[12.5px] font-semibold text-blue-800 tabular-nums">
                                              {String(
                                                horaSalidaAutorizada,
                                              ).substring(0, 5)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Observación */}
                                    {d.observacion && (
                                      <div className="pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <Info
                                            className="h-3 w-3 text-slate-400"
                                            strokeWidth={2.4}
                                          />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Observaciones
                                          </span>
                                        </div>
                                        <p className="text-[12.5px] text-slate-600 break-words leading-relaxed pl-[18px]">
                                          {d.observacion}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </main>
                </div>
              </div>

              {/* ═══════════ FOOTER ═══════════ */}
              <div className="flex justify-end px-6 sm:px-8 py-4 border-t border-slate-200 bg-white shrink-0">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="gap-2 h-10 px-5 border-slate-200 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" strokeWidth={2.4} />
                  Cerrar
                </Button>
              </div>
            </>
          ) : (
            // Sin justificación
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                <EyeOff className="h-6 w-6 text-slate-400" strokeWidth={2} />
              </div>
              <p className="text-[15px] font-semibold text-slate-800">
                Sin justificación registrada
              </p>
              <p className="text-[12.5px] text-slate-500 mt-1 max-w-xs">
                El registro de asistencia no cuenta con una justificación asociada
              </p>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mt-6 gap-2 h-10 px-5 border-slate-200 hover:bg-slate-50"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
                Cerrar
              </Button>
            </div>
          )
        ) : (
          // Sin datos
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-slate-400" strokeWidth={2} />
            </div>
            <p className="text-[15px] font-semibold text-slate-800">
              Sin datos disponibles
            </p>
            <p className="text-[12.5px] text-slate-500 mt-1 max-w-xs">
              No se pudo cargar la información de la justificación
            </p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-6 gap-2 h-10 px-5 border-slate-200 hover:bg-slate-50"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
          className={`text-[12.5px] font-medium text-slate-800 mt-1.5 break-words ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function TimeBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | undefined | null;
  color: "emerald" | "rose";
}) {
  const colors = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: "text-emerald-600",
      value: "text-emerald-900",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      icon: "text-rose-600",
      value: "text-rose-900",
    },
  };
  const c = colors[color];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`h-3 w-3 ${c.icon}`} strokeWidth={2.4} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className={`text-[16px] font-bold font-mono tabular-nums ${c.value}`}>
        {value || "—"}
      </p>
    </div>
  );
}