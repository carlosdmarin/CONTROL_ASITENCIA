"use client";

import { useState, useEffect } from "react";
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaStats from "./components/AsistenciaStats";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";
import { mockAsistencias, mockResumen } from "./data/mock-data";

export default function AsistenciaPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <AsistenciaHeader loading={loading} />

      {/* TARJETAS DE RESUMEN */}
      <AsistenciaStats resumen={mockResumen} loading={loading} />

      {/* FILTROS */}
      <AsistenciaFilters loading={loading} />

      {/* TABLA */}
      <AsistenciaTable asistencias={mockAsistencias} loading={loading} />
    </div>
  );
}