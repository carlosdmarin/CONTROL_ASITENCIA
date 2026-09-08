"use client";

// ============================
// 📦 IMPORTS
// ============================

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Coffee,
} from "lucide-react";
import { ResumenAsistencia } from "@/types/asistencia";

// ============================
// 🧩 PROPS
// ============================

interface AsistenciaStatsProps {
  resumen: ResumenAsistencia;
  loading?: boolean;
}

// ============================
// 🎨 COLORES DEL SISTEMA
// ============================

const COLORS = {
  total: "#475569",
  presentes: "#227DC3",
  tardanzas: "#CC8033",
  ausentes: "#B82E5C",
  descansos: "#94A3B8",
} as const;

// ============================
// 🛠️ HELPERS
// ============================

function porcentaje(valor: number, total: number): string {
  if (!total || total <= 0) {
    return "Sin registros";
  }

  return `${Math.round((valor / total) * 100)}% del total`;
}

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ============================
// 📊 COMPONENTE
// ============================

export default function AsistenciaStats({
  resumen,
  loading = false,
}: AsistenciaStatsProps) {
  const stats = [
    {
      label: "Total Practicantes",
      badge: "PERSONAL",
      value: resumen.total,
      icon: Users,
      color: COLORS.total,
      detail:
        resumen.total > 0
          ? `${resumen.total} practicantes registrados`
          : "Sin practicantes registrados",
    },
    {
      label: "Presentes",
      badge: "ASISTENCIA",
      value: resumen.presentes,
      icon: UserCheck,
      color: COLORS.presentes,
      detail: porcentaje(resumen.presentes, resumen.total),
    },
    {
      label: "Tardanzas",
      badge: "INCIDENCIA",
      value: resumen.tardanzas,
      icon: Clock,
      color: COLORS.tardanzas,
      detail: porcentaje(resumen.tardanzas, resumen.total),
    },
    {
      label: "Ausentes",
      badge: "INCIDENCIA",
      value: resumen.ausentes || 0,
      icon: UserX,
      color: COLORS.ausentes,
      detail: porcentaje(resumen.ausentes || 0, resumen.total),
    },
    {
      label: "Descansos",
      badge: "JORNADA",
      value: resumen.descansos || 0,
      icon: Coffee,
      color: COLORS.descansos,
      detail: porcentaje(resumen.descansos || 0, resumen.total),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-lg
            "
          >
            {/* ============================
                LÍNEA DE ACENTO
                ============================ */}

            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{
                backgroundColor: stat.color,
              }}
            />

            <CardContent className="p-5">
              {/* ============================
                  HEADER
                  ============================ */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* Badge */}

                  <span
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      tracking-wider
                    "
                    style={{
                      color: stat.color,
                      backgroundColor: hexToRgba(stat.color, 0.08),
                      borderColor: hexToRgba(stat.color, 0.18),
                    }}
                  >
                    {stat.badge}
                  </span>

                  {/* Título */}

                  <p className="mt-2.5 text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                </div>

                {/* ============================
                    ICONO
                    ============================ */}

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    transition-transform
                    duration-200
                    group-hover:scale-[1.03]
                  "
                  style={{
                    backgroundColor: hexToRgba(stat.color, 0.09),
                    borderColor: hexToRgba(stat.color, 0.16),
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                    style={{
                      color: stat.color,
                    }}
                  />
                </div>
              </div>

              {/* ============================
                  VALOR PRINCIPAL
                  ============================ */}

              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-10 w-16 rounded-lg" />
                ) : (
                  <p
                    className="
                      text-3xl
                      font-semibold
                      tracking-tight
                      tabular-nums
                    "
                    style={{
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </p>
                )}
              </div>

              {/* ============================
                  FOOTER / METADATA
                  ============================ */}

              <div className="mt-3 min-h-5">
                {loading ? (
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                ) : (
                  <p className="text-xs text-slate-500">
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

