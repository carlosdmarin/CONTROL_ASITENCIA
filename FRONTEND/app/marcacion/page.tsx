"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCallback } from "react";

import QRScannerHeader from "./components/QRScannerHeader";
import QRScanner from "./components/QRScanner";
import QRScannerStatus from "./components/QRScannerStatus";
import QRScannerButton from "./components/QRScannerButton";
import QRScannerResult from "./components/QRScannerResult";

export default function MarcacionPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);

  const [marcacionStatus, setMarcacionStatus] = useState<{
    success: boolean;
    message: string;
    tipo?:
      | "ENTRADA"
      | "SALIDA"
      | "DESCANSO"
      | "YA_REGISTRADO"
      | "ERROR";
  } | null>(null);

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
        message:
          response.mensaje || "✅ Marcación registrada correctamente",
        tipo,
      });

      toast.success(
        response.mensaje || "✅ Marcación registrada correctamente"
      );
    } catch (error: any) {
      const msg =
        error.message || "Error al registrar marcación";

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

      if (isDescanso) {
        setMarcacionStatus({
          success: false,
          message: msg,
          tipo: "DESCANSO",
        });

        toast.error(`🚫 ${msg}`);
      } else if (isYaRegistrado) {
        setMarcacionStatus({
          success: false,
          message: msg,
          tipo: "YA_REGISTRADO",
        });

        toast.warning(`⚠️ ${msg}`);
      } else if (isNotFound) {
        setMarcacionStatus({
          success: false,
          message: msg,
          tipo: "ERROR",
        });

        toast.error(`❌ ${msg}`);
      } else {
        setMarcacionStatus({
          success: false,
          message: msg,
          tipo: "ERROR",
        });

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
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <QRScannerHeader />

      {/* CONTENIDO */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">

          {/* ESTADO DEL SCANNER */}
          <QRScannerStatus isScanning={isScanning} />

          {/* LECTOR QR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="aspect-square bg-black rounded-xl overflow-hidden relative">
              <QRScanner
                onScan={handleScan}
                onError={handleError}
                isActive={isScanning}
                isResultVisible={isResultVisible}
              />
            </div>
          </div>

          {/* BOTONES DE CONTROL */}
          <div className="flex gap-4">
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

          {/* HISTORIAL */}
          <button
            onClick={() => (window.location.href = "/historial")}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
          >
            📋 Ver mi historial de marcaciones
          </button>
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

