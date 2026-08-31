"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaStats from "./components/AsistenciaStats";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";
import { asistenciasApi } from "@/lib/api/asistencias";
import { AsistenciaDiaria, AsistenciaDiariaResponse } from "@/types/asistencia";

function formatFechaISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatHoras(horas: number | null | undefined): string | null {
  if (horas == null || horas === 0) return null;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  return `${h}h ${m}m`;
}

// ====== MAPEO DE ESTADOS - cubre los 7 valores documentados en AsistenciaDiariaResponse.java ======
// Propuesta si CLASES/MIXTO no tienen semántica distinta confirmada:
// - CLASES: día con clases académicas programadas (similar a DESCANSO pero con connotación formativa) → badge azul claro
// - MIXTO: día con bloques TRABAJO + CLASES → badge violeta
// Si en tu negocio CLASES debe contar como PRESENTE o MIXTO como EN_JORNADA, ajusta aquí.
function mapEstado(estadoDia: AsistenciaDiariaResponse["estadoDia"]): AsistenciaDiaria["estado"] {
  switch (estadoDia) {
    case "PRESENTE": return "PRESENTE";
    case "TARDE": return "TARDANZA";
    case "FALTA": return "AUSENTE";
    case "CLASES": return "CLASES";
    case "DESCANSO": return "DESCANSO";
    case "JUSTIFICADO": return "JUSTIFICADO";
    case "MIXTO": return "MIXTO";
    default: {
      // Exhaustiveness check: si añades un nuevo estado en Java y no lo mapeas, TypeScript avisará aquí
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

  const fechaISO = formatFechaISO(fecha);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await asistenciasApi.getAsistenciasDelDia(fechaISO).catch(() => [] as AsistenciaDiariaResponse[]);
      
      const dataArray: AsistenciaDiariaResponse[] = Array.isArray(data) ? data : [];
      setAsistencias(dataArray);
      
      // TODO: Si se quiere evitar el cálculo manual en el cliente, crear endpoint backend
      // GET /asistencias/resumen/dia-agregado?fecha=YYYY-MM-DD que devuelva
      // {total, presentes, tardanzas, ausentes, descansos} ya agregado.
      // Por ahora se calcula en cliente porque ResumenAsistenciaDTO.java es semanal por practicante, no agregado diario.
      const total = dataArray.length;
      const presentes = dataArray.filter((a: AsistenciaDiariaResponse) => a.estadoDia === "PRESENTE").length;
      const tardanzas = dataArray.filter((a: AsistenciaDiariaResponse) => a.estadoDia === "TARDE").length;
      const descansos = dataArray.filter((a: AsistenciaDiariaResponse) => a.estadoDia === "DESCANSO").length;
      const ausentes = dataArray.filter((a: AsistenciaDiariaResponse) => a.estadoDia === "FALTA").length;
      
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
  const handleFechaChange = (iso: string) => setFecha(new Date(iso + "T12:00:00"));

  // Mapear backend -> UI para tabla (sin area/sede, AsistenciaDiariaResponse no lo trae)
  const asistenciasUI = useMemo(() => {
    return asistencias.map((a) => ({
      id: a.idAsistencia || a.idPracticante,
      practicante: a.nombreCompleto,
      entrada: a.entradaReal ? a.entradaReal.substring(0, 5) : (a.entradaEsperada ? a.entradaEsperada.substring(0, 5) : null),
      salida: a.salidaReal ? a.salidaReal.substring(0, 5) : (a.salidaEsperada ? a.salidaEsperada.substring(0, 5) : null),
      horas: formatHoras(a.horasTrabajadas),
      estado: mapEstado(a.estadoDia),
    }));
  }, [asistencias]);

  // Filtros en memoria (sin filtro por área)
  const filtradas = useMemo(() => {
    return asistenciasUI.filter((a) => {
      const matchBusqueda = !busqueda || a.practicante.toLowerCase().includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === "todos" || a.estado.toLowerCase() === filtroEstado;
      return matchBusqueda && matchEstado;
    });
  }, [asistenciasUI, busqueda, filtroEstado]);

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

      <AsistenciaTable asistencias={filtradas} loading={loading} />
    </div>
  );
}