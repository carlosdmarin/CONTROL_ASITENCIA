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
import { Puesto } from "@/types/puestos";

interface PuestoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puesto: Puesto | null;
  onDelete: (id: number) => void;
}

export default function PuestoDeleteDialog({
  open,
  onOpenChange,
  puesto,
  onDelete,
}: PuestoDeleteDialogProps) {
  const handleDelete = () => {
    if (puesto) {
      onDelete(puesto.idPuesto);
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
            Esta acción eliminará el puesto{" "}
            <strong className="text-foreground font-semibold">
              {puesto?.nombrePuesto}
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