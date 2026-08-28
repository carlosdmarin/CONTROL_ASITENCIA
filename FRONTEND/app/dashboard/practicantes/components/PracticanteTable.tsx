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
import { Pencil, Trash2, Search, Users, MoreHorizontal, ClipboardList, QrCode } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Practicante } from "@/types/practicante";

interface PracticanteTableProps {
  practicantes: Practicante[];
  onEdit: (practicante: Practicante) => void;
  onDelete: (practicante: Practicante) => void;
  onShowQR?: (practicante: Practicante) => void;
  getStatusColor: (status: string) => string;
  busqueda: string;
  loading?: boolean;
}

// Función para generar iniciales
const getInitials = (nombreCompleto: string) => {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
};

// Skeletons para filas de la tabla
const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
      </TableRow>
    ))}
  </>
);

export function PracticanteTable({
  practicantes,
  onEdit,
  onDelete,
  onShowQR,
  getStatusColor,
  busqueda,
  loading = false,
}: PracticanteTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Lista de practicantes
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {practicantes.length} practicantes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-50/80">
                <TableHead className="font-semibold">Nombre completo</TableHead>
                <TableHead className="font-semibold">Documento</TableHead>
                <TableHead className="font-semibold">Sede</TableHead>
                <TableHead className="font-semibold">Cargo</TableHead>
                <TableHead className="font-semibold text-center">Horas</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
                <TableHead className="font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : practicantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {busqueda ? (
                        <>
                          <Search className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">
                            No se encontraron practicantes
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Intenta con otro término de búsqueda
                          </p>
                        </>
                      ) : (
                        <>
                          <Users className="h-10 w-10 text-gray-500 mb-3" />
                          <p className="text-sm font-medium text-gray-400">
                            No hay practicantes registrados
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Comienza creando tu primer practicante
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                practicantes.map((practicante) => (
                  <TableRow key={practicante.idPracticante} className="hover:bg-slate-50 h-12">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 text-xs font-medium">
                          <AvatarFallback className="text-blue-700 bg-blue-200">
                            {getInitials(practicante.nombreCompleto)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{practicante.nombreCompleto}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{practicante.documento}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-black border-purple-200"
                      >
                        {practicante.sede || (practicante as any).agencia}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {practicante.cargo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 text-center">
                      {practicante.horasSemanalesRequeridas}h
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(practicante.situacion)}>
                        {practicante.situacion}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onShowQR && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            onClick={() => onShowQR(practicante)}
                            title="Ver QR"
                          >
                            <QrCode className="h-4 w-4" />
                            <span className="sr-only">QR</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => onEdit(practicante)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(practicante)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Más acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {onShowQR && (
                                <DropdownMenuItem onClick={() => onShowQR(practicante)}>
                                  <QrCode className="h-4 w-4 mr-2" /> Ver QR
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem>Historial</DropdownMenuItem>
                              <DropdownMenuItem>Reportes</DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
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