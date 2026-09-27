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
import { KeyRound, Lock, Eye, EyeOff, Check, X, ShieldCheck, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { vigilantesApi } from "@/lib/api/vigilantes";

interface CambiarContrasenaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vigilante: { id: number; usuario: string; nombreCompleto: string } | null;
}

/** Reglas de contraseña — mismas que en VigilanteDialog para consistencia */
const PASSWORD_RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
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
    [nuevaContrasena]
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:w-full max-w-xl! max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border-slate-200 shadow-xl">
        {/* ───────────────────────── HEADER ───────────────────────── */}
        <DialogHeader className="relative p-0 shrink-0">
          {/* franja superior con gradiente OLAMSA (ámbar → azul) */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-700" />
          <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start gap-3.5 pr-12">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-amber-600" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-blue-700 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-slate-900 leading-tight">
                Cambiar contraseña
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                Actualiza la contraseña de acceso del vigilante.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ───────────────────────── BODY ───────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="space-y-5">
            {/* Card del vigilante — mejorada */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3.5 flex items-center gap-3 shadow-sm">
              <div className="h-11 w-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <span className="text-[13px] font-semibold text-blue-700 tracking-tight">
                  {getInitials(vigilante?.nombreCompleto || "")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                  {vigilante?.nombreCompleto || "—"}
                </p>
                <p className="text-[11.5px] font-mono text-slate-500 truncate mt-0.5">
                  @{vigilante?.usuario || "—"}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 bg-blue-50 text-blue-700 border-blue-200 text-[10.5px] font-medium gap-1"
              >
                <ShieldCheck className="h-3 w-3" />
                Vigilante
              </Badge>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5">
              <UserCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11.5px] text-amber-900 leading-snug">
                El vigilante deberá usar la nueva contraseña en su próximo inicio de sesión.
              </p>
            </div>

            {/* ── Sección: Nueva contraseña ── */}
            <div className="space-y-2.5">
              <Label
                htmlFor="new-password"
                className="text-[12px] font-medium text-slate-700"
              >
                Nueva contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="new-password"
                  type={showNueva ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-10 h-10 text-sm bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:border-blue-600"
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
                  aria-label={showNueva ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Medidor de fuerza + reglas */}
              {nuevaContrasena.length > 0 && (
                <div className="space-y-2 pt-0.5">
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
                      const ok = r.test(nuevaContrasena);
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
            </div>

            {/* ── Sección: Confirmar contraseña ── */}
            <div className="space-y-2.5">
              <Label
                htmlFor="confirm-password"
                className="text-[12px] font-medium text-slate-700"
              >
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="confirm-password"
                  type={showConfirmar ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-9 pr-10 h-10 text-sm bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:border-blue-600 ${
                    noCoinciden
                      ? "border-red-300 focus-visible:ring-red-400/30 focus-visible:border-red-400"
                      : coinciden
                      ? "border-emerald-300 focus-visible:ring-emerald-400/30 focus-visible:border-emerald-400"
                      : ""
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
                  aria-label={showConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Feedback de coincidencia */}
              {coinciden && (
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Las contraseñas coinciden
                </p>
              )}
              {noCoinciden && (
                <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium">
                  <X className="h-3 w-3" strokeWidth={3} />
                  Las contraseñas no coinciden
                </p>
              )}
              {!coinciden && !noCoinciden && (
                <p className="text-[11px] text-slate-500">
                  Debe coincidir con la nueva contraseña.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ───────────────────────── FOOTER ───────────────────────── */}
        <DialogFooter className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto mb-4 h-10 border-slate-200 hover:bg-white"
            disabled={isChanging}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCambiar}
            disabled={isChanging}
            className="w-full sm:w-auto h-10 bg-blue-700 hover:bg-blue-800 shadow-sm gap-2"
          >
            {isChanging ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Cambiar contraseña
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}