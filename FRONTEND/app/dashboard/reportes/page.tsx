"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ReportesHeader } from "./components/ReportesHeader";
import { ReportesPracticantesTable } from "./components/ReportesTable";
import { ReporteDialog } from "./components/ReporteDialog";
import ReporteFilters from "./components/ReporteFilters";
import { practicantesApi } from "@/lib/api/practicantes";
import { Practicante } from "@/types/practicante";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ReportesPage() {
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // ===== Estado del modal =====
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [practicanteReporte, setPracticanteReporte] =
    useState<Practicante | null>(null);

  // BUSQUEDA
  const [filtroSituacion, setFiltroSituacion] = useState("TODOS");
  const [filtroSede, setFiltroSede] = useState("todas");
  const cargarPracticantes = async () => {
    try {
      setLoading(true);
      const data = await practicantesApi.getAll();
      setPracticantes(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al cargar los practicantes";
      console.error("Error:", error);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPracticantes();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
      case "INACTIVO":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const sedesDisponibles = useMemo(() => {
    const set = new Set<string>();
    practicantes.forEach((p) => {
      if (p.sede) set.add(p.sede);
    });
    return Array.from(set).sort();
  }, [practicantes]);


  const practicantesFiltrados = useMemo(() => {
  const term = busqueda.toLowerCase().trim();
  return practicantes.filter((p) => {
    const nombreOficina = p.nombreOficina || p.oficina || "";
    const sede = p.sede || "";

    const matchBusqueda =
      term === "" ||
      p.nombreCompleto?.toLowerCase().includes(term) ||
      p.documento?.includes(busqueda) ||
      p.documento?.toLowerCase().includes(term) ||
      sede.toLowerCase().includes(term) ||
      nombreOficina.toLowerCase().includes(term);

    const matchSituacion =
      filtroSituacion === "TODOS" || p.situacion === filtroSituacion;

    const matchSede = filtroSede === "todas" || p.sede === filtroSede;

    return matchBusqueda && matchSituacion && matchSede;
  });
}, [practicantes, busqueda, filtroSituacion, filtroSede]);
  // ===== Abrir modal =====
  const handleViewReporte = (practicante: Practicante) => {
    setPracticanteReporte(practicante);
    setModalReporteAbierto(true);
  };

  // ReporteDialog maneja su propio toast "Reporte configurado correctamente"

  return (
    <div className="space-y-6">
      <ReportesHeader />

      <ReporteFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroSituacion={filtroSituacion}
        onFiltroSituacionChange={setFiltroSituacion}
        filtroSede={filtroSede}
        onFiltroSedeChange={setFiltroSede}
        sedes={sedesDisponibles}
      />

      <ReportesPracticantesTable
        practicantes={practicantesFiltrados}
        busqueda={busqueda}
        loading={loading}
        getStatusColor={getStatusColor}
        onViewReporte={handleViewReporte}
      />

      <ReporteDialog
        open={modalReporteAbierto}
        onOpenChange={setModalReporteAbierto}
        practicante={practicanteReporte}
      />
    </div>
  );
}
