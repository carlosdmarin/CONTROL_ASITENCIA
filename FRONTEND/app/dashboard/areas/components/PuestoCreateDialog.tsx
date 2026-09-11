"use client";

import { useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NuevaArea } from "@/types/area";
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
  onSave: (nuevaArea: NuevaArea) => void;
}

export default function PuestoCreateDialog({
  open,
  onOpenChange,
  onSave,
}: PuestoCreateDialogProps) {
  const [formData, setFormData] = useState({
    nombreArea: "",
    descripcion: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nombreError = !formData.nombreArea.trim() ? "Requerido" : undefined;
  const isValid = !nombreError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ nombreArea: true });
      return;
    }
    onSave({
      nombreArea: formData.nombreArea.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      activo: true,
    } as NuevaArea);
    setFormData({ nombreArea: "", descripcion: "" });
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
              <DialogTitle className="text-base font-semibold tracking-tight">Nueva área</DialogTitle>
              <DialogDescription className="text-[13px] leading-4">
                Crea un área para asignar practicantes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-1.5">
            <Label htmlFor="nombreArea" className="text-[13px] font-medium">
              Nombre del Área <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreArea"
              value={formData.nombreArea}
              onChange={(e) => setFormData({ ...formData, nombreArea: e.target.value })}
              onBlur={() => setTouched((s) => ({ ...s, nombreArea: true }))}
              placeholder="Ej. Logística y servicios"
              className="h-9"
              aria-invalid={touched.nombreArea && !!nombreError}
            />
            {touched.nombreArea && nombreError && (
              <p className="text-xs text-red-600">{nombreError}</p>
            )}
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
              Guardar área
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
