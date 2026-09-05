"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaStats from "./components/AsistenciaStats";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";
import { asistenciasApi } from "@/lib/api/asistencias";
import { practicantesApi } from "@/lib/api/practicantes";
import { AsistenciaDiaria, AsistenciaDiariaResponse, normalizeEstadoDia, isTardanza, isAusente } from "@/types/asistencia";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatFechaISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatHoras(horas: number | null | undefined): string | null {
  if (horas == null || horas === 0) return null;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  return `${h}h ${m}m`;
}

function mapEstado(estadoDia: AsistenciaDiariaResponse["estadoDia"]): AsistenciaDiaria["estado"] {
  switch (estadoDia) {
    case "SIN_MARCAR": return "SIN_MARCAR";
    case "PRESENTE": return "PRESENTE";
    case "TARDE":
    case "TARDANZA": return "TARDANZA";
    case "FALTA":
    case "AUSENTE": return "AUSENTE";
    case "DESCANSO": return "DESCANSO";
    case "JUSTIFICADO": return "JUSTIFICADO";
    default: {
      const _exhaustiveCheck: never = estadoDia;
      void _exhaustiveCheck;
      return "AUSENTE";
    }
  }
}

export default function AsistenciaPage() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [asistencias, setAsistencias] = useState<AsistenciaDiariaResponse[]>([]);
  const [resumen, setResumen] = useState({ 
    total: 0, 
    presentes: 0, 
    tardanzas: 0, 
    ausentes: 0,
    descansos: 0 
  });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [permisoOpen, setPermisoOpen] = useState(false);
  const [permisoFecha, setPermisoFecha] = useState(formatFechaISO(new Date()));
  const [permisoMotivo, setPermisoMotivo] = useState("");
  const [permisoObs, setPermisoObs] = useState("");
  const [permisoTipo, setPermisoTipo] = useState("PERSONAL");
  const [permisoPracticante, setPermisoPracticante] = useState("");
  const [practicantes, setPracticantes] = useState<any[]>([]);

  const fechaISO = formatFechaISO(fecha);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await asistenciasApi.getAsistenciasDelDia(fechaISO).catch(() => [] as AsistenciaDiariaResponse[]);
      const dataArray: AsistenciaDiariaResponse[] = Array.isArray(data) ? data : [];
      setAsistencias(dataArray);
      const total = dataArray.length;
      const presentes = dataArray.filter((a) => a.estadoDia === "PRESENTE" || isTardanza(a.estadoDia)).length;
      const tardanzas = dataArray.filter((a) => isTardanza(a.estadoDia)).length;
      const descansos = dataArray.filter((a) => a.estadoDia === "DESCANSO").length;
      const ausentes = dataArray.filter((a) => isAusente(a.estadoDia)).length;
      // también contar SIN_MARCAR separado pero para resumen lo agrupamos
      setResumen({ total, presentes, tardanzas, ausentes, descansos });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cargar asistencias";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaISO]);

  const handlePrev = () => setFecha((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const handleNext = () => setFecha((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const handleFechaChange = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    setFecha(new Date(y, m - 1, d));
  };

  // Mapear backend -> UI para tabla
  const asistenciasUI = useMemo(() => {
    return asistencias.map((a) => ({
      id: a.idAsistencia || a.idPracticante,
      practicante: a.nombreCompleto,
      entrada: a.entradaReal ? a.entradaReal.substring(0, 5) : null,
      salida: a.salidaReal ? a.salidaReal.substring(0, 5) : null,
      horas: formatHoras(a.horasTrabajadas),
      estado: mapEstado(a.estadoDia),
    }));
  }, [asistencias]);

  // Filtros en memoria (sin filtro por área)
  const filtradasIndices = useMemo(() => {
    return asistenciasUI.map((a, idx) => ({...a, _idx: idx})).filter((a) => {
      const matchBusqueda = !busqueda || a.practicante.toLowerCase().includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === "todos" || a.estado.toLowerCase() === filtroEstado.toLowerCase();
      return matchBusqueda && matchEstado;
    });
  }, [asistenciasUI, busqueda, filtroEstado]);

  const filtradas = filtradasIndices;
  const filtradasRaw = filtradasIndices.map(f => asistencias[f._idx]);

  const handleCerrarJornada = async () => {
    try {
      const res = await asistenciasApi.cerrarJornada(fechaISO);
      toast.success(res.message || "Jornada cerrada");
      cargarDatos();
    } catch(e:any){ toast.error(e.message); }
  };

  const openPermiso = async () => {
    setPermisoOpen(true);
    try {
      const list = await practicantesApi.getActivos();
      setPracticantes(list);
    } catch {}
  };
  const handlePermiso = async () => {
    if (!permisoPracticante) { toast.error("Seleccione practicante"); return; }
    if (!permisoMotivo.trim()) { toast.error("Motivo obligatorio"); return; }
    try {
      await asistenciasApi.registrarPermiso(Number(permisoPracticante), permisoFecha, permisoMotivo, permisoObs, permisoTipo);
      toast.success("Permiso registrado. No se generará AUSENTE ese día.");
      setPermisoOpen(false);
      setPermisoMotivo(""); setPermisoObs("");
      cargarDatos();
    } catch(e:any){ toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <AsistenciaHeader
        fecha={fecha}
        onPrev={handlePrev}
        onNext={handleNext}
        onFechaChange={handleFechaChange}
        loading={loading}
      />

      <AsistenciaStats resumen={resumen} loading={loading} />
      <AsistenciaFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        loading={loading}
      />

      <AsistenciaTable asistencias={filtradas.map(({_idx, ...rest})=>rest)} rawData={filtradasRaw} loading={loading} onRefresh={cargarDatos} />
    </div>
  );
}