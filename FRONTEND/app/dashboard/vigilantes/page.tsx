"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import VigilantesHeader from "./components/VigilantesHeader";
import VigilantesTable, { VigilanteMock } from "./components/VigilantesTable";
import VigilanteDialog from "./components/VigilanteDialog";
import CambiarContrasenaDialog from "./components/CambiarContrasenaDialog";
import VigilanteEstadoDialog from "./components/VigilanteEstadoDialog";
import VigilanteFilters from "./components/VigilanteFilters";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import { vigilantesApi, VigilanteResponse } from "@/lib/api/vigilantes";
import { Button } from "@/components/ui/button";

function toUiModel(v: VigilanteResponse): VigilanteMock {
  return {
    id: v.id,
    nombre: v.nombre,
    apellido: v.apellido,
    nombreCompleto: `${v.nombre} ${v.apellido}`.trim(),
    usuario: v.usuario,
    sede: v.sedeNombre || "—",
    estado: v.estado ? "ACTIVO" : "INACTIVO",
  };
}

export default function VigilantesPage() {
  const [vigilantes, setVigilantes] = useState<VigilanteMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [dialogNuevoAbierto, setDialogNuevoAbierto] = useState(false);
  const [dialogPasswordAbierto, setDialogPasswordAbierto] = useState(false);
  const [vigilanteSeleccionado, setVigilanteSeleccionado] =
    useState<VigilanteMock | null>(null);
  const [dialogEstadoAbierto, setDialogEstadoAbierto] = useState(false);
  const [vigilanteEstado, setVigilanteEstado] = useState<VigilanteMock | null>(
    null,
  );
  const [isChangingEstado, setIsChangingEstado] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroSede, setFiltroSede] = useState("todas");

  const sedesDisponibles = useMemo(() => {
    const set = new Set<string>();
    vigilantes.forEach((v) => {
      if (v.sede && v.sede !== "—") set.add(v.sede);
    });
    return Array.from(set).sort();
  }, [vigilantes]);

  const cargarVigilantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vigilantesApi.getAll();
      const mapped = Array.isArray(data) ? data.map(toUiModel) : [];
      setVigilantes(mapped);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar vigilantes";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVigilantes();
  }, []);

  const vigilantesFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase().trim();
    return vigilantes.filter((v) => {
      const matchBusqueda =
        term === "" ||
        v.nombreCompleto.toLowerCase().includes(term) ||
        v.usuario.toLowerCase().includes(term) ||
        v.sede.toLowerCase().includes(term);

      const matchEstado = filtroEstado === "TODOS" || v.estado === filtroEstado;

      const matchSede = filtroSede === "todas" || v.sede === filtroSede;

      return matchBusqueda && matchEstado && matchSede;
    });
  }, [vigilantes, busqueda, filtroEstado, filtroSede]);

  const handleChangePassword = (v: VigilanteMock) => {
    setVigilanteSeleccionado(v);
    setDialogPasswordAbierto(true);
  };

  const handleToggleEstado = (v: VigilanteMock) => {
    setVigilanteEstado(v);
    setDialogEstadoAbierto(true);
  };

  const handleConfirmEstado = async () => {
    if (!vigilanteEstado) return;
    const nuevoEstado = vigilanteEstado.estado === "ACTIVO" ? false : true;
    try {
      setIsChangingEstado(true);
      await vigilantesApi.cambiarEstado(vigilanteEstado.id, nuevoEstado);
      toast.success(
        nuevoEstado
          ? "Vigilante activado correctamente."
          : "Vigilante desactivado correctamente.",
      );
      setDialogEstadoAbierto(false);
      setVigilanteEstado(null);
      await cargarVigilantes();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del vigilante. Intenta nuevamente.";
      if (msg.toLowerCase().includes("no encontrado") || msg.includes("404")) {
        toast.error("El vigilante ya no existe o no está disponible.");
      } else if (
        msg.toLowerCase().includes("permisos") ||
        msg.includes("403") ||
        msg.toLowerCase().includes("forbidden")
      ) {
        toast.error("No tienes permisos para realizar esta acción.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsChangingEstado(false);
    }
  };

  return (
    <div className="space-y-6">
      <VigilantesHeader onOpenCreate={() => setDialogNuevoAbierto(true)} />
        
      <VigilanteFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        filtroSede={filtroSede}
        onFiltroSedeChange={setFiltroSede}
        sedes={sedesDisponibles}
      />
      <VigilantesTable
        vigilantes={vigilantesFiltrados}
        loading={loading}
        busqueda={busqueda}
        onChangePassword={handleChangePassword}
        onToggleEstado={handleToggleEstado}
        onCreate={() => setDialogNuevoAbierto(true)}
      />
      <VigilanteDialog
        open={dialogNuevoAbierto}
        onOpenChange={setDialogNuevoAbierto}
        onSuccess={cargarVigilantes}
      />

      <CambiarContrasenaDialog
        open={dialogPasswordAbierto}
        onOpenChange={setDialogPasswordAbierto}
        vigilante={vigilanteSeleccionado}
      />

      <VigilanteEstadoDialog
        open={dialogEstadoAbierto}
        onOpenChange={(open) => {
          if (!open && !isChangingEstado) {
            setDialogEstadoAbierto(false);
            setVigilanteEstado(null);
          } else if (open) {
            setDialogEstadoAbierto(true);
          }
        }}
        vigilante={vigilanteEstado}
        onConfirm={handleConfirmEstado}
        isLoading={isChangingEstado}
      />
    </div>
  );
}
