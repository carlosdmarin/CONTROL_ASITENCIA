"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Sparkles,
  Info,
} from "lucide-react";
import { es } from "date-fns/locale";
import { startOfWeek, endOfWeek } from "date-fns";
import {
  formatFechaLargaFromDate,
  getWeekRange,
} from "@/lib/utils/reportesDate";

type TipoReporte = "DIARIO" | "SEMANAL" | "MENSUAL";

interface ReporteStepPeriodoProps {
  tipo: TipoReporte;
  fechaDiaria?: Date;
  semanaFecha?: Date;
  mesFecha?: Date;
  onFechaDiariaChange: (d?: Date) => void;
  onSemanaFechaChange: (d?: Date) => void;
  onMesFechaChange: (d?: Date) => void;
}

function formatFechaLarga(date?: Date) {
  if (!date) return "—";
  return formatFechaLargaFromDate(date);
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function ReporteStepPeriodo({
  tipo,
  fechaDiaria,
  semanaFecha,
  mesFecha,
  onFechaDiariaChange,
  onSemanaFechaChange,
  onMesFechaChange,
}: ReporteStepPeriodoProps) {
  // ═══════════ HEADER UNIFICADO ═══════════
  const headerConfig = {
    DIARIO: {
      icon: CalendarDays,
      gradient: "from-blue-600 to-blue-800",
      shadowColor: "shadow-blue-900/20",
      badgeBg: "bg-blue-50",
      badgeBorder: "border-blue-100",
      badgeText: "text-blue-700",
      title: "Seleccioná una fecha",
      subtitle: "Elegí el día específico que querés consultar",
      badge: "Diario",
    },
    SEMANAL: {
      icon: CalendarRange,
      gradient: "from-violet-600 to-purple-800",
      shadowColor: "shadow-violet-900/20",
      badgeBg: "bg-violet-50",
      badgeBorder: "border-violet-100",
      badgeText: "text-violet-700",
      title: "Seleccioná una semana",
      subtitle: "Elegí cualquier día y se tomará la semana completa",
      badge: "Semanal",
    },
    MENSUAL: {
      icon: CalendarCheck,
      gradient: "from-emerald-600 to-teal-800",
      shadowColor: "shadow-emerald-900/20",
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-100",
      badgeText: "text-emerald-700",
      title: "Seleccioná un mes",
      subtitle: "Elegí el mes completo que querés consultar",
      badge: "Mensual",
    },
  };

  const h = headerConfig[tipo];
  const HeaderIcon = h.icon;

  // ═══════════ RENDER DIARIO ═══════════
  if (tipo === "DIARIO") {
    return (
      <div className="space-y-4">
        <StepHeader
          icon={HeaderIcon}
          gradient={h.gradient}
          shadowColor={h.shadowColor}
          badgeBg={h.badgeBg}
          badgeBorder={h.badgeBorder}
          badgeText={h.badgeText}
          title={h.title}
          subtitle={h.subtitle}
          badge={h.badge}
        />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex justify-center p-4">
            <Calendar
              mode="single"
              selected={fechaDiaria}
              onSelect={onFechaDiariaChange}
              locale={es}
              weekStartsOn={1}
            />
          </div>
        </div>

        {fechaDiaria && (
          <SelectionCard
            label="Fecha seleccionada"
            value={formatFechaLarga(fechaDiaria)}
            color="blue"
          />
        )}
      </div>
    );
  }

  // ═══════════ RENDER SEMANAL ═══════════
  if (tipo === "SEMANAL") {
    const rango = semanaFecha ? getWeekRange(semanaFecha) : null;

    const handleWeekSelect = (date?: Date) => {
      if (!date) return;
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      onSemanaFechaChange(selectedDate);
    };

    const weekStart = semanaFecha
      ? startOfWeek(semanaFecha, { weekStartsOn: 1, locale: es })
      : undefined;
    const weekEnd = semanaFecha
      ? endOfWeek(semanaFecha, { weekStartsOn: 1, locale: es })
      : undefined;
    if (weekStart) weekStart.setHours(0, 0, 0, 0);
    if (weekEnd) weekEnd.setHours(0, 0, 0, 0);

    return (
      <div className="space-y-4">
        <StepHeader
          icon={HeaderIcon}
          gradient={h.gradient}
          shadowColor={h.shadowColor}
          badgeBg={h.badgeBg}
          badgeBorder={h.badgeBorder}
          badgeText={h.badgeText}
          title={h.title}
          subtitle={h.subtitle}
          badge={h.badge}
        />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex justify-center p-4">
            <Calendar
              mode="single"
              selected={semanaFecha}
              onSelect={handleWeekSelect}
              locale={es}
              weekStartsOn={1}
              modifiers={
                weekStart && weekEnd
                  ? { selectedWeek: { from: weekStart, to: weekEnd } }
                  : undefined
              }
              modifiersClassNames={{
                selectedWeek: "bg-violet-50",
              }}
            />
          </div>
        </div>

        {rango && (
          <SelectionCard
            label="Semana seleccionada"
            value={rango.label}
            color="violet"
          />
        )}
      </div>
    );
  }

  // ═══════════ RENDER MENSUAL ═══════════
  const mesActual = mesFecha ? mesFecha.getMonth() : new Date().getMonth();
  const anioActual = mesFecha ? mesFecha.getFullYear() : new Date().getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleMesChange = (mesStr: string | null) => {
    if (mesStr == null) return;
    const mes = Number(mesStr);
    if (Number.isNaN(mes) || mes < 0 || mes > 11) return;
    const nueva = mesFecha ? new Date(mesFecha) : new Date();
    nueva.setMonth(mes);
    nueva.setDate(1);
    nueva.setHours(0, 0, 0, 0);
    if (!mesFecha) nueva.setFullYear(anioActual);
    onMesFechaChange(nueva);
  };

  const handleAnioChange = (anioStr: string | null) => {
    if (anioStr == null) return;
    const anio = Number(anioStr);
    if (Number.isNaN(anio)) return;
    const nueva = mesFecha ? new Date(mesFecha) : new Date();
    nueva.setFullYear(anio);
    nueva.setMonth(mesActual);
    nueva.setDate(1);
    nueva.setHours(0, 0, 0, 0);
    onMesFechaChange(nueva);
  };

  const handleMesCalendarSelect = (d?: Date) => {
    if (!d) {
      onMesFechaChange(undefined);
      return;
    }
    const nueva = new Date(d);
    nueva.setDate(1);
    nueva.setHours(0, 0, 0, 0);
    onMesFechaChange(nueva);
  };

  const mesLabel = mesFecha
    ? mesFecha.toLocaleString("es-ES", {
        timeZone: "America/Lima",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      <StepHeader
        icon={HeaderIcon}
        gradient={h.gradient}
        shadowColor={h.shadowColor}
        badgeBg={h.badgeBg}
        badgeBorder={h.badgeBorder}
        badgeText={h.badgeText}
        title={h.title}
        subtitle={h.subtitle}
        badge={h.badge}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2.4} />
          </div>
          <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
            Período mensual
          </h4>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[12px] font-medium text-slate-700">
                Mes
              </Label>
              <Select value={String(mesActual)} onValueChange={handleMesChange}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((m, idx) => (
                    <SelectItem key={m} value={String(idx)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-medium text-slate-700">
                Año
              </Label>
              <Select value={String(anioActual)} onValueChange={handleAnioChange}>
                <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anios.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Calendar
              mode="single"
              selected={mesFecha}
              onSelect={handleMesCalendarSelect}
              captionLayout="dropdown"
              locale={es}
              weekStartsOn={1}
            />
          </div>
        </div>
      </div>

      {mesLabel && (
        <SelectionCard
          label="Mes seleccionado"
          value={mesLabel}
          color="emerald"
        />
      )}
    </div>
  );
}

/* ═══════════ HELPERS ═══════════ */

function StepHeader({
  icon: Icon,
  gradient,
  shadowColor,
  badgeBg,
  badgeBorder,
  badgeText,
  title,
  subtitle,
  badge,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  gradient: string;
  shadowColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  title: string;
  subtitle: string;
  badge: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        <div
          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${shadowColor}`}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full ${badgeBg} border ${badgeBorder} ${badgeText} px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider`}
          >
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
            {badge}
          </span>
        </div>
        <p className="text-[11.5px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function SelectionCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "violet" | "emerald";
}) {
  const colors = {
    blue: {
      border: "border-blue-100",
      bg: "bg-blue-50/50",
      iconBg: "bg-blue-100",
      iconBorder: "border-blue-200",
      iconText: "text-blue-700",
      labelText: "text-blue-700",
      valueText: "text-blue-900",
    },
    violet: {
      border: "border-violet-100",
      bg: "bg-violet-50/50",
      iconBg: "bg-violet-100",
      iconBorder: "border-violet-200",
      iconText: "text-violet-700",
      labelText: "text-violet-700",
      valueText: "text-violet-900",
    },
    emerald: {
      border: "border-emerald-100",
      bg: "bg-emerald-50/50",
      iconBg: "bg-emerald-100",
      iconBorder: "border-emerald-200",
      iconText: "text-emerald-700",
      labelText: "text-emerald-700",
      valueText: "text-emerald-900",
    },
  };

  const c = colors[color];

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border ${c.border} ${c.bg} px-4 py-3.5`}
    >
      <div
        className={`h-9 w-9 rounded-lg ${c.iconBg} border ${c.iconBorder} flex items-center justify-center shrink-0`}
      >
        <CalendarCheck className={`h-4 w-4 ${c.iconText}`} strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${c.labelText} leading-none`}
        >
          {label}
        </p>
        <p
          className={`text-[13.5px] font-bold ${c.valueText} mt-1.5 capitalize`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}