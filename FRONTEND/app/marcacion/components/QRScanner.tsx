"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
  isActive: boolean;
  isResultVisible?: boolean;
}

export default function QRScanner({
  onScan,
  onError,
  isActive,
  isResultVisible = false,
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const containerId = "qr-reader-container";
  const QR_BOX_SIZE = 250;

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        // 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (e) {
      // ignorar errores al detener
    }
    setIsCameraReady(false);
  }, []);

  // Iniciar / detener escáner real
  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        // Esperar a que el DOM exista
        await new Promise((r) => setTimeout(r, 100));
        if (!mounted) return;

        const el = document.getElementById(containerId);
        if (!el) {
          if (isActive && !isResultVisible) setTimeout(startScanner, 200);
          return;
        }

        if (scannerRef.current) await stopScanner();

        const html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: QR_BOX_SIZE, height: QR_BOX_SIZE },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Decodificado con éxito - extraer documento
            let documento = decodedText.trim();
            // Si es JSON {"documento":"70000001"} o {"dni":"..."} intentar parsear
            try {
              const obj = JSON.parse(decodedText);
              documento =
                obj.documento ||
                obj.dni ||
                obj.codigo ||
                obj.documentoPracticante ||
                decodedText;
            } catch {
              // Si es URL con ?doc= o ?codigo=, extraer param
              try {
                const url = new URL(decodedText);
                documento =
                  url.searchParams.get("documento") ||
                  url.searchParams.get("dni") ||
                  url.searchParams.get("codigo") ||
                  decodedText;
              } catch {
                // texto plano, usar tal cual
              }
            }
            // Limpiar: solo dígitos del documento
            documento = documento.toString().trim();
            if (documento) {
              onScan(documento);
            }
          },
          () => {
            // error de frame, ignorar (no hay QR en este frame)
          },
        );

        if (mounted) setIsCameraReady(true);
      } catch (error: any) {
        console.error("❌ ERROR COMPLETO AL INICIAR CÁMARA:", error);

        const msg = error?.message || String(error);
        onError(`Error de cámara: ${msg}`);
      }
    };

    if (isActive && !isResultVisible) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isActive, isResultVisible, onError, stopScanner]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Contenedor real de html5-qrcode - ocupa todo */}
      <div
        id={containerId}
        className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_canvas]:hidden"
      />

      {/* Overlay visual — único marco 250px centrado, color marca */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[250px] pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-brand rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-brand rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-brand rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-brand rounded-br-xl"></div>
        </div>
        {isCameraReady && isActive && !isResultVisible && (
          <div className="absolute left-1/2 top-1/2 h-0.5 w-[200px] -translate-x-1/2 -translate-y-1/2 bg-brand/80 animate-scan-line rounded-full shadow-lg shadow-brand/50"></div>
        )}
      </div>

      {/* Estado pausado */}
      {!isActive && !isResultVisible && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <span className="bg-white/90 text-slate-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
            Escáner en pausa
          </span>
        </div>
      )}

      {/* Ayuda para HTTPS */}
      {!isCameraReady && isActive && !isResultVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
          <p className="text-white text-xs text-center">
            Si la cámara no inicia, asegúrate de usar <b>https://</b> o{" "}
            <b>localhost</b> y dar permiso de cámara.
          </p>
        </div>
      )}
    </div>
  );
}
