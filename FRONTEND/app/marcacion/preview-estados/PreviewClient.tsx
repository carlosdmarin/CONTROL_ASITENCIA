// TEMPORAL - borrar después de la Fase 2B
"use client";

import { useState } from "react";
import QRScannerResult from "../components/QRScannerResult";
import { Button } from "@/components/ui/button";

type EstadoId =
  | "loading"
  | "entrada"
  | "salida"
  | "descanso"
  | "ya_registrado"
  | "jornada_finalizada"
  | "inactivo"
  | "no_encontrado"
  | "error_generico";

type Estado = {
  id: EstadoId;
  label: string;
  codigo: string;
  marcacionStatus: {
    success: boolean;
    message: string;
    tipo?: "ENTRADA" | "SALIDA" | "DESCANSO" | "YA_REGISTRADO" | "JORNADA_FINALIZADA" | "INACTIVO" | "ERROR";
  } | null;
};

const ESTADOS: Estado[] = [
  {
    id: "loading",
    label: "Cargando",
    codigo: "70000001",
    marcacionStatus: null, // fuerza loading (fetch en curso)
  },
  {
    id: "entrada",
    label: "Entrada éxito",
    codigo: "70000001",
    marcacionStatus: { success: true, message: "Entrada registrada correctamente", tipo: "ENTRADA" },
  },
  {
    id: "salida",
    label: "Salida éxito",
    codigo: "70000001",
    marcacionStatus: { success: true, message: "Salida registrada correctamente", tipo: "SALIDA" },
  },
  {
    id: "descanso",
    label: "Descanso",
    codigo: "70000001",
    marcacionStatus: { success: false, message: "Hoy es tu día de descanso según tu horario.", tipo: "DESCANSO" },
  },
  {
    id: "ya_registrado",
    label: "Ya registrado",
    codigo: "70000001",
    marcacionStatus: { success: false, message: "Ya registraste entrada y salida hoy.", tipo: "YA_REGISTRADO" },
  },
  {
    id: "jornada_finalizada",
    label: "Jornada finalizada",
    codigo: "70000001",
    marcacionStatus: { success: false, message: "La jornada de ingreso ya terminó.", tipo: "JORNADA_FINALIZADA" },
  },
  {
    id: "inactivo",
    label: "Inactivo",
    codigo: "70000002",
    marcacionStatus: { success: false, message: "Practicante no activo", tipo: "INACTIVO" },
  },
  {
    id: "no_encontrado",
    label: "No encontrado",
    codigo: "00000000",
    marcacionStatus: { success: false, message: "Practicante no encontrado", tipo: "ERROR" },
  },
  {
    id: "error_generico",
    label: "Error genérico",
    codigo: "70000001",
    marcacionStatus: { success: false, message: "Error al registrar marcación", tipo: "ERROR" },
  },
];

export default function PreviewClient() {
  const [selected, setSelected] = useState<EstadoId>("entrada");
  const [key, setKey] = useState(0);

  const estado = ESTADOS.find((e) => e.id === selected)!;

  const handleSelect = (id: EstadoId) => {
    setSelected(id);
    setKey((k) => k + 1);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>TEMPORAL</strong> — Vista previa de estados de <code>QRScannerResult</code>. Borrar carpeta <code>app/marcacion/preview-estados</code> después de Fase 2B. Solo disponible en desarrollo.
        </div>
        <h1 className="mb-2 text-lg font-bold text-slate-800">Preview estados — Marcación</h1>
        <p className="mb-4 text-sm text-slate-500">Datos falsos, sin llamadas reales a API (el componente aún intenta fetch interno con `codigo`, pero muestra fallback). Sin audio real.</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <Button
              key={e.id}
              variant={selected === e.id ? "default" : "outline"}
              size="sm"
              className={selected === e.id ? "bg-brand text-brand-foreground" : ""}
              onClick={() => handleSelect(e.id)}
            >
              {e.label}
            </Button>
          ))}
        </div>
        <p className="mb-2 text-xs text-slate-400">Mostrando: <span className="font-mono font-medium text-slate-600">{estado.label}</span> — codigo <span className="font-mono">{estado.codigo}</span></p>
      </div>

      {/* Renderiza el componente real con key para remontar */}
      <div key={key}>
        <QRScannerResult
          codigo={estado.codigo}
          marcacionStatus={estado.marcacionStatus}
          onClose={() => handleSelect(estado.id)}
        />
        {/* Nota: para loading forzamos visible sin marcacionStatus, pero el componente lo resuelve tras fetch */}
      </div>

      <p className="mx-auto mt-24 max-w-5xl text-center text-xs text-slate-400">
        Estados no cubiertos por QRScannerResult: <em>cámara sin permiso / no disponible</em> (está en QRScanner.tsx), <em>sin conexión</em> y <em>vacío inicial</em> (no hay modal). Ver inventario.
      </p>
    </div>
  );
}
