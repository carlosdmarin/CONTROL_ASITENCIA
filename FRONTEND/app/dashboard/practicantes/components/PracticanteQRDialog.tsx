"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CarnetPracti } from "./CarnetPracti";
import { Download, QrCode } from "lucide-react";
import { Practicante } from "@/types/practicante";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";

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

  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (!open || !practicante) return;
    const build = () =>
      `PRACTIQR|${practicante.idPracticante}|${new Date().toISOString()}`;
    setQrValue(build());
    const id = setInterval(() => setQrValue(build()), 30000);
    return () => clearInterval(id);
  }, [open, practicante]);

  if (!practicante) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md justify-center">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 ">
            <QrCode className="h-5 w-5" />
            Carnet de {practicante.nombreCompleto}
          </DialogTitle>
        </DialogHeader>

        <CarnetPracti
          carnetRef={carnetRef}
          practicante={practicante}
          qrValue={qrValue || `PRACTIQR|${practicante.idPracticante}|${new Date().toISOString()}`}
          fotoPreview={fotoPreview}
          isDownloading={isDownloading}
          fileInputRef={fileInputRef}
          onFotoChange={handleFotoChange}
          onRemoveFoto={removeFoto}
          editableFoto={true}
        />

        {/* BOTONES */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={downloadCarnet}
            className="flex-1 gap-2 h-8 bg-[#0A2F6B] hover:bg-[#08244f]"
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
