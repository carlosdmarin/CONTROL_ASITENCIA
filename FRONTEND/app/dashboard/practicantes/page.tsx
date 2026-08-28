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
import { PracticanteQRDialog } from "./components/PracticanteQRDialog";
import { practicantesApi } from "@/lib/api/practicantes";
import { Practicante, NuevoPracticante } from "@/types/practicante";

export default function PracticantesPage() {
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [dialogQRabierto, setDialogQRabierto] = useState(false);
  const [practicanteAEditar, setPracticanteAEditar] = useState<Practicante | null>(null);
  const [practicanteAEliminar, setPracticanteAEliminar] = useState<Practicante | null>(null);
  const [practicanteAQR, setPracticanteAQR] = useState<Practicante | null>(null);

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
      (p.sede || (p as any).agencia || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // ====== AGREGAR PRACTICANTE ======
  const agregarPracticante = async (nuevoPracticante: NuevoPracticante & { horario?: any[] }) => {
    try {
      const { horario, ...practicanteData } = nuevoPracticante as any;
      const creado = await practicantesApi.create(practicanteData);
      // Guardar horario si existe
      if (horario && horario.length > 0 && creado?.idPracticante) {
        try {
          await practicantesApi.guardarHorario(creado.idPracticante, horario);
        } catch (e) {
          console.warn("Practicante creado pero horario no se pudo guardar:", e);
          toast.warning("Practicante creado, pero el horario no se pudo guardar");
        }
      } else if (horario && horario.length > 0) {
        // Si el backend no devuelve id, intentar con el horario en el payload (compat)
        console.warn("Horario recibido pero sin idPracticante, se ignora");
      }
      await cargarPracticantes();
      setModalAbierto(false);
      toast.success("Practicante agregado correctamente");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al crear el practicante";
      console.error("Error:", error);
      toast.error(msg);
    }
  };

  // ====== EDITAR PRACTICANTE ======
  const guardarCambios = async (practicanteEditado: Practicante & { horario?: any[] }) => {
    try {
      const data: any = {
        nombre: practicanteEditado.nombreCompleto.split(" ")[0] || "",
        apellido: practicanteEditado.nombreCompleto.split(" ").slice(1).join(" ") || "",
        documento: practicanteEditado.documento,
        idSede: 1,
        idPuesto: 1,
        idTipoInstituto: 1,
        idCargo: 1,
        correoElectronico: practicanteEditado.correoElectronico,
        telefono: practicanteEditado.telefono,
        fechaInicioPracticas: practicanteEditado.fechaInicioPracticas,
        fechaFinPracticas: practicanteEditado.fechaFinPracticas,
      };
      await practicantesApi.update(practicanteEditado.idPracticante, data);
      // Actualizar horario si viene
      const horario = (practicanteEditado as any).horario;
      if (horario && horario.length > 0) {
        try {
          await practicantesApi.updateHorario(practicanteEditado.idPracticante, horario);
        } catch (e) {
          console.warn("Horario no se pudo actualizar:", e);
        }
      }
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
          onShowQR={(p) => {
            setPracticanteAQR(p);
            setDialogQRabierto(true);
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

      <PracticanteQRDialog
        open={dialogQRabierto}
        onOpenChange={setDialogQRabierto}
        practicante={practicanteAQR}
      />
    </div>
  );
}