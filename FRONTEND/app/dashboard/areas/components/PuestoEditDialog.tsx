"use client";

import { useState, useEffect } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Area } from "@/types/area";
import { Puesto } from "@/types/puestos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PuestoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puesto: Area | Puesto | null;
  onSave: (puesto: Area) => void;
}

function toAreaCompat(p: Area | Puesto): Area {
  const a = p as Area;
  if (a.nombreArea !== undefined) return a as Area;
  const legacy = p as Puesto;
  return {
    idArea: legacy.idArea ?? legacy.idPuesto ?? 0,
    nombreArea: legacy.nombreArea ?? legacy.nombrePuesto ?? (legacy as any).area ?? "",
    descripcion: legacy.descripcion ?? (legacy as any).area,
    activo: legacy.activo,
    fechaCreacion: legacy.fechaCreacion,
  };
}

export default function PuestoEditDialog({
  open,
  onOpenChange,
  puesto,
  onSave,
}: PuestoEditDialogProps) {
  const [formData, setFormData] = useState<Area | null>(null);

  useEffect(() => {
    setFormData(puesto ? toAreaCompat(puesto) : null);
  }, [puesto]);

  if (!formData) return null;

  const isValid = formData.nombreArea.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      ...formData,
      nombreArea: formData.nombreArea.trim(),
      descripcion: formData.descripcion?.trim() || undefined,
    });
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
              <DialogTitle className="text-base font-semibold tracking-tight">Editar área</DialogTitle>
              <DialogDescription className="text-[13px] leading-4">
                Modifica nombre o descripción. Cambia el estado si es necesario.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-nombreArea" className="text-[13px] font-medium">
              Nombre del Área <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-nombreArea"
              value={formData.nombreArea}
              onChange={(e) => setFormData({ ...formData, nombreArea: e.target.value })}
              className="h-9"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-descripcion" className="text-[13px] font-medium">
              Descripción <span className="text-slate-400 font-normal">— opcional</span>
            </Label>
            <Textarea
              id="edit-descripcion"
              value={formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="resize-none"
              placeholder="Breve descripción…"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="edit-activo" className="text-[13px] font-medium cursor-pointer">
                Estado
              </Label>
              <p className="text-xs text-slate-500">
                {formData.activo ? "Activo — visible para asignaciones" : "Inactivo — oculto para nuevas asignaciones"}
              </p>
            </div>
            <Switch
              id="edit-activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              aria-label="Cambiar estado activo"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid} className="h-9 bg-blue-600 hover:bg-blue-700">
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
