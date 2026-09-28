"use client";

import { useState, useMemo } from "react";
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
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
  UserCircle2,
  Sparkles,
  IdCard,
} from "lucide-react";
import { vigilantesApi } from "@/lib/api/vigilantes";

interface CambiarContrasenaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vigilante: { id: number; usuario: string; nombreCompleto: string } | null;
}

/** Reglas de contraseña — mismas que en VigilanteDialog para consistencia */
const PASSWORD_RULES = [
  {
    id: "len",
    label: "Mínimo 8 caracteres",
    test: (v: string) => v.length >= 8,
  },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /\d/.test(v) },
];

/** Iniciales para el avatar */
function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-400 via-amber-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-cyan-400 via-sky-500 to-blue-600",
];

function getAvatarGradient(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default function CambiarContrasenaDialog({
  open,
  onOpenChange,
  vigilante,
}: CambiarContrasenaDialogProps) {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  if (!vigilante && open) return null;

  const resetForm = () => {
    setNuevaContrasena("");
    setConfirmarContrasena("");
    setShowNueva(false);
    setShowConfirmar(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (isChanging) return;
      resetForm();
    }
    onOpenChange(next);
  };

  const passwordScore = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(nuevaContrasena)).length,
    [nuevaContrasena],
  );

  const coinciden =
    nuevaContrasena.length > 0 &&
    confirmarContrasena.length > 0 &&
    nuevaContrasena === confirmarContrasena;

  const noCoinciden =
    confirmarContrasena.length > 0 && nuevaContrasena !== confirmarContrasena;

  const handleCambiar = async () => {
    if (!vigilante) return;
    const nueva = nuevaContrasena;
    const confirmar = confirmarContrasena;
    if (!nueva || !nueva.trim()) {
      toast.error("Completa ambos campos de contraseña.");
      return;
    }
    if (!confirmar || !confirmar.trim()) {
      toast.error("Completa ambos campos de contraseña.");
      return;
    }
    if (nueva !== confirmar) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    try {
      setIsChanging(true);
      await vigilantesApi.cambiarContrasena(vigilante.id, {
        nuevaContrasena: nueva,
        confirmarContrasena: confirmar,
      });
      toast.success("Contraseña actualizada correctamente");
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la contraseña. Intenta nuevamente.";
      if (msg.toLowerCase().includes("no encontrado") || msg.includes("404")) {
        toast.error("El vigilante ya no existe o no está disponible.");
      } else if (msg.toLowerCase().includes("coinciden")) {
        toast.error("Las contraseñas no coinciden.");
      } else if (
        msg.toLowerCase().includes("permisos") ||
        msg.includes("403") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.toLowerCase().includes("acceso denegado")
      ) {
        toast.error("No tienes permisos para realizar esta acción.");
      } else if (
        msg.toLowerCase().includes("obligatoria") ||
        msg.toLowerCase().includes("obligatorio")
      ) {
        toast.error("Completa ambos campos de contraseña.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsChanging(false);
    }
  };

  const gradient = vigilante
    ? getAvatarGradient(vigilante.id, vigilante.nombreCompleto)
    : AVATAR_GRADIENTS[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
        <DialogHeader className="relative bg-white border-b border-slate-200 px-6 sm:px-7 py-5 pr-14 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-900/20">
                <KeyRound className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  Cambiar contraseña
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Seguridad
                </span>
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                Actualizá la contraseña de acceso del vigilante
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ═══════════ BODY ═══════════ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 sm:p-6 space-y-5">
            {/* ─── CARD: Vigilante ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[13px] font-bold shadow-sm shrink-0`}
                  >
                    {getInitials(vigilante?.nombreCompleto || "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-slate-900 truncate leading-tight">
                      {vigilante?.nombreCompleto || "—"}
                    </p>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 mt-1">
                      <IdCard
                        className="h-3 w-3 text-slate-400"
                        strokeWidth={2.4}
                      />
                      @{vigilante?.usuario || "—"}
                    </span>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                    <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
                    Vigilante
                  </span>
                </div>
              </div>
            </div>

            {/* ─── BANNER INFORMATIVO ─── */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5">
              <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                <UserCircle2
                  className="h-4 w-4 text-amber-600"
                  strokeWidth={2.4}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-amber-900">
                  Importante
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                  El vigilante deberá usar la nueva contraseña en su próximo
                  inicio de sesión
                </p>
              </div>
            </div>

            {/* ─── CARD: Nueva contraseña ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Lock
                    className="h-3.5 w-3.5 text-amber-700"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-tight">
                    Nueva contraseña
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Debe cumplir los 3 requisitos de seguridad
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="new-password"
                    className="text-[12px] font-medium text-slate-700 flex items-center gap-1"
                  >
                    Contraseña
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="new-password"
                      type={showNueva ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-10 text-[13px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 focus-visible:bg-white transition-all"
                      autoComplete="new-password"
                      value={nuevaContrasena}
                      onChange={(e) => setNuevaContrasena(e.target.value)}
                      disabled={isChanging}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNueva((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      tabIndex={-1}
                      aria-label={
                        showNueva ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {showNueva ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Medidor de fuerza + reglas */}
                {nuevaContrasena.length > 0 && (
                  <div className="space-y-2 pt-1">
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
                        const ok = r.test(nuevaContrasena);
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
              </div>
            </div>

            {/* ─── CARD: Confirmar contraseña ─── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-blue-700"
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-tight">
                    Confirmar contraseña
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Repetí la nueva contraseña
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-[12px] font-medium text-slate-700 flex items-center gap-1"
                  >
                    Confirmación
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="confirm-password"
                      type={showConfirmar ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-9 pr-10 h-10 text-[13px] rounded-xl transition-all ${
                        noCoinciden
                          ? "bg-rose-50/40 border-rose-300 focus-visible:ring-rose-400/30 focus-visible:border-rose-400"
                          : coinciden
                            ? "bg-emerald-50/40 border-emerald-300 focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400"
                            : "bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:bg-white"
                      }`}
                      autoComplete="new-password"
                      value={confirmarContrasena}
                      onChange={(e) => setConfirmarContrasena(e.target.value)}
                      disabled={isChanging}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      tabIndex={-1}
                      aria-label={
                        showConfirmar
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showConfirmar ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Feedback de coincidencia */}
                {coinciden && (
                  <p className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Las contraseñas coinciden
                  </p>
                )}
                {noCoinciden && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium">
                    <X className="h-3 w-3" strokeWidth={3} />
                    Las contraseñas no coinciden
                  </p>
                )}
                {!coinciden && !noCoinciden && (
                  <p className="text-[11px] text-slate-500">
                    Debe coincidir con la nueva contraseña
                  </p>
                )}
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
            disabled={isChanging}
            className="w-full sm:w-auto h-10 border-slate-200 hover:bg-slate-50 text-[13px] rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCambiar}
            disabled={isChanging}
            className="w-full sm:w-auto h-10 gap-1.5 bg-blue-700 hover:bg-blue-800 shadow-sm text-[13px] font-semibold rounded-xl"
          >
            {isChanging ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" strokeWidth={2.4} />
                Cambiar contraseña
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}