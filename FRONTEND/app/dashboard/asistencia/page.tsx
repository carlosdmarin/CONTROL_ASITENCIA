"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";
import { asistenciasApi } from "@/lib/api/asistencias";
import { practicantesApi } from "@/lib/api/practicantes";
import {
  AsistenciaDiaria,
  AsistenciaDiariaResponse,
  normalizeEstadoDia,
  isTardanza,
  isAusente,
} from "@/types/asistencia";
import { Practicante } from "@/types/practicante";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

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
    case "TARDE":
    case "TARDANZA":
      return "TARDANZA";
    case "FALTA":
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
  const [asistencias, setAsistencias] = useState<AsistenciaDiariaResponse[]>([]);
  const [resumen, setResumen] = useState({
    total: 0,
    presentes: 0,
    tardanzas: 0,
    ausentes: 0,
    descansos: 0,
    sinMarcar: 0,
    justificados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroSede, setFiltroSede] = useState("todas");
  const [tabEstado, setTabEstado] = useState("todos");
  const [permisoOpen, setPermisoOpen] = useState(false);
  const [permisoFecha, setPermisoFecha] = useState(formatFechaISO(new Date()));
  const [permisoMotivo, setPermisoMotivo] = useState("");
  const [permisoObs, setPermisoObs] = useState("");
  const [permisoTipo, setPermisoTipo] = useState("PERSONAL");
  const [permisoPracticante, setPermisoPracticante] = useState("");
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [practicantesAll, setPracticantesAll] = useState<Practicante[]>([]);

  const fechaISO = formatFechaISO(fecha);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await asistenciasApi
        .getAsistenciasDelDia(fechaISO)
        .catch(() => [] as AsistenciaDiariaResponse[]);
      const dataArray: AsistenciaDiariaResponse[] = Array.isArray(data) ? data : [];
      setAsistencias(dataArray);
      const presentes = dataArray.filter((a) => normalizeEstadoDia(a.estadoDia) === "PRESENTE").length;
      const tardanzas = dataArray.filter((a) => normalizeEstadoDia(a.estadoDia) === "TARDANZA").length;
      const ausentes = dataArray.filter((a) => normalizeEstadoDia(a.estadoDia) === "AUSENTE").length;
      const descansos = dataArray.filter((a) => normalizeEstadoDia(a.estadoDia) === "DESCANSO").length;
      const sinMarcar = dataArray.filter((a) => normalizeEstadoDia(a.estadoDia) === "SIN_MARCAR").length;
      const justificados = dataArray.filter((a) => {
        const det = a.situacionesDetalle;
        const situacion = a.situacion;
        return Boolean(a.justificado) || Boolean(situacion && situacion !== "NINGUNA") || Boolean(det && det.length > 0);
      }).length;
      const total = dataArray.length;
      setResumen({ total, presentes, tardanzas, ausentes, descansos, sinMarcar, justificados });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cargar asistencias";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cargarPracticantesSede = async () => {
    try {
      const list = await practicantesApi.getAll().catch(() => [] as Practicante[]);
      setPracticantesAll(Array.isArray(list) ? list : []);
    } catch {}
  };

  useEffect(() => {
    cargarDatos();
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
    const [y, m, d] = iso.split("-").map(Number);
    setFecha(new Date(y, m - 1, d));
  };

  const practicantesMap = useMemo(
    () => new Map(practicantesAll.map((p) => [p.idPracticante, p])),
    [practicantesAll],
  );

  const sedeMap = useMemo(() => {
    const m = new Map<number, string>();
    practicantesAll.forEach((p) => {
      const sede = p.sede || p.agencia || p.sedeObj?.nombre || "";
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
      const sede = p.sede || p.agencia || "";
      if (sede) s.add(sede);
    });
    return Array.from(s).sort();
  }, [asistencias, sedeMap, practicantesAll]);

  const asistenciasUI = useMemo(() => {
    return asistencias.map((a) => {
      const practInfo = practicantesMap.get(a.idPracticante);
      const sede = sedeMap.get(a.idPracticante) || practInfo?.sede || practInfo?.agencia || "";
      const area = practInfo?.nombreArea || practInfo?.area || practInfo?.puesto || "";
      const documento = practInfo?.documento || "";
      return {
        id: a.idAsistencia || a.idPracticante,
        practicante: a.nombreCompleto,
        documento,
        sede,
        area,
        jornada: a.entradaEsperada && a.salidaEsperada ? `${a.entradaEsperada.substring(0, 5)} – ${a.salidaEsperada.substring(0, 5)}` : a.entradaEsperada ? a.entradaEsperada.substring(0, 5) : "—",
        programada: a.entradaEsperada ? a.entradaEsperada.substring(0, 5) : null,
        entrada: a.entradaReal ? a.entradaReal.substring(0, 5) : null,
        tardanza: a.minutosTardanza ?? null,
        salida: a.salidaReal ? a.salidaReal.substring(0, 5) : null,
        horas: formatHoras(a.horasTrabajadas),
        estado: mapEstado(a.estadoDia),
        _sede: sede,
        _justificado: Boolean(a.justificado) || Boolean(a.situacion && a.situacion !== "NINGUNA") || Boolean(a.situacionesDetalle?.length),
      };
    });
  }, [asistencias, sedeMap, practicantesMap]);

  const tabCounts = useMemo(() => {
    return {
      todos: asistencias.length,
      presente: asistencias.filter((a) => normalizeEstadoDia(a.estadoDia) === "PRESENTE").length,
      tardanza: asistencias.filter((a) => normalizeEstadoDia(a.estadoDia) === "TARDANZA").length,
      ausente: asistencias.filter((a) => normalizeEstadoDia(a.estadoDia) === "AUSENTE").length,
      sin_marcar: asistencias.filter((a) => normalizeEstadoDia(a.estadoDia) === "SIN_MARCAR").length,
      descanso: asistencias.filter((a) => normalizeEstadoDia(a.estadoDia) === "DESCANSO").length,
      justificado: asistencias.filter((a) => {
        const det = a.situacionesDetalle;
        return Boolean(a.justificado) || Boolean(a.situacion && a.situacion !== "NINGUNA") || Boolean(det && det.length > 0);
      }).length,
    };
  }, [asistencias]);

  const filtradasIndices = useMemo(() => {
    return asistenciasUI
      .map((a, idx) => ({ ...a, _idx: idx }))
      .filter((a) => {
        const matchBusqueda =
          !busqueda ||
          a.practicante.toLowerCase().includes(busqueda.toLowerCase()) ||
          a._sede.toLowerCase().includes(busqueda.toLowerCase()) ||
          a.documento.toLowerCase().includes(busqueda.toLowerCase());
        let matchEstado = true;
        if (filtroEstado !== "todos") {
          if (filtroEstado === "justificado") {
            matchEstado = a._justificado;
          } else {
            matchEstado = a.estado.toLowerCase() === filtroEstado.toLowerCase();
          }
        }
        let matchTab = true;
        if (tabEstado !== "todos") {
          if (tabEstado === "justificado") {
            matchTab = a._justificado;
          } else {
            matchTab = a.estado.toLowerCase() === tabEstado.toLowerCase();
          }
        }
        const matchSede = filtroSede === "todas" || a._sede === filtroSede;
        return matchBusqueda && matchEstado && matchTab && matchSede;
      });
  }, [asistenciasUI, busqueda, filtroEstado, tabEstado, filtroSede]);

  const filtradas = filtradasIndices;
  const filtradasRaw = filtradasIndices.map((f) => asistencias[f._idx]);

  const openPermiso = async () => {
    setPermisoOpen(true);
    try {
      const list = await practicantesApi.getActivos();
      setPracticantes(list);
    } catch {}
  };
  const handlePermiso = async () => {
    if (!permisoPracticante) {
      toast.error("Seleccione practicante");
      return;
    }
    if (!permisoMotivo.trim()) {
      toast.error("Motivo obligatorio");
      return;
    }
    try {
      await asistenciasApi.registrarPermiso(
        Number(permisoPracticante),
        permisoFecha,
        permisoMotivo,
        permisoObs,
        permisoTipo,
      );
      toast.success("Permiso registrado. No se generará AUSENTE ese día.");
      setPermisoOpen(false);
      setPermisoMotivo("");
      setPermisoObs("");
      cargarDatos();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const fechaLarga = fecha.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <AsistenciaHeader
        fecha={fecha}
        onPrev={handlePrev}
        onNext={handleNext}
        onFechaChange={handleFechaChange}
        loading={loading}
      />

      {/* Resumen compacto del día */}


      {/* Tabs de estados */}
      <div className="flex gap-2 pt-7 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {[
          { key: "todos", label: "Todos", count: tabCounts.todos },
          { key: "presente", label: "Presentes", count: tabCounts.presente },
          { key: "tardanza", label: "Tardanzas", count: tabCounts.tardanza },
          { key: "ausente", label: "Ausentes", count: tabCounts.ausente },
          { key: "sin_marcar", label: "Sin marcar", count: tabCounts.sin_marcar },
          { key: "descanso", label: "Descanso", count: tabCounts.descanso },
          { key: "justificado", label: "Justificados", count: tabCounts.justificado },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabEstado(tab.key)}
            className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
              tabEstado === tab.key
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0 text-xs font-semibold ${
                tabEstado === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

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

      <AsistenciaTable
        asistencias={filtradas.map(({ _idx, _sede, _justificado, ...rest }) => rest)}
        rawData={filtradasRaw}
        loading={loading}
        onRefresh={cargarDatos}
      />
    </div>
  );
}
