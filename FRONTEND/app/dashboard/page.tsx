"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "recharts";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  AlertTriangle,
  ClockAlert,
  XCircle,
  MinusCircle,
  CheckCircle2,
  Eye,
  ChevronRight,
  LogIn,
  LogOut,
  Coffee,
} from "lucide-react";
import Link from "next/link";

import { practicantesApi } from "@/lib/api/practicantes";
import { asistenciasApi } from "@/lib/api/asistencias";
import { Practicante } from "@/types/practicante";
import {
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
  isTardanza,
  isAusente,
} from "@/types/asistencia";

function formatFechaISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSemanaActual(): { inicio: string; fin: string } {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diffLunes = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return { inicio: formatFechaISO(lunes), fin: formatFechaISO(domingo) };
}

const DIAS_LABELS: Record<string, string> = {
  "1": "Lunes",
  "2": "Martes",
  "3": "Miércoles",
  "4": "Jueves",
  "5": "Viernes",
  "6": "Sábado",
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const COLORS = {
  total: "#0f172a",
  presentes: "#227DC3",
  tardanzas: "#CC8033",
  faltas: "#B82E5C",
  descansos: "#64748b",
} as const;

function porcentaje(valor: number, total: number): string {
  if (!total || total <= 0) return "Sin registros";
  return `${Math.round((valor / total) * 100)}% del total`;
}
function porcentajeBadge(valor: number, total: number): string {
  if (!total || total <= 0) return "—";
  return `${Math.round((valor / total) * 100)}%`;
}
function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
function TrendIcon({ percent }: { percent: string }) {
  if (percent === "—") return <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />;
  const value = parseInt(percent.replace("%", ""), 10);
  if (Number.isNaN(value)) return <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />;
  return value >= 50 ? (
    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.25} />
  ) : (
    <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.25} />
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [resumenAsistencia, setResumenAsistencia] = useState({
    presentes: 0,
    tardes: 0,
    faltas: 0,
    total: 0,
  });
  const [periodo, setPeriodo] = useState("semana");
  const [rangoData, setRangoData] = useState<
    {
      fecha: string;
      presentes: number;
      tardanzas: number;
      faltas: number;
      total: number;
    }[]
  >([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [atencion, setAtencion] = useState<AsistenciaDiariaResponse[]>([]);
  const [atencionLoading, setAtencionLoading] = useState(true);
  const [actividades, setActividades] = useState<
    { usuario: string; accion: string; hora: string; tipo: string }[]
  >([]);
  const [actividadLoading, setActividadLoading] = useState(true);
  const [asistenciasHoy, setAsistenciasHoy] = useState<AsistenciaDiariaResponse[]>([]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const practicantesData = await practicantesApi.getAll();
      setPracticantes(practicantesData);
      const fecha = formatFechaISO(new Date());
      try {
        const resumen = await asistenciasApi.getResumenDiario(fecha);
        if (resumen) {
          setResumenAsistencia({
            presentes: resumen.diasPresente || 0,
            tardes: resumen.diasTarde || 0,
            faltas: resumen.diasFalta || 0,
            total:
              (resumen.diasPresente || 0) +
              (resumen.diasFalta || 0),
          });
        }
      } catch (error) {
        console.warn("No se pudo cargar el resumen de asistencia:", error);
      }
      try {
        setAtencionLoading(true);
        setActividadLoading(true);
        const asistenciasDia = await asistenciasApi.getAsistenciasDelDia(fecha);
        const filtradas = asistenciasDia.filter((a) => {
          const n = normalizeEstadoDia(a.estadoDia);
          if (n === "DESCANSO" || n === "PRESENTE") return false;
          if (n === "JUSTIFICADO") return false;
          if (n === "AUSENTE") return !a.justificado;
          if (n === "SIN_MARCAR") return true;
          if (n === "TARDANZA") return true;
          if (isAusente(a.estadoDia)) return !a.justificado;
          if (isTardanza(a.estadoDia)) return true;
          return false;
        });
        const prioridad = (estado: string) => {
          const n = normalizeEstadoDia(estado);
          if (n === "AUSENTE" || isAusente(estado)) return 0;
          if (n === "SIN_MARCAR") return 1;
          if (n === "TARDANZA" || isTardanza(estado)) return 2;
          return 3;
        };
        filtradas.sort(
          (a, b) => prioridad(a.estadoDia) - prioridad(b.estadoDia),
        );
        setAtencion(filtradas);
        setAsistenciasHoy(asistenciasDia);

        const acts: {
          usuario: string;
          accion: string;
          hora: string;
          tipo: string;
        }[] = [];
        asistenciasDia.forEach((a) => {
          const esTardanza =
            isTardanza(a.estadoDia) ||
            normalizeEstadoDia(a.estadoDia) === "TARDANZA";
          if (a.entradaReal) {
            const hora = a.entradaReal.substring(0, 5);
            acts.push({
              usuario: a.nombreCompleto,
              accion: esTardanza ? "Marcó tardanza" : "Registró entrada",
              hora,
              tipo: esTardanza ? "tardanza" : "entrada",
            });
          }
          if (a.salidaReal) {
            const hora = a.salidaReal.substring(0, 5);
            acts.push({
              usuario: a.nombreCompleto,
              accion: "Registró salida",
              hora,
              tipo: "salida",
            });
          }
        });
        acts.sort((a, b) => b.hora.localeCompare(a.hora));
        setActividades(acts.slice(0, 5));
      } catch (error) {
        console.warn("No se pudo cargar requiere atención/actividad:", error);
        setAtencion([]);
        setActividades([]);
        setAsistenciasHoy([]);
      } finally {
        setAtencionLoading(false);
        setActividadLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarRango = async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      const { inicio, fin } = getSemanaActual();
      const data = await asistenciasApi.getResumenRango(inicio, fin);
      setRangoData(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setChartError(e.message || "Error al cargar gráfico");
      setRangoData([]);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (periodo === "semana") {
      cargarRango();
    }
  }, [periodo]);

  const totalPracticantes = practicantes.length;

  const chartConfig: ChartConfig = {
    presentes: { label: "Presentes", color: "hsl(206, 70%, 45%)" }, // Azul profundo
    tardanzas: { label: "Tardanzas", color: "hsl(30, 60%, 50%)" }, // Ámbar
    faltas: { label: "Faltas", color: "hsl(340, 60%, 45%)" }, // Rojo ciruela
  };

  const chartData = rangoData.map((r) => {
    const d = new Date(r.fecha + "T00:00:00");
    const label = DIAS_LABELS[String(d.getDay())] ?? r.fecha;
    return {
      day: label,
      fecha: r.fecha,
      presentes: r.presentes ?? 0,
      tardanzas: r.tardanzas ?? 0,
      faltas: r.faltas ?? 0,
    };
    }).filter((d) =>{
      const date = new Date(d.fecha +  "T00:00:00");
      return date.getDay() !== 0;
  });

  // Techo dinámico del eje Y para que el área no quede "aplastada" contra el
  // fondo cuando los valores son bajos (solo visual, no toca los datos).
  const chartMax = Math.max(
    1,
    ...chartData.map((d) => d.presentes + d.tardanzas + d.faltas === 0 ? 0 : Math.max(d.presentes, d.tardanzas, d.faltas)),
  );
  const yAxisMax = Math.max(4, chartMax + 2);

  // Puntualidad de hoy: solo quienes debían asistir hoy (excluye DESCANSO), solo PRESENTE vs TARDANZA
  // Usa asistenciasHoy (datos reales de GET /diaria?fecha, que ya filtra INACTIVOS y usa horaFin para SIN_MARCAR/AUSENTE)
  const descansos = asistenciasHoy.filter((a) => normalizeEstadoDia(a.estadoDia) === "DESCANSO").length;
  const esperados = asistenciasHoy.filter((a) => normalizeEstadoDia(a.estadoDia) !== "DESCANSO").length;
  const puntuales = asistenciasHoy.filter((a) => normalizeEstadoDia(a.estadoDia) === "PRESENTE").length;
  const tardanzasPunt = asistenciasHoy.filter((a) => {
    const n = normalizeEstadoDia(a.estadoDia);
    return n === "TARDANZA" || isTardanza(a.estadoDia);
  }).length;
  const marcados = puntuales + tardanzasPunt;
  const puntualidad = marcados > 0 ? (puntuales / marcados) * 100 : 0;
  const puntualidadStr = marcados > 0 ? `${puntualidad.toFixed(1).replace(/\.0$/, "")}%` : "0%";
  const donutData = [
    { name: "Puntuales", value: puntuales, fill: "var(--color-presentes)" },
    { name: "Tardanzas", value: tardanzasPunt, fill: "var(--color-tardanzas)" },
  ].filter((d) => d.value > 0);

  const donutConfig: ChartConfig = {
    presentes: { label: "Puntuales", color: "hsl(206, 70%, 45%)" },
    tardanzas: { label: "Tardanzas", color: "hsl(30, 60%, 50%)" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-900 rounded-xl shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="pl-4 border-l border-slate-200">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                {loading
                  ? "Cargando resumen del sistema…"
                  : `${totalPracticantes} practicantes · ${resumenAsistencia.presentes} presentes hoy`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
              <SelectTrigger className="w-[160px] h-9 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="Rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes" disabled>
                  Este mes
                </SelectItem>
                <SelectItem value="trimestre" disabled>
                  Este trimestre
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-white border-slate-200 rounded-xl"
            >
              <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
              {new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs - lenguaje visual inspirado en AsistenciaStats */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {(() => {
          const totalDia = resumenAsistencia.total;
          const kpis = [
            {
              label: "Total practicantes",
              badge: "PERSONAL",
              value: totalPracticantes,
              icon: Users,
              color: COLORS.total,
              detail: "Practicantes registrados",
              percent: "—",
            },
            {
              label: "Presentes hoy",
              badge: "ASISTENCIA",
              value: resumenAsistencia.presentes,
              icon: UserCheck,
              color: COLORS.presentes,
              detail: porcentaje(resumenAsistencia.presentes, totalDia),
              percent: porcentajeBadge(resumenAsistencia.presentes, totalDia),
            },
            {
              label: "Tardanzas hoy",
              badge: "INCIDENCIA",
              value: resumenAsistencia.tardes,
              icon: ClockAlert,
              color: COLORS.tardanzas,
              detail: porcentaje(resumenAsistencia.tardes, totalDia),
              percent: porcentajeBadge(resumenAsistencia.tardes, totalDia),
            },
            {
              label: "Ausentes hoy",
              badge: "INCIDENCIA",
              value: resumenAsistencia.faltas,
              icon: UserX,
              color: COLORS.faltas,
              detail: porcentaje(resumenAsistencia.faltas, totalDia),
              percent: porcentajeBadge(resumenAsistencia.faltas, totalDia),
            },
            {
              label: "Descansos hoy",
              badge: "DESCANSO",
              value: descansos,
              icon: Coffee,
              color: COLORS.descansos,
              detail: "No laboran hoy",
              percent: "—",
            },
          ];
          return kpis.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg animate-kpi-enter"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider"
                        style={{
                          color: stat.color,
                          backgroundColor: hexToRgba(stat.color, 0.08),
                          borderColor: hexToRgba(stat.color, 0.18),
                        }}
                      >
                        {stat.badge}
                      </span>
                      <div className="mt-2.5 flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: stat.color }} />
                        <p className="truncate text-sm font-medium text-slate-600">{stat.label}</p>
                      </div>
                    </div>
                    <div
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700 transition-transform duration-200 group-hover:scale-[1.03]"
                      aria-label={`Indicador: ${stat.percent}`}
                    >
                      {loading ? (
                        <Skeleton className="h-3 w-10 rounded-full" />
                      ) : (
                        <>
                          <TrendIcon percent={stat.percent} />
                          <span>{stat.percent}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    {loading ? (
                      <Skeleton className="h-10 w-16 rounded-lg" />
                    ) : (
                      <p className="text-3xl font-semibold tracking-tight tabular-nums" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 min-h-5">
                    {loading ? (
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                    ) : (
                      <p className="text-xs text-slate-500">{stat.detail}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          });
        })()}
      </div>

      {/* Gráfico semanal + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                  <span className="p-1.5 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </span>
                  Asistencias semanales
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Lunes a sabado · presentes, tardanzas y faltas
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="rounded-full bg-blue-50 text-blue-600 border-blue-200 text-xs"
              >
                Últimos 7 días
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {chartLoading ? (
              <Skeleton className="h-65 w-full rounded-xl" />
            ) : chartError ? (
              <div className="h-65 w-full flex flex-col items-center justify-center text-sm text-red-500">
                <p>{chartError}</p>
                <p className="text-xs text-slate-500 mt-1">
                  No se pudo cargar el gráfico
                </p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[260px] w-full flex items-center justify-center text-sm text-slate-500">
                Sin datos para esta semana
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <AreaChart
                  data={chartData}
                  margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="fillPresentes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-presentes)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-presentes)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillTardanzas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-tardanzas)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-tardanzas)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillFaltas" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-faltas)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-faltas)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    allowDecimals={false}
                    domain={[0, yAxisMax]}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        className="rounded-xl border-slate-200 shadow-sm"
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    isAnimationActive={true}
                    animationDuration={700}
                    dataKey="presentes"
                    type="natural"
                    fill="url(#fillPresentes)"
                    stroke="var(--color-presentes)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--color-presentes)" }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    isAnimationActive={true}
                    animationDuration={700}
                    dataKey="tardanzas"
                    type="natural"
                    fill="url(#fillTardanzas)"
                    stroke="var(--color-tardanzas)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--color-tardanzas)" }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    isAnimationActive={true}
                    animationDuration={700}
                    dataKey="faltas"
                    type="natural"
                    fill="url(#fillFaltas)"
                    stroke="var(--color-faltas)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--color-faltas)" }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Donut Puntualidad de hoy */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold text-slate-900">
              Puntualidad de hoy
            </CardTitle>
            <CardDescription className="text-xs">
              Practicantes que marcaron entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
            {atencionLoading ? (
              <Skeleton className="h-[220px] w-[220px] rounded-full" />
            ) : esperados === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-slate-50 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">--</p>
                <p className="text-xs font-medium text-slate-500">Puntualidad</p>
                <p className="text-[11px] text-slate-400 mt-2">Sin jornada programada</p>
              </div>
            ) : (
              <>
                <div className="relative h-55 w-full">
                  <ChartContainer config={donutConfig} className="h-55 w-full">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={donutData.length > 0 ? donutData : [{ name: "Sin datos", value: 1, fill: "hsl(var(--muted))" }]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={donutData.length > 0 ? 3 : 0}
                        strokeWidth={0}
                        isAnimationActive={true}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                      {marcados === 0 ? "0%" : puntualidadStr}
                    </span>
                    <span className="text-xs font-medium text-slate-500">Puntualidad</span>
                  </div>
                </div>
                <div className="w-full space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#227DC3]" /> Puntuales
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">{puntuales}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[hsl(38,92%,50%)]" /> Tardanzas
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">{tardanzasPunt}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
                    <span className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{marcados}</span> de <span className="font-medium text-slate-700">{esperados}</span> marcaron
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad + Requiere atención */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
              <span className="p-1.5 bg-emerald-50 rounded-lg">
                <Activity className="h-4 w-4 text-emerald-600" />
              </span>
              Actividad reciente
            </CardTitle>
            <CardDescription className="text-xs">
              Últimas marcaciones de hoy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {actividadLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : actividades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="p-3 bg-slate-50 rounded-full mb-3">
                  <Activity className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Sin actividad reciente
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Aún no se han registrado marcaciones hoy
                </p>
              </div>
            ) : (
              actividades.map((act, index) => {
                const isEntrada = act.tipo === "entrada";
                const isTardanza = act.tipo === "tardanza";
                const badgeBg = isTardanza
                  ? "bg-amber-500 text-white"
                  : isEntrada
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-500 text-white";
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {/* Avatar como elemento principal, con badge de entrada/salida superpuesto */}
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarFallback className="text-xs font-medium bg-slate-50 text-slate-700">
                          {iniciales(act.usuario)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${badgeBg}`}
                      >
                        {isTardanza ? (
                          <ClockAlert className="h-2.5 w-2.5" />
                        ) : isEntrada ? (
                          <LogIn className="h-2.5 w-2.5" />
                        ) : (
                          <LogOut className="h-2.5 w-2.5" />
                        )}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-900">
                        {act.usuario}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {act.accion}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full tabular-nums">
                      {act.hora}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                <span className="p-1.5 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </span>
                Requiere atención
                {!atencionLoading && atencion.length > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-1 rounded-full bg-amber-50 text-amber-700 border-amber-200"
                  >
                    {atencion.length}
                  </Badge>
                )}
              </CardTitle>
              <Link
                href="/dashboard/asistencia"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Ver todos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Practicantes activos con falta, tardanza o sin marcar hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {atencionLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : atencion.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="p-3 bg-emerald-50 rounded-full mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Todo al día
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ningún practicante activo requiere atención hoy
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {atencion.slice(0, 5).map((a) => {
                  const n = normalizeEstadoDia(a.estadoDia);
                  const practicanteInfo = practicantes.find(
                    (p) => p.idPracticante === a.idPracticante,
                  );
                  const area =
                    practicanteInfo?.nombreArea || practicanteInfo?.area || practicanteInfo?.puesto || "—";
                  let badgeClass =
                    "bg-slate-100 text-slate-700 border-slate-200";
                  let Icon = MinusCircle;
                  let label = "Sin marcar";
                  if (n === "AUSENTE" || isAusente(a.estadoDia)) {
                    badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                    Icon = XCircle;
                    label = "Falta";
                  } else if (n === "TARDANZA" || isTardanza(a.estadoDia)) {
                    badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                    Icon = ClockAlert;
                    label = "Tardanza";
                  }
                  return (
                    <div
                      key={a.idPracticante}
                      className="flex items-center gap-3 py-3 px-1 hover:bg-slate-50 transition-colors rounded-lg"
                    >
                      <Avatar className="h-9 w-9 shrink-0 border border-slate-200">
                        <AvatarFallback className="text-xs font-medium bg-slate-50 text-slate-700">
                          {iniciales(a.nombreCompleto)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-slate-900">
                          {a.nombreCompleto}
                        </p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                          <span>{area}</span>
                          {a.entradaReal ? (
                            <span className="hidden sm:inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {a.entradaReal.substring(0, 5)}
                              <span className="text-slate-300">•</span>
                              esperada{" "}
                              {a.entradaEsperada?.substring(0, 5) ?? "—"}
                            </span>
                          ) : a.entradaEsperada ? (
                            <span className="hidden sm:inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              esperada {a.entradaEsperada.substring(0, 5)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          className={`${badgeClass} rounded-full gap-1 text-xs font-medium border`}
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </Badge>
                        <Link
                          href="/dashboard/asistencia"
                          aria-label={`Ver detalle de ${a.nombreCompleto}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-slate-100"
                            aria-label="Ver detalle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {atencion.length > 5 && (
                  <Link
                    href="/dashboard/asistencia"
                    className="flex items-center justify-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 py-2 pt-3"
                  >
                    Ver todos ({atencion.length}){" "}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}