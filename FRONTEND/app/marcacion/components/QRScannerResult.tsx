// app/marcacion/components/QRScannerResult.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { practicantesApi } from "@/lib/api/practicantes";
import { ResultadoCard } from "./ResultadoCard";

const AUTO_CLOSE_MS = 5000;

interface QRScannerResultProps {
  codigo: string;
  onClose: () => void;
  marcacionStatus?: {
    success: boolean;
    message: string;
    tipo?:
      | "ENTRADA"
      | "SALIDA"
      | "DESCANSO"
      | "YA_REGISTRADO"
      | "JORNADA_FINALIZADA"
      | "INACTIVO"
      | "ERROR";
  } | null;
}

type PracticanteReal = {
  idPracticante: number;
  nombreCompleto: string;
  documento: string;
  sede: string;
  area: string;
  cargo: string;
  situacion: string;
} | null;

export default function QRScannerResult({
  codigo,
  onClose,
  marcacionStatus,
}: QRScannerResultProps) {
  const [practicante, setPracticante] = useState<PracticanteReal>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hora, setHora] = useState("");
  const [fecha, setFecha] = useState("");
  const [visible, setVisible] = useState(true);

  // SONIDOS
  const playedSoundRef = useRef<string | null>(null);

  const isDescanso = marcacionStatus?.tipo === "DESCANSO";
  const isYaRegistrado = marcacionStatus?.tipo === "YA_REGISTRADO";
  const isJornadaFinalizada = marcacionStatus?.tipo === "JORNADA_FINALIZADA";
  const isInactivo =
    marcacionStatus?.tipo === "INACTIVO" ||
    marcacionStatus?.message?.toLowerCase().includes("no activo") ||
    marcacionStatus?.message?.toLowerCase().includes("inactivo");
  const isError =
    marcacionStatus?.tipo === "ERROR" ||
    (!marcacionStatus?.success &&
      marcacionStatus !== null &&
      !isDescanso &&
      !isYaRegistrado &&
      !isJornadaFinalizada &&
      !isInactivo);
  const isSuccess = marcacionStatus?.success === true;
  const isEntrada = isSuccess && marcacionStatus?.tipo === "ENTRADA";
  const isSalida = isSuccess && marcacionStatus?.tipo === "SALIDA";

  useEffect(() => {
    if (!marcacionStatus) return;

    const sonido = `${codigo}-${marcacionStatus.tipo}`;

    // Evita reproducir el mismo sonido mas de una vez
    if (playedSoundRef.current === sonido) return;

    let archivoSonido: string | null = null;

    switch (marcacionStatus.tipo) {
      case "ENTRADA":
      case "SALIDA":
        archivoSonido = "/sounds/success.mp3";
        break;

      case "YA_REGISTRADO":
        archivoSonido = "/sounds/completed.mp3";
        break;

      case "ERROR":
      case "INACTIVO":
      case "DESCANSO":
        archivoSonido = "/sounds/error.mp3";
        break;

      default:
        break;
    }

    if (!archivoSonido) return;

    playedSoundRef.current = sonido;

    const audio = new Audio(archivoSonido);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // El navegador puede bloquear audio si no hubo interacción del usuario
    });
  }, [marcacionStatus, codigo]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await practicantesApi.getByDocumento(codigo);
        if (!mounted) return;
        setPracticante({
          idPracticante: data.idPracticante,
          nombreCompleto: data.nombreCompleto,
          documento: data.documento,
          sede: (data as any).sede || "—",
          area: (data as any).area || (data as any).nombreOficina || "—",
          cargo: data.cargo,
          situacion: data.situacion,
        });
      } catch (e: any) {
        if (!mounted) return;
        setError(`No se encontró practicante con documento ${codigo}`);
        setPracticante(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    const now = new Date();
    setHora(
      now.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    setFecha(
      now.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    );

    // Cerrar automático SOLO si es éxito
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, AUTO_CLOSE_MS);
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [codigo, onClose, isSuccess]);

  if (!visible) return null;

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <Card className="max-w-sm w-full mx-4 p-8 text-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600">Buscando practicante...</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">{codigo}</p>
        </Card>
      </div>
    );
  }

  // ===== CARD: DÍA DE DESCANSO =====
  if (isDescanso) {
    return (
      <ResultadoCard
        variant="descanso"
        closing={!visible}
        onClose={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        practicante={
          practicante
            ? {
                nombreCompleto: practicante.nombreCompleto,
                cargo: practicante.cargo,
                area: practicante.area,
                sede: practicante.sede,
                documento: practicante.documento,
              }
            : null
        }
        hora={hora}
        fecha={fecha}
        message={marcacionStatus?.message}
      />
    );
  }

  // ===== CARD: JORNADA FINALIZADA =====
  if (isJornadaFinalizada) {
    const rawMsg = marcacionStatus?.message;
    const hasMsg = rawMsg && rawMsg.trim().length > 0;
    return (
      <ResultadoCard
        variant="jornada_finalizada"
        subtitle={hasMsg ? "" : undefined}
        message={hasMsg ? rawMsg : undefined}
        closing={!visible}
        onClose={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        practicante={
          practicante
            ? {
                nombreCompleto: practicante.nombreCompleto,
                cargo: practicante.cargo,
                area: practicante.area,
                sede: practicante.sede,
                documento: practicante.documento,
              }
            : null
        }
        hora={hora}
        fecha={fecha}
      />
    );
  }

  // ===== CARD: PRACTICANTE NO ACTIVO =====
  if (isInactivo) {
    const msgInactivo = marcacionStatus?.message;
    const isSameInactivo = msgInactivo && msgInactivo.trim().toLowerCase() === "practicante no activo";
    return (
      <ResultadoCard
        variant="inactivo"
        closing={!visible}
        onClose={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        practicante={
          practicante
            ? {
                nombreCompleto: practicante.nombreCompleto,
                cargo: practicante.cargo,
                area: practicante.area,
                sede: practicante.sede,
                documento: practicante.documento,
              }
            : null
        }
        hora={hora}
        fecha={fecha}
        message={isSameInactivo ? undefined : msgInactivo}
      />
    );
  }

  // ===== CARD: YA REGISTRÓ ENTRADA Y SALIDA =====
  if (isYaRegistrado) {
    return (
      <ResultadoCard
        variant="ya_registrado"
        closing={!visible}
        onClose={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        practicante={
          practicante
            ? {
                nombreCompleto: practicante.nombreCompleto,
                cargo: practicante.cargo,
                area: practicante.area,
                sede: practicante.sede,
                documento: practicante.documento,
              }
            : null
        }
        hora={hora}
        fecha={fecha}
        message={marcacionStatus?.message}
      />
    );
  }

  // ===== CARD: ERROR =====
  if (isError || error || !practicante) {
    const hasPracticante = !!practicante?.nombreCompleto;
    const msgError = marcacionStatus?.message || error || "Practicante no encontrado";
    return (
      <ResultadoCard
        variant="error"
        subtitle={hasPracticante ? undefined : `Código escaneado: ${codigo}`}
        message={msgError}
        practicante={
          hasPracticante && practicante
            ? {
                nombreCompleto: practicante.nombreCompleto,
                cargo: practicante.cargo,
                area: practicante.area,
                sede: practicante.sede,
                documento: practicante.documento,
              }
            : null
        }
        hora={hasPracticante ? hora : undefined}
        fecha={hasPracticante ? fecha : undefined}
        closing={!visible}
        onClose={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        actionLabel="Intentar de nuevo"
      />
    );
  }

  // ===== CARD: ÉXITO — inactivo variante y entrada/salida
  const isInactive = practicante?.situacion !== "ACTIVO";

  // Inactivo variante — Grupo 3
  if (isInactive) {
    return (
      <ResultadoCard
        variant="inactivo_exito"
        closing={!visible}
        onClose={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        practicante={
          practicante
            ? {
                nombreCompleto: practicante.nombreCompleto,
                cargo: practicante.cargo,
                area: practicante.area,
                sede: practicante.sede,
                documento: practicante.documento,
              }
            : null
        }
        hora={hora}
        fecha={fecha}
        message={marcacionStatus?.message}
        autoCloseMs={AUTO_CLOSE_MS}
      />
    );
  }

  // Entrada / Salida — nuevo
  return (
    <ResultadoCard
      variant={isEntrada ? "entrada" : isSalida ? "salida" : "entrada"}
      closing={!visible}
      onClose={() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }}
      practicante={
        practicante
          ? {
              nombreCompleto: practicante.nombreCompleto,
              cargo: practicante.cargo,
              area: practicante.area,
              sede: practicante.sede,
              documento: practicante.documento,
            }
          : null
      }
      hora={hora}
      fecha={fecha}
      message={marcacionStatus?.message}
      autoCloseMs={AUTO_CLOSE_MS}
    />
  );
}
