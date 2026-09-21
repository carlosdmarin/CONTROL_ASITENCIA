"use client";

import { ReporteSemanalResponse } from "@/types/reporte";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  if (n === "TARDANZA") return "bg-amber-50 text-amber-700 border-amber-200";
  if (n === "AUSENTE") return "bg-red-50 text-red-700 border-red-200";
  if (n === "DESCANSO") return "bg-slate-100 text-slate-700 border-slate-200";
  if (n === "JUSTIFICADO") return "bg-blue-50 text-blue-700 border-blue-200";
  if (n === "SIN_MARCAR") return "bg-slate-50 text-slate-500 border-slate-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
}
function getSituacionLabel(s?: string | null) {
  if (!s || s === "NINGUNA") return "—";
  if (s === "TARDANZA_JUSTIFICADA") return "Tardanza justificada";
  if (s === "SALIDA_ANTICIPADA_JUSTIFICADA") return "Salida anticipada justificada";
  if (s === "INASISTENCIA_JUSTIFICADA") return "Inasistencia justificada";
  return s;
}

export function ReporteSemanalView({ reporte }: { reporte: ReporteSemanalResponse }) {
  const p = reporte.practicante;
  const r = reporte.resumen;
  const fechaGen = reporte.fechaGeneracion
    ? new Date(reporte.fechaGeneracion).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleString("es-ES");

  const balanceText = (() => {
    if (r.estadoBalance === "FALTANTES") return `Horas faltantes: ${formatHoras(r.horasFaltantes)}`;
    if (r.estadoBalance === "ADICIONALES") return `Horas adicionales: ${formatHoras(r.horasAdicionales)}`;
    return "Jornada cumplida";
  })();
  const balanceColor = r.estadoBalance === "FALTANTES" ? "text-red-600" : r.estadoBalance === "ADICIONALES" ? "text-green-600" : "text-slate-700";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-5xl mx-auto">
      {/* Cabecera - idéntica a ReporteDiarioView */}
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
          <p className="text-sm font-bold tracking-tight text-slate-900">REPORTE SEMANAL DE ASISTENCIA</p>
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
                  <span className="text-xs font-medium text-slate-900">{p.nombreOficina || (p as any).oficina || "—"}</span>
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
                  <span className="text-xs font-medium text-slate-900">{(p as any).tipoInstituto || "—"}</span>
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

        {/* Período */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">PERIODO DEL REPORTE</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-slate-50 capitalize">{reporte.semanaLabel}</Badge>
            <Badge variant="outline" className="bg-slate-50">Tipo: Semanal</Badge>
            <Badge variant="outline" className="bg-slate-50">Lunes-Sábado</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">{formatFechaLarga(reporte.semanaInicio)} → {formatFechaLarga(reporte.semanaFin)}</p>
        </div>

        {/* Resumen semanal */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">RESUMEN SEMANAL</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Días programados</p>
                <p className="text-lg font-bold text-slate-900">{r.diasProgramados}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Días trabajados</p>
                <p className="text-lg font-bold text-slate-900">{r.diasTrabajados}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Presentes</p>
                <p className="text-lg font-bold text-green-700">{r.diasPresentes}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Tardanzas</p>
                <p className="text-lg font-bold text-amber-600">{r.tardanzas}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Ausencias</p>
                <p className="text-lg font-bold text-red-600">{r.ausencias}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Justificaciones</p>
                <p className="text-lg font-bold text-blue-600">{r.justificaciones}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Descansos</p>
                <p className="text-lg font-bold text-slate-600">{r.descansos}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Cumplimiento</p>
                <p className="text-lg font-bold text-slate-900">{Number(r.porcentajeCumplimiento).toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Balance de horas */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">BALANCE DE HORAS</h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Programadas</p>
                <p className="text-sm font-bold text-slate-900">{formatHoras(r.horasProgramadas)}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Trabajadas</p>
                <p className="text-sm font-bold text-slate-900">{formatHoras(r.horasTrabajadas)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Balance</p>
                <p className={`text-sm font-bold ${balanceColor}`}>{balanceText}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-900">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-slate-300 uppercase">Cumplimiento</p>
                <p className="text-sm font-bold text-white">{Number(r.porcentajeCumplimiento).toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detalle diario */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">DETALLE DIARIO (LUNES-SÁBADO)</h3>
          <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-9 bg-slate-900 text-white text-[10px] uppercase tracking-wider text-center">
                <div className="p-2 border-r border-slate-700">Día</div>
                <div className="p-2 border-r border-slate-700">Fecha</div>
                <div className="p-2 border-r border-slate-700">Entrada prog.</div>
                <div className="p-2 border-r border-slate-700">Entrada real</div>
                <div className="p-2 border-r border-slate-700">Salida prog.</div>
                <div className="p-2 border-r border-slate-700">Salida real</div>
                <div className="p-2 border-r border-slate-700">Estado</div>
                <div className="p-2 border-r border-slate-700">Situación</div>
                <div className="p-2">Horas</div>
              </div>
              {reporte.detalleDiario.map((d) => (
                <div key={d.fecha} className="grid grid-cols-9 text-center text-xs divide-x divide-slate-200 border-t border-slate-200">
                  <div className="p-2 font-medium text-slate-900">{d.diaSemana}</div>
                  <div className="p-2 font-mono text-slate-600 text-[11px]">{d.fecha}</div>
                  <div className="p-2 font-mono text-slate-600">{d.esDescanso ? "—" : formatHora(d.horaInicio)}</div>
                  <div className="p-2 font-mono text-slate-900">{d.esDescanso ? "—" : formatHora(d.asistencia?.entradaReal)}</div>
                  <div className="p-2 font-mono text-slate-600">{d.esDescanso ? "—" : formatHora(d.horaFin)}</div>
                  <div className="p-2 font-mono text-slate-900">{d.esDescanso ? "—" : formatHora(d.asistencia?.salidaReal)}</div>
                  <div className="p-1 flex justify-center items-center">
                    <Badge className={`${estadoColor(d.estado)} border text-[10px] h-5`}>{d.estado}</Badge>
                  </div>
                  <div className="p-2 text-slate-600 text-[11px]">{getSituacionLabel(d.situacion)}</div>
                  <div className="p-2 font-medium text-slate-900">{d.esDescanso ? "—" : formatHoras(d.horasTrabajadas)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidencias */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest text-slate-500">INCIDENCIAS SEMANALES</h3>
          {reporte.incidencias && reporte.incidencias.length > 0 ? (
            <div className="mt-2 p-3 rounded-lg border border-amber-200 bg-amber-50 space-y-1">
              {reporte.incidencias.map((inc, i) => (
                <p key={i} className="text-xs text-slate-700">• {inc}</p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400 italic">Sin incidencias relevantes.</p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between text-[8px] text-slate-400">
          <span>PractiQR • Sistema de Control de Asistencia • OLAMSA</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
