"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ReportesHeader } from "./components/ReportesHeader";
import { ReportesPracticantesTable } from "./components/ReportesTable";
import { ReporteDialog } from "./components/ReporteDialog";
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
  const [practicanteReporte, setPracticanteReporte] = useState<Practicante | null>(null);

  const cargarPracticantes = async () => {
    try {
      setLoading(true);
      const data = await practicantesApi.getAll();
      setPracticantes(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al cargar los practicantes";
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

  const practicantesFiltrados = useMemo(() => {
    if (!busqueda) return practicantes;
    const term = busqueda.toLowerCase();
    return practicantes.filter((p) => {
      const nombreArea = p.nombreArea || p.area || p.puesto || "";
      const sede = p.sede || p.agencia || "";
      return (
        p.nombreCompleto?.toLowerCase().includes(term) ||
        p.documento?.includes(busqueda) ||
        p.documento?.toLowerCase().includes(term) ||
        sede.toLowerCase().includes(term) ||
        nombreArea.toLowerCase().includes(term)
      );
    });
  }, [practicantes, busqueda]);

  // ===== Abrir modal =====
  const handleViewReporte = (practicante: Practicante) => {
    setPracticanteReporte(practicante);
    setModalReporteAbierto(true);
  };

// ReporteDialog maneja su propio toast "Reporte configurado correctamente"

  return (
    <div className="space-y-6">
      <ReportesHeader />

      <div className="relative w-full max-w-[380px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, DNI, sede o área..."
          className="pl-9 h-10 bg-white border-slate-200 rounded-xl"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

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