"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Building2,
  Zap,
} from "lucide-react";


// ====== DATOS FICTICIOS ======
const stats = [
  {
    title: "Total Practicantes",
    value: "124",
    change: "+12%",
    trend: "up" as const,
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Practicantes Activos",
    value: "98",
    change: "+5%",
    trend: "up" as const,
    icon: UserCheck,
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Ausencias",
    value: "12",
    change: "-3%",
    trend: "down" as const,
    icon: UserX,
    gradient: "from-rose-500 to-rose-600",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    title: "Horas Totales",
    value: "8,432",
    change: "+8%",
    trend: "up" as const,
    icon: Clock,
    gradient: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

const asistenciaSemanal = [
  { day: "Lunes", value: 85 },
  { day: "Martes", value: 92 },
  { day: "Miércoles", value: 78 },
  { day: "Jueves", value: 95 },
  { day: "Viernes", value: 88 },
  { day: "Sábado", value: 45 },
  { day: "Domingo", value: 20 },
];

const chartConfig: ChartConfig = {
  value: {
    label: "Asistencia",
    color: "hsl(221, 83%, 53%)",
  },
};

const actividades = [
  { usuario: "Carlos Marín", accion: "Registró entrada", hora: "08:15 AM", tipo: "entrada" },
  { usuario: "Ana García", accion: "Registró salida", hora: "06:30 PM", tipo: "salida" },
  { usuario: "Luis Pérez", accion: "Solicitó vacaciones", hora: "10:00 AM", tipo: "solicitud" },
  { usuario: "Marta López", accion: "Marcó tardanza", hora: "09:20 AM", tipo: "tardanza" },
];

const turnos = [
  { nombre: "Mañana", total: 42, color: "text-blue-600", bg: "bg-blue-50" },
  { nombre: "Tarde", total: 38, color: "text-orange-600", bg: "bg-orange-50" },
  { nombre: "Noche", total: 44, color: "text-purple-600", bg: "bg-purple-50" },
];

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Anchos estables para las barras (evita Math.random en render - react-hooks/purity)
const statWidths = ["72%", "85%", "64%", "91%"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* ====== HEADER CON GRADIENTE SUTIL ====== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 border shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Resumen general del sistema de asistencias
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="semana">
              <SelectTrigger className="w-35 h-9 bg-white/70 backdrop-blur-sm border-gray-200">
                <SelectValue placeholder="Rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
                <SelectItem value="trimestre">Este trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-white/70 backdrop-blur-sm border-gray-200"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Button>
          </div>
        </div>
      </div>

      {/* ====== TARJETAS DE ESTADÍSTICAS CON ESTILOS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card
                key={stat.title}
                className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge
                      variant={stat.trend === "up" ? "default" : "destructive"}
                      className="gap-1 text-xs px-2 py-0.5 font-medium"
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                      style={{ width: statWidths[stats.indexOf(stat) % statWidths.length] }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ====== GRÁFICO + ACTIVIDAD ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO */}
        <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                Asistencias semanales
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-gray-50">
                Últimos 7 días
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <BarChart data={asistenciaSemanal}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(221, 83%, 53%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ACTIVIDAD RECIENTE */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              : actividades.map((act, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                        {iniciales(act.usuario)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{act.usuario}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {act.accion}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                      {act.hora}
                    </span>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      {/* ====== TURNOS CON TARJETAS MEJORADAS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {turnos.map((turno) => (
          <Card
            key={turno.nombre}
            className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Turno {turno.nombre}
                  </p>
                  <p className={`text-3xl font-bold ${turno.color}`}>
                    {turno.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    empleados asignados
                  </p>
                </div>
                <div className={`p-3 rounded-2xl ${turno.bg}`}>
                  <Building2 className={`h-6 w-6 ${turno.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}