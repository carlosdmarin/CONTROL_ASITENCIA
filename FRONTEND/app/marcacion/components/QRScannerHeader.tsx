"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, QrCode } from "lucide-react";
import { logout } from "@/lib/auth";


export default function QRScannerHeader() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

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
        {/* ====== CERRAR SESIÓN ====== */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Cerrar sesión"
          className="h-9 gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline text-sm font-medium">
            {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </span>
        </Button>
      </div>
    </header>
  );
}