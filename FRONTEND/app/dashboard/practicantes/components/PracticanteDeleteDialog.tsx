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
            Esta acción eliminará al practicante{" "}
            <strong className="text-foreground font-semibold">
              {practicante.nombreCompleto}
            </strong>{" "}
            con documento{" "}
            <strong className="text-foreground font-semibold">
              {practicante.documento}
            </strong>
            . Este proceso es irreversible y eliminarás todos los datos
            asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t pt-4">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash className="h-4 w-4 mr-1" />
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}