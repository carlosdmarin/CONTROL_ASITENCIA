"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  School,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  X,
  MapPin,
  FileText,
  Info,
  Hash,
  CalendarDays,
  Clock8,
  Layers,
  BadgeCheck,
  Circle,
  AlertCircle,
} from "lucide-react";
import { Practicante } from "@/types/practicante";
import { practicantesApi } from "@/lib/api/practicantes";

interface PracticanteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
}

interface HorarioDetalle {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

// Función para obtener iniciales
const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

// Mapeo de días
const DIAS_MAP: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

// Colores para badges de días
const DIA_COLORS: Record<string, string> = {
  LUNES: "border-blue-200 bg-blue-50 text-blue-700",
  MARTES: "border-indigo-200 bg-indigo-50 text-indigo-700",
  MIERCOLES: "border-purple-200 bg-purple-50 text-purple-700",
  JUEVES: "border-cyan-200 bg-cyan-50 text-cyan-700",
  VIERNES: "border-green-200 bg-green-50 text-green-700",
  SABADO: "border-amber-200 bg-amber-50 text-amber-700",
  DOMINGO: "border-rose-200 bg-rose-50 text-rose-700",
};

export function PracticanteDetailDialog({
  open,
  onOpenChange,
  practicante,
}: PracticanteDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [horario, setHorario] = useState<HorarioDetalle[]>([]);

  // Cargar horario cuando se abre el modal
  useEffect(() => {
    if (open && practicante?.idPracticante) {
      const cargarHorario = async () => {
        try {
          setLoading(true);
          const data = await practicantesApi.getHorario(practicante.idPracticante);
          if (data && data.length > 0) {
            setHorario(data);
          }
        } catch (error) {
          console.error("Error al cargar horario:", error);
          setHorario([]);
        } finally {
          setLoading(false);
        }
      };
      cargarHorario();
    }
  }, [open, practicante]);

  if (!practicante) return null;

  const isActivo = practicante.situacion === "ACTIVO";

  // Información para mostrar en cards
  const infoItems = [
    {
      label: "Documento",
      value: practicante.documento,
      icon: Hash,
    },
    {
      label: "Email",
      value: practicante.correoElectronico || "—",
      icon: Mail,
    },
    {
      label: "Teléfono",
      value: practicante.telefono || "—",
      icon: Phone,
    },
  ];

  const laboralItems = [
    {
      label: "Sede",
      value: practicante.sede || practicante.agencia || "—",
      icon: Building2,
    },
    {
      label: "Área",
      value: practicante.area || "—",
      icon: Layers,
    },
    {
      label: "Puesto",
      value: practicante.puesto || "—",
      icon: BriefcaseBusiness,
    },
    {
      label: "Cargo",
      value: practicante.cargo || "—",
      icon: BadgeCheck,
    },
    {
      label: "Tipo de instituto",
      value: practicante.tipoInstituto || "—",
      icon: School,
    },
    {
      label: "Horas semanales",
      value: `${practicante.horasSemanalesRequeridas || 0}h`,
      icon: Clock8,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] p-0 overflow-hidden gap-0">
        {/* HEADER CON GRADIENTE */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/30 ring-4 ring-white/20">
                <AvatarFallback className="text-blue-700 bg-white/90 text-xl font-bold shadow-lg">
                  {getInitials(practicante.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h2 className="text-xl font-bold tracking-tight">
                  {practicante.nombreCompleto}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge 
                    variant="outline" 
                    className={`${
                      isActivo 
                        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                        : 'bg-red-500/20 text-red-300 border-red-400/30'
                    } backdrop-blur-sm`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActivo ? 'bg-green-300' : 'bg-red-300'}`} />
                    {isActivo ? "ACTIVO" : "INACTIVO"}
                  </Badge>
                  <span className="text-sm text-white/70 font-mono">
                    #{practicante.idPracticante}
                  </span>
                </div>
              </div>
            </div>
           
          </div>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <ScrollArea className="flex-1 px-6 py-6 max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* ====== DATOS PERSONALES ====== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Datos personales</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-white border">
                      <item.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* ====== INFORMACIÓN LABORAL ====== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-indigo-50">
                  <BriefcaseBusiness className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Información laboral</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {laboralItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-white border">
                      <item.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* ====== FECHAS DE CONTRATO ====== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-50">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Fechas de contrato</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-50/50">
                  <div className="p-1.5 rounded-lg bg-white border">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de inicio</p>
                    <p className="text-sm font-medium text-gray-900">
                      {practicante.fechaInicioPracticas 
                        ? new Date(practicante.fechaInicioPracticas).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50/50">
                  <div className="p-1.5 rounded-lg bg-white border">
                    <CalendarDays className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de fin</p>
                    <p className="text-sm font-medium text-gray-900">
                      {practicante.fechaFinPracticas 
                        ? new Date(practicante.fechaFinPracticas).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* ====== HORARIO SEMANAL ====== */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700">Horario semanal</h3>
                </div>
                {!loading && horario.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {horario.filter(h => h.activo).length} días activos
                  </Badge>
                )}
              </div>

              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : horario.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {horario.map((bloque, index) => {
                    const diaKey = bloque.diaSemana;
                    const colorClass = DIA_COLORS[diaKey] || "border-gray-200 bg-gray-50 text-gray-700";
                    const diaLabel = DIAS_MAP[diaKey] || diaKey;
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${colorClass} transition-colors hover:opacity-80`}
                      >
                        <span className="text-sm font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current" />
                          {diaLabel}
                        </span>
                        {bloque.activo ? (
                          <span className="text-sm font-mono bg-white/60 px-2.5 py-0.5 rounded-md">
                            {bloque.horaInicio.substring(0, 5)} - {bloque.horaFin.substring(0, 5)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic flex items-center gap-1">
                            <Circle className="h-2 w-2 fill-gray-300" />
                            Descanso
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-lg border border-dashed bg-gray-50/50">
                  <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No se encontró horario configurado</p>
                  <p className="text-xs text-gray-400 mt-1">El practicante aún no tiene un horario asignado</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* FOOTER */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50/50 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="gap-2 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}