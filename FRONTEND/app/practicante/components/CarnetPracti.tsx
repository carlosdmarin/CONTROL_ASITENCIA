"use client";

import { CustomQRCode } from "./CustomQRCode";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Practicante } from "@/types/practicante";
import { RefObject, useEffect, useRef, useState } from "react";

interface CarnetPractiProps {
  practicante: Practicante;
  qrValue: string;
  fotoPreview?: string | null;
  isDownloading?: boolean;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  onFotoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFoto?: () => void;
  editableFoto?: boolean;
  carnetRef?: RefObject<HTMLDivElement | null>;
}

export function CarnetPracti({
  practicante,
  qrValue,
  fotoPreview = null,
  isDownloading = false,
  fileInputRef,
  onFotoChange,
  onRemoveFoto,
  editableFoto = true,
  carnetRef,
}: CarnetPractiProps) {
  const isInitialRef = useRef(true);
  const [qrRefresh, setQrRefresh] = useState(false);
  const [showQrEnter, setShowQrEnter] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowQrEnter(false), 260);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }
    setQrRefresh(true);
    const t = setTimeout(() => setQrRefresh(false), 180);
    return () => clearTimeout(t);
  }, [qrValue]);
  const renderFoto = () => {
    if (fotoPreview) {
      return (
        <img
          src={fotoPreview}
          alt={`Foto de ${practicante.nombreCompleto}`}
          className="h-full w-full object-top"
        />
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#d3d3d3"
          className="h-18 w-18"
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
    <div
      ref={carnetRef as any}
      className="mx-auto w-90 overflow-hidden rounded-2xl bg-white shadow-xl animate-carnet-enter"
      style={{ borderRadius: "16px" }}
    >
      {/* ENCABEZADO */}
      <div className="relative flex items-center justify-center h-22 bg-[#E64A19] px-2 py-3">
        <img
          src="/images/LOGO-H6.png"
          alt="OLAMSA"
          className="h-60 w-auto"
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Ctext x='0' y='30' font-family='Arial' font-size='24' fill='white' font-weight='bold'%3EOLAMSA%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* DATOS */}
      <div className="px-6 py-5">
        <div className="flex gap-4">
          {/* FOTO */}
          <div className="relative group">
            <div
              className={`aspect-[3/4] w-28 overflow-hidden rounded-xl border-2 transition-all ${
                fotoPreview
                  ? "border-[#E64A19]"
                  : isDownloading
                    ? "border-transparent"
                    : "border-dashed border-gray-300 hover:border-[#E64A19]"
              } bg-slate-50`}
              style={{ borderRadius: "12px" }}
            >
              {renderFoto()}
            </div>

            {editableFoto && fileInputRef && onFotoChange && (
              <>
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-white/90 hover:bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  {fotoPreview && onRemoveFoto && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-white/90 hover:bg-red-50 hover:text-red-600"
                      onClick={onRemoveFoto}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFotoChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className="flex-1 pl-3">
            <p className="text-lg font-bold uppercase text-[#0A2F6B]">
              {practicante.nombreCompleto}
            </p>

            <div className="mt-3">
              <p className="text-xs font-semibold text-[#E64A19]">DNI</p>
              <p className="font-mono text-sm font-bold text-[#0A2F6B]">
                {practicante.documento}
              </p>
            </div>

            <div className="mt-2">
              <p className="text-xs font-semibold text-[#E64A19]">SEDE</p>
              <p className="text-sm font-semibold text-[#0A2F6B]">
                {practicante.sede || "No asignada"}
              </p>
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="mt-5 flex items-center gap-5">
          <div className="rounded-xl border-2 border-[#E64A19] bg-white p-3">
            <div className={`relative inline-block ${showQrEnter ? "animate-qr-enter" : ""} ${qrRefresh ? "animate-qr-refresh" : ""}`}>
              <CustomQRCode
                value={qrValue}
                size={140}
                cornerColor="#E64A19"
                fgColor="#000000"
                bgColor="#FFFFFF"
                excavateSize={44}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="">
                  <img
                    src="/images/ISOTIPO-H6.png"
                    alt="OLAMSA"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
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
      <div className="bg-white px-6 py-4 text-center">
        <p className="text-xs font-medium text-[#0A2F6B]">
          Somos una gran familia sostenible
        </p>
        <p className="text-xs font-medium text-[#E64A19]">
          de palmicultores de Ucayali
        </p>
      </div>
    </div>
  );
}
