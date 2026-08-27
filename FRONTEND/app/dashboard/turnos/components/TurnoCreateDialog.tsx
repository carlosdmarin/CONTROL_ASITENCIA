"use client";

import { useState } from "react";
import { Clock, SaveCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NuevoTurno } from "../types";

interface TurnoCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nuevoTurno: NuevoTurno) => void;
}

export default function TurnoCreateDialog({
  open,
  onOpenChange,
  onSave,
}: TurnoCreateDialogProps) {
  // Estado con los campos correctos
  const [formData, setFormData] = useState({
    nombre: "",
    horaInicio: "00:00",
    horaSalida: "00:00",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombre: formData.nombre,
      horaInicio: formData.horaInicio,
      horaSalida: formData.horaSalida,
    });
    setFormData({
      nombre: "",
      horaInicio: "00:00",
      horaSalida: "00:00",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
     

      {/*  AQUÍ ESTÁ EL CAMBIO: FORZAR ANCHO */}
      <SheetContent
        side="right"
        className="w-[90vw] sm:w-175 lg:w-225 max-w-none p-6 overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-2xl">Agregar turno</SheetTitle>
          </div>
          <SheetDescription>
            Completa los datos del nuevo turno.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* ====== NOMBRE ====== */}
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: TARDE"
              required
            />
          </div>

          {/* ====== HORA DE INICIO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="inicio">Hora de Inicio</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="inicio"
                type="time"
                className="pl-9"
                value={formData.horaInicio}
                onChange={(e) =>
                  setFormData({ ...formData, horaInicio: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* ====== HORA DE SALIDA ====== */}
          <div className="grid gap-2">
            <Label htmlFor="salida">Hora de salida</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="salida"
                type="time"
                className="pl-9"
                value={formData.horaSalida}
                onChange={(e) =>
                  setFormData({ ...formData, horaSalida: e.target.value })
                }
                required
              />
            </div>
          </div>

          <SheetFooter>
            <SheetClose></SheetClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <SaveCheck className="h-4 w-4 mr-1" />
              Guardar empleado
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
