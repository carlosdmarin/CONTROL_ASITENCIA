"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import PuestoHeader from "./components/PuestoHeader";
import PuestoFilters from "./components/PuestoFilters";
import PuestoTable from "./components/PuestoTable";
import PuestoCreateDialog from "./components/PuestoCreateDialog";
import PuestoEditDialog from "./components/PuestoEditDialog";
import PuestoDeleteDialog from "./components/PuestoDeleteDialog";
import { puestosApi } from "@/lib/api/puestos";
import { Puesto, NuevoPuesto } from "@/types/puestos";

// Mock profesional si backend no responde
const MOCK_PUESTOS: Puesto[] = [
  { idPuesto: 1, nombrePuesto: "Soporte TI", area: "Tecnología", descripcion: "Atención a usuarios, mantenimiento de equipos y redes", activo: true },
  { idPuesto: 2, nombrePuesto: "Asistente Logística", area: "Logística", descripcion: "Control de inventarios y coordinación de despachos", activo: true },
  { idPuesto: 3, nombrePuesto: "Auxiliar Contable", area: "Administración", descripcion: "Registro de comprobantes y conciliaciones", activo: true },
  { idPuesto: 4, nombrePuesto: "Operario Planta", area: "Operaciones", descripcion: "Operación de línea de producción Neshuya", activo: false },
  { idPuesto: 5, nombrePuesto: "Analista de Calidad", area: "Calidad", descripcion: "Muestreo y control de parámetros físico-químicos", activo: true },
  { idPuesto: 6, nombrePuesto: "Asistente RRHH", area: "Recursos Humanos", descripcion: "Apoyo en reclutamiento y control de asistencia", activo: true },
];

type EstadoFiltro = "todos" | "activos" | "inactivos";

export default function PuestosPage() {
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState<Puesto | null>(null);

  const cargarPuestos = async () => {
    try {
      setLoading(true);
      const data = await puestosApi.getAll();
      setPuestos(data.length ? data : MOCK_PUESTOS);
    } catch (error: unknown) {
      console.error("Error:", error);
      setPuestos(MOCK_PUESTOS);
      toast.error("Sin conexión al backend — mostrando datos de ejemplo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuestos();
  }, []);

  const totalActivos = useMemo(() => puestos.filter((p) => p.activo).length, [puestos]);

  const puestosFiltrados = useMemo(() => {
    return puestos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombrePuesto.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.area.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false);
      const matchEstado =
        estado === "todos" || (estado === "activos" ? p.activo : !p.activo);
      return matchBusqueda && matchEstado;
    });
  }, [puestos, busqueda, estado]);

  // ====== FUNCIÓN getStatusColor ======
  const getStatusColor = (activo: boolean): string => {
    return activo
      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
      : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
  };

  const agregarPuesto = async (nuevoPuesto: NuevoPuesto) => {
    try {
      const creado = await puestosApi.create(nuevoPuesto);
      setPuestos((prev) => [creado, ...prev]);
      setModalCrearAbierto(false);
      toast.success(`Puesto "${nuevoPuesto.nombrePuesto}" creado`);
    } catch {
      const mockNuevo: Puesto = {
        idPuesto: Math.max(...puestos.map((p) => p.idPuesto), 0) + 1,
        ...nuevoPuesto,
      };
      setPuestos((prev) => [mockNuevo, ...prev]);
      setModalCrearAbierto(false);
      toast.success(`Puesto "${nuevoPuesto.nombrePuesto}" creado (mock)`);
    }
  };

  const editarPuesto = async (puestoEditado: Puesto) => {
    try {
      const actualizado = await puestosApi.update(puestoEditado.idPuesto, puestoEditado);
      setPuestos((prev) => prev.map((p) => (p.idPuesto === actualizado.idPuesto ? actualizado : p)));
      setDialogEditarAbierto(false);
      toast.success(`Puesto "${puestoEditado.nombrePuesto}" actualizado`);
    } catch {
      setPuestos((prev) => prev.map((p) => (p.idPuesto === puestoEditado.idPuesto ? puestoEditado : p)));
      setDialogEditarAbierto(false);
      toast.success(`Puesto actualizado (mock)`);
    }
  };

  const eliminarPuesto = async (id: number) => {
    try {
      await puestosApi.eliminar(id);
      setPuestos((prev) => prev.filter((p) => p.idPuesto !== id));
      setDialogEliminarAbierto(false);
      toast.success("Puesto eliminado");
    } catch {
      setPuestos((prev) => prev.filter((p) => p.idPuesto !== id));
      setDialogEliminarAbierto(false);
      toast.success("Puesto eliminado (mock)");
    }
  };

  return (
    <div className="space-y-6">
      <PuestoHeader
        total={puestos.length}
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
            total={puestos.length}
            loading={loading}
          />
        </div>

        <PuestoTable
          puestos={puestosFiltrados}
          onEdit={(p) => {
            setPuestoSeleccionado(p);
            setDialogEditarAbierto(true);
          }}
          onDelete={(p) => {
            setPuestoSeleccionado(p);
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
        puesto={puestoSeleccionado}
        onSave={editarPuesto}
      />

      <PuestoDeleteDialog
        open={dialogEliminarAbierto}
        onOpenChange={setDialogEliminarAbierto}
        puesto={puestoSeleccionado}
        onDelete={eliminarPuesto}
      />
    </div>
  );
}