"use client";

import { ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VigilantesHeaderProps {
  onOpenCreate: () => void;
}

export default function VigilantesHeader({ onOpenCreate }: VigilantesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl shrink-0">
          <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">Vigilantes</h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-snug">
            Administra los usuarios encargados del control de asistencia.
          </p>
        </div>
      </div>

      <Button
        className="w-full sm:w-auto justify-center gap-2 px-4 py-2.5 h-10 hover:shadow-md transition-all bg-blue-700 duration-300 hover:bg-blue-800 shrink-0"
        onClick={onOpenCreate}
      >
        <UserPlus className="h-5 w-5 shrink-0" />
        Nuevo vigilante
      </Button>
    </div>
  );
}
