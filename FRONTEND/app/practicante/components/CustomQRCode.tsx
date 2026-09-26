"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface CustomQRCodeProps {
  value: string;
  size?: number;
  cornerColor?: string;   // color de los 3 cuadrados grandes (finder patterns)
  fgColor?: string;       // color de los puntitos de datos
  bgColor?: string;
  excavateSize?: number;  // espacio (px) reservado en el centro para el logo
  dotScale?: number;      // 0-1, qué tan grande es cada punto respecto a su celda (0.85 recomendado)
}

export function CustomQRCode({
  value,
  size = 140,
  cornerColor = "#F97316",
  fgColor = "#000000",
  bgColor = "#FFFFFF",
  excavateSize = 44,
  dotScale = 0.85,
}: CustomQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
    const modules = qr.modules;
    const moduleCount = modules.size;
    const scale = size / moduleCount;

    const canvas = canvasRef.current;
    const dpr = 3;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Los 3 cuadrados grandes de las esquinas miden 7x7 módulos cada uno
    const isFinderZone = (row: number, col: number) => {
      const topLeft = row < 7 && col < 7;
      const topRight = row < 7 && col >= moduleCount - 7;
      const bottomLeft = row >= moduleCount - 7 && col < 7;
      return topLeft || topRight || bottomLeft;
    };

    // Hueco reservado en el centro para el logo
    const excavateModules = Math.ceil(excavateSize / scale);
    const excavateStart = Math.floor((moduleCount - excavateModules) / 2);
    const excavateEnd = excavateStart + excavateModules;
    const isExcavated = (row: number, col: number) =>
      row >= excavateStart && row < excavateEnd &&
      col >= excavateStart && col < excavateEnd;

    // Dibuja un cuadrado con esquinas redondeadas (para los finder patterns)
    const drawRoundedSquare = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
      ctx.fill();
    };

    // Dibuja cada uno de los 3 finder patterns como anillo cuadrado redondeado
    const drawFinderPattern = (startRow: number, startCol: number) => {
      const x = startCol * scale;
      const y = startRow * scale;
      const outerSize = 7 * scale;
      const innerSize = 5 * scale;
      const coreSize = 3 * scale;

      // anillo exterior (color de marca)
      drawRoundedSquare(x, y, outerSize, outerSize, outerSize * 0.28, cornerColor);
      // hueco blanco
      drawRoundedSquare(
        x + scale,
        y + scale,
        innerSize,
        innerSize,
        innerSize * 0.28,
        bgColor
      );
      // núcleo sólido (color de marca)
      drawRoundedSquare(
        x + scale * 2,
        y + scale * 2,
        coreSize,
        coreSize,
        coreSize * 0.28,
        cornerColor
      );
    };

    // 1. Puntos de datos (todo lo que NO es finder pattern ni está excavado)
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!modules.get(row, col)) continue;
        if (isFinderZone(row, col)) continue;
        if (isExcavated(row, col)) continue;

        const cx = col * scale + scale / 2;
        const cy = row * scale + scale / 2;
        const r = (scale * dotScale) / 2;

        ctx.fillStyle = fgColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Finder patterns (las 3 esquinas), dibujados aparte como anillos redondeados
    drawFinderPattern(0, 0); // arriba-izquierda
    drawFinderPattern(0, moduleCount - 7); // arriba-derecha
    drawFinderPattern(moduleCount - 7, 0); // abajo-izquierda
  }, [value, size, cornerColor, fgColor, bgColor, excavateSize, dotScale]);

  return <canvas ref={canvasRef} />;
}