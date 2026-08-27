"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveCheck, Clock } from "lucide-react";
import { Turno } from "../types";

interface TurnoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: Turno | null;
  onSave: (turno: Turno) => void;
}

export default function TurnoEditDialog({
  open,
  onOpenChange,
  turno,
  onSave,
}: TurnoEditDialogProps) {
  const [formData, setFormData] = useState<Turno | null>(null);
  const [horaInicio, setHoraInicio] = useState("00:00");
  const [horaSalida, setHoraSalida] = useState("00:00");
  // CARGAR DATOS DEL TURNO
  useEffect(() => {
    if (turno) {
      setFormData(turno);
      // Si los datos vienen de la API, usa los valores directamente
      setHoraInicio(turno.horaInicio?.slice(0, 5) || "00:00");
      setHoraSalida(turno.horaSalida?.slice(0, 5) || "00:00");
    }
  }, [turno]);
  // GUARDAR CAMBIOS
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({
        ...formData,
        horaInicio: horaInicio,
        horaSalida: horaSalida,
      });
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-7 w-7 text-blue-700" />
            <DialogTitle className="text-2xl">Editar turno</DialogTitle>
          </div>
          <DialogDescription>Modifica los datos del turno</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* === NOMBRE === */}
          <div className="grid gap-2">
            <Label htmlFor="edit-nombre">Nombre</Label>
            <Input
              id="edit-nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: TARDE"
              required
            />
          </div>
          {/* === HORA DE INICIO === */}
          <div className="grid gap-2">
            <Label htmlFor="edit-inicio">Hora de Inicio</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-inicio"
                type="time"
                className="pl-9"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
          </div>
          {/* HORA DE SALIDA */}
          <div className="grid gap-2">
            <Label htmlFor="edit-salida">Hora de salida</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-salida"
                type="time"
                className="pl-9"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <SaveCheck className="h-4 w-4 mr-1" />
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
