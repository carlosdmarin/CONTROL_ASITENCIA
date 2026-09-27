"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  ShieldCheck,
  User,
  Lock,
  Building2,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  MapPin,
  Check,
  X,
} from "lucide-react";
import { vigilantesApi } from "@/lib/api/vigilantes";
import { sedeApi } from "@/lib/api/sedes";
import { Sede } from "@/types/practicante";

interface VigilanteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/** Reglas de contraseña — feedback visual al usuario */
const PASSWORD_RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /\d/.test(v) },
];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setUsuario("");
    setContrasena("");
    setShowPassword(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetForm();
      setIsCreating(false);
    }
    onOpenChange(next);
  };

  /** Fuerza de la contraseña: 0–3 */
  const passwordScore = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(contrasena)).length,
    [contrasena]
  );

  const handleCrear = async () => {
    const n = nombre.trim();
    const a = apellido.trim();
    const u = usuario.trim();
    const c = contrasena;
    if (!n) return toast.error("El nombre es obligatorio");
    if (!a) return toast.error("El apellido es obligatorio");
    if (!u) return toast.error("El usuario es obligatorio");
    if (!c || !c.trim()) return toast.error("La contraseña es obligatoria");
    if (sedeId == null) return toast.error("La sede es obligatoria");

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
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo crear el vigilante. Intenta nuevamente.";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:w-full max-w-xl! max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border-slate-200 shadow-xl">
        {/* ───────────────────────── HEADER ───────────────────────── */}
        <DialogHeader className="relative p-0 shrink-0">
          {/* franja superior con gradiente de marca */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-800 via-blue-600 to-orange-500" />
          <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <ShieldCheck className="h-5.5 w-5.5 text-blue-700" strokeWidth={2.2} />
              </div>
              {/* punto de estado */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-slate-900 leading-tight">
                Nuevo vigilante
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                Crea un usuario de control para el escaneo de asistencia.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ───────────────────────── BODY ───────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="space-y-6">
            {/* ── Sección 1: Datos personales ── */}
            <section className="space-y-3.5">
              <SectionTitle icon={IdCard} title="Datos personales" hint="Identificación del vigilante" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Nombre" htmlFor="vig-nombre">
                  <InputWithIcon
                    id="vig-nombre"
                    icon={User}
                    placeholder="Ej: Juan"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={isCreating}
                  />
                </Field>
                <Field label="Apellido" htmlFor="vig-apellido">
                  <InputWithIcon
                    id="vig-apellido"
                    icon={User}
                    placeholder="Ej: Pérez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    disabled={isCreating}
                  />
                </Field>
              </div>
            </section>

            <Divider />

            {/* ── Sección 2: Credenciales de acceso ── */}
            <section className="space-y-3.5">
              <SectionTitle
                icon={KeyRound}
                title="Credenciales de acceso"
                hint="Con estas credenciales iniciará sesión"
              />
              <Field label="Usuario" htmlFor="vig-usuario" hint="Debe ser único en el sistema">
                <InputWithIcon
                  id="vig-usuario"
                  icon={User}
                  placeholder="Ej: jperez"
                  className="font-mono"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={isCreating}
                />
              </Field>

              <Field label="Contraseña" htmlFor="vig-password">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="vig-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-10 text-sm bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:border-blue-600"
                    autoComplete="new-password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    disabled={isCreating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Medidor de fuerza + reglas */}
                {contrasena.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordScore
                              ? passwordScore === 1
                                ? "bg-red-400"
                                : passwordScore === 2
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {PASSWORD_RULES.map((r) => {
                        const ok = r.test(contrasena);
                        return (
                          <li
                            key={r.id}
                            className={`flex items-center gap-1.5 text-[11px] ${
                              ok ? "text-emerald-600" : "text-slate-400"
                            }`}
                          >
                            {ok ? (
                              <Check className="h-3 w-3 shrink-0" strokeWidth={3} />
                            ) : (
                              <X className="h-3 w-3 shrink-0" strokeWidth={3} />
                            )}
                            {r.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Field>
            </section>

            <Divider />

            {/* ── Sección 3: Asignación ── */}
            <section className="space-y-3.5">
              <SectionTitle
                icon={MapPin}
                title="Asignación"
                hint="Sede donde operará el vigilante"
              />
              <Field label="Sede" htmlFor="vig-sede">
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
                    <SelectTrigger
                      id="vig-sede"
                      className="pl-9 h-10 bg-white border-slate-200 rounded-lg w-full focus:ring-2 focus:ring-blue-600/30"
                    >
                      <SelectValue
                        placeholder={loadingSedes ? "Cargando sedes..." : "Selecciona sede"}
                      />
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
              </Field>
            </section>
          </div>
        </div>

        {/* ───────────────────────── FOOTER ───────────────────────── */}
        <DialogFooter className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto mb-4 h-10 border-slate-200 hover:bg-white"
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCrear}
            disabled={isCreating}
            className="w-full sm:w-auto h-10 bg-blue-700 hover:bg-blue-800 shadow-sm gap-2"
          >
            {isCreating ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Crear vigilante
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── Helpers visuales ───────────────────────── */

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-blue-700" strokeWidth={2.5} />
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
        {title}
      </h3>
      {hint && <span className="text-[11px] text-slate-400 font-normal">· {hint}</span>}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={htmlFor} className="text-[12px] font-medium text-slate-700">
          {label}
        </Label>
        {hint && <span className="text-[10.5px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />;
}

function InputWithIcon({
  id,
  icon: Icon,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <Input
        id={id}
        className={`pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:border-blue-600 ${className}`}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}