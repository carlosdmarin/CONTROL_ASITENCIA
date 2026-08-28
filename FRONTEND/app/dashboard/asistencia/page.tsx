"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaStats from "./components/AsistenciaStats";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";
import { asistenciasApi } from "@/lib/api/asistencias";
import { AsistenciaDiariaResponse } from "./types";

function formatFechaISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatHoras(horas: number | null | undefined): string | null {
  if (horas == null || horas === 0) return null;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  return `${h}h ${m}m`;
}

function mapEstado(estadoDia: string): "PRESENTE" | "TARDANZA" | "AUSENTE" | "EN_JORNADA" {
  switch (estadoDia) {
    case "PRESENTE": return "PRESENTE";
    case "TARDE": return "TARDANZA";
    case "FALTA": return "AUSENTE";
    case "DESCANSO": return "AUSENTE";
    case "JUSTIFICADO": return "AUSENTE";
    default: return "EN_JORNADA";
  }
}

export default function AsistenciaPage() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [asistencias, setAsistencias] = useState<AsistenciaDiariaResponse[]>([]);
  const [resumen, setResumen] = useState({ total: 0, presentes: 0, tardanzas: 0, ausentes: 0 });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroArea, setFiltroArea] = useState("todas");

  const fechaISO = formatFechaISO(fecha);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [data, res] = await Promise.all([
        asistenciasApi.getAsistenciasDelDia(fechaISO).catch(() => []),
        asistenciasApi.getResumenDiario(fechaISO).catch(() => null),
      ]);
      setAsistencias(Array.isArray(data) ? data : []);
      if (res) {
        setResumen({
          total: res.diasPresente + res.diasTarde + res.diasFalta + (res.diasJustificado || 0) || data.length,
          presentes: res.diasPresente || 0,
          tardanzas: res.diasTarde || 0,
          ausentes: res.diasFalta || 0,
        });
      } else {
        // Calcular desde asistencias si no hay resumen
        const presentes = data.filter((a: any) => a.estadoDia === "PRESENTE").length;
        const tardanzas = data.filter((a: any) => a.estadoDia === "TARDE").length;
        const ausentes = data.filter((a: any) => a.estadoDia === "FALTA" || a.estadoDia === "DESCANSO").length;
        setResumen({ total: data.length, presentes, tardanzas, ausentes });
      }
    } catch (e: any) {
      toast.error(e.message || "Error al cargar asistencias");
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

  // Mapear backend -> UI para tabla
  const asistenciasUI = useMemo(() => {
    return asistencias.map((a) => ({
      id: a.idAsistencia || a.idPracticante,
      practicante: a.nombreCompleto,
      area: "—", // El backend no devuelve area directa, se puede enriquecer con practicante.sede si se añade
      entrada: a.entradaReal ? a.entradaReal.substring(0, 5) : null,
      salida: a.salidaReal ? a.salidaReal.substring(0, 5) : null,
      horas: formatHoras(a.horasTrabajadas as any),
      estado: mapEstado(a.estadoDia),
    }));
  }, [asistencias]);

  // Filtros en memoria
  const filtradas = useMemo(() => {
    return asistenciasUI.filter((a) => {
      const matchBusqueda = !busqueda || a.practicante.toLowerCase().includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === "todos" || a.estado.toLowerCase() === filtroEstado;
      const matchArea = filtroArea === "todas" || a.area === filtroArea;
      return matchBusqueda && matchEstado && matchArea;
    });
  }, [asistenciasUI, busqueda, filtroEstado, filtroArea]);

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
        filtroArea={filtroArea}
        onFiltroAreaChange={setFiltroArea}
        loading={loading}
      />

      <AsistenciaTable asistencias={filtradas} loading={loading} />
    </div>
  );
}
