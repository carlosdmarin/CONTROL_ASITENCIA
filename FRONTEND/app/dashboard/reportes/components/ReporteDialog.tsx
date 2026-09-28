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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NotebookText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  User,
  IdCard,
  Building2,
} from "lucide-react";
import { Practicante } from "@/types/practicante";
import {
  ReporteDiarioResponse,
  ReporteSemanalResponse,
  ReporteMensualResponse,
} from "@/types/reporte";
import { reportesApi } from "@/lib/api/reportes";
import {
  formatFechaISO,
  formatFechaLargaFromDate,
  getWeekRange,
} from "@/lib/utils/reportesDate";
import { ReporteStepTipo } from "./ReporteStepTipo";
import { ReporteStepPeriodo } from "./ReporteStepPeriodo";
import { ReporteStepConfirmacion } from "./ReporteStepConfirmacion";
import { ReporteDiarioView } from "./ReporteDiarioView";
import { ReporteSemanalView } from "./ReporteSemanalView";
import { ReporteMensualView } from "./ReporteMensualView";
import { descargarPdfDiario } from "@/lib/reportes/pdf/diarioPdf";
import { descargarExcelDiario } from "@/lib/reportes/excel/diarioExcel";
import { descargarPdfSemanal } from "@/lib/reportes/pdf/semanalPdf";
import { descargarExcelSemanal } from "@/lib/reportes/excel/semanalExcel";
import { descargarPdfMensual } from "@/lib/reportes/pdf/mensualPdf";
import { descargarExcelMensual } from "@/lib/reportes/excel/mensualExcel";

type TipoReporte = "DIARIO" | "SEMANAL" | "MENSUAL";

interface ReporteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
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

