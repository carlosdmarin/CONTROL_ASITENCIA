"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  UserX,
  ClockAlert,
  CalendarOff,
  type LucideIcon,
} from "lucide-react";

const COLORS = {
  total: { base: "#0f172a", tint: "#f1f5f9", soft: "#e2e8f0" },
  presentes: { base: "#059669", tint: "#ecfdf5", soft: "#d1fae5" },
  tardanzas: { base: "#d97706", tint: "#fffbeb", soft: "#fef3c7" },
  faltas: { base: "#dc2626", tint: "#fef2f2", soft: "#fee2e2" },
  descansos: { base: "#64748b", tint: "#f8fafc", soft: "#f1f5f9" },
} as const;

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function calcPct(valor: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((valor / total) * 100);
}

interface DashboardKpisProps {
  loading: boolean;
  totalPracticantes: number;
  presentes: number;
  tardes: number;
  faltas: number;
  descansos: number;
  totalDia: number;
}

interface KpiConfig {
  label: string;
  badge: string;
  value: number;
  icon: LucideIcon;
  base: string;
  tint: string;
  soft: string;
  detail: string;
  percent: number | null;
}

export default function DashboardKpis({
  loading,
  totalPracticantes,
  presentes,
  tardes,
  faltas,
  descansos,
  totalDia,
}: DashboardKpisProps) {
  const kpis: KpiConfig[] = [
    {
      label: "Total practicantes",
      badge: "PERSONAL",
      value: totalPracticantes,
      icon: Users,
      base: COLORS.total.base,
      tint: COLORS.total.tint,
      soft: COLORS.total.soft,
      detail: "Registrados en el sistema",
      percent: null,
    },
    {
      label: "Presentes hoy",
      badge: "ASISTENCIA",
      value: presentes,
      icon: UserCheck,
      base: COLORS.presentes.base,
      tint: COLORS.presentes.tint,
      soft: COLORS.presentes.soft,
      detail: `${presentes} de ${totalDia} marcaron`,
      percent: calcPct(presentes, totalDia),
    },
    {
      label: "Tardanzas hoy",
      badge: "INCIDENCIA",
      value: tardes,
      icon: ClockAlert,
      base: COLORS.tardanzas.base,
      tint: COLORS.tardanzas.tint,
      soft: COLORS.tardanzas.soft,
      detail: `${tardes} de ${totalDia} llegaron tarde`,
      percent: calcPct(tardes, totalDia),
    },
    {
      label: "Ausentes hoy",
      badge: "INCIDENCIA",
      value: faltas,
      icon: UserX,
      base: COLORS.faltas.base,
      tint: COLORS.faltas.tint,
      soft: COLORS.faltas.soft,
      detail: `${faltas} de ${totalDia} no asistieron`,
      percent: calcPct(faltas, totalDia),
    },
    {
      label: "Descansos hoy",
      badge: "DESCANSO",
      value: descansos,
      icon: CalendarOff,
      base: COLORS.descansos.base,
      tint: COLORS.descansos.tint,
      soft: COLORS.descansos.soft,
      detail: "No laboran este día",
      percent: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      {kpis.map((stat, index) => {
        const Icon = stat.icon;
        const accent = stat.base;
        const bgAccent = hexToRgba(accent, 0.1);
        const borderAccent = hexToRgba(accent, 0.2);

        return (
          <Card
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-kpi-enter cursor-default"
            style={{
              animationDelay: `${index * 60}ms`,
              background: `linear-gradient(135deg, ${stat.tint} 0%, #ffffff 85%)`,
            }}
          >
            <CardContent className="relative p-5">
              {/* ─── Ícono marca de agua (esquina inferior derecha, gigante) ─── */}
              <Icon
                className="absolute -bottom-3 -right-3 h-24 w-24 opacity-[0.06] pointer-events-none transition-all duration-300 group-hover:opacity-[0.09] group-hover:scale-105"
                style={{ color: accent }}
                strokeWidth={1.5}
              />

              {/* ─── Fila superior: badge + ícono chico ─── */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider"
                  style={{
                    color: accent,
                    backgroundColor: stat.soft,
                    borderColor: borderAccent,
                  }}
                >
                  {stat.badge}
                </span>

                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: stat.soft,
                    boxShadow: `0 1px 2px ${hexToRgba(accent, 0.1)}`,
                  }}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    strokeWidth={2.4}
                    style={{ color: accent }}
                  />
                </div>
              </div>

              {/* ─── Label ─── */}
              <p
                className="relative z-10 mt-3 text-[11.5px] font-medium uppercase tracking-wider opacity-70"
                style={{ color: accent }}
              >
                {stat.label}
              </p>

              {/* ─── Valor + porcentaje ─── */}
              <div className="relative z-10 mt-1.5 flex items-baseline gap-2 flex-wrap">
                {loading ? (
                  <Skeleton className="h-9 w-14 rounded-lg" />
                ) : (
                  <p
                    className="text-[28px] font-bold tracking-tight tabular-nums leading-none"
                    style={{ color: accent }}
                  >
                    {stat.value}
                  </p>
                )}
                {stat.percent !== null && !loading && (
                  <span
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums"
                    style={{
                      color: accent,
                      backgroundColor: stat.soft,
                    }}
                  >
                    {stat.percent}%
                  </span>
                )}
              </div>

              {/* ─── Detalle ─── */}
              <div className="relative z-10 mt-3 min-h-5">
                {loading ? (
                  <Skeleton className="h-3 w-32 rounded-md" />
                ) : (
                  <p
                    className="text-[11.5px] font-medium truncate opacity-70"
                    style={{ color: accent }}
                  >
                    {stat.detail}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
