"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut, QrCode } from "lucide-react";


export default function QRScannerHeader() {


  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 pt-[max(0px,env(safe-area-inset-top))]">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        {/* ====== LOGO ====== */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-xl">
            <QrCode className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">PractiQR Escáner</h1>
            <p className="text-xs text-slate-500">Escanea tu QR para marcar asistencia</p>
          </div>
        </div>
      </div>
    </header>
  );
}