"use client";

import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  CalendarDays,
  User,
  Building2,
  IdCard,
  Sparkles,
  Info,
} from "lucide-react";
import { Practicante } from "@/types/practicante";

type TipoReporte = "DIARIO" | "SEMANAL" | "MENSUAL";

interface Props {
  practicante: Practicante | null;
  tipo: TipoReporte;
  periodoLabel: string;
}

function toTitleCase(texto: string) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

function getInitials(nombre: string) {
  if (!nombre) return "?";
  const partes = nombre.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombre.charAt(0) || "?";
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-400 via-amber-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-cyan-400 via-sky-500 to-blue-600",
];

function getAvatarGradient(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const TIPO_LABEL: Record<TipoReporte, string> = {
  DIARIO: "Diario",
  SEMANAL: "Semanal",
  MENSUAL: "Mensual",
};

export function ReporteStepConfirmacion({
  practicante,
  tipo,
  periodoLabel,
}: Props) {
  if (!practicante) return null;

  const nombreDisplay = toTitleCase(practicante.nombreCompleto);
  const gradient = getAvatarGradient(
    practicante.idPracticante,
    practicante.nombreCompleto,
  );

  return (
    <div className="space-y-4">
      {/* ═══════════ HEADER DE SECCIÓN ═══════════ */}
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
          <FileCheck className="h-4 w-4 text-white" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
              Revisá tu reporte
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
              Último paso
            </span>
          </div>
          <p className="text-[11.5px] text-slate-500 mt-0.5">
            Verificá los datos antes de generar el reporte
          </p>
        </div>
      </div>

      {/* ═══════════ CARD: PRACTICANTE ═══════════ */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5 text-blue-700" strokeWidth={2.4} />
            </div>
            <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
              Practicante
            </h4>
          </div>
          {practicante.tipoPracticante && (
            <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0">
              {practicante.tipoPracticante}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar con gradiente */}
            <div
              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[14px] font-bold shadow-sm shrink-0`}
            >
              {getInitials(nombreDisplay)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight">
                {nombreDisplay}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600">
                  <IdCard className="h-3 w-3 text-slate-400" strokeWidth={2.4} />
                  {practicante.documento}
                </span>
                {(practicante.nombreOficina || practicante.oficina) && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[180px]">
                      <Building2
                        className="h-3 w-3 text-slate-400 shrink-0"
                        strokeWidth={2.4}
                      />
                      <span className="truncate">
                        {practicante.nombreOficina ||
                          practicante.oficina ||
                          "Sin área"}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ CARD: RESUMEN DEL REPORTE ═══════════ */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <FileCheck className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2.4} />
          </div>
          <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
            Resumen del reporte
          </h4>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tipo */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/40 px-3.5 py-3">
            <div className="h-10 w-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center shrink-0">
              <FileCheck className="h-4 w-4 text-blue-700" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 leading-none">
                Tipo de reporte
              </p>
              <p className="text-[14px] font-bold text-blue-900 mt-1.5 truncate">
                {TIPO_LABEL[tipo]}
              </p>
            </div>
          </div>

          {/* Período */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3.5 py-3">
            <div className="h-10 w-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center shrink-0">
              <CalendarDays
                className="h-4 w-4 text-emerald-700"
                strokeWidth={2.2}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 leading-none">
                Período
              </p>
              <p className="text-[14px] font-bold text-emerald-900 mt-1.5 truncate capitalize">
                {periodoLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ BANNER INFORMATIVO ═══════════ */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3.5">
        <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
          <Info className="h-4 w-4 text-blue-600" strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-blue-900">
            Todo listo para generar
          </p>
          <p className="text-[11.5px] text-blue-700 mt-0.5 leading-snug">
            Al confirmar se generará el reporte{" "}
            <span className="font-semibold">
              {TIPO_LABEL[tipo].toLowerCase()}
            </span>{" "}
            del practicante
          </p>
        </div>
      </div>
    </div>
  );
}