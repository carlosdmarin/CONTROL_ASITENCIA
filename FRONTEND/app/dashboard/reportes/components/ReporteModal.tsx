"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotepadText, Download, CalendarDays } from "lucide-react";
import { Practicante } from "@/types/practicante";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface ReporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
  onGenerar?: (practicante: Practicante) => void;
}

const getInitials = (nombre: string) => {
  if (!nombre) return "?";
  const p = nombre.split(" ");
  return p.length >= 2 ? p[0][0] + p[1][0] : nombre[0];
};

export function ReporteModal({
  open,
  onOpenChange,
  practicante,
  onGenerar,
}: ReporteModalProps) {
  if (!practicante) return null;

  const handleGenerar = () => {
    onGenerar?.(practicante);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! w-full! max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <NotepadText className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Generar reporte
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configura el reporte para este practicante
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Info del practicante */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          <Avatar className="h-10 w-10 border border-slate-200">
            <AvatarFallback className="text-xs font-medium bg-white text-slate-700">
              {getInitials(practicante.nombreCompleto)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate">
              {practicante.nombreCompleto}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {practicante.documento} ·{" "}
              {practicante.nombreArea || practicante.area || "Sin área"}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {practicante.cargo}
          </Badge>
        </div>

        {/* Aquí va el contenido del reporte (placeholder) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>Opciones de reporte </span>
          </div>
          <div className="rounded-xl border flex items-center gap-10 justify-center border-slate-200 p-6 text-center text-xs text-slate-400">
            <Card>
              <CardHeader>
                <CardTitle>Reporte Diario</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Generar Reporte diaro</p>
              </CardContent>
            </Card>
            <div>reporte 2</div>
            <div>reporte 3</div>
          </div>
        </div>

        <DialogFooter className="gap-2 h-10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerar}
            className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Generar reporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
