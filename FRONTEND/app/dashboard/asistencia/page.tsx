"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";
import { Button } from "@/components/ui/button";

import { asistenciasApi } from "@/lib/api/asistencias";
import { practicantesApi } from "@/lib/api/practicantes";
import {
  AsistenciaDiaria,
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
} from "@/types/asistencia";
import { Practicante } from "@/types/practicante";

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

function mapEstado(
  estadoDia: AsistenciaDiariaResponse["estadoDia"],
): AsistenciaDiaria["estado"] {
  switch (estadoDia) {
    case "SIN_MARCAR":
      return "SIN_MARCAR";
    case "PRESENTE":
      return "PRESENTE";
    case "TARDANZA":
      return "TARDANZA";
    case "AUSENTE":
      return "AUSENTE";
    case "DESCANSO":
      return "DESCANSO";
    case "JUSTIFICADO":
      return "JUSTIFICADO";
    default: {
      const _exhaustiveCheck: never = estadoDia;
      void _exhaustiveCheck;
      return "AUSENTE";
    }
  }
}

export default function AsistenciaPage() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [asistencias, setAsistencias] = useState<AsistenciaDiariaResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroSede, setFiltroSede] = useState("todas");
  const [practicantesAll, setPracticantesAll] = useState<Practicante[]>([]);

  const fechaISO = formatFechaISO(fecha);
  const requestIdRef = useRef(0);

  const cargarDatos = async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const data = await asistenciasApi.getAsistenciasDelDia(fechaISO);
      if (requestId !== requestIdRef.current) return;
      const dataArray: AsistenciaDiariaResponse[] = Array.isArray(data)
        ? data
        : [];
      setAsistencias(dataArray);
    } catch (e: unknown) {
      if (requestId !== requestIdRef.current) return;
      const msg =
        e instanceof Error ? e.message : "Error al cargar asistencias";
      setError(msg);
      toast.error(msg);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const cargarPracticantesSede = async () => {
    try {
      const list = await practicantesApi
        .getAll()
        .catch(() => [] as Practicante[]);
      setPracticantesAll(Array.isArray(list) ? list : []);
    } catch {}
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaISO]);

  useEffect(() => {
    cargarPracticantesSede();
  }, []);

  const handlePrev = () =>
    setFecha((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() - 1);
      return n;
    });

  const handleNext = () =>
    setFecha((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 1);
      return n;
    });

  const handleFechaChange = (iso: string) => {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return;
    const parsed = new Date(y, m - 1, d);
    if (isNaN(parsed.getTime())) return;
    if (
      parsed.getFullYear() !== y ||
      parsed.getMonth() !== m - 1 ||
      parsed.getDate() !== d
    )
      return;
    setFecha(parsed);
    setError(null);
  };

  const practicantesMap = useMemo(
    () => new Map(practicantesAll.map((p) => [p.idPracticante, p])),
    [practicantesAll],
  );

  const sedeMap = useMemo(() => {
    const m = new Map<number, string>();
    practicantesAll.forEach((p) => {
      const sede = p.sede || p.sedeObj?.nombre || "";
      if (p.idPracticante) m.set(p.idPracticante, sede);
    });
    return m;
  }, [practicantesAll]);

  const sedesDisponibles = useMemo(() => {
    const s = new Set<string>();
    asistencias.forEach((a) => {
      const sede = sedeMap.get(a.idPracticante) || "";
      if (sede) s.add(sede);
    });
    practicantesAll.forEach((p) => {
      const sede = p.sede || "";
      if (sede) s.add(sede);
    });
    return Array.from(s).sort();
  }, [asistencias, sedeMap, practicantesAll]);

  const filasCompletas = useMemo(() => {
    return asistencias.map((a) => {
      const practInfo = practicantesMap.get(a.idPracticante);
      const sede = sedeMap.get(a.idPracticante) || practInfo?.sede || "";
      const oficina = practInfo?.nombreOficina || practInfo?.oficina || "";
      const documento = practInfo?.documento || "";
      const ui = {
        id: a.idAsistencia || a.idPracticante,
        practicante: a.nombreCompleto,
        documento,
        sede,
        oficina,
        jornada:
          a.entradaEsperada && a.salidaEsperada
            ? `${a.entradaEsperada.substring(0, 5)} – ${a.salidaEsperada.substring(0, 5)}`
            : a.entradaEsperada
              ? a.entradaEsperada.substring(0, 5)
              : "—",
        programada: a.entradaEsperada
          ? a.entradaEsperada.substring(0, 5)
          : null,
        entrada: a.entradaReal ? a.entradaReal.substring(0, 5) : null,
        tardanza: a.minutosTardanza ?? null,
        salida: a.salidaReal ? a.salidaReal.substring(0, 5) : null,
        horas: formatHoras(a.horasTrabajadas),
        estado: mapEstado(a.estadoDia),
        _sede: sede,
        _justificado:
          Boolean(a.justificado) ||
          Boolean(a.situacion && a.situacion !== "NINGUNA") ||
          Boolean(a.situacionesDetalle?.length),
      };
      return { ui, raw: a };
    });
  }, [asistencias, sedeMap, practicantesMap]);

  const filasFiltradas = useMemo(() => {
    return filasCompletas.filter(({ ui }) => {
      const matchBusqueda =
        !busqueda ||
        ui.practicante.toLowerCase().includes(busqueda.toLowerCase()) ||
        ui._sede.toLowerCase().includes(busqueda.toLowerCase()) ||
        ui.documento.toLowerCase().includes(busqueda.toLowerCase());

      let matchEstado = true;
      if (filtroEstado !== "todos") {
        if (filtroEstado === "justificado") {
          matchEstado = ui._justificado;
        } else {
          matchEstado = ui.estado.toLowerCase() === filtroEstado.toLowerCase();
        }
      }

      const matchSede = filtroSede === "todas" || ui._sede === filtroSede;
      return matchBusqueda && matchEstado && matchSede;
    });
  }, [filasCompletas, busqueda, filtroEstado, filtroSede]);

  const filtradas = filasFiltradas.map((f) => f.ui);
  const filtradasRaw = filasFiltradas.map((f) => f.raw);
  const filasParaTabla = filasFiltradas.map(({ ui, raw }) => ({ ui, raw }));

  return (
    <div className="space-y-4">
      <AsistenciaHeader
        fecha={fecha}
        onPrev={handlePrev}
        onNext={handleNext}
        onFechaChange={handleFechaChange}
        loading={loading}
      />

      <AsistenciaFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        filtroSede={filtroSede}
        onFiltroSedeChange={setFiltroSede}
        sedes={sedesDisponibles}
        loading={loading}
      />

      {error && !loading && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3.5">
          <div className="h-8 w-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
            <AlertCircle className="h-4 w-4 text-rose-600" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-rose-900">
              Error al cargar las asistencias
            </p>
            <p className="text-[11.5px] text-rose-700 mt-0.5 break-words">
              {error}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            className="h-8 px-3 text-[12px] bg-white border-rose-200 hover:bg-rose-50 text-rose-700 shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      <AsistenciaTable
        asistencias={filtradas.map(({ _sede, _justificado, ...rest }) => rest)}
        rawData={filtradasRaw}
        filas={filasParaTabla}
        loading={loading}
        onRefresh={cargarDatos}
      />
    </div>
  );
}