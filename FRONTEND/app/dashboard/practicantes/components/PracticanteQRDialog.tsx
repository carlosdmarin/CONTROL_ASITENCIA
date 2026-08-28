"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { Practicante } from "@/types/practicante";

interface PracticanteQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
}

export function PracticanteQRDialog({ open, onOpenChange, practicante }: PracticanteQRDialogProps) {
  if (!practicante) return null;

  const qrValue = practicante.documento;
  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${practicante.idPracticante}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-${practicante.nombreCompleto}-${practicante.documento}.png`;
      a.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            QR de {practicante.nombreCompleto}
          </DialogTitle>
          <DialogDescription>
            Escanea este QR en <b>/marcacion</b> para registrar asistencia. Contiene el DNI: <b>{practicante.documento}</b>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <QRCodeCanvas
              id={`qr-${practicante.idPracticante}`}
              value={qrValue}
              size={200}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">{practicante.nombreCompleto}</p>
            <p className="text-xs text-slate-500 font-mono">{practicante.documento} • {practicante.sede || (practicante as any).agencia}</p>
          </div>
          <Button onClick={downloadQR} variant="outline" className="w-full gap-2">
            <Download className="h-4 w-4" />
            Descargar QR
          </Button>
          <p className="text-xs text-slate-400 text-center">
            Prueba escaneando este QR desde tu celular en la página de marcación.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
