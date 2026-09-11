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
import { Trash, OctagonAlert } from "lucide-react";
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle>
            <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 sm:mx-0">
              <OctagonAlert className="h-5 w-5 text-destructive" />
            </div>
            ¿Estás completamente seguro?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            Esta acción eliminará el área{" "}
            <strong className="text-foreground font-semibold">
              {puesto ? getNombreCompat(puesto) : ""}
            </strong>
            . Este proceso es irreversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t pt-4">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4 mr-1" />
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}