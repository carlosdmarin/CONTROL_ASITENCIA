"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

type SplashScreenProps = {
  duration?: number;
  onComplete?: () => void;
};

export function SplashScreen({ duration = 2500, onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
    const completeTimer = setTimeout(() => onComplete?.(), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 transition-opacity duration-300 ease-out splash-root ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Cargando PractiQR"
      aria-busy="true"
      role="status"
    >
      {/* Aura Moonstone - 4 capas */}
      <div className="splash-aura absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="splash-layer splash-layer--1" aria-hidden="true" />
        <div className="splash-layer splash-layer--2" aria-hidden="true" />
        <div className="splash-layer splash-layer--3" aria-hidden="true" />
        <div className="splash-layer splash-layer--4" aria-hidden="true" />
      </div>
      {/* Grid refinada */}
      <div className="splash-grid" aria-hidden="true" />

      {/* Contenido centrado */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Ícono QR en contenedor de vidrio */}
        <div
          className="splash-qr-wrap"
          style={{
            animation: "splash-logo 700ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div className="splash-qr-halo" aria-hidden="true" />
          <div className="splash-qr-ring" aria-hidden="true" />
          <div className="splash-qr-glass">
            <QrCode className="splash-qr-icon" strokeWidth={1.5} aria-hidden="true" />
            <div className="splash-qr-scan" aria-hidden="true" />
          </div>
        </div>

        {/* Nombre + subtítulo */}
        <div
          className="mt-5 flex flex-col items-center"
          style={{
            animation: "splash-fade-up 600ms cubic-bezier(0.16,1,0.3,1) both",
            animationDelay: "220ms",
          }}
          role="status"
          aria-live="polite"
        >
          <h1 className="text-[22px] font-bold tracking-tight text-white md:text-[24px]">
            PractiQR
          </h1>
          <p className="mt-1.5 text-[11px] font-medium tracking-[0.18em] text-slate-400 uppercase">
            Control de asistencias
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
            OLAMSA
          </p>
        </div>

        {/* Línea de progreso decorativa + Cargando */}
        <div
          className="mt-9 flex flex-col items-center gap-3"
          style={{
            animation: "splash-fade 500ms ease-out both",
            animationDelay: "520ms",
          }}
        >
          <div className="splash-progress-track" aria-hidden="true">
            <div className="splash-progress-fill" />
          </div>
          <span className="text-[11px] font-medium tracking-widest text-slate-500">
            Cargando
          </span>
        </div>
      </div>

      {/* Footer discreto */}
      <div
        className="absolute bottom-6 z-10 flex flex-col items-center gap-1 md:bottom-8"
        style={{
          animation: "splash-fade 500ms ease-out both",
          animationDelay: "700ms",
        }}
      >
        <div className="h-px w-8 bg-white/10" />
        <span className="text-[10px] font-medium tracking-wider text-slate-500">
          © 2026 OLAMSA · Ucayali, Perú
        </span>
      </div>

      <style>{`
        @keyframes splash-logo {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splash-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes splash-loader {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(40%); }
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="splash-"] { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
