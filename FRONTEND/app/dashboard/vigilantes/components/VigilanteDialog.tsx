"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, User, Lock, Building2, Eye, EyeOff } from "lucide-react";
import { vigilantesApi } from "@/lib/api/vigilantes";
import { sedeApi } from "@/lib/api/sedes";
import { Sede } from "@/types/practicante";

interface VigilanteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function VigilanteDialog({ open, onOpenChange, onSuccess }: VigilanteDialogProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sedeId, setSedeId] = useState<number | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    const cargarSedes = async () => {
      try {
        setLoadingSedes(true);
        const data = await sedeApi.getAll();
        const activas = (data as Sede[]).filter((s) => s.activo);
        const lista = activas.length > 0 ? activas : (data as Sede[]);
        setSedes(lista);
        if (lista.length > 0 && sedeId == null) {
          setSedeId(lista[0].idSede);
        }
      } catch {
        toast.error("No se pudieron cargar las sedes");
      } finally {
        setLoadingSedes(false);
      }
    };
    cargarSedes();
  }, [open]);

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setUsuario("");
    setContrasena("");
    setShowPassword(false);
    // sedeId se mantiene en la primera sede para UX, no se resetea a null
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetForm();
      setIsCreating(false);
    }
    onOpenChange(next);
  };

  const handleCrear = async () => {
    const n = nombre.trim();
    const a = apellido.trim();
    const u = usuario.trim();
    const c = contrasena;
    if (!n) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!a) {
      toast.error("El apellido es obligatorio");
      return;
    }
    if (!u) {
      toast.error("El usuario es obligatorio");
      return;
    }
    if (!c || !c.trim()) {
      toast.error("La contraseña es obligatoria");
      return;
    }
    if (sedeId == null) {
      toast.error("La sede es obligatoria");
      return;
    }
    try {
      setIsCreating(true);
      await vigilantesApi.create({
        nombre: n,
        apellido: a,
        usuario: u,
        contrasena: c,
        sedeId,
      });
      toast.success("Vigilante creado correctamente");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo crear el vigilante. Intenta nuevamente.";
      // Mensajes específicos ya vienen de BusinessException (409, 400)
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 shrink-0 border-b border-slate-100 pr-10 sm:pr-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-xl shrink-0">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg leading-tight">Nuevo vigilante</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                Completa los datos para crear un usuario de control.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="vig-nombre" className="text-xs font-medium">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="vig-nombre"
                    placeholder="Ej: Juan"
                    className="pl-9 h-10 text-sm bg-white"
                    autoComplete="off"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="vig-apellido" className="text-xs font-medium">
                  Apellido
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="vig-apellido"
                    placeholder="Ej: Pérez"
                    className="pl-9 h-10 text-sm bg-white"
                    autoComplete="off"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="vig-usuario" className="text-xs font-medium">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="vig-usuario"
                  placeholder="Ej: jperez"
                  className="pl-9 h-10 text-sm bg-white font-mono"
                  autoComplete="off"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <p className="text-[11px] text-slate-500">El usuario debe ser único en el sistema.</p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="vig-password" className="text-xs font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="vig-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 h-10 text-sm bg-white"
                  autoComplete="new-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={isCreating}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="vig-sede" className="text-xs font-medium">
                Sede
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select
                  value={sedeId != null ? String(sedeId) : ""}
                  onValueChange={(v) => {
                    const id = Number(v);
                    if (!Number.isNaN(id)) setSedeId(id);
                  }}
                  disabled={loadingSedes || isCreating}
                >
                  <SelectTrigger className="pl-9 h-10 bg-white border-slate-200 rounded-lg w-full">
                    <SelectValue placeholder={loadingSedes ? "Cargando sedes..." : "Selecciona sede"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sedes.map((s) => (
                      <SelectItem key={s.idSede} value={String(s.idSede)}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-3 sm:pt-4 shrink-0 border-t bg-slate-50/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto h-10"
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCrear}
            disabled={isCreating}
            className="w-full sm:w-auto h-10 bg-blue-700 hover:bg-blue-800 gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            {isCreating ? "Creando..." : "Crear vigilante"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
