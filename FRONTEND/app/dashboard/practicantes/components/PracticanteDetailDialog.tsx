"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  School,
  CalendarDays,
  Clock,
  UserX,
  Layers,
  BadgeCheck,
  AlertCircle,
  IdCard,
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

const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

function toTitleCase(texto: string) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-400 via-amber-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-cyan-400 via-sky-500 to-blue-600",
];

function getAvatarGradient(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const DIAS_MAP: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

const DIAS_ORDER = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

export function PracticanteDetailDialog({
  open,
  onOpenChange,
  practicante,
}: PracticanteDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [horario, setHorario] = useState<HorarioDetalle[]>([]);

  useEffect(() => {
    if (open && practicante?.idPracticante) {
      const cargarHorario = async () => {
        try {
          setLoading(true);
          const data = await practicantesApi.getHorario(
            practicante.idPracticante,
          );
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
  const gradient = getAvatarGradient(
    practicante.idPracticante,
    practicante.nombreCompleto,
  );
  const nombreDisplay = toTitleCase(practicante.nombreCompleto);

  const horarioOrdenado = [...horario].sort(
    (a, b) => DIAS_ORDER.indexOf(a.diaSemana) - DIAS_ORDER.indexOf(b.diaSemana),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-5xl max-h-[92vh] p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* HEADER — el X de cierre lo posiciona el propio Dialog arriba a la derecha,
            así que dejamos ese espacio libre (pr-10) para que el ID no quede pegado a él */}
        <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 pr-14">
          <div className="flex items-center gap-5">
            {/* Avatar cuadrado */}
            <div className="relative shrink-0">
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[16px] font-bold shadow-sm`}
              >
                {getInitials(nombreDisplay)}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white ${
                  isActivo ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </div>

            {/* Nombre + estado, con el badge unificado al de la tabla (pill + punto) */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <DialogTitle className="text-[20px] font-semibold text-slate-900 tracking-tight leading-tight">
                  {nombreDisplay}
                </DialogTitle>
                {isActivo ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 border-emerald-200 text-emerald-700 rounded-full px-2.5 py-0.5 text-[11px] font-medium inline-flex items-center gap-1.5"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Activo
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 border-slate-200 text-slate-500 rounded-full px-2.5 py-0.5 text-[11px] font-medium inline-flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Inactivo
                  </Badge>
                )}
              </div>
              <p className="text-[13px] text-slate-500 mt-1">
                {practicante.cargo || "Sin cargo asignado"}
              </p>
            </div>

            {/* ID, ahora dentro del propio bloque de header sin invadir el área del X */}
            <div className="hidden sm:flex flex-col items-end shrink-0 pl-5 border-l border-slate-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
                ID
              </span>
              <span className="text-[13px] font-mono font-semibold text-slate-700 mt-1 tabular-nums">
                {String(practicante.idPracticante).padStart(4, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* BODY — columna izquierda ampliada (Contacto, Formación, Información laboral
            y Período de prácticas) para equilibrar el alto contra Horario semanal,
            que es la sección naturalmente más larga y ahora queda sola a la derecha */}
        <ScrollArea className="flex-1 max-h-[calc(92vh-100px)] overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 p-5 sm:p-6">
            {/* ─── Columna izquierda ─── */}
            <aside className="space-y-5">
              {/* Card de contacto */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.2} />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Contacto
                  </h3>
                </div>
                <div className="p-4 space-y-3.5">
                  <ContactRow
                    icon={IdCard}
                    label="Documento"
                    value={practicante.documento}
                    mono
                  />
                  <ContactRow
                    icon={Mail}
                    label="Correo"
                    value={practicante.correoElectronico || "No registrado"}
                    muted={!practicante.correoElectronico}
                  />
                  <ContactRow
                    icon={Phone}
                    label="Teléfono"
                    value={practicante.telefono || "No registrado"}
                    muted={!practicante.telefono}
                  />
                </div>
              </div>

              {/* Card de formación */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <School
                    className="h-3.5 w-3.5 text-slate-400"
                    strokeWidth={2.2}
                  />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Formación
                  </h3>
                </div>
                <div className="p-4">
                  <ContactRow
                    icon={School}
                    label="Centro de estudios"
                    value={practicante.tipoInstituto || "—"}
                  />
                </div>
              </div>

              {/* Info laboral — se mueve a la izquierda para balancear alturas */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <BriefcaseBusiness
                      className="h-3.5 w-3.5 text-blue-700"
                      strokeWidth={2.2}
                    />
                  </div>
                  <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                    Información laboral
                  </h3>
                </div>
                <div className="p-4 space-y-3.5">
                  <FieldRow
                    icon={Building2}
                    label="Sede"
                    value={practicante.sede || "—"}
                  />
                  <FieldRow
                    icon={Layers}
                    label="Oficina"
                    value={
                      practicante.nombreOficina || practicante.oficina || "—"
                    }
                  />
                  <FieldRow
                    icon={BadgeCheck}
                    label="Cargo"
                    value={practicante.cargo || "—"}
                  />
                  <FieldRow
                    icon={Clock}
                    label="Horas semanales"
                    value={`${practicante.horasSemanalesRequeridas || 0} h`}
                  />
                </div>
              </div>

              {/* Período de prácticas — también en la columna izquierda */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CalendarDays
                      className="h-3.5 w-3.5 text-emerald-700"
                      strokeWidth={2.2}
                    />
                  </div>
                  <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                    Período de prácticas
                  </h3>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="p-4">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                      Inicio
                    </p>
                    <p className="text-[13px] font-semibold text-slate-800 mt-1.5">
                      {practicante.fechaInicioPracticas
                        ? new Date(
                            practicante.fechaInicioPracticas,
                          ).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                      Fin
                    </p>
                    <p className="text-[13px] font-semibold text-slate-800 mt-1.5">
                      {practicante.fechaFinPracticas
                        ? new Date(
                            practicante.fechaFinPracticas,
                          ).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                {practicante.fechaDesactivacion && (
                  <div className="border-t border-rose-100 bg-rose-50/50 px-4 py-3.5 flex items-start gap-3">
                    <UserX
                      className="h-4 w-4 text-rose-600 mt-0.5 shrink-0"
                      strokeWidth={2.4}
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                        Desactivado
                      </p>
                      <p className="text-[12.5px] text-rose-800 mt-0.5">
                        {new Date(practicante.fechaDesactivacion).toLocaleString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ─── Columna derecha: Horario semanal, ahora sola y protagonista ─── */}
            <main>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                      <Clock
                        className="h-3.5 w-3.5 text-orange-700"
                        strokeWidth={2.2}
                      />
                    </div>
                    <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight">
                      Horario semanal
                    </h3>
                  </div>
                  {!loading && horario.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 border-orange-200 text-orange-700 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    >
                      {horario.filter((h) => h.activo).length} días
                    </Badge>
                  )}
                </div>

                {loading ? (
                  <div className="p-5 space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                  </div>
                ) : horarioOrdenado.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {horarioOrdenado.map((bloque, index) => {
                      const diaLabel =
                        DIAS_MAP[bloque.diaSemana] || bloque.diaSemana;
                      const isActive = bloque.activo;

                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-4 px-5 py-3.5 ${
                            isActive ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          {/* Día */}
                          <span
                            className={`text-[13px] font-medium w-24 shrink-0 ${
                              isActive ? "text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {diaLabel}
                          </span>

                          {/* Horas */}
                          {isActive ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-[12px] font-semibold text-slate-800 tabular-nums">
                                {bloque.horaInicio.substring(0, 5)}
                              </span>
                              <span className="text-slate-400 text-[11px] font-medium">
                                a
                              </span>
                              <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-[12px] font-semibold text-slate-800 tabular-nums">
                                {bloque.horaFin.substring(0, 5)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[12px] italic text-slate-400">
                              Descanso
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4">
                    <AlertCircle className="h-6 w-6 text-slate-300 mb-2" />
                    <p className="text-[12.5px] text-slate-500">
                      Sin horario configurado
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════ HELPERS ═══════════ */

function ContactRow({
  icon: Icon,
  label,
  value,
  mono,
  muted,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
          {label}
        </p>
        <p
          className={`text-[12.5px] mt-1 break-all ${
            muted
              ? "text-slate-400 italic"
              : mono
                ? "font-mono font-medium text-slate-800"
                : "font-medium text-slate-800"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0"
        strokeWidth={2.2}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
          {label}
        </p>
        <p className="text-[13px] font-medium text-slate-800 mt-1.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}