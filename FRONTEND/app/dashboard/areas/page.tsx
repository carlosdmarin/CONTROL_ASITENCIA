"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import PuestoHeader from "./components/PuestoHeader";
import PuestoFilters from "./components/PuestoFilters";
import PuestoTable from "./components/PuestoTable";
import PuestoCreateDialog from "./components/PuestoCreateDialog";
import PuestoEditDialog from "./components/PuestoEditDialog";
import PuestoDeleteDialog from "./components/PuestoDeleteDialog";
import { areasApi } from "@/lib/api/areas";
import { Area, NuevaArea } from "@/types/area";
import { MOCK_AREAS } from "@/lib/mocks/areas";

type EstadoFiltro = "todos" | "activos" | "inactivos";

export default function PuestosPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);

  // Alias para compatibilidad con componentes legacy que esperan puestos

  const cargarPuestos = async () => {
    try {
      setLoading(true);
      const data = await areasApi.getAll();
      setAreas(data.length ? data : MOCK_AREAS);
    } catch (error: unknown) {
      console.error("Error:", error);
      setAreas(MOCK_AREAS);
      toast.error("Sin conexión al backend — mostrando datos de ejemplo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuestos();
  }, []);

  const totalActivos = useMemo(() => areas.filter((p) => p.activo).length, [areas]);

  const puestosFiltrados = useMemo(() => {
    return areas.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombreArea.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false);
      const matchEstado =
        estado === "todos" || (estado === "activos" ? p.activo : !p.activo);
      return matchBusqueda && matchEstado;
    });
  }, [areas, busqueda, estado]);

  // ====== FUNCIÓN getStatusColor ======
  const getStatusColor = (activo: boolean): string => {
    return activo
      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
      : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
  };

  const agregarPuesto = async (nuevaArea: NuevaArea) => {
    try {
      const creado = await areasApi.create(nuevaArea);
      setAreas((prev) => [creado, ...prev]);
      setModalCrearAbierto(false);
      toast.success(`Área "${nuevaArea.nombreArea}" creada`);
    } catch {
      const mockNuevo: Area = {
        idArea: Math.max(...areas.map((p) => p.idArea), 0) + 1,
        ...nuevaArea,
      };
      setAreas((prev) => [mockNuevo, ...prev]);
      setModalCrearAbierto(false);
      toast.success(`Área "${nuevaArea.nombreArea}" creada (mock)`);
    }
  };

  const editarPuesto = async (areaEditada: Area) => {
    try {
      const actualizado = await areasApi.update(areaEditada.idArea, areaEditada);
      setAreas((prev) => prev.map((p) => (p.idArea === actualizado.idArea ? actualizado : p)));
      setDialogEditarAbierto(false);
      toast.success(`Área "${areaEditada.nombreArea}" actualizada`);
    } catch {
      setAreas((prev) => prev.map((p) => (p.idArea === areaEditada.idArea ? areaEditada : p)));
      setDialogEditarAbierto(false);
      toast.success(`Área actualizada (mock)`);
    }
  };

  const eliminarPuesto = async (id: number) => {
    try {
      await areasApi.eliminar(id);
      setAreas((prev) => prev.filter((p) => p.idArea !== id));
      setDialogEliminarAbierto(false);
      toast.success("Área eliminada");
    } catch {
      setAreas((prev) => prev.filter((p) => p.idArea !== id));
      setDialogEliminarAbierto(false);
      toast.success("Área eliminada (mock)");
    }
  };

  return (
    <div className="space-y-6">
      <PuestoHeader
        total={areas.length}
        totalActivos={totalActivos}
        onOpenCreate={() => setModalCrearAbierto(true)}
        loading={loading}
      />

      <div className="rounded-xl ">
        <div className="p-4 sm:p-1 border-b border-slate-100">
          <PuestoFilters
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            estado={estado}
            onEstadoChange={setEstado}
            totalFiltrados={puestosFiltrados.length}
            total={areas.length}
            loading={loading}
          />
        </div>

        <PuestoTable
          puestos={puestosFiltrados}
          onEdit={(p) => {
            setAreaSeleccionada(p as Area);
            setDialogEditarAbierto(true);
          }}
          onDelete={(p) => {
            setAreaSeleccionada(p as Area);
            setDialogEliminarAbierto(true);
          }}
          getStatusColor={getStatusColor}  // ← AGREGAR ESTA LÍNEA
          busqueda={busqueda}
          loading={loading}
        />
      </div>

      <PuestoCreateDialog
        open={modalCrearAbierto}
        onOpenChange={setModalCrearAbierto}
        onSave={agregarPuesto}
      />

      <PuestoEditDialog
        open={dialogEditarAbierto}
        onOpenChange={setDialogEditarAbierto}
        puesto={areaSeleccionada}
        onSave={editarPuesto}
      />

      <PuestoDeleteDialog
        open={dialogEliminarAbierto}
        onOpenChange={setDialogEliminarAbierto}
        puesto={areaSeleccionada}
        onDelete={eliminarPuesto}
      />
    </div>
  );
}