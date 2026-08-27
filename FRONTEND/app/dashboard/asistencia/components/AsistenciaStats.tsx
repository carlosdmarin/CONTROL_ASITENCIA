"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Clock, UserX, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResumenAsistencia } from "../types";

interface AsistenciaStatsProps {
  resumen: ResumenAsistencia;
  loading?: boolean;
}

export default function AsistenciaStats({ resumen, loading = false }: AsistenciaStatsProps) {
  const stats = [
    {
      label: "Total Practicantes",
      value: resumen.total,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50/50",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      detail: `${resumen.total} Practicantes registrados`,
      trend: "+12%",
      trendUp: true,
      description: "vs mes anterior",
    },
    {
      label: "Presentes",
      value: resumen.presentes,
      icon: UserCheck,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50/50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      detail: `${Math.round((resumen.presentes / resumen.total) * 100)}% del total`,
      trend: "+5%",
      trendUp: true,
      description: "vs mes anterior",
    },
    {
      label: "Tardanzas",
      value: resumen.tardanzas,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50/50",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      detail: `${Math.round((resumen.tardanzas / resumen.total) * 100)}% del total`,
      trend: "-3%",
      trendUp: false,
      description: "vs mes anterior",
    },
    {
      label: "Ausentes",
      value: resumen.ausentes,
      icon: UserX,
      gradient: "from-rose-500 to-red-600",
      bgGradient: "from-rose-50 to-red-50/50",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
      textColor: "text-rose-600",
      detail: `${Math.round((resumen.ausentes / resumen.total) * 100)}% del total`,
      trend: "-8%",
      trendUp: false,
      description: "vs mes anterior",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-0 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 overflow-hidden group"
        >
          {/* Barra de gradiente superior con animación */}
          <div  />
          
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                )}
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
              
              {/* Icono con efecto glassmorphism */}
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110`} />
                <div className={`relative p-2.5 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            
            {/* Detalle con tendencia */}
            <div className="mt-3 flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-3 w-32" />
              ) : (
                <p className="text-xs text-gray-500">{stat.detail}</p>
              )}
              
              {!loading && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  stat.trendUp 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.trend}
                </div>
              )}
            </div>

            {/* Barra de progreso con gradiente */}
            {!loading && (
              <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out group-hover:opacity-80`}
                  style={{ 
                    width: `${Math.min((stat.value / stats[0].value) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}