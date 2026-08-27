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
import { Turno } from "../types";

interface TurnoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: Turno | null;
  onDelete: (id: number) => void;
}

export default function TurnoDeleteDialog({ open, onOpenChange, turno, onDelete }: TurnoDeleteDialogProps) {
  const handleDelete = () => {
    if (turno) {
      onDelete(turno.id);
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
            Esta acción eliminará el turno{" "}
            <strong className="text-foreground font-semibold">
              {turno?.nombre || "seleccionado"}
            </strong>
            . Este proceso es irreversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t pt-4">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}