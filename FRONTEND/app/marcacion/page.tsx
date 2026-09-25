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
export default function MarcacionPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

  const [marcacionStatus, setMarcacionStatus] = useState<{
    success: boolean;
    message: string;
    tipo?: "ENTRADA" | "SALIDA" | "DESCANSO" | "YA_REGISTRADO" | "JORNADA_FINALIZADA" | "INACTIVO" | "ERROR";
  } | null>(null);

  const cargarHistorial = async () => {
    try {
      setLoadingHist(true);
      const { asistenciasApi } = await import("@/lib/api/asistencias");
      const data = await asistenciasApi.getMarcacionesRecientes(10);
      setHistorial(data || []);
    } catch {
      // silencioso
    } finally { setLoadingHist(false); }
  };
  useEffect(() => { cargarHistorial(); }, []);

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
        (msg.toLowerCase().includes("qr") && msg.toLowerCase().includes("no es válido"));

      if (isQrExpirado) {
        const m = "El código QR ha expirado. Espere al nuevo código y vuelva a escanear.";
        setMarcacionStatus({ success: false, message: m, tipo: "QR_EXPIRADO" as any });
        toast.error(`⏰ ${m}`);
      } else if (isQrInvalido) {
        const m = "El código QR no es válido.";
        setMarcacionStatus({ success: false, message: m, tipo: "QR_INVALIDO" as any });
        toast.error(`❌ ${m}`);
      } else if (isInactivo) {
        setMarcacionStatus({ success: false, message: msg, tipo: "INACTIVO" });
        toast.error(`🚫 ${msg}`);
      } else if (isDescanso) {
        setMarcacionStatus({ success: false, message: msg, tipo: "DESCANSO" });
        toast.error(`🚫 ${msg}`);
      } else if (isJornadaFinalizada) {
        setMarcacionStatus({ success: false, message: msg, tipo: "JORNADA_FINALIZADA" });
        toast.error(`⏰ ${msg}`);
      } else if (isYaRegistrado) {
        setMarcacionStatus({ success: false, message: msg, tipo: "YA_REGISTRADO" });
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
            <p className="mt-2.5 sm:mt-3 text-center text-xs sm:text-sm text-slate-600">Coloca el QR dentro del recuadro</p>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Historial reciente</h3>
              <button onClick={cargarHistorial} className="text-xs font-medium text-brand hover:text-brand-hover underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-md px-1.5 py-1.5 min-h-[32px]">Actualizar</button>
            </div>
            {loadingHist ? (
              <p className="text-xs text-slate-400 text-center py-4">Cargando...</p>
            ) : historial.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin marcaciones hoy</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b">
                      <th className="text-left py-1 font-medium">Practicante</th>
                      <th className="text-left py-1 font-medium">DNI</th>
                      <th className="text-center py-1 font-medium">Hora</th>
                      <th className="text-center py-1 font-medium">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h: any) => (
                      <tr key={h.idMarcacion} className="border-b last:border-0">
                        <td className="py-1.5 truncate max-w-[110px]">{h.nombreCompleto}</td>
                        <td className="py-1.5 font-mono">{h.documento}</td>
                        <td className="py-1.5 text-center font-mono">{h.horaMarcacion?.substring(0,5) || "—"}</td>
                        <td className="py-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${h.tipoMarcacion === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {h.tipoMarcacion}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link href="/marcacion/historial" className="w-full text-xs font-medium text-brand hover:text-brand-hover underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 rounded-md transition-colors py-2 block text-center mt-2">
              Ver historial completo
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
