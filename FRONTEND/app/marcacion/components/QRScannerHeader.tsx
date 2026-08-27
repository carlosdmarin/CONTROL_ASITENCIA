"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut, QrCode } from "lucide-react";

interface QRScannerHeaderProps {
  user: {
    email: string;
    role?: string;
  };
}

export default function QRScannerHeader({ user }: QRScannerHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* ====== LOGO ====== */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <QrCode className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Attendance Scanner</h1>
            <p className="text-xs text-slate-500">Escanea tu QR para marcar asistencia</p>
          </div>
        </div>

        {/* ====== USUARIO ====== */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-slate-700 hidden sm:inline">
              {user.email}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}