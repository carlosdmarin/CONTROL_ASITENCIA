"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Sparkles } from "lucide-react";

interface AsistenciaSemanalChartProps {
  chartData: {
    day: string;
    fecha: string;
    presentes: number;
    ausentes: number;
  }[];
  loading: boolean;
  error: string | null;
  yAxisMax: number;
}

const COLORS = {
  presentes: "#10b981",
  ausentes: "#f43f5e",
};

const chartConfig: ChartConfig = {
  presentes: { label: "Presentes", color: COLORS.presentes },
  ausentes: { label: "Ausentes", color: COLORS.ausentes },
};

export default function AsistenciaSemanalChart({
  chartData,
  loading,
  error,
  yAxisMax,
}: AsistenciaSemanalChartProps) {
  // Promedio de presentes para línea de referencia
  const promedioPresentes =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((acc, d) => acc + d.presentes, 0) / chartData.length,
        )
      : 0;

  return (
    <Card className="lg:col-span-2 relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ─── Fondo decorativo sutil ─── */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(244, 63, 94, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* ─── Header ─── */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center shadow-md shadow-blue-900/30">
              <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                Asistencias semanales
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                Últimos 7 días
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              Presencia diaria · lunes a sábado
            </p>
          </div>
        </div>

        {/* Leyenda premium */}
        <div className="hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider">
              Presentes
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50/70">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[10.5px] font-bold text-rose-800 uppercase tracking-wider">
              Ausentes
            </span>
          </div>
        </div>
      </div>

      {/* ─── Gráfico ─── */}
      <CardContent className="relative z-10 pt-3 pb-5">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : error ? (
          <div className="h-[280px] w-full flex flex-col items-center justify-center text-sm text-red-500">
            <p>{error}</p>
            <p className="text-xs text-slate-500 mt-1">
              No se pudo cargar el gráfico
            </p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[280px] w-full flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Sin datos para esta semana
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Los datos aparecerán cuando se registren marcaciones
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={chartData}
              margin={{ left: 0, right: 12, top: 16, bottom: 0 }}
            >
              <defs>
                {/* Gradiente de presentes */}
                <linearGradient
                  id="fillPresentes"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-presentes)"
                    stopOpacity={0.55}
                  />
                  <stop
                    offset="60%"
                    stopColor="var(--color-presentes)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-presentes)"
                    stopOpacity={0.02}
                  />
                </linearGradient>

                {/* Gradiente de ausentes */}
                <linearGradient
                  id="fillAusentes"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-ausentes)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="60%"
                    stopColor="var(--color-ausentes)"
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-ausentes)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              {/* Grid horizontal */}
              <CartesianGrid
                vertical={false}
                strokeDasharray="2 6"
                stroke="#e2e8f0"
                opacity={0.8}
              />

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 11.5, fill: "#94a3b8", fontWeight: 600 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 11.5, fill: "#94a3b8", fontWeight: 600 }}
                allowDecimals={false}
                domain={[0, yAxisMax]}
                width={26}
              />

              {/* Línea de promedio de presentes */}
              <ReferenceLine
                y={promedioPresentes}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity={0.3}
                strokeWidth={1.5}
                label={{
                  value: `prom. ${promedioPresentes}`,
                  position: "insideTopRight",
                  fill: "#10b981",
                  fontSize: 9.5,
                  fontWeight: 700,
                  offset: 8,
                }}
              />

              <ChartTooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="rounded-xl border-slate-200 shadow-xl bg-white/98 backdrop-blur-md px-3.5 py-2.5"
                  />
                }
              />

              {/* Ausentes (detrás, más tenue) */}
              <Area
                isAnimationActive={true}
                animationDuration={1000}
                animationBegin={200}
                dataKey="ausentes"
                type="monotone"
                fill="url(#fillAusentes)"
                stroke="var(--color-ausentes)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  strokeWidth: 2,
                  stroke: "#fff",
                  fill: "var(--color-ausentes)",
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 2.5,
                  stroke: "#fff",
                  fill: "var(--color-ausentes)",
                }}
              />

              {/* Presentes (encima, protagonista) */}
              <Area
                isAnimationActive={true}
                animationDuration={1000}
                dataKey="presentes"
                type="monotone"
                fill="url(#fillPresentes)"
                stroke="var(--color-presentes)"
                strokeWidth={3}
                dot={{
                  r: 4,
                  strokeWidth: 2.5,
                  stroke: "#fff",
                  fill: "var(--color-presentes)",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 3,
                  stroke: "#fff",
                  fill: "var(--color-presentes)",
                }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}