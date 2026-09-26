"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import VigilantesHeader from "./components/VigilantesHeader";
import VigilantesTable, { VigilanteMock } from "./components/VigilantesTable";
import VigilanteDialog from "./components/VigilanteDialog";
import CambiarContrasenaDialog from "./components/CambiarContrasenaDialog";
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
  const [vigilanteSeleccionado, setVigilanteSeleccionado] = useState<VigilanteMock | null>(null);

  const cargarVigilantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vigilantesApi.getAll();
      const mapped = Array.isArray(data) ? data.map(toUiModel) : [];
      setVigilantes(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar vigilantes";
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
    if (!busqueda) return vigilantes;
    const term = busqueda.toLowerCase();
    return vigilantes.filter(
      (v) =>
        v.nombreCompleto.toLowerCase().includes(term) ||
        v.usuario.toLowerCase().includes(term) ||
        v.sede.toLowerCase().includes(term)
    );
  }, [vigilantes, busqueda]);

  const handleChangePassword = (v: VigilanteMock) => {
    setVigilanteSeleccionado(v);
    setDialogPasswordAbierto(true);
  };

  return (
    <div className="space-y-6">
      <VigilantesHeader onOpenCreate={() => setDialogNuevoAbierto(true)} />

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, usuario o sede..."
          className="pl-9 h-10 bg-white border-slate-200 rounded-xl"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" onClick={cargarVigilantes} className="h-8 bg-white">
            Reintentar
          </Button>
        </div>
      )}

      <VigilantesTable
        vigilantes={vigilantesFiltrados}
        loading={loading}
        busqueda={busqueda}
        onChangePassword={handleChangePassword}
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
    </div>
  );
}
