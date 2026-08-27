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
import { SaveCheck, Pencil } from "lucide-react";
import { Practicante, Sede, Cargo, Puesto, TipoInstituto } from "@/types/practicante";
import { sedeApi } from "@/lib/api/agencias";
import { cargosApi } from "@/lib/api/cargos";
import { puestosApi } from "@/lib/api/puestos";
import { tiposInstitutoApi } from "@/lib/api/tipos-instituto";

interface PracticanteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
  onSave: (practicante: Practicante) => void;
}

export function PracticanteEditDialog({
  open,
  onOpenChange,
  practicante,
  onSave,
}: PracticanteEditDialogProps) {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tiposInstituto, setTiposInstituto] = useState<TipoInstituto[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(true);
  const [formData, setFormData] = useState<Practicante | null>(null);

  // Cargar selects
  useEffect(() => {
    if (!open) return;

    const cargarSelects = async () => {
      try {
        setLoadingSelects(true);
        const [sedesData, cargosData, puestosData, tiposData] = await Promise.all([
          sedeApi.getAll(),
          cargosApi.getAll(),
          puestosApi.getAll(),
          tiposInstitutoApi.getAll(),
        ]);

        setSedes(sedesData);
        setCargos(cargosData);
        setPuestos(puestosData);
        setTiposInstituto(tiposData);
      } catch (error) {
        console.error("Error al cargar selects:", error);
      } finally {
        setLoadingSelects(false);
      }
    };

    cargarSelects();
  }, [open]);

  // Cargar datos del practicante
  useEffect(() => {
    setFormData(practicante);
  }, [practicante]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="text-blue-600" />
            <span className="text-blue-600">Editar practicante</span>
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del practicante
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* ====== NOMBRE COMPLETO (solo lectura) ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-nombre">Nombre completo</Label>
            <Input
              id="edit-nombre"
              value={formData.nombreCompleto}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* ====== DOCUMENTO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-documento">Documento</Label>
            <Input
              id="edit-documento"
              name="documento"
              value={formData.documento || ""}
              onChange={handleChange}
              required
            />
          </div>

          {/* ====== EMAIL ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              name="correoElectronico"
              value={formData.correoElectronico || ""}
              onChange={handleChange}
              type="email"
            />
          </div>

          {/* ====== TELÉFONO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-telefono">Teléfono</Label>
            <Input
              id="edit-telefono"
              name="telefono"
              value={formData.telefono || ""}
              onChange={handleChange}
            />
          </div>

          {/* ====== SEDE ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-sede">Sede</Label>
            <select
              id="edit-sede"
              name="sede"
              value={formData.sede || (formData as any).agencia || ""}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
              disabled={loadingSelects}
            >
              {sedes.map((sede) => (
                <option key={sede.idSede} value={sede.nombre}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ====== CARGO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-cargo">Cargo</Label>
            <select
              id="edit-cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
              disabled={loadingSelects}
            >
              {cargos.map((cargo) => (
                <option key={cargo.idCargo} value={cargo.nombre}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ====== FECHA INICIO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-fecha-inicio">Fecha de inicio</Label>
            <Input
              id="edit-fecha-inicio"
              name="fechaInicioPracticas"
              value={formData.fechaInicioPracticas || ""}
              onChange={handleChange}
              type="date"
              required
            />
          </div>

          {/* ====== FECHA FIN ====== */}
          <div className="grid gap-2">
            <Label htmlFor="edit-fecha-fin">Fecha de fin</Label>
            <Input
              id="edit-fecha-fin"
              name="fechaFinPracticas"
              value={formData.fechaFinPracticas || ""}
              onChange={handleChange}
              type="date"
            />
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