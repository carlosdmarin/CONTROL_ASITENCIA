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
import { PowerOff, RotateCcw, OctagonAlert } from "lucide-react";
import { Practicante } from "@/types/practicante";

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
  const handleDelete = () => {
    if (practicante) {
      onDelete(practicante.idPracticante);
    }
  };

  if (!practicante) return null;

  const isActivo = practicante.situacion === "ACTIVO";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle>
            <div className={`mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full sm:mx-0 ${isActivo ? "bg-orange-100" : "bg-green-100"}`}>
              <OctagonAlert className={`h-5 w-5 ${isActivo ? "text-orange-600" : "text-green-600"}`} />
            </div>
            {isActivo
              ? `¿Desactivar a ${practicante.nombreCompleto}?`
              : `¿Activar a ${practicante.nombreCompleto}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
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
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className={isActivo ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isActivo ? (
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