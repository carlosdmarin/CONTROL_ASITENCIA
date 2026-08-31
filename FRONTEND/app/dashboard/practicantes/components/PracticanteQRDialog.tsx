"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode, Upload, X } from "lucide-react";
import { Practicante } from "@/types/practicante";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";

interface PracticanteQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
}

export function PracticanteQRDialog({
  open,
  onOpenChange,
  practicante,
}: PracticanteQRDialogProps) {
  const carnetRef = useRef<HTMLDivElement>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false); // 
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!practicante) return null;

  const qrValue = practicante.documento;

  const downloadCarnet = async () => {
    if (!carnetRef.current) return;

    try {
      // 1. Ocultamos el borde punteado / hover antes de capturar
      setIsDownloading(true);

      // Esperamos un frame para que React re-renderice sin el borde
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const dataUrl = await toPng(carnetRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        filter: (node) => {
          if (node instanceof HTMLElement && node.style.display === "none")
            return false;
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `Carnet-${practicante.nombreCompleto}-${practicante.documento}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al descargar carnet:", error);
    } finally {
      // 2. Restauramos el borde para la vista normal
      setIsDownloading(false);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Renderizar la foto (real o avatar por defecto SVG) — CORREGIDO tamaño/centrado
  const renderFoto = () => {
    if (fotoPreview) {
      return (
        <img
          src={fotoPreview}
          alt={`Foto de ${practicante.nombreCompleto}`}
          className="h-full w-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#d3d3d3"
          className="h-18 w-18" // ahora más proporcionado
        >
          <circle cx="12" cy="12" r="11" />
          <circle cx="12" cy="9.5" r="3.5" fill="white" />
          <path
            d="M12 14c-3.5 0-6.5 2.9-6.5 6.5h13c0-3.6-3-6.5-6.5-6.5z"
            fill="white"
          />
        </svg>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Carnet de {practicante.nombreCompleto}
          </DialogTitle>
        </DialogHeader>

        {/* CARNET */}
        <div
          ref={carnetRef}
          className="mx-auto w-90 overflow-hidden rounded-2xl bg-white shadow-xl"
          style={{ borderRadius: "16px" }}
        >
          {/* ENCABEZADO */}
          <div className="relative flex items-center bg-[#0A2F6B] px-6 py-5">
            <img
              src="/images/LOGO_OLAMSA.png"
              alt="OLAMSA"
              className="h-18 w-auto"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Ctext x='0' y='30' font-family='Arial' font-size='24' fill='white' font-weight='bold'%3EOLAMSA%3C/text%3E%3C/svg%3E";
              }}
            />

            <div className="mt-1 ml-2">
              <p className="text-sm font-medium tracking-widest text-orange-400">
                SISTEMA DE ASISTENCIA
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                PRACTICANTE
              </h2>
            </div>
          </div>

          {/* DATOS */}
          <div className="px-6 py-5">
            <div className="flex gap-4">
              {/* FOTO */}
              <div className="relative group">
                <div
                  className={`h-28 w-24 overflow-hidden rounded-xl border-2 transition-all ${
                    fotoPreview
                      ? "border-[#7CB342]"
                      : isDownloading
                        ? "border-transparent" // sin punteado al exportar
                        : "border-dashed border-gray-300 hover:border-[#7CB342]"
                  } bg-slate-50`}
                  style={{ borderRadius: "12px" }}
                >
                  {renderFoto()}
                </div>

                {/* Botones de acción sobre la foto (no se ven en descarga porque opacity-0 por defecto) */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-white/90 hover:bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  {fotoPreview && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-white/90 hover:bg-red-50 hover:text-red-600"
                      onClick={removeFoto}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </div>

              {/* INFORMACIÓN */}
              <div className="flex-1">
                <p className="text-lg font-bold uppercase text-[#0A2F6B]">
                  {practicante.nombreCompleto}
                </p>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-[#7CB342]">DNI</p>
                  <p className="font-mono text-sm font-bold text-[#0A2F6B]">
                    {practicante.documento}
                  </p>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-[#7CB342]">SEDE</p>
                  <p className="text-sm font-semibold text-[#0A2F6B]">
                    {practicante.sede ||
                      (practicante as any).agencia ||
                      "No asignada"}
                  </p>
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="mt-5 flex items-center gap-5">
              <div className="rounded-xl border-2 border-[#7CB342] bg-white p-3">
                <QRCodeCanvas
                  value={qrValue}
                  size={140}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-[#0A2F6B]">MARCACIÓN</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Escanea este código QR
                  <br />
                  desde la página de
                  <br />
                  marcación para registrar
                  <br />
                  tu asistencia.
                </p>
              </div>
            </div>
          </div>

          {/* PIE */}
          <div className="bg-[#0A2F6B] px-6 py-4 text-center">
            <p className="text-xs font-medium text-white">Somos una gran familia sostenible</p>
            <p className="text-xs font-medium text-orange-400">
              de palmicultores de Ucayali
            </p>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex gap-2">
          <Button
            onClick={downloadCarnet}
            className="flex-1 gap-2"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Generando..." : "Descargar carnet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
