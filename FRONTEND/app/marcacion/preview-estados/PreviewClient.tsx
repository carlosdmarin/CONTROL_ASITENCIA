// TEMPORAL - borrar después de la Fase 2B
"use client";

import { useState, useEffect } from "react";
import QRScannerResult from "../components/QRScannerResult";
import QRScanner from "../components/QRScanner";
import { Button } from "@/components/ui/button";
import { practicantesApi } from "@/lib/api/practicantes";

type EstadoId =
  | "loading"
  | "entrada"
  | "salida"
  | "entrada_inactivo_variante"
  | "descanso"
  | "ya_registrado"
  | "jornada_finalizada"
  | "inactivo"
  | "no_encontrado"
  | "error_generico";

type PerfilId = "corto" | "largo" | "sin_foto";

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
  { id: "loading", label: "Cargando", codigo: "70000001", marcacionStatus: null },
  { id: "entrada", label: "Entrada éxito", codigo: "70000001", marcacionStatus: { success: true, message: "Entrada registrada correctamente", tipo: "ENTRADA" } },
  { id: "salida", label: "Salida éxito", codigo: "70000001", marcacionStatus: { success: true, message: "Salida registrada correctamente", tipo: "SALIDA" } },
  { id: "entrada_inactivo_variante", label: "Entrada éxito pero INACTIVO (variante)", codigo: "70000003", marcacionStatus: { success: true, message: "Entrada registrada correctamente", tipo: "ENTRADA" } },
  { id: "descanso", label: "Descanso", codigo: "70000001", marcacionStatus: { success: false, message: "Hoy es tu día de descanso según tu horario.", tipo: "DESCANSO" } },
  { id: "ya_registrado", label: "Ya registrado", codigo: "70000001", marcacionStatus: { success: false, message: "Ya registraste entrada y salida hoy.", tipo: "YA_REGISTRADO" } },
  { id: "jornada_finalizada", label: "Jornada finalizada", codigo: "70000001", marcacionStatus: { success: false, message: "La jornada de ingreso ya terminó.", tipo: "JORNADA_FINALIZADA" } },
  { id: "inactivo", label: "Inactivo", codigo: "70000002", marcacionStatus: { success: false, message: "Practicante no activo", tipo: "INACTIVO" } },
  { id: "no_encontrado", label: "No encontrado", codigo: "00000000", marcacionStatus: { success: false, message: "Practicante no encontrado", tipo: "ERROR" } },
  { id: "error_generico", label: "Error genérico", codigo: "70000001", marcacionStatus: { success: false, message: "Error al registrar marcación", tipo: "ERROR" } },
];

const PERFILES: Record<PerfilId, any> = {
  corto: {
    idPracticante: 1,
    nombreCompleto: "Ana Ruiz",
    documento: "70000001",
    sede: "Pucallpa",
    oficina: "TI",
    nombreOficina: "TI",
    area: "TI",
    cargo: "Practicante",
    situacion: "ACTIVO",
    tipoInstituto: "Universidad",
    horasSemanalesRequeridas: 30,
    fechaInicioPracticas: "2026-01-01",
  },
  largo: {
    idPracticante: 2,
    nombreCompleto: "María Fernanda Quispe Huamaní de la Cruz",
    documento: "70000002",
    sede: "Oficina Pucallpa - Sede Central Ucayali - Km 36.8 Carretera Federico Basadre",
    oficina: "Tecnología de la Información y Comunicaciones - Desarrollo de Sistemas Empresariales y Transformación Digital",
    nombreOficina: "Tecnología de la Información y Comunicaciones - Desarrollo de Sistemas Empresariales y Transformación Digital",
    area: "Tecnología de la Información y Comunicaciones - Desarrollo de Sistemas Empresariales y Transformación Digital",
    cargo: "Practicante Profesional de Ingeniería de Sistemas y Tecnologías Emergentes - Área de Innovación y Desarrollo",
    situacion: "ACTIVO",
    tipoInstituto: "Universidad Nacional de Ucayali",
    horasSemanalesRequeridas: 30,
    fechaInicioPracticas: "2026-01-01",
  },
  sin_foto: {
    idPracticante: 3,
    nombreCompleto: "Carlos Pérez",
    documento: "70000003",
    sede: "Pucallpa",
    oficina: "Logística",
    nombreOficina: "Logística",
    area: "Logística",
    cargo: "Practicante Pre Profesional",
    situacion: "ACTIVO",
    tipoInstituto: "Instituto",
    horasSemanalesRequeridas: 30,
    fechaInicioPracticas: "2026-01-01",
  },
};

