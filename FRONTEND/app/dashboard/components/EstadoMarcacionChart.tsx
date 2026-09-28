"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import {
  Activity,
  Clock,
  UserCheck,
  UserX,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface EstadoMarcacionChartProps {
  loading: boolean;
  conAsistencia: number;
  sinMarcar: number;
  totalDonut: number;
}

const COLORS = {
  conAsistencia: "#10b981", // emerald
  sinMarcar: "#94a3b8", // slate
  track: "#f1f5f9", // slate-100
};

const donutConfig: ChartConfig = {
  conAsistencia: { label: "Con asistencia", color: COLORS.conAsistencia },
  sinMarcar: { label: "Sin marcar", color: COLORS.sinMarcar },
};

export default function EstadoMarcacionChart({
  loading,
  conAsistencia,
  sinMarcar,
  totalDonut,
}: EstadoMarcacionChartProps) {
  const pctAsistencia =
    totalDonut > 0 ? Math.round((conAsistencia / totalDonut) * 100) : 0;
  const pctSinMarcar =
    totalDonut > 0 ? Math.round((sinMarcar / totalDonut) * 100) : 0;

  const donutData = [
    {
      name: "Con asistencia",
      value: conAsistencia,
      fill: "var(--color-conAsistencia)",
    },
    {
      name: "Sin marcar",
      value: sinMarcar,
      fill: "var(--color-sinMarcar)",
    },
  ].filter((d) => d.value > 0);

  // Estado general del día para el insight
  const estadoGeneral =
    pctAsistencia >= 80
      ? { label: "Excelente", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" }
      : pctAsistencia >= 50
        ? { label: "Aceptable", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" }
        : { label: "Baja asistencia", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100" };

  return (
    <Card className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* ─── Header ─── */}
      <div className="relative z-10 flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center shadow-md shadow-slate-900/20">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
                Estado de marcación
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                Hoy
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              {totalDonut} {totalDonut === 1 ? "marcación" : "marcaciones"} registradas
            </p>
          </div>
        </div>
      </div>

      {/* ─── Contenido ─── */}
      <CardContent className="relative z-10 flex-1 flex flex-col p-5">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ) : totalDonut === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-slate-400" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin datos</p>
            <p className="text-xs text-slate-500 mt-1">
              Aún no hay marcaciones registradas
            </p>
          </div>
        ) : (
          <>
            {/* ─── Donut con doble anillo ─── */}
            <div className="relative flex items-center justify-center">
              <div className="relative h-[220px] w-[220px]">
                {/* Anillo exterior (track sutil) */}
                <div className="absolute inset-0 rounded-full border-[14px] border-slate-50" />

                {/* Donut principal */}
                <ChartContainer
                  config={donutConfig}
                  className="absolute inset-0 h-[220px] w-[220px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          className="rounded-xl border-slate-200 shadow-xl bg-white/98 backdrop-blur-md"
                        />
                      }
                    />
                    <Pie
                      data={
                        donutData.length > 0
                          ? donutData
                          : [
                              {
                                name: "Sin datos",
                                value: 1,
                                fill: "hsl(var(--muted))",
                              },
                            ]
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={78}
                      outerRadius={105}
                      paddingAngle={donutData.length > 1 ? 3 : 0}
                      strokeWidth={0}
                      isAnimationActive={true}
                      animationDuration={1000}
                      cornerRadius={8}
                    />
                  </PieChart>
                </ChartContainer>

                {/* Centro del donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[36px] font-bold tracking-tight text-slate-900 tabular-nums leading-none">
                      {pctAsistencia}
                    </span>
                    <span className="text-[18px] font-bold text-slate-400 leading-none">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">
                    Con asistencia
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Cards de leyenda ─── */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              {/* Con asistencia */}
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <UserCheck
                      className="h-3.5 w-3.5 text-emerald-700"
                      strokeWidth={2.6}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Con asistencia
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-bold text-emerald-900 tabular-nums leading-none">
                    {conAsistencia}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">
                    {pctAsistencia}%
                  </span>
                </div>
              </div>

              {/* Sin marcar */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/60 to-white p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <UserX
                      className="h-3.5 w-3.5 text-slate-600"
                      strokeWidth={2.6}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Sin marcar
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-bold text-slate-900 tabular-nums leading-none">
                    {sinMarcar}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    {pctSinMarcar}%
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Insight al pie ─── */}
            <div
              className={`mt-4 flex items-center gap-2.5 rounded-xl border ${estadoGeneral.border} ${estadoGeneral.bg} px-3.5 py-2.5`}
            >
              <div className={`h-6 w-6 rounded-lg bg-white border ${estadoGeneral.border} flex items-center justify-center shrink-0`}>
                <TrendingUp
                  className={`h-3.5 w-3.5 ${estadoGeneral.color}`}
                  strokeWidth={2.6}
                />
              </div>
              <div className="min-w-0">
                <p className={`text-[11.5px] font-bold ${estadoGeneral.color} leading-none`}>
                  {estadoGeneral.label}
                </p>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-none">
                  {conAsistencia} de {totalDonut} practicantes marcaron hoy
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}