"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Briefcase,
  MapPin,
  CalendarDays,
  ClockArrowUp,
  ClockArrowDown,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Marcacion {
  id: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  tipo: "ENTRADA" | "SALIDA";
  estado: "EXITOSO" | "FALLIDO";
  sede: string;
  cargo: string;
  area: string;
  totalHoras?: string;
}

interface HistorialProps {
  onBack?: () => void;
}

// Datos de mentira
const MARCACIONES: Marcacion[] = [
  {
    id: "1",
    fecha: "2026-09-02",
    horaEntrada: "07:30",
    horaSalida: "17:00",
    tipo: "ENTRADA",
    estado: "EXITOSO",
    sede: "OFICINA PUCALLPA",
    cargo: "PRACTICANTE PROFESIONAL",
    area: "Tecnología de la Información",
    totalHoras: "9h 30min",
  },
  {
    id: "2",
    fecha: "2026-09-02",
    horaEntrada: "07:30",
    horaSalida: "17:00",
    tipo: "SALIDA",
    estado: "EXITOSO",
    sede: "OFICINA PUCALLPA",
    cargo: "PRACTICANTE PROFESIONAL",
    area: "Tecnología de la Información",
    totalHoras: "9h 30min",
  },
  {
    id: "3",
    fecha: "2026-09-01",
    horaEntrada: "07:45",
    horaSalida: "17:15",
    tipo: "ENTRADA",
    estado: "EXITOSO",
    sede: "OFICINA PUCALLPA",
    cargo: "PRACTICANTE PROFESIONAL",
    area: "Tecnología de la Información",
    totalHoras: "9h 30min",
  },
  {
    id: "4",
    fecha: "2026-09-01",
    horaEntrada: "07:45",
    horaSalida: "17:15",
    tipo: "SALIDA",
    estado: "EXITOSO",
    sede: "OFICINA PUCALLPA",
    cargo: "PRACTICANTE PROFESIONAL",
    area: "Tecnología de la Información",
    totalHoras: "9h 30min",
  },
  {
    id: "5",
    fecha: "2026-08-31",
    horaEntrada: "08:00",
    horaSalida: "16:00",
    tipo: "ENTRADA",
    estado: "EXITOSO",
    sede: "PLANTA NESHUYA",
    cargo: "PRACTICANTE PRE PROFESIONAL",
    area: "Mantenimiento",
    totalHoras: "8h 00min",
  },
  {
    id: "6",
    fecha: "2026-08-31",
    horaEntrada: "08:00",
    horaSalida: "16:00",
    tipo: "SALIDA",
    estado: "EXITOSO",
    sede: "PLANTA NESHUYA",
    cargo: "PRACTICANTE PRE PROFESIONAL",
    area: "Mantenimiento",
    totalHoras: "8h 00min",
  },
  {
    id: "7",
    fecha: "2026-08-30",
    horaEntrada: "07:30",
    horaSalida: "17:00",
    tipo: "ENTRADA",
    estado: "FALLIDO",
    sede: "OFICINA PUCALLPA",
    cargo: "PRACTICANTE PROFESIONAL",
    area: "Recursos Humanos",
    totalHoras: "0h 00min",
  },
  {
    id: "8",
    fecha: "2026-08-29",
    horaEntrada: "07:30",
    horaSalida: "17:00",
    tipo: "ENTRADA",
    estado: "EXITOSO",
    sede: "PLANTA CAMPOVERDE",
    cargo: "PRACTICANTE PRE PROFESIONAL",
    area: "Logística",
    totalHoras: "9h 30min",
  },
  {
    id: "9",
    fecha: "2026-08-29",
    horaEntrada: "07:30",
    horaSalida: "17:00",
    tipo: "SALIDA",
    estado: "EXITOSO",
    sede: "PLANTA CAMPOVERDE",
    cargo: "PRACTICANTE PRE PROFESIONAL",
    area: "Logística",
    totalHoras: "9h 30min",
  },
  {
    id: "10",
    fecha: "2026-08-28",
    horaEntrada: "08:15",
    horaSalida: "16:30",
    tipo: "ENTRADA",
    estado: "EXITOSO",
    sede: "OFICINA PUCALLPA",
    cargo: "PRACTICANTE PROFESIONAL",
    area: "Tecnología de la Información",
    totalHoras: "8h 15min",
  },
];

// Resumen de estadísticas
const ESTADISTICAS = {
  total: 10,
  exitosas: 9,
  fallidas: 1,
  horasTotales: "86h 45min",
  promedioDiario: "8h 40min",
  sedePrincipal: "OFICINA PUCALLPA",
};

