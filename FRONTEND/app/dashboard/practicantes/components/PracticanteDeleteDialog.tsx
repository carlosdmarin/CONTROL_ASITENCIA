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
import { Practicante } from "@/types/practicante";
import { useState } from "react";

interface PracticanteDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
  onDelete: (id: number) => void;
}

export function PracticanteDeleteDialog({
  open,
  onOpenChange,
  practicante,
  onDelete,
}: PracticanteDeleteDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = () => {
    if (practicante && !isPending) {
      setIsPending(true);
      try {
        onDelete(practicante.idPracticante);
      } finally {
        // El padre cierra el dialog y recarga; reseteamos al cerrar
        setTimeout(() => setIsPending(false), 1200);
      }
    }
  };

  if (!practicante) return null;

  const isActivo = practicante.situacion === "ACTIVO";

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if(!o) setIsPending(false); onOpenChange(o); }}>
      <AlertDialogContent className="w-[calc(100vw-24px)] max-w-md">
        <AlertDialogHeader className="pb-4 min-w-0">
          <AlertDialogTitle className="min-w-0 break-words text-left w-full">
            <div className={`mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full sm:mx-0 ${isActivo ? "bg-orange-100" : "bg-green-100"}`}>
              <OctagonAlert className={`h-5 w-5 ${isActivo ? "text-orange-600" : "text-green-600"}`} />
            </div>
            <span className="break-words">
            {isActivo
              ? `¿Desactivar a ${practicante.nombreCompleto}?`
              : `¿Activar a ${practicante.nombreCompleto}?`}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] break-words">
            {isActivo ? (
              <>
                El practicante pasará a estado{" "}
                <strong className="text-foreground font-semibold">INACTIVO</strong> y dejará de aparecer en los registros activos. Sus asistencias e historial se conservarán.
                <br />
                <span className="text-xs text-muted-foreground">Documento: {practicante.documento}</span>
              </>
            ) : (
              <>
                El practicante volverá a estado{" "}
                <strong className="text-foreground font-semibold">ACTIVO</strong> y aparecerá nuevamente en los registros activos.
                <br />
                <span className="text-xs text-muted-foreground">Documento: {practicante.documento}</span>
                {practicante.fechaDesactivacion && (
                  <span className="text-xs text-muted-foreground block mt-1">Desactivado el: {new Date(practicante.fechaDesactivacion).toLocaleString("es-PE")}</span>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t pt-4">
          <AlertDialogCancel onClick={() => onOpenChange(false)} className="h-10" disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className={`h-10 ${isActivo ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Procesando...
              </>
            ) : isActivo ? (
              <>
                <PowerOff className="h-4 w-4 mr-1" />
                Sí, desactivar
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-1" />
                Sí, activar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}