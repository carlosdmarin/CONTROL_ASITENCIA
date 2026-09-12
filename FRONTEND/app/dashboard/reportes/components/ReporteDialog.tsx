"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookText, CheckCircle2, ArrowLeft, ArrowRight, FileCheck, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Practicante } from "@/types/practicante";
import { ReporteDiarioResponse } from "@/types/reporte";
import { reportesApi } from "@/lib/api/reportes";
import { startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ReporteStepTipo } from "./ReporteStepTipo";
import { ReporteStepPeriodo } from "./ReporteStepPeriodo";
import { ReporteStepConfirmacion } from "./ReporteStepConfirmacion";
import { ReporteDiarioView } from "./ReporteDiarioView";
import { descargarPdfDiario } from "@/lib/reportes/pdf/diarioPdf";
import { descargarExcelDiario } from "@/lib/reportes/excel/diarioExcel";

type TipoReporte = "DIARIO" | "SEMANAL" | "MENSUAL";

interface ReporteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
}

function getInitials(nombre: string) {
  if (!nombre) return "?";
  const p = nombre.split(" ");
  return p.length >= 2 ? p[0][0] + p[1][0] : nombre[0];
}

function formatFechaLarga(date: Date) {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFechaISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekLabel(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1, locale: es });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1, locale: es });
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(0, 0, 0, 0);
  const label = `${weekStart.getDate()} al ${weekEnd.getDate()} de ${weekEnd.toLocaleString("es-ES", { month: "long" })} de ${weekEnd.getFullYear()}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function ReporteDialog({ open, onOpenChange, practicante }: ReporteDialogProps) {
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [tipoReporte, setTipoReporte] = useState<TipoReporte | null>(null);
  const [fechaDiaria, setFechaDiaria] = useState<Date | undefined>(new Date());
  const [semanaFecha, setSemanaFecha] = useState<Date | undefined>(new Date());
  const [mesFecha, setMesFecha] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [reporte, setReporte] = useState<ReporteDiarioResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // Limpiar período al cambiar tipo
  useEffect(() => {
    if (!tipoReporte) return;
    if (tipoReporte === "DIARIO" && !fechaDiaria) setFechaDiaria(new Date());
    if (tipoReporte === "SEMANAL" && !semanaFecha) setSemanaFecha(new Date());
    if (tipoReporte === "MENSUAL" && !mesFecha)
      setMesFecha(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  }, [tipoReporte]);

  // Reset al cerrar / abrir
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setPasoActual(1);
        setTipoReporte(null);
        setFechaDiaria(new Date());
        setSemanaFecha(new Date());
        setMesFecha(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setReporte(null);
        setIsGenerating(false);
      }, 150);
    }
  };

  useEffect(() => {
    if (open) {
      setPasoActual(1);
      setTipoReporte(null);
      setReporte(null);
    }
  }, [open, practicante?.idPracticante]);

  const canContinuarPaso1 = !!tipoReporte;
  const canContinuarPaso2 = (() => {
    if (!tipoReporte) return false;
    if (tipoReporte === "DIARIO") return !!fechaDiaria;
    if (tipoReporte === "SEMANAL") return !!semanaFecha;
    if (tipoReporte === "MENSUAL") return !!mesFecha;
    return false;
  })();

  const handleContinuar = () => {
    if (pasoActual === 1 && canContinuarPaso1) setPasoActual(2);
    else if (pasoActual === 2 && canContinuarPaso2) setPasoActual(3);
  };

  const handleAtras = () => {
    if (reporte) {
      setReporte(null);
      return;
    }
    if (pasoActual > 1) setPasoActual((p) => (p - 1) as 1 | 2 | 3);
  };

  const periodoLabel = (() => {
    if (!tipoReporte) return "—";
    if (tipoReporte === "DIARIO" && fechaDiaria) return formatFechaLarga(fechaDiaria);
    if (tipoReporte === "SEMANAL" && semanaFecha) return getWeekLabel(semanaFecha);
    if (tipoReporte === "MENSUAL" && mesFecha)
      return mesFecha.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });
    return "—";
  })();

  const handleGenerar = async () => {
    if (!practicante || !tipoReporte) return;
    if (tipoReporte !== "DIARIO") {
      toast.info(`Reporte ${tipoReporte.toLowerCase()} próximamente`, {
        description: "Por ahora solo está disponible el reporte diario.",
      });
      return;
    }
    if (!fechaDiaria) {
      toast.error("Selecciona una fecha");
      return;
    }
    try {
      setIsGenerating(true);
      const fechaISO = formatFechaISO(fechaDiaria);
      const res = await reportesApi.getReporteDiario(practicante.idPracticante, fechaISO);
      setReporte(res);
      toast.success("Reporte generado correctamente");
    } catch (e: any) {
      const msg = e?.message || "No se pudo generar el reporte";
      toast.error(msg);
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescargarPdf = async () => {
    if (!reporte) return;
    try {
      setIsDownloadingPdf(true);
      await descargarPdfDiario(reporte);
      toast.success("PDF descargado");
    } catch (e: any) {
      toast.error("Error al generar PDF");
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDescargarExcel = async () => {
    if (!reporte) return;
    try {
      setIsDownloadingExcel(true);
      await descargarExcelDiario(reporte);
      toast.success("Excel descargado");
    } catch (e: any) {
      toast.error("Error al generar Excel");
      console.error(e);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  if (!practicante) return null;

  const steps = [
    { num: 1, label: "Tipo" },
    { num: 2, label: "Período" },
    { num: 3, label: "Confirmar" },
  ];

  // Si hay reporte, mostrar vista previa ampliada
  const isPreview = !!reporte;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${isPreview ? "max-w-5xl! w-full! max-h-[90vh]" : "max-w-2xl! w-full! max-h-[90vh]"} flex flex-col p-0 overflow-hidden`}>
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl shrink-0">
              <NotebookText className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold leading-none">
                {isPreview ? "Vista previa del reporte" : "Generar reporte"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                {isPreview ? "Revisa el documento antes de descargar" : "Selecciona el tipo y período del reporte para este practicante."}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <Avatar className="h-8 w-8 border border-slate-200 shrink-0">
                  <AvatarFallback className="text-xs font-medium bg-white text-slate-700">
                    {getInitials(practicante.nombreCompleto)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{practicante.nombreCompleto}</p>
                  <p className="text-xs text-slate-500 truncate">DNI {practicante.documento}</p>
                </div>
                <Badge variant="outline" className="ml-auto hidden sm:inline-flex text-xs shrink-0">
                  {practicante.nombreArea || practicante.area || "Sin área"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {!isPreview && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 sm:gap-4">
                {steps.map((step, idx) => {
                  const isActive = pasoActual === step.num;
                  const isCompleted = pasoActual > step.num;
                  return (
                    <div key={step.num} className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className={
                            isCompleted
                              ? "flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shrink-0"
                              : isActive
                                ? "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-blue-100 shrink-0 text-sm font-medium"
                                : "flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0 text-sm font-medium"
                          }
                        >
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.num}
                        </div>
                        <span
                          className={
                            isActive
                              ? "text-xs font-semibold text-blue-700"
                              : isCompleted
                                ? "text-xs font-medium text-blue-700"
                                : "text-xs font-medium text-slate-400"
                          }
                        >
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={
                            isCompleted || pasoActual > step.num
                              ? "w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 bg-green-600"
                              : "w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 bg-slate-200"
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isPreview && reporte ? (
            <div className="space-y-4">
              <ReporteDiarioView reporte={reporte} />
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <Button
                  onClick={handleDescargarPdf}
                  disabled={isDownloadingPdf || isDownloadingExcel}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                >
                  {isDownloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  {isDownloadingPdf ? "Generando PDF..." : "Descargar PDF"}
                </Button>
                <Button
                  onClick={handleDescargarExcel}
                  disabled={isDownloadingPdf || isDownloadingExcel}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  {isDownloadingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                  {isDownloadingExcel ? "Generando Excel..." : "Descargar Excel"}
                </Button>
              </div>
            </div>
          ) : (
            <div key={pasoActual} className="animate-in fade-in slide-in-from-bottom-1 duration-250">
              {pasoActual === 1 && <ReporteStepTipo value={tipoReporte} onChange={setTipoReporte} />}
              {pasoActual === 2 && tipoReporte && (
                <ReporteStepPeriodo
                  tipo={tipoReporte}
                  fechaDiaria={fechaDiaria}
                  semanaFecha={semanaFecha}
                  mesFecha={mesFecha}
                  onFechaDiariaChange={setFechaDiaria}
                  onSemanaFechaChange={setSemanaFecha}
                  onMesFechaChange={setMesFecha}
                />
              )}
              {pasoActual === 3 && tipoReporte && (
                <ReporteStepConfirmacion practicante={practicante} tipo={tipoReporte} periodoLabel={periodoLabel} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 h-22 border-t pl-9  pr-10 bg-muted/20 shrink-0 flex-row justify-between sm:justify-between gap-2">
          <div>
            {isPreview ? (
              <Button variant="outline" onClick={() => setReporte(null)} className="rounded-xl gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            ) : pasoActual === 1 ? (
              <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-xl">
                Cancelar
              </Button>
            ) : (
              <Button variant="outline" onClick={handleAtras} className="rounded-xl gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
            )}
          </div>
          <div>
            {isPreview ? (
              <Button  variant="outline" onClick={() => handleOpenChange(false)} className="rounded-xl">
                Cerrar
              </Button>
            ) : pasoActual < 3 ? (
              <Button
                onClick={handleContinuar}
                disabled={(pasoActual === 1 && !canContinuarPaso1) || (pasoActual === 2 && !canContinuarPaso2)}
                className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white gap-1.5 disabled:opacity-50"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerar}
                disabled={isGenerating}
                className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                {isGenerating ? "Generando..." : "Generar reporte"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