function getAvatarGradient(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function ReporteDialog({
  open,
  onOpenChange,
  practicante,
}: ReporteDialogProps) {
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [tipoReporte, setTipoReporte] = useState<TipoReporte | null>(null);
  const [fechaDiaria, setFechaDiaria] = useState<Date | undefined>(new Date());
  const [semanaFecha, setSemanaFecha] = useState<Date | undefined>(new Date());
  const [mesFecha, setMesFecha] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [reporte, setReporte] = useState<ReporteDiarioResponse | null>(null);
  const [reporteSemanal, setReporteSemanal] =
    useState<ReporteSemanalResponse | null>(null);
  const [reporteMensual, setReporteMensual] =
    useState<ReporteMensualResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  useEffect(() => {
    if (!tipoReporte) return;
    if (tipoReporte === "DIARIO" && !fechaDiaria) setFechaDiaria(new Date());
    if (tipoReporte === "SEMANAL" && !semanaFecha) setSemanaFecha(new Date());
    if (tipoReporte === "MENSUAL" && !mesFecha)
      setMesFecha(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      );
  }, [tipoReporte]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setPasoActual(1);
        setTipoReporte(null);
        setFechaDiaria(new Date());
        setSemanaFecha(new Date());
        setMesFecha(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        );
        setReporte(null);
        setReporteSemanal(null);
        setReporteMensual(null);
        setIsGenerating(false);
      }, 150);
    }
  };

  useEffect(() => {
    if (open) {
      setPasoActual(1);
      setTipoReporte(null);
      setReporte(null);
      setReporteSemanal(null);
      setReporteMensual(null);
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
    if (reporte || reporteSemanal || reporteMensual) {
      setReporte(null);
      setReporteSemanal(null);
      setReporteMensual(null);
      return;
    }
    if (pasoActual > 1) setPasoActual((p) => (p - 1) as 1 | 2 | 3);
  };

  const periodoLabel = (() => {
    if (!tipoReporte) return "—";
    if (tipoReporte === "DIARIO" && fechaDiaria)
      return formatFechaLargaFromDate(fechaDiaria);
    if (tipoReporte === "SEMANAL" && semanaFecha)
      return getWeekRange(semanaFecha).label;
    if (tipoReporte === "MENSUAL" && mesFecha)
      return mesFecha.toLocaleString("es-ES", {
        timeZone: "America/Lima",
        month: "long",
        year: "numeric",
      });
    return "—";
  })();

  const handleGenerar = async () => {
    if (!practicante || !tipoReporte) return;
    try {
      setIsGenerating(true);
      if (tipoReporte === "DIARIO") {
        if (!fechaDiaria) {
          toast.error("Selecciona una fecha");
          return;
        }
        const fechaISO = formatFechaISO(fechaDiaria);
        const res = await reportesApi.getReporteDiario(
          practicante.idPracticante,
          fechaISO,
        );
        setReporte(res);
        toast.success("Reporte generado correctamente");
      } else if (tipoReporte === "SEMANAL") {
        if (!semanaFecha) {
          toast.error("Selecciona una semana");
          return;
        }
        const fechaISO = formatFechaISO(semanaFecha);
        const res = await reportesApi.getReporteSemanal(
          practicante.idPracticante,
          fechaISO,
        );
        setReporteSemanal(res);
        toast.success("Reporte semanal generado correctamente");
      } else if (tipoReporte === "MENSUAL") {
        if (!mesFecha) {
          toast.error("Selecciona un mes");
          return;
        }
        const fechaISO = formatFechaISO(mesFecha);
        const res = await reportesApi.getReporteMensual(
          practicante.idPracticante,
          fechaISO,
        );
        setReporteMensual(res);
        toast.success("Reporte mensual generado correctamente");
      }
    } catch (e: any) {
      const msg = e?.message || "No se pudo generar el reporte";
      toast.error(msg);
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescargarPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      if (reporte) await descargarPdfDiario(reporte);
      else if (reporteSemanal) await descargarPdfSemanal(reporteSemanal);
      else if (reporteMensual) await descargarPdfMensual(reporteMensual);
      toast.success("PDF descargado");
    } catch (e: any) {
      toast.error("Error al generar PDF");
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDescargarExcel = async () => {
    try {
      setIsDownloadingExcel(true);
      if (reporte) await descargarExcelDiario(reporte);
      else if (reporteSemanal) await descargarExcelSemanal(reporteSemanal);
      else if (reporteMensual) await descargarExcelMensual(reporteMensual);
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
    { num: 1, label: "Tipo", icon: FileCheck },
    { num: 2, label: "Período", icon: NotebookText },
    { num: 3, label: "Confirmar", icon: CheckCircle2 },
  ];

  const isPreview = !!reporte || !!reporteSemanal || !!reporteMensual;
  const nombreDisplay = toTitleCase(practicante.nombreCompleto);
  const gradient = getAvatarGradient(
    practicante.idPracticante,
    practicante.nombreCompleto,
  );
  const periodoLabelShort = tipoReporte
    ? tipoReporte === "DIARIO"
      ? "Diario"
      : tipoReporte === "SEMANAL"
        ? "Semanal"
        : "Mensual"
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${
          isPreview
            ? "!max-w-5xl w-full max-h-[92vh]"
            : "!max-w-2xl w-full max-h-[92vh]"
        } flex flex-col p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50`}
      >
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <DialogHeader className="relative bg-white border-b border-slate-200 px-6 sm:px-7 py-5 pr-14 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <NotebookText className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  {isPreview ? "Vista previa del reporte" : "Generar reporte"}
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {isPreview ? "Previsualización" : "Reportes"}
                </span>
                {periodoLabelShort && !isPreview && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
                    {periodoLabelShort}
                  </span>
                )}
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                {isPreview
                  ? "Revisá el documento antes de descargar"
                  : "Seleccioná el tipo y período del reporte para este practicante"}
              </DialogDescription>
            </div>
          </div>

          {/* Card del practicante */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[13px] font-bold shadow-sm shrink-0`}
            >
              {getInitials(nombreDisplay)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-slate-900 truncate leading-tight">
                {nombreDisplay}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-slate-500">
                  <IdCard
                    className="h-2.5 w-2.5 text-slate-400"
                    strokeWidth={2.4}
                  />
                  {practicante.documento}
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2 py-1 text-[10.5px] font-medium text-slate-600 shrink-0">
              <Building2 className="h-3 w-3 text-slate-400" strokeWidth={2.4} />
              {practicante.nombreOficina || practicante.oficina || "Sin área"}
            </span>
          </div>
        </DialogHeader>

        {/* ═══════════ STEP INDICATOR ═══════════ */}
        {!isPreview && (
          <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 sm:gap-2">
                {steps.map((step, idx) => {
                  const isActive = pasoActual === step.num;
                  const isDone = pasoActual > step.num;
                  const Icon = step.icon;

                  return (
                    <div key={step.num} className="flex items-center">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="relative shrink-0">
                          {isActive && (
                            <span className="absolute inset-0 rounded-full bg-blue-400/40 animate-ping" />
                          )}
                          {isActive && (
                            <span className="absolute -inset-1 rounded-full bg-blue-100/60 blur-sm" />
                          )}
                          <div
                            className={`
                              relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[12px] sm:text-[13px] font-bold transition-all duration-500 shrink-0
                              ${
                                isActive
                                  ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white ring-4 ring-blue-100 shadow-md shadow-blue-900/20"
                                  : isDone
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                              }
                            `}
                          >
                            {isDone ? (
                              <CheckCircle2
                                className="h-4 w-4 sm:h-4.5 sm:w-4.5 animate-in zoom-in duration-300"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <Icon
                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${
                                  isActive ? "scale-110" : ""
                                }`}
                                strokeWidth={2.5}
                              />
                            )}
                          </div>
                        </div>
                        <span
                          className={`
                            text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-all duration-300
                            ${
                              isActive
                                ? "text-blue-700"
                                : isDone
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                            }
                          `}
                        >
                          {step.label}
                        </span>
                      </div>

                      {idx < steps.length - 1 && (
                        <div className="relative w-6 sm:w-12 h-[2px] mx-1.5 sm:mx-2 rounded-full overflow-hidden bg-slate-200">
                          <div
                            className={`
                              absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                              ${
                                isDone
                                  ? "w-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                  : isActive
                                    ? "w-1/2 bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse"
                                    : "w-0 bg-transparent"
                              }
                            `}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ BODY ═══════════ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 sm:p-6">
            {isPreview && (reporte || reporteSemanal || reporteMensual) ? (
              <div className="space-y-4">
                {/* Vistas del reporte — cada una trae su propio contenedor */}
                {reporte && <ReporteDiarioView reporte={reporte} />}
                {reporteSemanal && (
                  <ReporteSemanalView reporte={reporteSemanal} />
                )}
                {reporteMensual && (
                  <ReporteMensualView reporte={reporteMensual} />
                )}

                {/* Card de descargas */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <FileDown
                        className="h-3.5 w-3.5 text-blue-700"
                        strokeWidth={2.4}
                      />
                    </div>
                    <h3 className="text-[12px] font-bold text-slate-800 tracking-tight">
                      Descargar reporte
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={handleDescargarPdf}
                      disabled={isDownloadingPdf || isDownloadingExcel}
                      className="h-11 gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[13px] font-semibold shadow-sm"
                    >
                      {isDownloadingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generando PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" strokeWidth={2.4} />
                          Descargar PDF
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDescargarExcel}
                      disabled={isDownloadingPdf || isDownloadingExcel}
                      className="h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-semibold shadow-sm"
                    >
                      {isDownloadingExcel ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generando Excel...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet
                            className="h-4 w-4"
                            strokeWidth={2.4}
                          />
                          Descargar Excel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={pasoActual}
                className="animate-in fade-in slide-in-from-bottom-1 duration-250"
              >
                {pasoActual === 1 && (
                  <ReporteStepTipo
                    value={tipoReporte}
                    onChange={setTipoReporte}
                  />
                )}
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
                  <ReporteStepConfirmacion
                    practicante={practicante}
                    tipo={tipoReporte}
                    periodoLabel={periodoLabel}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center sm:justify-between">
          {/* Izquierda: Volver / Atrás / Cancelar */}
          <div className="flex gap-2 w-full sm:w-auto">
            {isPreview ? (
              <Button
                variant="outline"
                onClick={() => {
                  setReporte(null);
                  setReporteSemanal(null);
                  setReporteMensual(null);
                }}
                className="flex-1 sm:flex-none h-10 gap-1.5 border-slate-200 hover:bg-slate-50 text-[13px] rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
                Volver a editar
              </Button>
            ) : pasoActual === 1 ? (
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                className="flex-1 sm:flex-none h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-[13px] rounded-xl"
              >
                Cancelar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleAtras}
                className="flex-1 sm:flex-none h-10 gap-1.5 border-slate-200 hover:bg-slate-50 text-[13px] rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
                Atrás
              </Button>
            )}
          </div>

          {/* Derecha: Continuar / Generar / Cerrar */}
          <div className="flex gap-2 w-full sm:w-auto">
            {isPreview ? (
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1 sm:flex-none h-10 border-slate-200 hover:bg-slate-50 text-[13px] rounded-xl"
              >
                Cerrar
              </Button>
            ) : pasoActual < 3 ? (
              <Button
                onClick={handleContinuar}
                disabled={
                  (pasoActual === 1 && !canContinuarPaso1) ||
                  (pasoActual === 2 && !canContinuarPaso2)
                }
                className="flex-1 sm:flex-none h-10 gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-semibold rounded-xl shadow-sm"
              >
                Continuar
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Button>
            ) : (
              <Button
                onClick={handleGenerar}
                disabled={isGenerating}
                className="flex-1 sm:flex-none h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-xl shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" strokeWidth={2.4} />
                    Generar reporte
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}