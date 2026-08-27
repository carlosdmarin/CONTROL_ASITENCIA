"use client";

import { useState, useEffect } from "react";
import {
  IdCard,
  BriefcaseBusiness,
  BookUser,
  Building2,
  School,
  UserPlus,
  SaveCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  NuevoPracticante, 
  Agencia, 
  Cargo, 
  Puesto, 
  TipoInstituto 
} from "@/types/practicante";
import { agenciasApi } from "@/lib/api/agencias";
import { cargosApi } from "@/lib/api/cargos";
import { puestosApi } from "@/lib/api/puestos";
import { tiposInstitutoApi } from "@/lib/api/tipos-instituto";

interface PracticanteCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nuevoPracticante: NuevoPracticante) => void;
}

export function PracticanteCreateDialog({
  open,
  onOpenChange,
  onSave,
}: PracticanteCreateDialogProps) {
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [tiposInstituto, setTiposInstituto] = useState<TipoInstituto[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(true);

  const [formData, setFormData] = useState({
    codigoTrabajador: "",
    nombre: "",
    apellido: "",
    documento: "",
    idAgencia: 0,
    idCargo: 0,
    idPuesto: 0,
    idTipoInstituto: 0,
    correoElectronico: "",
    telefono: "",
    fechaInicioPracticas: new Date().toISOString().split("T")[0],
    fechaFinPracticas: "",
  });

  // Cargar selects
  useEffect(() => {
    if (!open) return;

    const cargarSelects = async () => {
      try {
        setLoadingSelects(true);
        const [agenciasData, cargosData, puestosData, tiposData] = await Promise.all([
          agenciasApi.getAll(),
          cargosApi.getAll(),
          puestosApi.getAll(),
          tiposInstitutoApi.getAll(),
        ]);

        setAgencias(agenciasData);
        setCargos(cargosData);
        setPuestos(puestosData);
        setTiposInstituto(tiposData);

        // Setear valores por defecto
        if (agenciasData.length > 0) {
          setFormData((prev) => ({ ...prev, idAgencia: agenciasData[0].idAgencia }));
        }
        if (cargosData.length > 0) {
          setFormData((prev) => ({ ...prev, idCargo: cargosData[0].idCargo }));
        }
        if (puestosData.length > 0) {
          setFormData((prev) => ({ ...prev, idPuesto: puestosData[0].idPuesto }));
        }
        if (tiposData.length > 0) {
          setFormData((prev) => ({ ...prev, idTipoInstituto: tiposData[0].idTipoInstituto }));
        }
      } catch (error) {
        console.error("Error al cargar selects:", error);
      } finally {
        setLoadingSelects(false);
      }
    };

    cargarSelects();
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.codigoTrabajador || !formData.nombre || !formData.apellido || !formData.documento) {
      return;
    }

    onSave({
      codigoTrabajador: formData.codigoTrabajador,
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      idAgencia: formData.idAgencia,
      idCargo: formData.idCargo,
      idPuesto: formData.idPuesto,
      idTipoInstituto: formData.idTipoInstituto,
      correoElectronico: formData.correoElectronico || undefined,
      telefono: formData.telefono || undefined,
      fechaInicioPracticas: formData.fechaInicioPracticas,
      fechaFinPracticas: formData.fechaFinPracticas || undefined,
    });

    // Resetear formulario
    setFormData({
      codigoTrabajador: "",
      nombre: "",
      apellido: "",
      documento: "",
      idAgencia: agencias.length > 0 ? agencias[0].idAgencia : 0,
      idCargo: cargos.length > 0 ? cargos[0].idCargo : 0,
      idPuesto: puestos.length > 0 ? puestos[0].idPuesto : 0,
      idTipoInstituto: tiposInstituto.length > 0 ? tiposInstituto[0].idTipoInstituto : 0,
      correoElectronico: "",
      telefono: "",
      fechaInicioPracticas: new Date().toISOString().split("T")[0],
      fechaFinPracticas: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[90vw] sm:w-175 lg:w-225 max-w-none p-6 overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-blue-700" />
            <SheetTitle className="text-2xl">Agregar practicante</SheetTitle>
          </div>
          <SheetDescription>
            Completa los datos del nuevo practicante.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* ====== CÓDIGO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="codigoTrabajador">Código de trabajador</Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="codigoTrabajador"
                name="codigoTrabajador"
                value={formData.codigoTrabajador}
                onChange={handleChange}
                placeholder="Ej: 25070"
                className="w-full pl-9"
                required
              />
            </div>
          </div>

          {/* ====== NOMBRE ====== */}
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <div className="relative">
              <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre del practicante"
                className="w-full pl-9"
                required
              />
            </div>
          </div>

          {/* ====== APELLIDO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="apellido">Apellido</Label>
            <div className="relative">
              <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellido del practicante"
                className="w-full pl-9"
                required
              />
            </div>
          </div>

          {/* ====== DOCUMENTO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="documento">Documento</Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="DNI del practicante"
                className="w-full pl-9"
                required
              />
            </div>
          </div>

          {/* ====== AGENCIA ====== */}
          <div className="grid gap-2">
            <Label htmlFor="idAgencia">Agencia</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="idAgencia"
                name="idAgencia"
                value={formData.idAgencia}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  agencias.map((agencia) => (
                    <option key={agencia.idAgencia} value={agencia.idAgencia}>
                      {agencia.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* ====== PUESTO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="idPuesto">Puesto</Label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="idPuesto"
                name="idPuesto"
                value={formData.idPuesto}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  puestos.map((puesto) => (
                    <option key={puesto.idPuesto} value={puesto.idPuesto}>
                      {puesto.nombrePuesto}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* ====== CARGO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="idCargo">Cargo</Label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="idCargo"
                name="idCargo"
                value={formData.idCargo}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  cargos.map((cargo) => (
                    <option key={cargo.idCargo} value={cargo.idCargo}>
                      {cargo.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* ====== TIPO INSTITUTO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="idTipoInstituto">Tipo de instituto</Label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="idTipoInstituto"
                name="idTipoInstituto"
                value={formData.idTipoInstituto}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-2 text-sm bg-white"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  tiposInstituto.map((tipo) => (
                    <option key={tipo.idTipoInstituto} value={tipo.idTipoInstituto}>
                      {tipo.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* ====== EMAIL ====== */}
          <div className="grid gap-2">
            <Label htmlFor="correoElectronico">Email</Label>
            <Input
              id="correoElectronico"
              name="correoElectronico"
              value={formData.correoElectronico}
              onChange={handleChange}
              placeholder="correo@empresa.com"
              type="email"
            />
          </div>

          {/* ====== TELÉFONO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="987654321"
            />
          </div>

          {/* ====== FECHA INICIO ====== */}
          <div className="grid gap-2">
            <Label htmlFor="fechaInicioPracticas">Fecha de inicio</Label>
            <Input
              id="fechaInicioPracticas"
              name="fechaInicioPracticas"
              value={formData.fechaInicioPracticas}
              onChange={handleChange}
              type="date"
              required
            />
          </div>

          {/* ====== FECHA FIN ====== */}
          <div className="grid gap-2">
            <Label htmlFor="fechaFinPracticas">Fecha de fin (opcional)</Label>
            <Input
              id="fechaFinPracticas"
              name="fechaFinPracticas"
              value={formData.fechaFinPracticas}
              onChange={handleChange}
              type="date"
            />
          </div>

          <SheetFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <SaveCheck className="h-4 w-4 mr-1" />
              Guardar practicante
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}