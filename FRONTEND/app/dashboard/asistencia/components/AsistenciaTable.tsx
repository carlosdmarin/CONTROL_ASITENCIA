"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Users, Pencil, FileCheck, Eye, Save, X, FileText, Info, Clock, User, CalendarDays, BadgeCheck, AlertCircle, Edit, EyeOff } from "lucide-react";
import { AsistenciaDiaria, AsistenciaDiariaResponse, normalizeEstadoDia, isTardanza, isAusente } from "@/types/asistencia";
import { asistenciasApi } from "@/lib/api/asistencias";
import { toast } from "sonner";

interface AsistenciaTableProps {
  asistencias: AsistenciaDiaria[];
  rawData?: AsistenciaDiariaResponse[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function AsistenciaTable({ asistencias, rawData = [], loading = false, onRefresh }: AsistenciaTableProps) {
  const [justificarOpen, setJustificarOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const [verOpen, setVerOpen] = useState(false);
  const [selected, setSelected] = useState<AsistenciaDiariaResponse | null>(null);
  const [verData, setVerData] = useState<AsistenciaDiariaResponse | null>(null);
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [tipoJust, setTipoJust] = useState("TARDANZA");
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [saving, setSaving] = useState(false);

  const getEstadoBadge = (estado: string, visual?: string | null, justificado?: boolean | null) => {
    const n = normalizeEstadoDia(estado);
    if (visual === "TARDANZA_JUSTIFICADA") return { label: 'Tardanza justificada', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (visual === "INASISTENCIA_JUSTIFICADA") return { label: 'Inasistencia justificada', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (justificado && n === "TARDANZA") return { label: 'Tardanza justificada', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (justificado && n === "AUSENTE") return { label: 'Inasistencia justificada', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    const config: Record<string, { label: string; className: string }> = {
      'SIN_MARCAR': { label: 'Sin marcar', className: 'bg-slate-100 text-slate-600 border-slate-200' },
      'PRESENTE': { label: 'Presente', className: 'bg-green-50 text-green-700 border-green-200' },
      'TARDANZA': { label: 'Tardanza', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      'AUSENTE': { label: 'Ausente', className: 'bg-red-50 text-red-700 border-red-200' },
      'DESCANSO': { label: 'Descanso', className: 'bg-slate-100 text-slate-600 border-slate-200' },
      'JUSTIFICADO': { label: 'Justificado', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    };
    return config[n] || config[estado] || { label: estado, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const TableSkeleton = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const openJustificar = (idx: number) => {
    const r = rawData[idx];
    if (!r || !r.idAsistencia) {
      toast.error("No se puede justificar: aún no existe registro (SIN_MARCAR). Registre primero o use permiso previo.");
      return;
    }
    if (isJustificado(r)) {
      toast.info("Esta asistencia ya está justificada");
      return;
    }
    setSelected(r);
    setMotivo(r.justificacionMotivo || "");
    setObservacion(r.justificacionObservacion || "");
    const n = normalizeEstadoDia(r.estadoDia);
    if (n === "TARDANZA") setTipoJust("TARDANZA");
    else if (n === "AUSENTE") setTipoJust("INASISTENCIA");
    else setTipoJust("OTRO");
    setJustificarOpen(true);
  };

  const isJustificado = (r: AsistenciaDiariaResponse | undefined) => {
    if (!r) return false;
    return Boolean(r.justificado) || normalizeEstadoDia(r.estadoDia) === "JUSTIFICADO" || r.estadoVisual === "TARDANZA_JUSTIFICADA" || r.estadoVisual === "INASISTENCIA_JUSTIFICADA";
  };
  const hasJustificacion = (r: AsistenciaDiariaResponse | undefined) => {
    if (!r) return false;
    return Boolean(r.justificado) && Boolean(r.justificacionMotivo || r.justificacionTipo || r.justificacionFecha);
  };

  const openEditar = (idx: number) => {
    const r = rawData[idx];
    if (!r) return;
    if (isJustificado(r)) {
      toast.info("No se puede editar una asistencia justificada");
      return;
    }
    setSelected(r);
    setHoraEntrada(r.entradaReal ? r.entradaReal.substring(0,5) : "");
    setHoraSalida(r.salidaReal ? r.salidaReal.substring(0,5) : "");
    setEditarOpen(true);
  };

  const openVer = (idx: number) => {
    const r = rawData[idx];
    if (!r) return;
    setVerData(r);
    setVerOpen(true);
  };

  const handleJustificar = async () => {
    if (!selected?.idAsistencia) return;
    if (!motivo.trim()) { toast.error("El motivo es obligatorio"); return; }
    setSaving(true);
    try {
      await asistenciasApi.justificar(selected.idAsistencia!, motivo, observacion, tipoJust);
      toast.success("Justificación guardada");
      setJustificarOpen(false);
      onRefresh?.();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleEditar = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const fecha = selected.fecha;
      await asistenciasApi.corregirManual(selected.idPracticante, fecha, horaEntrada || null, horaSalida || null);
      toast.success("Corrección guardada, estado recalculado");
      setEditarOpen(false);
      onRefresh?.();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <>
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Registro de Asistencia
          </CardTitle>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {asistencias.length} practicantes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-50/80">
              <TableHead className="font-semibold">#</TableHead>
              <TableHead className="font-semibold ">Practicante</TableHead>
              <TableHead className="font-semibold text-center">Entrada</TableHead>
              <TableHead className="font-semibold text-center">Salida</TableHead>
              <TableHead className="font-semibold text-center">Horas</TableHead>
              <TableHead className="font-semibold text-center">Estado</TableHead>
              <TableHead className="font-semibold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : (
              asistencias.map((asistencia, index) => {
                const raw = rawData[index];
                const estado = getEstadoBadge(asistencia.estado, (raw as any)?.estadoVisual, (raw as any)?.justificado);
                const justificado = isJustificado(raw);
                const puedeJustificar = raw && !justificado && !!raw.idAsistencia;
                const puedeVer = hasJustificacion(raw);
                return (
                  <TableRow key={index} className="hover:bg-slate-50 h-12">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{asistencia.practicante}</TableCell>
                    <TableCell className="text-center font-mono text-sm">{asistencia.entrada || "—"}</TableCell>
                    <TableCell className="text-center font-mono text-sm">{asistencia.salida || "—"}</TableCell>
                    <TableCell className="text-center font-mono text-sm">{asistencia.horas || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={estado.className}>{estado.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={justificado} title={justificado ? "No editable: justificado" : "Editar horas"} onClick={() => openEditar(index)}><Pencil className="h-3 w-3" />Editar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 bg-amber-50 hover:bg-amber-100 disabled:opacity-50" disabled={!puedeJustificar} title={!puedeJustificar ? (justificado ? "Ya justificado" : "Sin registro para justificar") : "Justificar"} onClick={() => openJustificar(index)}><FileCheck className="h-3 w-3" />Justificar</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={!puedeVer} title={!puedeVer ? "Sin justificación" : "Ver justificación"} onClick={() => openVer(index)}><Eye className="h-3 w-3" />Ver</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>

    {/* ============================================================ */}
    {/* DIALOG 1: JUSTIFICAR ASISTENCIA */}
    {/* ============================================================ */}
    <Dialog open={justificarOpen} onOpenChange={setJustificarOpen}>
      <DialogContent className="max-w-lg sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Justificar asistencia</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Registrar una justificación para la asistencia seleccionada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {selected && (
          <div className="space-y-5 pt-1">
            {/* Tarjeta de información del practicante */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                    <User className="h-3 w-3" />
                    Practicante
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selected.nombreCompleto}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                    <CalendarDays className="h-3 w-3" />
                    Fecha
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selected.fecha}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                    <BadgeCheck className="h-3 w-3" />
                    Estado actual
                  </div>
                  <Badge className={getEstadoBadge(selected.estadoDia, selected.estadoVisual, selected.justificado).className}>
                    {getEstadoBadge(selected.estadoDia, selected.estadoVisual, selected.justificado).label}
                  </Badge>
                </div>
                {selected.entradaReal && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      <Clock className="h-3 w-3" />
                      Entrada real
                    </div>
                    <span className="text-sm font-mono font-medium text-slate-800">{selected.entradaReal.substring(0,5)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipo-justificacion" className="text-sm font-medium text-slate-700">Tipo de justificación</Label>
                <Select value={tipoJust} onValueChange={(v:any)=> setTipoJust(v)}>
                  <SelectTrigger id="tipo-justificacion" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TARDANZA">Tardanza</SelectItem>
                    <SelectItem value="INASISTENCIA">Inasistencia</SelectItem>
                    <SelectItem value="PERMISO">Permiso</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motivo-justificacion" className="text-sm font-medium text-slate-700">
                  Motivo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="motivo-justificacion"
                  value={motivo}
                  onChange={e=>setMotivo(e.target.value)}
                  placeholder="Ej: Permiso médico, tráfico, emergencia familiar..."
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="observacion-justificacion" className="text-sm font-medium text-slate-700">Observación</Label>
                <Textarea
                  id="observacion-justificacion"
                  value={observacion}
                  onChange={e=>setObservacion(e.target.value)}
                  placeholder="Detalles adicionales (opcional)"
                  rows={3}
                  className="w-full resize-y min-h-[80px]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={()=>setJustificarOpen(false)}
                className="gap-1.5"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleJustificar}
                disabled={saving || !motivo.trim()}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* ============================================================ */}
    {/* DIALOG 2: CORREGIR MARCACIÓN MANUAL (RH) */}
    {/* ============================================================ */}
    <Dialog open={editarOpen} onOpenChange={setEditarOpen}>
      <DialogContent className="max-w-lg sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 mt-0.5">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-semibold">Corregir marcación manual</DialogTitle>
                <Badge variant="outline" className="text-[10px] font-mono uppercase bg-slate-100 border-slate-200 text-slate-600 px-1.5 py-0">
                  RH
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Modificar entrada/salida. El estado se recalculará automáticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {selected && (
          <div className="space-y-5 pt-1">
            {/* Tarjeta de información */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                    <User className="h-3 w-3" />
                    Practicante
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selected.nombreCompleto}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                    <CalendarDays className="h-3 w-3" />
                    Fecha
                  </div>
                  <span className="text-sm font-medium text-slate-800">{selected.fecha}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                    <Clock className="h-3 w-3" />
                    Horario esperado
                  </div>
                  <div className="flex items-center gap-2 text-sm font-mono font-medium text-slate-800">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selected.entradaEsperada?.substring(0,5) || "—"}
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selected.salidaEsperada?.substring(0,5) || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campos de hora */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Registro de marcación</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hora-entrada" className="text-xs text-slate-500">Hora entrada</Label>
                  <Input
                    id="hora-entrada"
                    type="time"
                    value={horaEntrada}
                    onChange={e=>setHoraEntrada(e.target.value)}
                    className="w-full font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hora-salida" className="text-xs text-slate-500">Hora salida</Label>
                  <Input
                    id="hora-salida"
                    type="time"
                    value={horaSalida}
                    onChange={e=>setHoraSalida(e.target.value)}
                    className="w-full font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="flex items-start gap-2.5 bg-blue-50/70 border border-blue-100 rounded-lg p-3">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Dejar vacío para no registrar. El sistema validará que entrada &lt; salida y recalculará <span className="font-medium text-slate-700">PRESENTE</span> / <span className="font-medium text-amber-600">TARDANZA</span>.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={()=>setEditarOpen(false)}
                className="gap-1.5"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleEditar}
                disabled={saving}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* ============================================================ */}
    {/* DIALOG 3: VER JUSTIFICACIÓN */}
    {/* ============================================================ */}
    <Dialog open={verOpen} onOpenChange={setVerOpen}>
      <DialogContent className="max-w-lg sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Detalle de justificación</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Información de la justificación registrada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {verData ? (
          hasJustificacion(verData) ? (
            <div className="space-y-5 pt-1">
              {/* Identificación del practicante */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      <User className="h-3 w-3" />
                      Practicante
                    </div>
                    <span className="text-sm font-medium text-slate-800">{verData.nombreCompleto}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      <CalendarDays className="h-3 w-3" />
                      Fecha
                    </div>
                    <span className="text-sm font-medium text-slate-800">{verData.fecha}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                      <BadgeCheck className="h-3 w-3" />
                      Estado
                    </div>
                    <Badge className={getEstadoBadge(verData.estadoDia, verData.estadoVisual, verData.justificado).className}>
                      {getEstadoBadge(verData.estadoDia, verData.estadoVisual, verData.justificado).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Información de la justificación */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Tipo</div>
                    <span className="text-sm font-medium text-slate-800">{verData.justificacionTipo || "—"}</span>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Fecha de justificación</div>
                    <span className="text-sm font-medium text-slate-800">
                      {verData.justificacionFecha ? new Date(verData.justificacionFecha).toLocaleString("es-PE") : "—"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Motivo</div>
                  <span className="text-sm font-medium text-slate-800">{verData.justificacionMotivo || "—"}</span>
                </div>

                {verData.justificacionObservacion && (
                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Observaciones</div>
                    <span className="text-sm text-slate-700">{verData.justificacionObservacion}</span>
                  </div>
                )}
              </div>

              {/* Registro de marcación */}
              {(verData.entradaReal || verData.salidaReal) && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                    <Clock className="h-3 w-3" />
                    Registro de marcación
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs">Entrada real</span>
                      <span className="font-mono font-medium text-slate-800 block">{verData.entradaReal?.substring(0,5) || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Salida real</span>
                      <span className="font-mono font-medium text-slate-800 block">{verData.salidaReal?.substring(0,5) || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={()=>setVerOpen(false)}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                <EyeOff className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500">No existe justificación para esta asistencia.</p>
            </div>
          )
        ) : (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">Sin datos disponibles.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}