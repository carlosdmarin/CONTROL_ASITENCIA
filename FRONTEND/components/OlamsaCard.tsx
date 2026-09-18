"use client";

import { useState, useEffect, useRef } from "react";

type OlamsaCardProps = {
  images?: string[];
  interval?: number;
  enableKenBurns?: boolean;
  compact?: boolean;
};

const DEFAULT_IMAGES = [
  "/images/olamsa-1.png",
  "/images/olamsa-2.png",
  "/images/olamsa-3.jpg",
  "/images/olamsa-4.jpg",
];

export function OlamsaCard({
  images = DEFAULT_IMAGES,
  interval = 7000,
  enableKenBurns = true,
  compact = false,
}: OlamsaCardProps) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  const validImages = images.filter(Boolean);
  const hasImages = validImages.length > 0;

  const currentRef = useRef(current);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Preload siguiente imagen
  useEffect(() => {
    if (!hasImages || validImages.length <= 1) return;
    const nextIndex = (current + 1) % validImages.length;
    const img = new window.Image();
    img.src = validImages[nextIndex];
  }, [current, hasImages, validImages]);

  // Rotación automática 7s con crossfade real 1400ms
  useEffect(() => {
    if (!hasImages || validImages.length <= 1) return;

    const startTransition = () => {
      const nextIndex = (currentRef.current + 1) % validImages.length;
      // 1. Preparar siguiente con opacity 0
      setNext(nextIndex);
      // 2. Forzar render inicial
      raf1Ref.current = requestAnimationFrame(() => {
        raf2Ref.current = requestAnimationFrame(() => {
          // 3. Cambiar a opacity 1 (next) y 0 (current) - inicia crossfade
          setFading(true);
        });
      });
      // 4. Mantener ambas montadas 1400ms, luego consolidar
      fadeTimeoutRef.current = setTimeout(() => {
        setCurrent(nextIndex);
        setNext(null);
        setFading(false);
      }, 1400);
    };

    intervalRef.current = setInterval(startTransition, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
      if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
    };
  }, [hasImages, validImages.length, interval]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
      if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
    };
  }, []);

  if (!hasImages) {
    return (
      <div className="w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-800 p-4 flex flex-col justify-end border border-white/10">
        <p className="text-[11px] font-bold tracking-widest text-white">OLAMSA</p>
        <p className="text-[10px] text-white/70">Ucayali, Perú</p>
        <p className="text-[11px] font-medium text-white leading-snug mt-2">
          Somos una gran familia sostenible
          <br />
          de palmicultores de Ucayali
        </p>
      </div>
    );
  }

  const shouldKenBurns = enableKenBurns && !compact;

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden relative border border-white/10 shadow-sm shrink-0 ${
        compact ? "h-36" : "h-40"
      }`}
      aria-label="OLAMSA - Somos una gran familia sostenible de palmicultores de Ucayali"
    >
      {/* Dos capas superpuestas para crossfade real */}
      {validImages.map((src, index) => {
        const isCurrent = index === current;
        const isNext = index === next;
        if (!isCurrent && !isNext) return null;

        // Lógica de opacidad para crossfade 1400ms
        // - Sin transición: current 1, next 0
        // - Durante fade: current 0, next 1
        let opacity = 0;
        if (!fading) {
          opacity = isCurrent ? 1 : isNext ? 0 : 0;
        } else {
          opacity = isNext ? 1 : isCurrent ? 0 : 0;
        }

        const isVisible = opacity === 1;

        return (
          <div
            key={src + index}
            className="absolute inset-0"
            style={{
              opacity,
              transition: "opacity 1400ms ease-in-out",
              zIndex: isVisible || isNext ? 2 : 1,
            }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${
                shouldKenBurns ? "will-change-transform" : ""
              }`}
              style={
                shouldKenBurns
                  ? {
                      transform: isVisible ? "scale(1.05)" : "scale(1)",
                      transition: "transform 7000ms ease-out",
                    }
                  : undefined
              }
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        );
      })}

      {/* Overlay gradiente */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.78) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Contenido texto */}
      <div className="absolute inset-x-0 bottom-0 z-[4] p-3.5">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.14em] text-white leading-none">
            OLAMSA
          </p>
          <p className="text-[10px] font-medium text-white/70 leading-none">
            Ucayali, Perú
          </p>
          <p className="text-[11px] font-medium text-white leading-snug mt-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Somos una gran familia sostenible
            <br />
            de palmicultores de Ucayali
          </p>
        </div>

        {validImages.length > 1 && (
          <div className="flex items-center gap-1.5 mt-3">
            {validImages.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === current && !fading ? "w-4 bg-white" : i === next && fading ? "w-4 bg-white" : i === current ? "w-1.5 bg-white/40" : "w-1.5 bg-white/40"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
