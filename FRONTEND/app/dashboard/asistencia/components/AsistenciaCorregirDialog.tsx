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
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  X,
  Save,
  User,
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
} from "lucide-react";
import { AsistenciaDiariaResponse, normalizeEstadoDia } from "@/types/asistencia";
import { asistenciasApi } from "@/lib/api/asistencias";
import React from "react";

interface AsistenciaCorregirDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asistencia: AsistenciaDiariaResponse | null;
  onSuccess?: () => void;
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
      setHoraEntrada(asistencia.entradaReal ? asistencia.entradaReal.substring(0, 5) : "");
      setHoraSalida(asistencia.salidaReal ? asistencia.salidaReal.substring(0, 5) : "");
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
        horaSalida || null
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        {asistencia && (
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
                    <span className="text-xl font-bold text-slate-800">{asistencia.nombreCompleto}</span>
                    <div className="text-sm text-slate-500">Practicante · Información del registro</div>
                  </div>
                </div>
                <Separator orientation="vertical" className="hidden md:block" />
                {/* Lado derecho: datos en grid de 4 columnas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-slate-500 uppercase ">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                      Fecha
                    </div>
                    <span className="text-base text-[12px] font-medium text-slate-800">{asistencia.fecha}</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-2 gap-1.5 text-[10px] font-semibold text-slate-500 uppercase ">
                      <BadgeCheck className="h-3.5 w-3.5 text-[10px] text-indigo-600" />
                      Estado
                    </div>
                    <Badge className={getEstadoBadge(asistencia.estadoDia).className}>
                      {getEstadoBadge(asistencia.estadoDia).label}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] mb-2 font-semibold text-slate-500 uppercase ">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      Entrada
                    </div>
                    <span className="text-[12px] font-mono font-medium bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 inline-block">
                      {asistencia.entradaEsperada?.substring(0, 5) || "—"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] mb-2 font-semibold text-slate-500 uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5 text-red-600" />
                      Salida
                    </div>
                    <span className="text-[12px] font-mono  font-medium bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200 inline-block">
                      {asistencia.salidaEsperada?.substring(0, 5) || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================
            SECCIÓN: REGISTRO DE MARCACIÓN (con valores actuales)
            ============================================================ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Registro de marcación</h3>

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
            NOTA INFORMATIVA (estilo imagen)
            ============================================================ */}
            <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-100 rounded-xl p-4">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">Esta acción será registrada en el historial del sistema.</p>
            </div>

            {/* ============================================================
            FOOTER: con botón principal específico
            ============================================================ */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2 h-11 px-6">
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
  );
}
