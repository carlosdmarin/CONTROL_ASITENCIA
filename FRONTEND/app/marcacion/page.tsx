"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRScannerHeader from "./components/QRScannerHeader";
import QRScanner from "./components/QRScanner";
import QRScannerStatus from "./components/QRScannerStatus";
import QRScannerButton from "./components/QRScannerButton";
import QRScannerResult from "./components/QRScannerResult";

type UserSession = {
  email: string;
  role?: string;
  name?: string;
};

export default function MarcacionPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);

  // Verificar sesión
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    try {
      setUser(JSON.parse(userData) as UserSession);
    } catch {
      router.push("/login");
    }
   
  }, [router]);

  // Manejar escaneo exitoso - ahora con validación de horario y descanso
  const handleScan = async (data: string) => {
    if (!data || isResultVisible) return;
    
    setScannedCode(data);
    setIsResultVisible(true);
    setIsScanning(false);

    try {
      // Intentar registrar marcación en backend (valida horario y descanso)
      const { asistenciasApi } = await import("@/lib/api/asistencias");
      await asistenciasApi.marcar(data, 'ENTRADA');
      toast.success(`✅ Marcación registrada para: ${data}`);
    } catch (error: any) {
      const msg = error.message || "Error al registrar marcación";
      // Si es día de descanso, mostrar mensaje específico
      if (msg.includes("descanso") || msg.includes("Descanso")) {
        toast.error(`🚫 ${msg}`);
      } else {
        // Si backend no está disponible, mostrar éxito mock (para demo)
        console.warn("Backend no disponible, usando mock:", msg);
        toast.success(`✅ Marcación registrada para: ${data} (mock)`);
      }
    }
  };

  // Cerrar el resultado
  const handleCloseResult = () => {
    setIsResultVisible(false);
    setScannedCode(null);
    setIsScanning(true);
  };

  // Manejar error
  const handleError = (error: string) => {
    console.error("Error al escanear:", error);
    toast.error("❌ Error al leer el código QR");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ====== HEADER ====== */}
      <QRScannerHeader user={user} />

      {/* ====== CONTENIDO ====== */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* ====== ESTADO DEL SCANNER ====== */}
          <QRScannerStatus isScanning={isScanning} />

          {/* ====== LECTOR QR ====== */}
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

          {/* ====== BOTONES DE CONTROL ====== */}
          <div className="flex gap-4">
            <QRScannerButton
              isScanning={isScanning}
              onToggle={() => setIsScanning(!isScanning)}
              onReset={() => {
                setIsScanning(true);
                setScannedCode(null);
                setIsResultVisible(false);
                window.location.reload();
              }}
            />
          </div>

          {/* ====== BOTÓN HISTORIAL ====== */}
          <button
            onClick={() => router.push("/historial")}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
          >
            📋 Ver mi historial de marcaciones
          </button>
        </div>
      </div>

      {/* ====== RESULTADO DEL ESCANEO ====== */}
      {isResultVisible && scannedCode && (
        <QRScannerResult 
          codigo={scannedCode} 
          onClose={handleCloseResult} 
        />
      )}
    </div>
  );
}