"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import TurnoHeader from "./components/TurnoHeader";
import TurnoFilters from "./components/TurnoFilters";
import TurnoTable from "./components/TurnoTable";
import TurnoCreateDialog from "./components/TurnoCreateDialog";
import TurnoEditDialog from "./components/TurnoEditDialog";
import TurnoDeleteDialog from "./components/TurnoDeleteDialog";
import { Turno, NuevoTurno } from "./types";


// API DE MI TurnoController 
const API_URL =  "http://localhost:8080/api/turnos";


export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

 
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  // ====== CARGAR TURNOS DESDE LA API ======
  const cargarTurnos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if(!response.ok) throw new Error("Error al cargar los turnos");
      const data = await response.json();
      setTurnos(data);
    }catch (error){
      console.log("Error", error);
      toast.error("Error al cargar los turnos")
    }finally{
      setLoading(false);
    }
  }

  useEffect(() =>{
    cargarTurnos();
  }, []);


  // ======== FILTRADO =======
  const turnosFiltrados = turnos.filter((t)=>
    t.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ====== AGREGAR TURNO ======
  const agregarTurno = async (nuevoTurno: NuevoTurno) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoTurno),
      });
      if (!response.ok) throw new Error("Error al crear turno");
      const turnoCreado = await response.json();
      setTurnos([...turnos, turnoCreado]);
      setModalCrearAbierto(false);
      toast.success(`Turno ${nuevoTurno.nombre} creado`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el turno");
    }
  };

  // ====== EDITAR TURNO ======
  const editarTurno = async (turnoEditado: Turno) => {
    try {
      const response = await fetch(`${API_URL}/${turnoEditado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(turnoEditado),
      });
      if (!response.ok) throw new Error("Error al actualizar turno");
      const actualizado = await response.json();
      setTurnos(turnos.map((t) => (t.id === actualizado.id ? actualizado : t)));
      setDialogEditarAbierto(false);
      toast.success(` Turno ${turnoEditado.nombre} actualizado`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el turno");
    }
  };

    // ====== ELIMINAR TURNO ======
  const eliminarTurno = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar turno");
      setTurnos(turnos.filter((t) => t.id !== id));
      setDialogEliminarAbierto(false);
      toast.success(" Turno eliminado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el turno");
    }
  };

  return (
    <div className="space-y-6">
      <TurnoHeader total={turnos.length} onOpenCreate={() => setModalCrearAbierto(true)} />

      <TurnoCreateDialog
        open={modalCrearAbierto}
        onOpenChange={setModalCrearAbierto}
        onSave={agregarTurno}
      />

      <TurnoFilters busqueda={busqueda} onBusquedaChange={setBusqueda} />

      <TurnoTable
        turnos={turnosFiltrados}
        onEdit={(turno) => {
          setTurnoSeleccionado(turno);
          setDialogEditarAbierto(true);
        }}
        onDelete={(turno) => {
          setTurnoSeleccionado(turno);
          setDialogEliminarAbierto(true);
        }}
        busqueda={busqueda}
      />

      <TurnoEditDialog
        open={dialogEditarAbierto}
        onOpenChange={setDialogEditarAbierto}
        turno={turnoSeleccionado}
        onSave={editarTurno}
      />

      <TurnoDeleteDialog
        open={dialogEliminarAbierto}
        onOpenChange={setDialogEliminarAbierto}
        turno={turnoSeleccionado}
        onDelete={eliminarTurno}
      />
    </div>
  );
}