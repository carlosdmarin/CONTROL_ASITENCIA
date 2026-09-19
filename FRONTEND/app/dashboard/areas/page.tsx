"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AreaHeader from "./components/AreaHeader";
import AreaFilters from "./components/AreaFilters";
import AreaTable from "./components/AreaTable";
import AreaCreateDialog from "./components/AreaCreateDialog";
import AreaEditDialog from "./components/AreaEditDialog";
import AreaDeleteDialog from "./components/AreaDeleteDialog";
import { areasApi } from "@/lib/api/areas";
import { Area, NuevaArea } from "@/types/area";

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
      setAreas(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      setAreas([]);
      toast.error("Error al cargar áreas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuestos();
  }, []);

  const totalActivos = useMemo(() => areas.filter((a) => a.activo).length, [areas]);

  const areasFiltradas = useMemo(() => {
    return areas.filter((a) => {
      const matchBusqueda =
        !busqueda ||
        a.nombreArea.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false);
      const matchEstado =
        estado === "todos" || (estado === "activos" ? a.activo : !a.activo);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al crear área";
      toast.error(msg);
    }
  };

  const editarPuesto = async (areaEditada: Area) => {
    try {
      const actualizado = await areasApi.update(areaEditada.idArea, areaEditada);
      setAreas((prev) => prev.map((p) => (p.idArea === actualizado.idArea ? actualizado : p)));
      setDialogEditarAbierto(false);
      toast.success(`Área "${areaEditada.nombreArea}" actualizada`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al actualizar área";
      toast.error(msg);
    }
  };

  const eliminarPuesto = async (id: number) => {
    const area = areas.find((a) => a.idArea === id) || areaSeleccionada;
    if (!area) return;
    try {
      if (area.activo) {
        // REGLA 1: Desactivar con validación backend
        const actualizada = await areasApi.desactivar(id);
        setAreas((prev) => prev.map((p) => (p.idArea === actualizada.idArea ? actualizada : p)));
        setDialogEliminarAbierto(false);
        toast.success(`Área "${area.nombreArea}" desactivada`);
      } else {
        const actualizada = await areasApi.activar(id);
        setAreas((prev) => prev.map((p) => (p.idArea === actualizada.idArea ? actualizada : p)));
        setDialogEliminarAbierto(false);
        toast.success(`Área "${area.nombreArea}" activada`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cambiar estado del área";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <AreaHeader
        total={areas.length}
        totalActivos={totalActivos}
        onOpenCreate={() => setModalCrearAbierto(true)}
        loading={loading}
      />

      <div className="rounded-xl ">
        <div className="p-4 sm:p-1 border-b border-slate-100">
          <AreaFilters
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            estado={estado}
            onEstadoChange={setEstado}
            totalFiltrados={areasFiltradas.length}
            total={areas.length}
            loading={loading}
          />
        </div>

        <AreaTable
          areas={areasFiltradas}
          onEdit={(p) => {
            setAreaSeleccionada(p as Area);
            setDialogEditarAbierto(true);
          }}
          onDelete={(p) => {
            setAreaSeleccionada(p as Area);
            setDialogEliminarAbierto(true);
          }}
          getStatusColor={getStatusColor} 
          busqueda={busqueda}
          loading={loading}
        />
      </div>

      <AreaCreateDialog
        open={modalCrearAbierto}
        onOpenChange={setModalCrearAbierto}
        onSave={agregarPuesto}
      />

      <AreaEditDialog
        open={dialogEditarAbierto}
        onOpenChange={setDialogEditarAbierto}
        area={areaSeleccionada}
        onSave={editarPuesto}
      />

      <AreaDeleteDialog
        open={dialogEliminarAbierto}
        onOpenChange={setDialogEliminarAbierto}
        area={areaSeleccionada}
        onDelete={eliminarPuesto}
      />
    </div>
  );
}