export default function PreviewClient() {
  const [selected, setSelected] = useState<EstadoId>("entrada");
  const [perfil, setPerfil] = useState<PerfilId>("corto");
  const [visible, setVisible] = useState(true);
  const [key, setKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const estado = ESTADOS.find((e) => e.id === selected)!;

  // 1. Override instalado ANTES de montar modal (ready)
  useEffect(() => {
    const original = practicantesApi.getByDocumento;
    const originalByCodigo = (practicantesApi as any).getByCodigo;

    const fakeForPerfil = () => {
      if (selected === "entrada_inactivo_variante") {
        return { ...PERFILES["corto"], situacion: "INACTIVO", nombreCompleto: "Jorge Inactivo Prueba", documento: "70000003" };
      }
      return PERFILES[perfil];
    };

    (practicantesApi as any).getByDocumento = async (doc: string) => {
      if (selected === "loading") {
        return new Promise(() => {});
      }
      if (selected === "no_encontrado") {
        throw new Error("Practicante no encontrado");
      }
      await new Promise((r) => setTimeout(r, 300));
      const fake = fakeForPerfil();
      return { ...fake, documento: estado.codigo };
    };
    if (originalByCodigo) {
      (practicantesApi as any).getByCodigo = async (doc: string) => {
        if (selected === "no_encontrado") throw new Error("Practicante no encontrado");
        if (selected === "loading") return new Promise(() => {}) as any;
        await new Promise((r) => setTimeout(r, 300));
        return { ...fakeForPerfil(), documento: estado.codigo };
      };
    }

    setReady(true);

    return () => {
      (practicantesApi as any).getByDocumento = original;
      if (originalByCodigo) (practicantesApi as any).getByCodigo = originalByCodigo;
    };
  }, [perfil, selected, estado.codigo]);

  const handleSelect = (id: EstadoId) => {
    setSelected(id);
    setVisible(true);
    setKey((k) => k + 1);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleReopen = () => {
    setVisible(true);
    setKey((k) => k + 1);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 pb-40">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>TEMPORAL</strong> — Vista previa de estados de <code>QRScannerResult</code> + <code>QRScanner</code>. Borrar carpeta <code>app/marcacion/preview-estados</code> después de Fase 2B. Solo disponible en desarrollo.
        </div>
        <h1 className="mb-2 text-lg font-bold text-slate-800">Preview estados — Marcación</h1>
        <p className="mb-1 text-sm text-slate-500">Datos falsos completos vía override de <code>practicantesApi.getByDocumento</code> instalado antes de montar el modal (estado listo: {ready ? "sí" : "instalando..."}). Sin red al backend. Audio puede sonar.</p>
        <p className="mb-4 text-xs text-slate-500">Para ver el modal en móvil usa DevTools (F12) con ancho 390. El selector de ancho se quitó porque el modal es fixed inset-0.</p>

        {!visible && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Modal cerrado — estado actual: <span className="font-mono font-medium text-slate-800">{estado.label}</span> — perfil <span className="font-mono">{perfil}</span></p>
            <Button size="sm" className="mt-2 bg-brand text-brand-foreground" onClick={handleReopen}>Reabrir</Button>
          </div>
        )}

        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-2 text-center text-xs text-slate-400">Fondo de prueba — el modal es fixed y tapa todo, pero la barra inferior sigue accesible con z-[9999]</div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
          <strong>Estados de cámara (QRScanner.tsx ~156):</strong> Mensaje <em>&quot;Si la cámara no inicia...&quot;</em> es estado inicial <code>!isCameraReady</code>. No hay permiso denegado diferenciado; denegar va a <code>toast.error</code>. Para ver pausa, usa el preview de abajo.
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCameraPreview((v) => !v)}>{showCameraPreview ? "Ocultar" : "Mostrar"} preview cámara pausada</Button>
            {showCameraPreview && <Button size="sm" variant="outline" onClick={() => setIsScanning((v) => !v)}>{isScanning ? "Pausar" : "Reanudar"} (simulado)</Button>}
          </div>
        </div>
        {showCameraPreview && (
          <div className="mx-auto mt-3 max-w-md overflow-hidden rounded-xl border border-slate-200 bg-black">
            <div className="aspect-square">
              <QRScanner onScan={() => {}} onError={() => {}} isActive={isScanning} isResultVisible={false} />
            </div>
          </div>
        )}
      </div>

      {/* Modal real — solo cuando listo y visible */}
      {ready && visible && (
        <div key={key}>
          <QRScannerResult
            codigo={estado.codigo}
            marcacionStatus={estado.marcacionStatus}
            onClose={handleClose}
          />
        </div>
      )}

      <p className="mx-auto mt-8 max-w-5xl text-center text-xs text-slate-400">
        Audio: intenta <code>/sounds/*.mp3</code> según tipo. Si suena, es normal; si da error se silencia con catch.
      </p>

      {/* Barra fija siempre accesible */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pointer-events-auto" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <span className="text-xs font-medium text-slate-700">Controles</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setControlsVisible((v) => !v)}>{controlsVisible ? "Ocultar" : "Mostrar"}</Button>
            <Button size="sm" className="h-7 bg-brand text-brand-foreground text-xs" onClick={handleReopen}>Reabrir</Button>
          </div>
        </div>
        {controlsVisible && (
          <div className="max-h-[28vh] overflow-y-auto border-t border-slate-100">
            <div className="p-3 space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Perfil:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {([
                    ["corto", "Nombre corto"],
                    ["largo", "Nombre muy largo"],
                    ["sin_foto", "Sin foto"],
                  ] as const).map(([id, label]) => (
                    <Button key={id} variant={perfil === id ? "default" : "outline"} size="sm" className={perfil === id ? "bg-brand text-brand-foreground whitespace-nowrap" : "whitespace-nowrap"} onClick={() => { setPerfil(id as PerfilId); setVisible(true); setKey((k) => k + 1); }}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Estado:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {ESTADOS.map((e) => (
                    <Button key={e.id} variant={selected === e.id ? "default" : "outline"} size="sm" className={selected === e.id ? "bg-brand text-brand-foreground whitespace-nowrap" : "whitespace-nowrap"} onClick={() => handleSelect(e.id)}>
                      {e.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
