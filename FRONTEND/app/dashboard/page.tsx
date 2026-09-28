"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import DashboardKpis from "./components/DashboardKpis";
import AsistenciaSemanalChart from "./components/AsistenciaSemanalChart";
import EstadoMarcacionChart from "./components/EstadoMarcacionChart";
import ActividadReciente from "./components/ActividadReciente";
import RequiereAtencion from "./components/RequiereAtencion";

import { practicantesApi } from "@/lib/api/practicantes";
import { asistenciasApi } from "@/lib/api/asistencias";
import { Practicante } from "@/types/practicante";
import {
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
  isTardanza,
  isAusente,
} from "@/types/asistencia";

function formatFechaISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSemanaActual(): { inicio: string; fin: string } {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diffLunes = dia === 0 ? -6 : 1 - dia;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return { inicio: formatFechaISO(lunes), fin: formatFechaISO(domingo) };
}

const DIAS_LABELS: Record<string, string> = {
  "1": "Lunes",
  "2": "Martes",
  "3": "Miércoles",
  "4": "Jueves",
  "5": "Viernes",
  "6": "Sábado",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [resumenAsistencia, setResumenAsistencia] = useState({
    presentes: 0,
    tardes: 0,
    faltas: 0,
    total: 0,
  });
  const [periodo, setPeriodo] = useState("semana");
  const [rangoData, setRangoData] = useState<
    {
      fecha: string;
      presentes: number;
      tardanzas: number;
      faltas: number;
      total: number;
    }[]
  >([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [atencion, setAtencion] = useState<AsistenciaDiariaResponse[]>([]);
  const [atencionLoading, setAtencionLoading] = useState(true);
  const [actividades, setActividades] = useState<
    { usuario: string; accion: string; hora: string; tipo: string }[]
  >([]);
  const [actividadLoading, setActividadLoading] = useState(true);
  const [asistenciasHoy, setAsistenciasHoy] = useState<
    AsistenciaDiariaResponse[]
  >([]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const practicantesData = await practicantesApi.getAll();
      setPracticantes(practicantesData);
      const fecha = formatFechaISO(new Date());

      try {
        const resumen = await asistenciasApi.getResumenDiario(fecha);
        if (resumen) {
          setResumenAsistencia({
            presentes: resumen.diasPresente || 0,
            tardes: resumen.diasTarde || 0,
            faltas: resumen.diasFalta || 0,
            total: (resumen.diasPresente || 0) + (resumen.diasFalta || 0),
          });
        }
      } catch (error) {
        console.warn("No se pudo cargar el resumen de asistencia:", error);
      }

      try {
        setAtencionLoading(true);
        setActividadLoading(true);
        const asistenciasDia = await asistenciasApi.getAsistenciasDelDia(fecha);
        const filtradas = asistenciasDia.filter((a) => {
          const n = normalizeEstadoDia(a.estadoDia);
          if (n === "DESCANSO" || n === "PRESENTE") return false;
          if (n === "JUSTIFICADO") return false;
          if (n === "AUSENTE") return !a.justificado;
          if (n === "SIN_MARCAR") return true;
          if (n === "TARDANZA") return true;
          if (isAusente(a.estadoDia)) return !a.justificado;
          if (isTardanza(a.estadoDia)) return true;
          return false;
        });
        const prioridad = (estado: string) => {
          const n = normalizeEstadoDia(estado);
          if (n === "AUSENTE" || isAusente(estado)) return 0;
          if (n === "SIN_MARCAR") return 1;
          if (n === "TARDANZA" || isTardanza(estado)) return 2;
          return 3;
        };
        filtradas.sort(
          (a, b) => prioridad(a.estadoDia) - prioridad(b.estadoDia),
        );
        setAtencion(filtradas);
        setAsistenciasHoy(asistenciasDia);

        const acts: {
          usuario: string;
          accion: string;
          hora: string;
          tipo: string;
        }[] = [];
        asistenciasDia.forEach((a) => {
          const esTardanza =
            isTardanza(a.estadoDia) ||
            normalizeEstadoDia(a.estadoDia) === "TARDANZA";
          if (a.entradaReal) {
            const hora = a.entradaReal.substring(0, 5);
            acts.push({
              usuario: a.nombreCompleto,
              accion: esTardanza ? "Marcó tardanza" : "Registró entrada",
              hora,
              tipo: esTardanza ? "tardanza" : "entrada",
            });
          }
          if (a.salidaReal) {
            const hora = a.salidaReal.substring(0, 5);
            acts.push({
              usuario: a.nombreCompleto,
              accion: "Registró salida",
              hora,
              tipo: "salida",
            });
          }
        });
        acts.sort((a, b) => b.hora.localeCompare(a.hora));
        setActividades(acts.slice(0, 5));
      } catch (error) {
        console.warn("No se pudo cargar requiere atención/actividad:", error);
        setAtencion([]);
        setActividades([]);
        setAsistenciasHoy([]);
      } finally {
        setAtencionLoading(false);
        setActividadLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarRango = async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      const { inicio, fin } = getSemanaActual();
      const data = await asistenciasApi.getResumenRango(inicio, fin);
      setRangoData(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setChartError(e.message || "Error al cargar gráfico");
      setRangoData([]);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (periodo === "semana") cargarRango();
  }, [periodo]);

  const totalPracticantes = practicantes.length;

  const chartData = rangoData
    .map((r) => {
      const d = new Date(r.fecha + "T00:00:00");
      const label = DIAS_LABELS[String(d.getDay())] ?? r.fecha;
      return {
        day: label,
        fecha: r.fecha,
        presentes: r.presentes ?? 0,
        ausentes: r.faltas ?? 0,
      };
    })
    .filter((d) => {
      const date = new Date(d.fecha + "T00:00:00");
      return date.getDay() !== 0;
    });

  const chartMax = Math.max(
    1,
    ...chartData.map((d) =>
      d.presentes + d.ausentes === 0 ? 0 : Math.max(d.presentes, d.ausentes),
    ),
  );
  const yAxisMax = Math.max(4, chartMax + 2);

  const descansos = asistenciasHoy.filter(
    (a) => normalizeEstadoDia(a.estadoDia) === "DESCANSO",
  ).length;

  const conAsistencia = asistenciasHoy.filter((a) => {
    const n = normalizeEstadoDia(a.estadoDia);
    const isPresente = n === "PRESENTE";
    const isTard = n === "TARDANZA" || isTardanza(a.estadoDia);
    return (isPresente || isTard) && !a.justificado;
  }).length;

  const sinMarcar = asistenciasHoy.filter((a) => {
    const n = normalizeEstadoDia(a.estadoDia);
    return n === "SIN_MARCAR" && !a.justificado;
  }).length;

  const totalDonut = conAsistencia + sinMarcar;

  return (
    <div className="space-y-6">
      <DashboardHeader
        loading={loading}
        totalPracticantes={totalPracticantes}
        presentesHoy={resumenAsistencia.presentes}
        periodo={periodo}
        onPeriodoChange={(v) => {
          if (v != null) setPeriodo(v);
        }}
      />

      <DashboardKpis
        loading={loading}
        totalPracticantes={totalPracticantes}
        presentes={resumenAsistencia.presentes}
        tardes={resumenAsistencia.tardes}
        faltas={resumenAsistencia.faltas}
        descansos={descansos}
        totalDia={resumenAsistencia.total}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AsistenciaSemanalChart
          chartData={chartData}
          loading={chartLoading}
          error={chartError}
          yAxisMax={yAxisMax}
        />
        <EstadoMarcacionChart
          loading={atencionLoading}
          conAsistencia={conAsistencia}
          sinMarcar={sinMarcar}
          totalDonut={totalDonut}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActividadReciente
          loading={actividadLoading}
          actividades={actividades}
        />
        <RequiereAtencion
          loading={atencionLoading}
          atencion={atencion}
          practicantes={practicantes}
        />
      </div>
    </div>
  );
}
