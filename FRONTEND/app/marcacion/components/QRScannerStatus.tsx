"use client";

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
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Scanner activo</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
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