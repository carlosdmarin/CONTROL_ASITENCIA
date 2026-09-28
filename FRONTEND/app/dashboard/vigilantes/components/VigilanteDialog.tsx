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
  Sparkles,
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
  {
    id: "len",
    label: "Mínimo 8 caracteres",
    test: (v: string) => v.length >= 8,
  },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /\d/.test(v) },
];

export default function VigilanteDialog({
  open,
  onOpenChange,
  onSuccess,
}: VigilanteDialogProps) {
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
    [contrasena],
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
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <DialogHeader className="relative bg-white border-b border-slate-200 px-6 sm:px-7 py-5 pr-14 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  Nuevo vigilante
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Control de acceso
                </span>
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                Creá un usuario de control para el escaneo de asistencia
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ═══════════ BODY ═══════════ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 sm:p-6 space-y-5">
            {/* ─── CARD: Datos personales ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <IdCard className="h-3.5 w-3.5 text-blue-700" strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-tight">
                    Datos personales
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Identificación del vigilante
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Nombre" htmlFor="vig-nombre" required>
                    <InputWithIcon
                      id="vig-nombre"
                      icon={User}
                      placeholder="Ej: Juan"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={isCreating}
                    />
                  </Field>
                  <Field label="Apellido" htmlFor="vig-apellido" required>
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
              </div>
            </div>

            {/* ─── CARD: Credenciales de acceso ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <KeyRound
                    className="h-3.5 w-3.5 text-amber-700"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-tight">
                    Credenciales de acceso
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Con estas credenciales iniciará sesión
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3.5">
                <Field
                  label="Usuario"
                  htmlFor="vig-usuario"
                  required
                  hint="Debe ser único en el sistema"
                >
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

                <Field label="Contraseña" htmlFor="vig-password" required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="vig-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-10 text-[13px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all"
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
                      aria-label={
                        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
                                  ? "bg-rose-400"
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
                              className={`flex items-center gap-1.5 text-[10.5px] ${
                                ok
                                  ? "text-emerald-600 font-medium"
                                  : "text-slate-400"
                              }`}
                            >
                              {ok ? (
                                <Check
                                  className="h-3 w-3 shrink-0"
                                  strokeWidth={3}
                                />
                              ) : (
                                <X
                                  className="h-3 w-3 shrink-0"
                                  strokeWidth={3}
                                />
                              )}
                              {r.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </Field>
              </div>
            </div>

            {/* ─── CARD: Asignación ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <MapPin
                    className="h-3.5 w-3.5 text-violet-700"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-tight">
                    Asignación
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Sede donde operará el vigilante
                  </p>
                </div>
              </div>
              <div className="p-4">
                <Field label="Sede" htmlFor="vig-sede" required>
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
                        className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl w-full text-[13px] font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <SelectValue
                          placeholder={
                            loadingSedes
                              ? "Cargando sedes..."
                              : "Seleccioná una sede"
                          }
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
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <div className="p-4 sm:px-6 sm:py-5 shrink-0 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
            className="w-full sm:w-auto h-10 border-slate-200 hover:bg-slate-50 text-[13px] rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCrear}
            disabled={isCreating}
            className="w-full sm:w-auto h-10 gap-1.5 bg-blue-700 hover:bg-blue-800 shadow-sm text-[13px] font-semibold rounded-xl"
          >
            {isCreating ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
                Crear vigilante
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════ HELPERS ═══════════ */

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <Label
          htmlFor={htmlFor}
          className="text-[12px] font-medium text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {hint && (
          <span className="text-[10.5px] text-slate-400">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
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
        className={`pl-9 h-10 text-[13px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white transition-all ${className}`}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}