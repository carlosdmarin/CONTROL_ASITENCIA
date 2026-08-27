"use client";

import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PracticanteHeaderProps {
  onOpenCreate: () => void;
}

export default function PracticanteHeader({ onOpenCreate }: PracticanteHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* ====== IZQUIERDA: Título ====== */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practicantes</h1>
          <p className="text-sm text-gray-500">
            Gestiona los practicantes de tu empresa
          </p>
        </div>
      </div>

      {/* ====== DERECHA: Botón Agregar ====== */}
      <Button
        className="gap-2 p-4 hover:shadow-md transition-all duration-300 hover:bg-blue-950"
        onClick={onOpenCreate}
      >
        <UserPlus className="h-5 w-5" />
        Agregar practicante
      </Button>
    </div>
  );
}