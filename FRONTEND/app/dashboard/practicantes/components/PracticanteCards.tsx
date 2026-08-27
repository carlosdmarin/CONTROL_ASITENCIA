"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Briefcase } from "lucide-react";
import { Practicante } from "@/types/practicante";

interface PracticanteCardsProps {
  practicantes: Practicante[];
}

export default function PracticanteCards({ practicantes }: PracticanteCardsProps) {
  const total = practicantes.length;
  const activos = practicantes.filter((p) => p.situacion === "ACTIVO").length;
  const inactivos = practicantes.filter((p) => p.situacion === "INACTIVO").length;

  // Obtener cargos únicos
  const cargosUnicos = new Set(practicantes.map((p) => p.cargo));
  const totalCargos = cargosUnicos.size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Users className="h-4 w-4" /> Total practicantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-purple-600">{total}</p>
          <p className="text-xs text-gray-400 mt-1">Practicantes registrados</p>
        </CardContent>
      </Card>

      <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <UserCheck className="h-4 w-4" /> Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{activos}</p>
          <p className="text-xs text-gray-400 mt-1">
            {total > 0 ? Math.round((activos / total) * 100) : 0}% del total
          </p>
        </CardContent>
      </Card>

      <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <UserX className="h-4 w-4" /> Inactivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{inactivos}</p>
          <p className="text-xs text-gray-400 mt-1">
            {total > 0 ? Math.round((inactivos / total) * 100) : 0}% del total
          </p>
        </CardContent>
      </Card>

      <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Briefcase className="h-4 w-4" /> Cargos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalCargos}</p>
          <p className="text-xs text-gray-400 mt-1">Cargos diferentes</p>
        </CardContent>
      </Card>
    </div>
  );
}