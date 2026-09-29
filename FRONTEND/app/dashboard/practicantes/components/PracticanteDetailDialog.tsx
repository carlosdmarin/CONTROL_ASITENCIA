"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-4xl max-h-[92vh] p-0 overflow-hidden gap-0 rounded-2xl border-slate-200 shadow-2xl bg-slate-50">
        {/* ═══════════ HEADER ═══════════ */}
        <div className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 pr-14">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[16px] font-bold shadow-sm`}
              >
                {getInitials(nombreDisplay)}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white ${
                  isActivo ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            </div>

            {/* Nombre + estado + tipo */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <DialogTitle className="text-[20px] font-semibold text-slate-900 tracking-tight leading-tight">
                  {nombreDisplay}
                </DialogTitle>
                {isActivo ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-[11px] font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-0.5 text-[11px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Inactivo
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-500 mt-1">
                {practicante.tipoPracticante || "Sin tipo asignado"}
              </p>
            </div>

            {/* ID */}
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

        {/* ═══════════ BODY ═══════════ */}
        <ScrollArea className="flex-1 max-h-[calc(92vh-100px)] overscroll-contain">
          <div className="p-5 sm:p-6 space-y-5">
            {/* ─── Grid 3 columnas: Contacto | Formación | Período ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Contacto — azul */}
              <InfoCard icon={Mail} title="Contacto" accent="blue">
                <FieldRow
                  icon={Mail}
                  label="Correo"
                  value={practicante.correoElectronico || "No registrado"}
                  muted={!practicante.correoElectronico}
                />
                <FieldRow
                  icon={Phone}
                  label="Teléfono"
                  value={practicante.telefono || "No registrado"}
                  muted={!practicante.telefono}
                  mono
                />
              </InfoCard>

              {/* Formación — emerald */}
              <InfoCard icon={School} title="Formación" accent="emerald">
                <FieldRow
                  icon={School}
                  label="Centro de estudios"
                  value={practicante.tipoInstituto || "—"}
                />
              </InfoCard>

              {/* Período — emerald */}
              <InfoCard icon={CalendarDays} title="Período" accent="emerald">
                <FieldRow
                  icon={CalendarDays}
                  label="Inicio"
                  value={
                    practicante.fechaInicioPracticas
                      ? new Date(
                          practicante.fechaInicioPracticas,
                        ).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"
                  }
                />
                <FieldRow
                  icon={CalendarDays}
                  label="Fin"
                  value={
                    practicante.fechaFinPracticas
                      ? new Date(
                          practicante.fechaFinPracticas,
                        ).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Sin definir"
                  }
                  muted={!practicante.fechaFinPracticas}
                />
              </InfoCard>
            </div>

            {/* ─── Info laboral + Horario ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
              {/* Info laboral — azul */}
              <InfoCard
                icon={BriefcaseBusiness}
                title="Información laboral"
                accent="blue"
              >
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
                  label="Tipo de practicante"
                  value={practicante.tipoPracticante || "—"}
                />
                <FieldRow
                  icon={Clock}
                  label="Horas semanales"
                  value={`${practicante.horasSemanalesRequeridas || 0} h`}
                />
              </InfoCard>

              {/* Horario — azul */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Clock
                        className="h-3.5 w-3.5 text-blue-600"
                        strokeWidth={2.4}
                      />
                    </div>
                    <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
                      Horario semanal
                    </h3>
                  </div>
                  {!loading && horario.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                      {horario.filter((h) => h.activo).length} días
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="p-4 space-y-2.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full rounded-md" />
                    ))}
                  </div>
                ) : horarioOrdenado.length > 0 ? (
                  <div className="p-4 space-y-2.5">
                    {horarioOrdenado.map((bloque, index) => {
                      const diaLabel =
                        DIAS_MAP[bloque.diaSemana] || bloque.diaSemana;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3"
                        >
                          <span
                            className={`text-[12.5px] font-medium ${
                              bloque.activo
                                ? "text-slate-700"
                                : "text-slate-300"
                            }`}
                          >
                            {diaLabel}
                          </span>
                          <span
                            className={`text-[12.5px] font-medium tabular-nums ${
                              bloque.activo
                                ? "text-slate-900"
                                : "text-slate-300 italic"
                            }`}
                          >
                            {bloque.activo
                              ? `${bloque.horaInicio.substring(0, 5)} – ${bloque.horaFin.substring(0, 5)}`
                              : "Descanso"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4">
                    <AlertCircle
                      className="h-5 w-5 text-slate-300 mb-2"
                      strokeWidth={2}
                    />
                    <p className="text-[12.5px] text-slate-500">
                      Sin horario configurado
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Desactivación ─── */}
            {practicante.fechaDesactivacion && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-3.5 flex items-start gap-3">
                <UserX
                  className="h-4 w-4 text-slate-400 mt-0.5 shrink-0"
                  strokeWidth={2.2}
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700">
                    Desactivado
                  </p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════ HELPERS ═══════════ */

type Accent = "blue" | "emerald";

function InfoCard({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  accent: Accent;
  children: React.ReactNode;
}) {
  const accents: Record<
    Accent,
    { iconBg: string; iconText: string; iconBorder: string }
  > = {
    blue: {
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      iconBorder: "border-blue-100",
    },
    emerald: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      iconBorder: "border-emerald-100",
    },
  };

  const a = accents[accent];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div
          className={`h-7 w-7 rounded-lg ${a.iconBg} border ${a.iconBorder} flex items-center justify-center shrink-0`}
        >
          <Icon className={`h-3.5 w-3.5 ${a.iconText}`} strokeWidth={2.4} />
        </div>
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-4 space-y-3.5">{children}</div>
    </div>
  );
}

function FieldRow({
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
    <div className="flex items-start gap-2.5">
      <Icon
        className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0"
        strokeWidth={2.2}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
          {label}
        </p>
        <p
          className={`text-[12.5px] mt-1.5 break-words ${
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