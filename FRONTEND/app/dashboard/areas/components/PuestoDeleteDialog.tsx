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
import { Trash, OctagonAlert, Power, CheckCircle } from "lucide-react";
import { Area } from "@/types/area";
import { Puesto } from "@/types/puestos";

interface PuestoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puesto: Area | Puesto | null;
  onDelete: (id: number) => void;
}

function getIdCompat(p: Area | Puesto): number {
  return (p as Area).idArea ?? (p as Puesto).idPuesto ?? 0;
}
function getNombreCompat(p: Area | Puesto): string {
  return (p as Area).nombreArea ?? (p as Puesto).nombrePuesto ?? "";
}
function getActivoCompat(p: Area | Puesto): boolean {
  return (p as Area).activo ?? (p as Puesto).activo ?? true;
}

export default function PuestoDeleteDialog({
  open,
  onOpenChange,
  puesto,
  onDelete,
}: PuestoDeleteDialogProps) {
  const handleDelete = () => {
    if (puesto) {
      onDelete(getIdCompat(puesto));
    }
  };

  const isActivo = puesto ? getActivoCompat(puesto) : true;
  const accion = isActivo ? "desactivar" : "activar";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle>
            <div className={`mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full sm:mx-0 ${isActivo ? "bg-amber-100" : "bg-green-100"}`}>
              {isActivo ? <Power className="h-5 w-5 text-amber-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
            {isActivo ? "¿Desactivar área?" : "¿Activar área?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {isActivo ? (
              <>
                Esta acción <strong className="text-foreground font-semibold">desactivará</strong> el área{" "}
                <strong className="text-foreground font-semibold">
                  {puesto ? getNombreCompat(puesto) : ""}
                </strong>
                . Los practicantes de un área inactiva no podrán registrar asistencia. Si tiene practicantes activos, la operación será rechazada.
              </>
            ) : (
              <>
                Esta acción <strong className="text-foreground font-semibold">activará</strong> el área{" "}
                <strong className="text-foreground font-semibold">
                  {puesto ? getNombreCompat(puesto) : ""}
                </strong>
                . Volverá a estar disponible para asignar practicantes y registrar asistencia.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t pt-4">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          {isActivo ? (
            <AlertDialogAction variant="destructive" onClick={handleDelete} className="bg-orange-600 text-white hover:bg-amber-700">
              <Power className="h-4 w-4 mr-1" />
              Sí, desactivar
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={handleDelete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Sí, activar
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}