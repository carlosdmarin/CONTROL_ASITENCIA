"use client";

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
import { KeyRound, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CambiarContrasenaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vigilante: { usuario: string; nombreCompleto: string } | null;
}

export default function CambiarContrasenaDialog({
  open,
  onOpenChange,
  vigilante,
}: CambiarContrasenaDialogProps) {
  if (!vigilante && open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 shrink-0 border-b border-slate-100 pr-10 sm:pr-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 rounded-xl shrink-0">
              <KeyRound className="h-5 w-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg leading-tight">Cambiar contraseña</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                Actualiza la contraseña de acceso del vigilante.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">Usuario</p>
                <p className="text-sm font-mono font-medium text-slate-900 truncate">
                  {vigilante?.usuario || "—"}
                </p>
                <p className="text-xs text-slate-500 truncate">{vigilante?.nombreCompleto}</p>
              </div>
              <Badge variant="outline" className="shrink-0 bg-white text-xs">
                Vigilante
              </Badge>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="new-password" className="text-xs font-medium">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-10 text-sm bg-white"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-medium">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-10 text-sm bg-white"
                  autoComplete="new-password"
                />
              </div>
              <p className="text-[11px] text-slate-500">Debe coincidir con la nueva contraseña.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-3 sm:pt-4 shrink-0 border-t bg-slate-50/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-10"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-10 bg-slate-900 hover:bg-slate-800 text-white gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Cambiar contraseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
