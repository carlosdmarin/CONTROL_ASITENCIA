"use client";

import { useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NuevoPuesto } from "@/types/puestos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PuestoCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nuevoPuesto: NuevoPuesto) => void;
}

export default function PuestoCreateDialog({
  open,
  onOpenChange,
  onSave,
}: PuestoCreateDialogProps) {
  const [formData, setFormData] = useState({
    nombrePuesto: "",
    area: "",
    descripcion: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nombreError = !formData.nombrePuesto.trim() ? "Requerido" : undefined;
  const areaError = !formData.area.trim() ? "Requerido" : undefined;
  const isValid = !nombreError && !areaError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ nombrePuesto: true, area: true });
      return;
    }
    onSave({
      nombrePuesto: formData.nombrePuesto.trim(),
      area: formData.area.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      activo: true,
    });
    setFormData({ nombrePuesto: "", area: "", descripcion: "" });
    setTouched({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight">Nuevo puesto</DialogTitle>
              <DialogDescription className="text-[13px] leading-4">
                Crea un puesto para asignar practicantes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-1.5">
            <Label htmlFor="nombrePuesto" className="text-[13px] font-medium">
              Nombre del puesto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombrePuesto"
              value={formData.nombrePuesto}
              onChange={(e) => setFormData({ ...formData, nombrePuesto: e.target.value })}
              onBlur={() => setTouched((s) => ({ ...s, nombrePuesto: true }))}
              placeholder="Ej. Soporte TI"
              className="h-9"
              aria-invalid={touched.nombrePuesto && !!nombreError}
            />
            {touched.nombrePuesto && nombreError && (
              <p className="text-xs text-red-600">{nombreError}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="area" className="text-[13px] font-medium">
              Área <span className="text-red-500">*</span>
            </Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              onBlur={() => setTouched((s) => ({ ...s, area: true }))}
              placeholder="Ej. Tecnología, Logística, Operaciones"
              className="h-9"
              aria-invalid={touched.area && !!areaError}
            />
            {touched.area && areaError && <p className="text-xs text-red-600">{areaError}</p>}
            <p className="text-xs text-slate-500">Se mostrará como subtítulo del puesto.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="descripcion" className="text-[13px] font-medium">
              Descripción <span className="text-slate-400 font-normal">— opcional</span>
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Breve descripción de responsabilidades…"
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid} className="h-9 bg-blue-600 hover:bg-blue-700">
              Guardar puesto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
