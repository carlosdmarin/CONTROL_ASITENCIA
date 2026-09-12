"use client";

import { ReporteDiarioResponse } from "@/types/reporte";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

function formatHora(hora?: string | null) {
  if (!hora) return "—";
  return hora.substring(0, 5);
}

function formatHoras(num?: number | null) {
  if (num == null) return "—";
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatFechaLarga(fechaStr: string) {
  try {
    const d = new Date(fechaStr + "T00:00:00");
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return fechaStr;
  }
}

function getInitials(nombre: string) {
  if (!nombre) return "?";
  const p = nombre.split(" ");
  return p.length >= 2 ? p[0][0] + p[1][0] : nombre[0];
}

function estadoColor(estado?: string | null) {
  const n = (estado || "").toUpperCase();
  if (n === "PRESENTE") return "bg-green-50 text-green-700 border-green-200";
  if (n === "TARDANZA" || n === "TARDE") return "bg-amber-50 text-amber-700 border-amber-200";
  if (n === "AUSENTE" || n === "FALTA") return "bg-red-50 text-red-700 border-red-200";
  if (n === "DESCANSO") return "bg-slate-100 text-slate-700 border-slate-200";
  if (n === "JUSTIFICADO") return "bg-blue-50 text-blue-700 border-blue-200";
  if (n === "SIN_MARCAR") return "bg-slate-50 text-slate-500 border-slate-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
}

export function ReporteDiarioView({ reporte }: { reporte: ReporteDiarioResponse }) {
  const p = reporte.practicante;
  const a = reporte.asistencia;
  const fechaGen = reporte.fechaGeneracion
    ? new Date(reporte.fechaGeneracion).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleString("es-ES");

  const horasTrabajadas = a?.horasTrabajadas ?? 0;
  const horasEsperadas = reporte.horasEsperadas ?? 0;
  const horasExtra = reporte.horasExtra ?? 0;
  const tardanza = a?.minutosTardanza ?? 0;

  const hasSituacion = a && (a.justificado || (a.situacion && a.situacion !== "NINGUNA") || (a.situacionesDetalle && a.situacionesDetalle.length > 0));
  const hasObservaciones = !!(a?.observaciones && a.observaciones.trim());

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <img src="/images/LOGO-C1.png" alt="OLAMSA" className="h-20 w-auto object-contain" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          <div className="hidden sm:block w-px h-10 bg-slate-200" />
          <div>
            <p className="text-[11px] font-bold tracking-widest text-slate-900">OLAMSA</p>
            <p className="text-[11px] text-slate-500 -mt-0.5">PractiQR</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tracking-tight text-slate-900">REPORTE DIARIO DE ASISTENCIA</p>
          <p className="text-xs text-slate-500">Fecha generación: {fechaGen} (America/Lima)</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Datos practicante */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500 bg-slate-50 px-3 py-2 border border-slate-200 rounded-t-lg">DATOS DEL PRACTICANTE</h3>
          <div className="border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">{getInitials(p.nombreCompleto)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Practicante</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{p.nombreCompleto}</p>
                  <p className="text-xs text-slate-500">DNI {p.documento}</p>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500">Área</span>
                  <span className="text-xs font-medium text-slate-900">{p.nombreArea || p.area || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500">Cargo</span>
                  <span className="text-xs font-medium text-slate-900">{p.cargo || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500">Sede</span>
                  <span className="text-xs font-medium text-slate-900">{p.sede || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500">Instituto</span>
                  <span className="text-xs font-medium text-slate-900">{p.tipoInstituto || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500">Estado</span>
                  <Badge variant="outline" className="text-xs h-5">{p.situacion || "—"}</Badge>
                </div>
              </div>
            </div>
            {p.fechaInicioPracticas && (
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                Periodo prácticas: {p.fechaInicioPracticas} {p.fechaFinPracticas ? `— ${p.fechaFinPracticas}` : ""}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Periodo */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">PERIODO DEL REPORTE</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-slate-50">Fecha: {formatFechaLarga(reporte.fecha)}</Badge>
            <Badge variant="outline" className="bg-slate-50">Tipo: Diario</Badge>
            <Badge variant="outline" className="bg-slate-50">Día: {reporte.diaSemana}</Badge>
          </div>
        </div>

        {/* Horario */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">HORARIO PROGRAMADO</h3>
          {reporte.esDescanso ? (
            <div className="mt-2 p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-700">DESCANSO</p>
              <p className="text-xs text-slate-500">Día no laborable</p>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Entrada esperada</p>
                  <p className="text-sm font-bold text-slate-900">{formatHora(reporte.horaInicio)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Salida esperada</p>
                  <p className="text-sm font-bold text-slate-900">{formatHora(reporte.horaFin)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Horas esperadas</p>
                  <p className="text-sm font-bold text-slate-900">{formatHoras(horasEsperadas)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Día</p>
                  <p className="text-sm font-bold text-slate-900">{reporte.diaSemana}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">RESUMEN DE ASISTENCIA</h3>
          <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-6 bg-slate-900 text-white text-[10px] uppercase tracking-wider text-center">
              <div className="p-2 border-r border-slate-700">Estado</div>
              <div className="p-2 border-r border-slate-700">Entrada</div>
              <div className="p-2 border-r border-slate-700">Salida</div>
              <div className="p-2 border-r border-slate-700">Trabajadas</div>
              <div className="p-2 border-r border-slate-700">Tardanza</div>
              <div className="p-2">Extra</div>
            </div>
            <div className="grid grid-cols-6 text-center text-sm divide-x divide-slate-200">
              <div className="p-3 flex justify-center">
                <Badge className={`${estadoColor(a?.estadoDia)} border text-xs`}>{a?.estadoDia || "—"}</Badge>
              </div>
              <div className="p-3 font-mono text-slate-900">{formatHora(a?.entradaReal)}</div>
              <div className="p-3 font-mono text-slate-900">{formatHora(a?.salidaReal)}</div>
              <div className="p-3 font-medium text-slate-900">{formatHoras(horasTrabajadas)}</div>
              <div className="p-3 text-slate-600">{tardanza > 0 ? `${tardanza} min` : "—"}</div>
              <div className="p-3 font-medium text-slate-900">{formatHoras(horasExtra)}</div>
            </div>
          </div>
        </div>

        {/* Situación */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">SITUACIÓN / JUSTIFICACIÓN</h3>
          {!hasSituacion ? (
            <p className="mt-2 text-xs text-slate-400 italic">Sin justificación registrada.</p>
          ) : (
            <div className="mt-2 p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <p className="text-xs"><span className="text-slate-500">Situación:</span> <span className="font-medium text-slate-900">{a?.situacion || "—"}</span></p>
              {a?.justificacionTipo && <p className="text-xs"><span className="text-slate-500">Tipo:</span> {a.justificacionTipo}</p>}
              {a?.justificacionMotivo && <p className="text-xs"><span className="text-slate-500">Motivo:</span> {a.justificacionMotivo}</p>}
              {a?.justificacionObservacion && <p className="text-xs"><span className="text-slate-500">Observación:</span> {a.justificacionObservacion}</p>}
              {a?.situacionesDetalle && a.situacionesDetalle.length > 0 && (
                <div className="text-xs text-slate-600">
                  {a.situacionesDetalle.map((s: any, i: number) => (
                    <div key={i} className="border-t border-slate-200 pt-1 mt-1">
                      {s.tipo} — {s.motivo}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Observaciones */}
        {hasObservaciones && (
          <div>
            <h3 className="text-[11px] font-bold tracking-widest text-slate-500">OBSERVACIONES</h3>
            <div className="mt-2 p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 whitespace-pre-wrap">
              {a.observaciones}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between text-[8px] text-slate-400">
          <span>PractiQR • Sistema de Control de Asistencia • OLAMSA</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
