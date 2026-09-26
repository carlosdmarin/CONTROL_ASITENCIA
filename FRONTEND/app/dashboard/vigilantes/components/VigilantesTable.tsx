"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList,
  Users,
  MapPin,
  Search,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export type VigilanteMock = {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  usuario: string;
  sede: string;
  estado: "ACTIVO" | "INACTIVO";
};

interface VigilantesTableProps {
  vigilantes: VigilanteMock[];
  loading?: boolean;
  busqueda?: string;
  onChangePassword: (vigilante: VigilanteMock) => void;
  onCreate?: () => void;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-slate-100 text-slate-700 border-slate-200",
];

function getInitials(nombreCompleto: string) {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
}

function getAvatarColor(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const TableSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell className="text-center">
          <Skeleton className="h-4 w-6 mx-auto" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20 mx-auto" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24 mx-auto" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-6 w-16 mx-auto rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

export default function VigilantesTable({
  vigilantes,
  loading = false,
  busqueda = "",
  onChangePassword,
  onCreate,
}: VigilantesTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Lista de vigilantes
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {vigilantes.length} vigilantes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider w-10 text-center">
                  #
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider min-w-[200px]">
                  Vigilante
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  Usuario
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                  Sede
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-center">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : vigilantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center px-4 py-6">
                      {busqueda ? (
                        <>
                          <Search className="h-10 w-10 text-gray-400 mb-3" />
                          <p className="text-sm font-medium text-gray-500">
                            No se encontraron vigilantes
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Intenta con otro término de búsqueda
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-slate-100 rounded-full mb-3">
                            <ShieldCheck className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">
                            No hay vigilantes registrados
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Los usuarios creados para el control de asistencia aparecerán aquí.
                          </p>
                          {onCreate && (
                            <Button
                              className="mt-4 gap-2 bg-blue-700 hover:bg-blue-800"
                              onClick={onCreate}
                            >
                              <Users className="h-4 w-4" />
                              Crear vigilante
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vigilantes.map((v, index) => (
                  <TableRow
                    key={v.id}
                    className="hover:bg-slate-50 h-14 transition-colors duration-150"
                  >
                    <TableCell className="text-center text-xs text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 text-xs font-medium border">
                          <AvatarFallback className={getAvatarColor(v.id, v.nombreCompleto)}>
                            {getInitials(v.nombreCompleto)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                          {v.nombreCompleto}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                        {v.usuario}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {v.sede}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {v.estado === "ACTIVO" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 border-emerald-200 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-100 border-slate-200 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                onClick={() => onChangePassword(v)}
                                aria-label={`Cambiar contraseña de ${v.usuario}`}
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent className="bg-slate-900 text-white">
                            <p>Cambiar contraseña</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
