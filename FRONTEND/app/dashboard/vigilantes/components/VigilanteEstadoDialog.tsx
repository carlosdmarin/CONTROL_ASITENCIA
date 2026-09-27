"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PowerOff, RotateCcw, OctagonAlert, Loader2 } from "lucide-react";
import { VigilanteMock } from "./VigilantesTable";

interface VigilanteEstadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vigilante: VigilanteMock | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function VigilanteEstadoDialog({
  open,
  onOpenChange,
  vigilante,
  onConfirm,
  isLoading = false,
}: VigilanteEstadoDialogProps) {
  if (!vigilante) return null;

  const activo = vigilante.estado === "ACTIVO";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-24px)] max-w-md">
        <AlertDialogHeader className="pb-2">
          <AlertDialogTitle className="flex flex-col gap-3 text-left">
            <div
              className={`mx-auto sm:mx-0 flex h-9 w-9 items-center justify-center rounded-full ${
                activo ? "bg-orange-100" : "bg-emerald-100"
              }`}
            >
              <OctagonAlert
                className={`h-5 w-5 ${activo ? "text-orange-600" : "text-emerald-600"}`}
              />
            </div>
            <span className="break-words">
              {activo ? `¿Desactivar a ${vigilante.nombreCompleto}?` : `¿Activar a ${vigilante.nombreCompleto}?`}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-snug break-words text-left">
            {activo ? (
              <>
                El vigilante pasará a <strong className="text-foreground">INACTIVO</strong> y no podrá iniciar sesión mientras su cuenta esté inactiva.
                <br />
                <span className="text-xs text-muted-foreground">Usuario: {vigilante.usuario}</span>
              </>
            ) : (
              <>
                El vigilante volverá a <strong className="text-foreground">ACTIVO</strong> y podrá iniciar sesión nuevamente.
                <br />
                <span className="text-xs text-muted-foreground">Usuario: {vigilante.usuario}</span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto h-10"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`w-full sm:w-auto h-10 gap-2 ${
              activo ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : activo ? (
              <>
                <PowerOff className="h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Activar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
