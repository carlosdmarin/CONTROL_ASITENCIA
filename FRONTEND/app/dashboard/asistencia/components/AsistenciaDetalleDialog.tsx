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
  Info,
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
  ShieldOff,
  FileText,
  ArrowLeftFromLine,
  X,
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

const getEstadoBadge = (
  estado: string
): { label: string; className: string; icon: React.ElementType } => {
  const n = normalizeEstadoDia(estado);
  const s = n;
  const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    SIN_MARCAR: {
      label: "Sin marcar",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: MinusCircle,
    },
    PRESENTE: {
      label: "Presente",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    TARDANZA: {
      label: "Tardanza",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
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

const hasJustificacion = (r: AsistenciaDiariaResponse | undefined | null) => {
  if (!r) return false;
  return Boolean(r.justificado && Boolean(r.justificacionMotivo || r.justificacionTipo || r.justificacionFecha));
};

export default function AsistenciaDetalleDialog({
  open,
  onOpenChange,
  asistencia: verData,
}: AsistenciaDetalleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-6xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <DialogHeader className="relative border-b border-slate-200 px-6 sm:px-8 pt-6 pb-5 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-20 h-20 rounded-lg bg-blue-900 flex items-center justify-center text-white shrink-0">
              <FileSearchCorner className="h-15 w-15" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-blue-900">Gestión de asistencia</span>
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
                  {/* COLUMNA IZQUIERDA: panel único (practicante + marcación) */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                    {/* Practicante */}
                    <div className="p-5">
                      <span className="text-xs font-medium text-slate-500">Información del practicante</span>

                      <div className="flex items-center gap-3 mt-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-slate-900 break-words leading-snug">
                            {verData.nombreCompleto}
                          </div>
                          <div className="text-xs text-slate-500">Practicante</div>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500">Fecha</span>
                          <span className="text-slate-800 font-medium ml-auto">{verData.fecha}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500">Estado del día</span>
                          <Badge className={`ml-auto ${getEstadoBadge(verData.estadoDia).className}`}>
                            {getEstadoBadge(verData.estadoDia).label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Registro de marcación */}
                    {(verData.entradaReal || verData.salidaReal) && (
                      <div className="border-t border-slate-200 bg-white p-5">
                        <span className="text-xs font-medium text-slate-500">Registro de marcación</span>

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
                            El horario mostrado corresponde a la marcación del lector QR
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COLUMNA DERECHA: JUSTIFICACIONES REGISTRADAS */}
                  <div>
                    {(() => {
                      const detalles = verData.situacionesDetalle as SituacionDetalle[] | undefined;
                      const list: SituacionDetalle[] =
                        detalles && detalles.length > 0
                          ? detalles
                          : [
                              {
                                tipo: verData.justificacionTipo || verData.situacion || "OTRO",
                                motivo: verData.justificacionMotivo,
                                observacion: verData.justificacionObservacion,
                                horaEntradaRegistrada: verData.entradaReal,
                                horaSalidaAnticipada: verData.horaSalidaAnticipadaAutorizada,
                                fechaRegistro: verData.justificacionFecha,
                              } as SituacionDetalle,
                            ];

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
                          iconLarge: <ArrowLeftFromLine className="h-8 w-8" />,
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
                        if (tipo === "JUSTIFICACION_TARDANZA") return "Tardanza justificada";
                        if (tipo === "SALIDA_ANTICIPADA_JUSTIFICADA") return "Salida anticipada justificada";
                        if (tipo === "JUSTIFICACION_FALTA") return "Falta justificada";
                        if (tipo === "JUSTIFICACION_ASISTENCIA") return "Asistencia justificada";
                        return tipo || "Otro";
                      };

                      return (
                        <>
                          <div className="space-y-3 mt-0">
                            {list.map((d: SituacionDetalle, idx: number) => {
                              const tipoKey = d.tipo?.toUpperCase() || "OTRO";
                              const colors = tipoColorMap[tipoKey] || tipoColorMap["OTRO"];
                              const tipoLabel = getTipoLabel(d.tipo);

                              return (
                                <div key={idx} className="rounded-xl border border-slate-200 p-5">
                                  {/* Fila superior: tipo + fecha */}
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`shrink-0 ${colors.iconText}`}>{colors.iconLarge}</span>
                                      <Badge
                                        variant="outline"
                                        className={`${colors.bg} ${colors.text} ${colors.border} text-xs font-medium px-2.5 py-0.5 whitespace-normal text-left border`}
                                      >
                                        {tipoLabel}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                                      {d.fechaRegistro
                                        ? new Date(d.fechaRegistro).toLocaleString("es-PE", { timeZone: "America/Lima" })
                                        : verData.justificacionFecha
                                          ? new Date(verData.justificacionFecha).toLocaleString("es-PE", { timeZone: "America/Lima" })
                                          : "—"}
                                    </span>
                                  </div>

                                  {/* Motivo: dato protagonista */}
                                  {d.motivo && (
                                    <div className="mb-3">
                                      <div className="text-xs text-slate-400 mb-0.5">Motivo</div>
                                      <p className="text-[15px] font-medium text-slate-900 break-words leading-snug">
                                        {d.motivo}
                                      </p>
                                    </div>
                                  )}

                                  {/* Horarios: compactos, en línea */}
                                  {(() => {
                                    const horaSalidaAutorizada = d.horaSalidaAnticipadaAutorizada ?? d.horaSalidaAnticipada;
                                    const hasHoraSalida = Boolean(horaSalidaAutorizada);
                                    return d.horaEntradaRegistrada || hasHoraSalida ? (
                                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm mb-3">
                                        {d.horaEntradaRegistrada && (
                                          <div className="flex items-baseline gap-1.5">
                                            <span className="text-xs text-slate-400">Entrada registrada</span>
                                            <span className="font-mono font-medium text-slate-800">
                                              {String(d.horaEntradaRegistrada).substring(0, 5)}
                                            </span>
                                          </div>
                                        )}
                                        {hasHoraSalida && (
                                          <div className="flex items-baseline gap-1.5">
                                            <span className="text-xs text-slate-400">Salida autorizada</span>
                                            <span className="font-mono font-medium text-blue-700">
                                              {String(horaSalidaAutorizada).substring(0, 5)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : null;
                                  })()}

                                  {/* Observación: secundaria, separada por hairline */}
                                  {d.observacion && (
                                    <div className="pt-3 border-t border-slate-100">
                                      <div className="text-xs text-slate-400 mb-0.5">Observaciones</div>
                                      <p className="text-sm text-slate-600 break-words leading-relaxed">{d.observacion}</p>
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
                <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2 h-10 px-6">
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
              <p className="text-base font-medium text-slate-700">No existe justificación para esta asistencia.</p>
              <p className="text-sm text-slate-500 mt-1">El registro de asistencia no cuenta con una justificación asociada.</p>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-6 gap-2 h-10 px-6">
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
            <p className="text-base font-medium text-slate-700">Sin datos disponibles</p>
            <p className="text-sm text-slate-500 mt-1">No se pudo cargar la información de la justificación.</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-6 gap-2 h-10 px-6">
              <X className="h-4 w-4" />
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
