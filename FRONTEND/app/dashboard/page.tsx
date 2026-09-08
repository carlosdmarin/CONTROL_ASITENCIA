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
  "0": "Domingo",
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
              (resumen.diasTarde || 0) +
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
  });

  // Techo dinámico del eje Y para que el área no quede "aplastada" contra el
  // fondo cuando los valores son bajos (solo visual, no toca los datos).
  const chartMax = Math.max(
    1,
    ...chartData.map((d) => d.presentes + d.tardanzas + d.faltas === 0 ? 0 : Math.max(d.presentes, d.tardanzas, d.faltas)),
  );
  const yAxisMax = Math.max(4, chartMax + 2);

  // Donut: distribución de hoy
  const donutTotal =
    (resumenAsistencia.presentes || 0) +
    (resumenAsistencia.tardes || 0) +
    (resumenAsistencia.faltas || 0);
  const donutData = [
    {
      name: "Presentes",
      value: resumenAsistencia.presentes || 0,
      fill: "var(--color-presentes)",
    },
    {
      name: "Tardanzas",
      value: resumenAsistencia.tardes || 0,
      fill: "var(--color-tardanzas)",
    },
    {
      name: "Faltas",
      value: resumenAsistencia.faltas || 0,
      fill: "var(--color-faltas)",
    },
  ].filter((d) => d.value > 0);
  const donutPorcentaje =
    donutTotal > 0
      ? Math.round(((resumenAsistencia.presentes || 0) / donutTotal) * 100)
      : 0;

  const donutConfig: ChartConfig = {
    presentes: { label: "Presentes", color: "hsl(206, 70%, 45%)" },
    tardanzas: { label: "Tardanzas", color: "hsl(30, 60%, 50%)" },
    faltas: { label: "Faltas", color: "hsl(340, 60%, 45%)" },
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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-2xl border border-slate-200 shadow-sm"
              >
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20 mt-2" />
                </CardContent>
              </Card>
            ))
          : [
              {
                title: "Total practicantes",
                value: totalPracticantes,
                description: "Registrados en el sistema",
                icon: Users,
                iconBg: "bg-slate-100",
                iconColor: "text-slate-700",
                alert: false,
              },
              {
                title: "Presentes hoy",
                value: resumenAsistencia.presentes,
                description:
                  donutTotal > 0
                    ? `${Math.round((resumenAsistencia.presentes / donutTotal) * 100)}% del día`
                    : "Sin registros hoy",
                icon: UserCheck,
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                alert: false,
              },
              {
                title: "Tardanzas hoy",
                value: resumenAsistencia.tardes,
                description:
                  resumenAsistencia.tardes === 0
                    ? "Sin tardanzas"
                    : `${resumenAsistencia.tardes} requieren seguimiento`,
                icon: ClockAlert,
                iconBg: "bg-amber-50",
                iconColor: "text-amber-600",
                alert: resumenAsistencia.tardes > 0,
              },
              {
                title: "Faltas hoy",
                value: resumenAsistencia.faltas,
                description:
                  resumenAsistencia.faltas === 0
                    ? "Sin faltas"
                    : "Requieren justificación",
                icon: UserX,
                iconBg: "bg-rose-50",
                iconColor: "text-rose-600",
                alert: resumenAsistencia.faltas > 0,
              },
            ].map((stat) => (
              <Card
                key={stat.title}
                className={`rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                  stat.alert ? "border-rose-100" : "border-slate-200"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xs font-medium tracking-wide text-slate-500">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-[32px] font-semibold tracking-tight text-slate-900 leading-none tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
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
                  Lunes a domingo · presentes, tardanzas y faltas
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
              <Skeleton className="h-[260px] w-full rounded-xl" />
            ) : chartError ? (
              <div className="h-[260px] w-full flex flex-col items-center justify-center text-sm text-red-500">
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
                    dataKey="presentes"
                    type="natural"
                    fill="url(#fillPresentes)"
                    stroke="var(--color-presentes)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--color-presentes)" }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
                    dataKey="tardanzas"
                    type="natural"
                    fill="url(#fillTardanzas)"
                    stroke="var(--color-tardanzas)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--color-tardanzas)" }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Area
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

        {/* Donut Estado de hoy */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold text-slate-900">
              Estado de hoy
            </CardTitle>
            <CardDescription className="text-xs">
              Distribución de asistencia del día
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
            {loading ? (
              <Skeleton className="h-[220px] w-[220px] rounded-full" />
            ) : donutTotal === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-slate-50 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Sin registros hoy
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Aún no hay asistencias
                </p>
              </div>
            ) : (
              <>
                <div className="relative h-55 w-full">
                  <ChartContainer config={donutConfig} className="h-55 w-full">
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        strokeWidth={0}
                      />
                    </PieChart>
                  </ChartContainer>
                  {/* Centro, centrado de forma robusta sobre el donut */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                      {donutPorcentaje}%
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Asistencia
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {donutTotal} registros
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[hsl(206,72%,45%)]" />{" "}
                      Presentes
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {resumenAsistencia.presentes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[hsl(30,60%,50%)]" />{" "}
                      Tardanzas
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {resumenAsistencia.tardes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[hsl(340,60%,45%)]" />{" "}
                      Faltas
                    </span>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {resumenAsistencia.faltas}
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
                    practicanteInfo?.area || practicanteInfo?.puesto || "—";
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