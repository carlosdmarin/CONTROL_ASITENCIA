"use client";
import {ScanLine, ScanQrCode} from "lucide-react"
interface QRScannerStatusProps {
  isScanning: boolean;
}

export default function QRScannerStatus({ isScanning }: QRScannerStatusProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isScanning ? (
            <>
              <ScanQrCode className="h-5 w-5 text-green-600"></ScanQrCode>
              <span className="text-sm font-medium text-slate-700">Scanner activo</span>
            </>
          ) : (
            <>
              <ScanLine className="h-5 w-5 text-slate-600"></ScanLine>
              <span className="text-sm font-medium text-slate-500">Scanner pausado</span>
            </>
          )}
        </div>
        <div className="text-xs text-slate-400">
          {isScanning ? "Esperando código..." : "Pausado"}
        </div>
      </div>
    </div>
  );
}