export default function Historial({ onBack }: HistorialProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("TODOS");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [selectedMarcacion, setSelectedMarcacion] = useState<Marcacion | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar datos
  const filteredData = MARCACIONES.filter((item) => {
    const matchesSearch =
      item.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fecha.includes(searchTerm);

    const matchesTipo = filterTipo === "TODOS" || item.tipo === filterTipo;
    const matchesEstado =
      filterEstado === "TODOS" || item.estado === filterEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER - Responsive */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1 sm:gap-2 shrink-0 px-2 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Volver</span>
            </Button>
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                Mi Historial
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden xs:block">
                Registro de todas tus marcaciones
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="gap-1 text-xs sm:text-sm shrink-0"
          >
            <User className="h-3 w-3" />
            <span className="hidden xs:inline">Carlos Ramírez</span>
            <span className="xs:hidden">CR</span>
          </Badge>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* TARJETAS DE ESTADÍSTICAS - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold">
                      {ESTADISTICAS.total}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      Total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {ESTADISTICAS.exitosas}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      Exitosas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg shrink-0">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-red-600">
                      {ESTADISTICAS.fallidas}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      Fallidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg shrink-0">
                    <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-2xl font-bold truncate">
                      {ESTADISTICAS.horasTotales}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      Horas totales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FILTROS - Responsive */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 sm:h-10 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={filterTipo} onValueChange={(v) => setFilterTipo(v ?? "TODOS")}>
                    <SelectTrigger className="w-[100px] sm:w-[130px] h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="ENTRADA">Entrada</SelectItem>
                      <SelectItem value="SALIDA">Salida</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterEstado} onValueChange={(v) => setFilterEstado(v ?? "TODOS")}>
                    <SelectTrigger className="w-[100px] sm:w-[130px] h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="EXITOSO">Exitoso</SelectItem>
                      <SelectItem value="FALLIDO">Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TABLA - Responsive con scroll horizontal */}

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Sede</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-slate-300" />
                          <p className="text-sm text-slate-500">
                            No se encontraron marcaciones
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-xs text-slate-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.fecha}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <ClockArrowUp className="h-3.5 w-3.5 text-green-600" />
                            <span>{item.horaEntrada}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <ClockArrowDown className="h-3.5 w-3.5 text-blue-600" />
                            <span>{item.horaSalida}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.tipo === "ENTRADA" ? "default" : "secondary"
                            }
                            className={
                              item.tipo === "ENTRADA"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            }
                          >
                            {item.tipo === "ENTRADA" ? (
                              <ClockArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ClockArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {item.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.estado === "EXITOSO"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : "border-red-200 text-red-700 bg-red-50"
                            }
                          >
                            {item.estado === "EXITOSO" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {item.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm">{item.sede}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMarcacion(item);
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* PAGINACIÓN - Responsive */}
          {totalPages > 1 && (
            <div className="flex flex-col xs:flex-row items-center gap-2 xs:gap-0 justify-between">
              <p className="text-xs sm:text-sm text-slate-500 order-2 xs:order-1">
                Mostrando {paginatedData.length} de {filteredData.length}{" "}
                registros
              </p>
              <div className="flex gap-0.5 sm:gap-1 order-1 xs:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm ${
                        currentPage === pageNum
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="flex items-center text-xs text-slate-400 px-0.5">
                      …
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG DE DETALLE - Responsive */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md mx-2 sm:mx-0 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Detalle de Marcación
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Información completa de la marcación seleccionada
            </DialogDescription>
          </DialogHeader>

          {selectedMarcacion && (
            <div className="space-y-3 sm:space-y-4">
              {/* Avatar y nombre */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-blue-200">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm sm:text-lg">
                    {getInitials("Carlos Ramírez")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                    Carlos Ramírez Torres
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Documento: 60563764
                  </p>
                </div>
              </div>

              <Separator />

              {/* Grid de información */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500">Fecha</p>
                  <p className="font-medium flex items-center gap-1 truncate">
                    <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                    {selectedMarcacion.fecha}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500">Tipo</p>
                  <Badge
                    variant={
                      selectedMarcacion.tipo === "ENTRADA"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      selectedMarcacion.tipo === "ENTRADA"
                        ? "bg-blue-100 text-blue-700 text-[10px] sm:text-xs"
                        : "bg-amber-100 text-amber-700 text-[10px] sm:text-xs"
                    }
                  >
                    {selectedMarcacion.tipo === "ENTRADA" ? (
                      <ClockArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    ) : (
                      <ClockArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    )}
                    {selectedMarcacion.tipo}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Hora Entrada
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <ClockArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 shrink-0" />
                    {selectedMarcacion.horaEntrada}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Hora Salida
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <ClockArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 shrink-0" />
                    {selectedMarcacion.horaSalida}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Estado
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      selectedMarcacion.estado === "EXITOSO"
                        ? "border-green-200 text-green-700 bg-green-50 text-[10px] sm:text-xs"
                        : "border-red-200 text-red-700 bg-red-50 text-[10px] sm:text-xs"
                    }
                  >
                    {selectedMarcacion.estado === "EXITOSO" ? (
                      <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    ) : (
                      <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    )}
                    {selectedMarcacion.estado}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Total Horas
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 shrink-0" />
                    {selectedMarcacion.totalHoras || "—"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sede</span>
                  <span className="font-medium flex items-center gap-1 truncate ml-2">
                    <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                    {selectedMarcacion.sede}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Área</span>
                  <span className="font-medium flex items-center gap-1 truncate ml-2">
                    <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                    {selectedMarcacion.area}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cargo</span>
                  <span className="font-medium truncate ml-2">
                    {selectedMarcacion.cargo}
                  </span>
                </div>
              </div>

              <Button className="w-full" onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
