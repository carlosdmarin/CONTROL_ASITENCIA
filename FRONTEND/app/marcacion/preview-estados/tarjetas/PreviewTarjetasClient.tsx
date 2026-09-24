// TEMPORAL - borrar después de la Fase 2B
"use client";

import { useState } from "react";
import { ResultadoCard, ResultadoCardBody } from "../../components/ResultadoCard";
import { Button } from "@/components/ui/button";

type Variant = "entrada" | "salida" | "ya_registrado" | "jornada_finalizada" | "descanso" | "inactivo" | "inactivo_exito" | "error";
type Perfil = "corto" | "largo" | "sin_datos";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "entrada", label: "Entrada" },
  { id: "salida", label: "Salida" },
  { id: "ya_registrado", label: "Ya registrado" },
  { id: "jornada_finalizada", label: "Jornada finalizada" },
  { id: "descanso", label: "Descanso" },
  { id: "inactivo", label: "Inactivo" },
  { id: "inactivo_exito", label: "Inactivo (variante éxito)" },
  { id: "error", label: "Error" },
];

const DATA: Record<Perfil, any> = {
  corto: {
    practicante: { nombreCompleto: "Ana Ruiz", cargo: "Practicante", area: "TI", sede: "Pucallpa", documento: "70000001" },
    hora: "08:02:15",
    fecha: "23 sept 2026",
  },
  largo: {
    practicante: {
      nombreCompleto: "María Fernanda Quispe Huamaní de la Cruz",
      cargo: "Practicante Profesional de Ingeniería de Sistemas y Tecnologías Emergentes — Área de Innovación y Desarrollo con nombre extremadamente largo para probar corte",
      area: "Tecnología de la Información y Comunicaciones — Desarrollo de Sistemas Empresariales y Transformación Digital con texto muy largo que debe hacer line-clamp",
      sede: "Oficina Pucallpa — Sede Central Ucayali — Km 36.8 Carretera Federico Basadre con dirección larga",
      documento: "70000002",
    },
    hora: "08:02:15",
    fecha: "23 sept 2026",
  },
  sin_datos: {
    practicante: null,
    hora: undefined,
    fecha: undefined,
  },
};

const MESSAGES: Record<Variant, string> = {
  entrada: "Entrada registrada correctamente a las 08:02:15.",
  salida: "Salida registrada correctamente.",
  ya_registrado: "Ya registraste entrada y salida hoy.",
  jornada_finalizada: "El horario de hoy ya terminó y no se puede registrar más.",
  descanso: "Hoy es tu día de descanso según tu horario.",
  inactivo: "Este practicante se encuentra inactivo.",
  inactivo_exito: "Practicante inactivo — se detectó en un éxito.",
  error: "No se pudo registrar la asistencia. Intenta de nuevo.",
};

export default function PreviewTarjetasClient() {
  const [perfil, setPerfil] = useState<Perfil>("corto");
  const [vista, setVista] = useState<"grid" | "modal">("grid");
  const [modalVariant, setModalVariant] = useState<Variant>("entrada");
  const [modalOpen, setModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [key, setKey] = useState(0);

  const data = DATA[perfil];

  const handleOpen = (v: Variant) => {
    setModalVariant(v);
    setClosing(false);
    setModalOpen(true);
    setKey((k) => k + 1);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setModalOpen(false);
    }, 300);
  };

  const handleProbarSalida = () => {
    setClosing(true);
    setTimeout(() => setClosing(false), 300);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>TEMPORAL</strong> — Preview tarjetas `ResultadoCard` (sin lógica). Borrar `app/marcacion/preview-estados/tarjetas` después de Fase 2B.
        </div>
        <p className="mb-4 text-xs text-slate-500">Para ver móvil usa DevTools (F12) a 390 px — Todas las variantes usan solo tokens (`--brand`, `--success`, etc.), sin emojis ni gradientes.</p>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-600 py-2">Perfil:</span>
          {(["corto", "largo", "sin_datos"] as Perfil[]).map((p) => (
            <Button key={p} variant={perfil === p ? "default" : "outline"} size="sm" className={perfil === p ? "bg-brand text-brand-foreground" : ""} onClick={() => setPerfil(p)}>
              {p === "corto" ? "Ana Ruiz" : p === "largo" ? "Nombre muy largo" : "Sin datos"}
            </Button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-slate-600 py-2">Vista:</span>
          <Button variant={vista === "grid" ? "default" : "outline"} size="sm" className={vista === "grid" ? "bg-brand text-brand-foreground" : ""} onClick={() => setVista("grid")}>Todas juntas</Button>
          <Button variant={vista === "modal" ? "default" : "outline"} size="sm" className={vista === "modal" ? "bg-brand text-brand-foreground" : ""} onClick={() => setVista("modal")}>Una sola en modal</Button>
        </div>

        {vista === "grid" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {VARIANTS.map((v) => (
              <ResultadoCardBody
                key={v.id}
                variant={v.id}
                message={MESSAGES[v.id]}
                practicante={data.practicante}
                hora={data.hora}
                fecha={data.fecha}
                onClose={() => {}}
                autoCloseMs={v.id === "entrada" || v.id === "salida" ? 5000 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {VARIANTS.map((v) => (
                <Button key={v.id} variant={modalVariant === v.id && modalOpen ? "default" : "outline"} size="sm" className={modalVariant === v.id && modalOpen ? "bg-brand text-brand-foreground" : ""} onClick={() => handleOpen(v.id)}>
                  {v.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleProbarSalida}>Probar salida (300ms)</Button>
              {!modalOpen && <Button size="sm" className="bg-brand text-brand-foreground" onClick={() => handleOpen(modalVariant)}>Reabrir</Button>}
            </div>
            <p className="text-xs text-slate-500">Controles z-[9999] por encima del modal `z-50` — siempre accesibles.</p>
          </div>
        )}
      </div>

      {vista === "modal" && modalOpen && (
        <ResultadoCard
          key={key}
          variant={modalVariant}
          message={MESSAGES[modalVariant]}
          practicante={DATA[perfil].practicante}
          hora={DATA[perfil].hora}
          fecha={DATA[perfil].fecha}
          onClose={handleClose}
          autoCloseMs={modalVariant === "entrada" || modalVariant === "salida" ? 5000 : undefined}
          closing={closing}
        />
      )}
    </div>
  );
}
