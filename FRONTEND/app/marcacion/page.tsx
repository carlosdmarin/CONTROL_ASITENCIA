"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCallback } from "react";

import QRScannerHeader from "./components/QRScannerHeader";
import QRScanner from "./components/QRScanner";
import QRScannerStatus from "./components/QRScannerStatus";
import QRScannerButton from "./components/QRScannerButton";
import QRScannerResult from "./components/QRScannerResult";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  History,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import type { MarcacionHistorial } from "@/types/asistencia";

export default function MarcacionPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [historial, setHistorial] = useState<MarcacionHistorial[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [errorHist, setErrorHist] = useState<string | null>(null);

  const [marcacionStatus, setMarcacionStatus] = useState<{
    success: boolean;
    message: string;
    tipo?:
      | "ENTRADA"
      | "SALIDA"
      | "DESCANSO"
      | "YA_REGISTRADO"
      | "JORNADA_FINALIZADA"
      | "INACTIVO"
      | "ERROR";
  } | null>(null);
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

function getInitials(nombreCompleto: string) {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
}
  const cargarHistorial = async () => {
    try {
      setLoadingHist(true);
      setErrorHist(null);
      const { asistenciasApi } = await import("@/lib/api/asistencias");
      const data = await asistenciasApi.getMarcacionesRecientes(10);
      setHistorial(data || []);
    } catch (error) {
      // Un fallo de red o de autorización no debe verse como "no hay marcaciones"
      console.error("Error al cargar el historial reciente:", error);
      setHistorial([]);
      setErrorHist("No se pudo cargar el historial reciente.");
    } finally {
      setLoadingHist(false);
    }
  };
  useEffect(() => {
    cargarHistorial();
  }, []);

  // Manejar escaneo
  const handleScan = async (data: string) => {
    if (!data || isResultVisible) return;

    setScannedCode(data);
    setIsResultVisible(true);
    setIsScanning(false);
    setMarcacionStatus(null);

    try {
      const { asistenciasApi } = await import("@/lib/api/asistencias");

      // El backend determina automáticamente ENTRADA/SALIDA
      const response = await asistenciasApi.marcar(data, "ENTRADA");

      const tipo =
        response.tipoMarcacion ||
        (response.mensaje?.toLowerCase().includes("salida")
          ? "SALIDA"
          : "ENTRADA");

      setMarcacionStatus({
        success: true,
        message: response.mensaje || "✅ Marcación registrada correctamente",
        tipo,
      });

      toast.success(
        response.mensaje || "✅ Marcación registrada correctamente",
      );
      cargarHistorial();
    } catch (error: any) {
      const msg = error.message || "Error al registrar marcación";

      console.log("📝 Mensaje de error:", msg);

      const isDescanso =
        msg.toLowerCase().includes("descanso") ||
        msg.toLowerCase().includes("día de descanso") ||
        msg.toLowerCase().includes("hoy es tu día de descanso");

      const isYaRegistrado =
        msg.toLowerCase().includes("ya registraste") ||
        msg.toLowerCase().includes("ya has registrado") ||
        msg.toLowerCase().includes("ya marcaste") ||
        msg.toLowerCase().includes("ya tienes") ||
        msg.toLowerCase().includes("ya registró");

      const isNotFound =
        msg.toLowerCase().includes("no encontrado") ||
        msg.toLowerCase().includes("not found");
      const isJornadaFinalizada =
        msg.toLowerCase().includes("jornada de ingreso ya terminó") ||
        msg.toLowerCase().includes("jornada ya terminó");
      const isInactivo =
        msg.toLowerCase().includes("no activo") ||
        msg.toLowerCase().includes("inactivo");
      const isQrExpirado =
        msg.toLowerCase().includes("expirado") ||
        msg.toLowerCase().includes("qr_expirado");
      const isQrInvalido =
        msg.toLowerCase().includes("no es válido") ||
        msg.toLowerCase().includes("qr_invalido") ||
        (msg.toLowerCase().includes("qr") &&
          msg.toLowerCase().includes("no es válido"));

      if (isQrExpirado) {
        const m =
          "El código QR ha expirado. Espere al nuevo código y vuelva a escanear.";
        setMarcacionStatus({
          success: false,
          message: m,
          tipo: "QR_EXPIRADO" as any,
        });
        toast.error(`⏰ ${m}`);
      } else if (isQrInvalido) {
        const m = "El código QR no es válido.";
        setMarcacionStatus({
          success: false,
          message: m,
          tipo: "QR_INVALIDO" as any,
        });
        toast.error(`❌ ${m}`);
      } else if (isInactivo) {
        setMarcacionStatus({ success: false, message: msg, tipo: "INACTIVO" });
        toast.error(`🚫 ${msg}`);
      } else if (isDescanso) {
        setMarcacionStatus({ success: false, message: msg, tipo: "DESCANSO" });
        toast.error(`🚫 ${msg}`);
      } else if (isJornadaFinalizada) {
        setMarcacionStatus({
          success: false,
          message: msg,
          tipo: "JORNADA_FINALIZADA",
        });
        toast.error(`⏰ ${msg}`);
      } else if (isYaRegistrado) {
        setMarcacionStatus({
          success: false,
          message: msg,
          tipo: "YA_REGISTRADO",
        });
        toast.warning(`⚠️ ${msg}`);
      } else if (isNotFound) {
        setMarcacionStatus({ success: false, message: msg, tipo: "ERROR" });
        toast.error(`❌ ${msg}`);
      } else {
        setMarcacionStatus({ success: false, message: msg, tipo: "ERROR" });
        toast.error(`❌ ${msg}`);
      }
    }
  };

  // Cerrar resultado
  const handleCloseResult = () => {
    setIsResultVisible(false);
    setScannedCode(null);
    setIsScanning(true);
    setMarcacionStatus(null);
  };

  // Error del lector
  const handleError = useCallback((error: string) => {
    console.error("❌ Error al iniciar escáner:", error);
    toast.error(error);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* HEADER */}
      <QRScannerHeader />

      {/* CONTENIDO */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-[390px] sm:max-w-md mx-auto space-y-4 sm:space-y-6">
          {/* ESTADO DEL SCANNER */}
          <QRScannerStatus isScanning={isScanning} />

          {/* LECTOR QR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="aspect-square bg-black rounded-xl overflow-hidden relative w-full max-w-[520px] mx-auto max-h-[52dvh] sm:max-h-[60dvh]">
              <QRScanner
                onScan={handleScan}
                onError={handleError}
                isActive={isScanning}
                isResultVisible={isResultVisible}
              />
            </div>
            <p className="mt-2.5 sm:mt-3 text-center text-xs sm:text-sm text-slate-600">
              Coloca el QR dentro del recuadro
            </p>
          </div>

          {/* BOTONES DE CONTROL */}
          <div className="flex gap-2.5 sm:gap-3">
            <QRScannerButton
              isScanning={isScanning}
              onToggle={() => setIsScanning(!isScanning)}
              onReset={() => {
                setIsScanning(true);
                setScannedCode(null);
                setIsResultVisible(false);
                setMarcacionStatus(null);
                window.location.reload();
              }}
            />
          </div>

          {/* HISTORIAL RECIENTE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <History
                    className="h-4 w-4 text-blue-700"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-bold text-slate-800 tracking-tight leading-tight">
                    Historial reciente
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Últimas {historial.length > 0 ? historial.length : ""}{" "}
                    {historial.length === 1 ? "marcación" : "marcaciones"} de
                    hoy
                  </p>
                </div>
              </div>
              <button
                onClick={cargarHistorial}
                disabled={loadingHist}
                className="shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11.5px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`h-3 w-3 ${loadingHist ? "animate-spin" : ""}`}
                  strokeWidth={2.6}
                />
                Actualizar
              </button>
            </div>

            {/* Lista */}
            {loadingHist ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100"
                  >
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            ) : errorHist ? (
              <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                <div className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-1">
                  <AlertCircle
                    className="h-5 w-5 text-rose-600"
                    strokeWidth={2.2}
                  />
                </div>
                <p className="text-[13px] font-semibold text-slate-800">
                  No se pudo cargar
                </p>
                <p className="text-[11.5px] text-slate-500 max-w-[260px]">
                  {errorHist}
                </p>
                <button
                  onClick={cargarHistorial}
                  disabled={loadingHist}
                  className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={2.6} />
                  Reintentar
                </button>
              </div>
            ) : historial.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-1">
                  <History className="h-5 w-5 text-slate-400" strokeWidth={2} />
                </div>
                <p className="text-[13px] font-semibold text-slate-700">
                  Sin marcaciones hoy
                </p>
                <p className="text-[11.5px] text-slate-500 max-w-[240px]">
                  Las marcaciones aparecerán acá cuando se registren
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {historial.map((h) => {
                  const isEntrada = h.tipoMarcacion === "ENTRADA";
                  const gradient = getAvatarGradient(
                    Number(h.idMarcacion) || 0,
                    h.nombreCompleto || "?",
                  );

                  return (
                    <div
                      key={h.idMarcacion}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Avatar con iniciales */}
                      <div
                        className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0`}
                      >
                        {getInitials(h.nombreCompleto || "?")}
                      </div>

                      {/* Nombre + DNI */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-slate-900 truncate leading-tight">
                          {h.nombreCompleto ?? "—"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10.5px] text-slate-500 truncate">
                            DNI {h.documento ?? "—"}
                          </span>
                        </div>
                      </div>

                      {/* Hora */}
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-[12.5px] font-semibold text-slate-800 tabular-nums leading-tight">
                          {h.horaMarcacion?.substring(0, 5) || "—"}
                        </p>
                      </div>

                      {/* Badge tipo */}
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider ${
                          isEntrada
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-blue-50 border border-blue-200 text-blue-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isEntrada ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                        />
                        {h.tipoMarcacion}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer con enlace */}
            <Link
              href="/marcacion/historial"
              className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-slate-600 hover:text-slate-900 py-3 border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
            >
              Ver historial completo
              <ChevronRight className="h-3 w-3" strokeWidth={2.6} />
            </Link>
          </div>
        </div>
      </div>

      {/* RESULTADO DEL ESCANEO */}
      {isResultVisible && scannedCode && (
        <QRScannerResult
          codigo={scannedCode}
          onClose={handleCloseResult}
          marcacionStatus={marcacionStatus}
        />
      )}
    </div>
  );
}
