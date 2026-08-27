"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import PracticanteHeader from "./components/PracticanteHeader";
import PracticanteCards from "./components/PracticanteCards";
import PracticanteFilters from "./components/PracticanteFilters";
import { PracticanteTable } from "./components/PracticanteTable";
import { PracticanteDeleteDialog } from "./components/PracticanteDeleteDialog";
import { PracticanteCreateDialog } from "./components/PracticanteCreateDialog";
import { PracticanteEditDialog } from "./components/PracticanteEditDialog";
import { practicantesApi } from "@/lib/api/practicantes";
import { Practicante, NuevoPracticante } from "@/types/practicante";

export default function PracticantesPage() {
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [practicanteAEditar, setPracticanteAEditar] = useState<Practicante | null>(null);
  const [practicanteAEliminar, setPracticanteAEliminar] = useState<Practicante | null>(null);

  // ====== CARGAR PRACTICANTES ======
  const cargarPracticantes = async () => {
    try {
      setLoading(true);
      const data = await practicantesApi.getAll();
      setPracticantes(data);
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

  // ====== FILTRAR ======
  const practicantesFiltrados = practicantes.filter(
    (p) =>
      p.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.documento?.includes(busqueda) ||
      p.codigoTrabajador?.includes(busqueda)
  );

  // ====== AGREGAR PRACTICANTE ======
  const agregarPracticante = async (nuevoPracticante: NuevoPracticante) => {
    try {
      await practicantesApi.create(nuevoPracticante);
      await cargarPracticantes();
      setModalAbierto(false);
      toast.success(" Practicante agregado correctamente");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al crear el practicante";
      console.error("Error:", error);
      toast.error(msg);
    }
  };

  // ====== EDITAR PRACTICANTE ======
  const guardarCambios = async (practicanteEditado: Practicante) => {
    try {
      // Convertir Practicante a NuevoPracticante para el update
      const data = {
        codigoTrabajador: practicanteEditado.codigoTrabajador,
        nombre: practicanteEditado.nombreCompleto.split(" ")[0] || "",
        apellido: practicanteEditado.nombreCompleto.split(" ").slice(1).join(" ") || "",
        documento: practicanteEditado.documento,
        idAgencia: 1, // TODO: Obtener el ID real de la agencia
        idPuesto: 1,  // TODO: Obtener el ID real del puesto
        idTipoInstituto: 1, // TODO: Obtener el ID real del tipo de instituto
        idCargo: 1,   // TODO: Obtener el ID real del cargo
        correoElectronico: practicanteEditado.correoElectronico,
        telefono: practicanteEditado.telefono,
        fechaInicioPracticas: practicanteEditado.fechaInicioPracticas,
        fechaFinPracticas: practicanteEditado.fechaFinPracticas,
      };
      await practicantesApi.update(practicanteEditado.idPracticante, data);
      await cargarPracticantes();
      setDialogEditarAbierto(false);
      toast.success("Practicante actualizado correctamente");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar el practicante";
      console.error("Error:", error);
      toast.error(msg);
    }
  };

  // ====== ELIMINAR PRACTICANTE ======
  const eliminarPracticante = async (id: number) => {
    try {
      await practicantesApi.eliminar(id);
      await cargarPracticantes();
      setDialogEliminarAbierto(false);
      toast.success("✅ Practicante eliminado correctamente");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al eliminar el practicante";
      console.error("Error:", error);
      toast.error(msg);
    }
  };

  // ====== ESTADO COLOR ======
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

  return (
    <div className="space-y-6">
      <PracticanteHeader onOpenCreate={() => setModalAbierto(true)} />

      <PracticanteCreateDialog
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        onSave={agregarPracticante}
      />

      <PracticanteCards practicantes={practicantes} />

      <PracticanteFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
      />

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Cargando practicantes...</p>
        </div>
      ) : (
        <PracticanteTable
          practicantes={practicantesFiltrados}
          onEdit={(p) => {
            setPracticanteAEditar(p);
            setDialogEditarAbierto(true);
          }}
          onDelete={(p) => {
            setPracticanteAEliminar(p);
            setDialogEliminarAbierto(true);
          }}
          getStatusColor={getStatusColor}
          busqueda={busqueda}
        />
      )}

      <PracticanteEditDialog
        open={dialogEditarAbierto}
        onOpenChange={setDialogEditarAbierto}
        practicante={practicanteAEditar}
        onSave={guardarCambios}
      />

      <PracticanteDeleteDialog
        open={dialogEliminarAbierto}
        onOpenChange={setDialogEliminarAbierto}
        practicante={practicanteAEliminar}
        onDelete={eliminarPracticante}
      />
    </div>
  );
}