"use client";

import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { es } from "date-fns/locale";
import { startOfWeek, endOfWeek } from "date-fns";

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
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function getWeekRange(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1, locale: es });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1, locale: es });
  // Normalizar a medianoche para comparación estable
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(0, 0, 0, 0);
  const label = `${weekStart.getDate()} al ${weekEnd.getDate()} de ${weekEnd.toLocaleString("es-ES", { month: "long" })} de ${weekEnd.getFullYear()}`;
  return { monday: weekStart, sunday: weekEnd, label: label.charAt(0).toUpperCase() + label.slice(1) };
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
  if (tipo === "DIARIO") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Selecciona una fecha</h3>
          <p className="text-xs text-muted-foreground mt-1">Elige el día específico que deseas consultar.</p>
        </div>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={fechaDiaria}
            onSelect={onFechaDiariaChange}
            locale={es}
            weekStartsOn={1}
            className="rounded-xl border border-slate-200 bg-white"
          />
        </div>
        {fechaDiaria && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
            <p className="text-xs text-slate-500">Fecha seleccionada</p>
            <p className="text-sm font-medium text-blue-900 capitalize">{formatFechaLarga(fechaDiaria)}</p>
          </div>
        )}
      </div>
    );
  }

  if (tipo === "SEMANAL") {
    const rango = semanaFecha ? getWeekRange(semanaFecha) : null;

    const handleWeekSelect = (date?: Date) => {
      if (!date) return;
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      onSemanaFechaChange(selectedDate);
    };

    const weekStart = semanaFecha ? startOfWeek(semanaFecha, { weekStartsOn: 1, locale: es }) : undefined;
    const weekEnd = semanaFecha ? endOfWeek(semanaFecha, { weekStartsOn: 1, locale: es }) : undefined;
    if (weekStart) weekStart.setHours(0, 0, 0, 0);
    if (weekEnd) weekEnd.setHours(0, 0, 0, 0);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Selecciona una semana</h3>
          <p className="text-xs text-muted-foreground mt-1">Elige cualquier día de la semana que deseas consultar.</p>
        </div>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={semanaFecha}
            onSelect={handleWeekSelect}
            locale={es}
            weekStartsOn={1}
            modifiers={weekStart && weekEnd ? { selectedWeek: { from: weekStart, to: weekEnd } } : undefined}
            modifiersClassNames={{
              selectedWeek: "bg-blue-50",
            }}
            className="rounded-xl border border-slate-200 bg-white"
          />
        </div>
        {rango && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center space-y-1">
            <p className="text-xs text-slate-500">Semana seleccionada</p>
            <Badge variant="outline" className="bg-white border-blue-200 text-blue-900 text-xs">
              {rango.label}
            </Badge>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">Selecciona cualquier día de la semana que deseas consultar.</p>
      </div>
    );
  }

  // MENSUAL
  const mesActual = mesFecha ? mesFecha.getMonth() : new Date().getMonth();
  const anioActual = mesFecha ? mesFecha.getFullYear() : new Date().getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleMesChange = (mesStr: string | null) => {
    if (mesStr == null) return;
    const mes = Number(mesStr);
    const nueva = mesFecha ? new Date(mesFecha) : new Date();
    nueva.setMonth(mes);
    nueva.setDate(1);
    if (!mesFecha) nueva.setFullYear(anioActual);
    onMesFechaChange(nueva);
  };

  const handleAnioChange = (anioStr: string | null) => {
    if (anioStr == null) return;
    const anio = Number(anioStr);
    const nueva = mesFecha ? new Date(mesFecha) : new Date();
    nueva.setFullYear(anio);
    nueva.setMonth(mesActual);
    nueva.setDate(1);
    onMesFechaChange(nueva);
  };

  // Si no hay mesFecha, sincroniza con selects
  const mesLabel = mesFecha ? mesFecha.toLocaleString("es-ES", { month: "long", year: "numeric" }) : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Selecciona un mes</h3>
        <p className="text-xs text-muted-foreground mt-1">Elige el mes completo que deseas consultar.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Mes</Label>
          <Select value={String(mesActual)} onValueChange={handleMesChange}>
            <SelectTrigger className="w-full h-9 bg-white">
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
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Año</Label>
          <Select value={String(anioActual)} onValueChange={handleAnioChange}>
            <SelectTrigger className="w-full h-9 bg-white">
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

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={mesFecha}
          onSelect={onMesFechaChange}
          captionLayout="dropdown"
          locale={es}
          weekStartsOn={1}
          className="rounded-xl border border-slate-200 bg-white"
        />
      </div>

      {mesLabel && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
          <p className="text-xs text-slate-500">Mes seleccionado</p>
          <p className="text-sm font-medium text-blue-900 capitalize">{mesLabel}</p>
        </div>
      )}
    </div>
  );
}
