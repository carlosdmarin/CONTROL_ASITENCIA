"use client";

import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TurnoHeaderProps {
  total: number;
  onOpenCreate: () => void;
}

export default function TurnoHeader({ total, onOpenCreate }: TurnoHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <FolderKanban className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turnos</h1>
          <p className="text-sm text-gray-500">Gestiona los turnos de tu equipo</p>
        </div>
        <Badge className="ml-2 text-sm bg-green-500/20 text-green-700 border-green-500/30">
          {total} registros
        </Badge>
      </div>

      <Button
        className="gap-2 p-4 hover:shadow-md transition-all duration-300 hover:bg-blue-950"
        onClick={onOpenCreate}
      >
        <Plus className="h-5 w-5" />
        Agregar turno
      </Button>
    </div>
  );
}