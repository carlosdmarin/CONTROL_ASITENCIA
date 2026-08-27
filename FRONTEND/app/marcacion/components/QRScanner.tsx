"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  isResultVisible = false
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Iniciar cámara
  useEffect(() => {
    let mounted = true;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
          setIsCameraReady(true);
        }
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        onError("No se pudo acceder a la cámara. Verifica los permisos.");
      }
    };

    if (isActive && !isResultVisible) {
      startCamera();
    } else {
      setIsCameraReady(false);
      stopStream();
    }

    return () => {
      mounted = false;
      stopStream();
    };
  }, [isActive, isResultVisible, onError, stopStream]);

  // Simular escaneo (solo cuando está activo y no hay resultado visible)
  useEffect(() => {
    if (!isActive || !isCameraReady || isResultVisible) return;

    const timeout = setTimeout(() => {
      const documentos = ["70000001", "70000002", "70000003", "70000004", "70000005"];
      const docAleatorio = documentos[Math.floor(Math.random() * documentos.length)];
      onScan(docAleatorio);
    }, 3000 + Math.random() * 2000);

    return () => clearTimeout(timeout);
  }, [isActive, isCameraReady, isResultVisible, onScan]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />
      
      {/* ====== OVERLAY DEL QR ====== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Marco del QR */}
        <div className="absolute inset-0 border-4 border-blue-500/60 rounded-xl m-8">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
        </div>
        
        {/* Texto inferior */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <span className="inline-block bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
            {isCameraReady ? "📷 Coloca el QR dentro del recuadro" : "⏳ Iniciando cámara..."}
          </span>
        </div>

        {/* Línea de escaneo animada (solo si no hay resultado visible) */}
        {isCameraReady && !isResultVisible && (
          <div className="absolute left-12 right-12 h-0.5 bg-blue-400/80 animate-scan-line rounded-full shadow-lg shadow-blue-500/50"></div>
        )}
      </div>
    </div>
  );
}