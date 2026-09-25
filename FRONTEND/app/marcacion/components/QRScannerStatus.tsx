"use client";
import {ScanLine, ScanQrCode} from "lucide-react"
interface QRScannerStatusProps {
  isScanning: boolean;
}

export default function QRScannerStatus({ isScanning }: QRScannerStatusProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isScanning ? (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-dot shrink-0" aria-hidden="true"></span>
              <ScanQrCode className="h-4 w-4 sm:h-5 sm:w-5 text-green-600"></ScanQrCode>
              <span className="text-sm sm:text-base font-medium text-slate-700">Escáner activo</span>
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600"></ScanLine>
              <span className="text-sm sm:text-base font-medium text-slate-500">Escáner en pausa</span>
            </>
          )}
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-600">
          {isScanning ? "Esperando código..." : "En pausa"}
        </div>
      </div>
    </div>
  );
}