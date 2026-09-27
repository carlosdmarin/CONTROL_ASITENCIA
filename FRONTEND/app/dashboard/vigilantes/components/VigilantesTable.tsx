"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  MapPin,
  Search,
  KeyRound,
  ShieldCheck,
  ShieldPlus,
  UserRoundCog,
  AtSign,
  Radio,
  PowerOff,
  RotateCcw,
} from "lucide-react";

export type VigilanteMock = {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  usuario: string;
  sede: string;
  estado: "ACTIVO" | "INACTIVO";
};

interface VigilantesTableProps {
  vigilantes: VigilanteMock[];
  loading?: boolean;
  busqueda?: string;
  onChangePassword: (vigilante: VigilanteMock) => void;
  onToggleEstado?: (vigilante: VigilanteMock) => void;
  onCreate?: () => void;
}

const AVATAR_GRADIENTS = [
  "from-blue-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-400 via-amber-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-cyan-400 via-sky-500 to-blue-600",
];

// Fix #2: normaliza el nombre a Title Case sin importar cómo venga guardado
function toTitleCase(texto: string) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

function getInitials(nombreCompleto: string) {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.split(" ");
  if (partes.length >= 2) {
    return (partes[0]?.charAt(0) || "") + (partes[1]?.charAt(0) || "");
  }
  return nombreCompleto.charAt(0) || "?";
}

function getAvatarGradient(id: number, nombre: string) {
  const str = `${id}-${nombre}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const TableSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-4 px-6 py-3 border-b border-slate-100"
      >
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    ))}
  </>
);

export default function VigilantesTable({
  vigilantes,
  loading = false,
  busqueda = "",
  onChangePassword,
  onToggleEstado,
  onCreate,
}: VigilantesTableProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
      {/* ═══════════ HEADER TIPO CONSOLA ═══════════ */}
      {/* Fix #1: fondo propio (slate-50) + borde más marcado para que
          se lea claramente como encabezado y no como una fila más */}
      <div className="relative border-b border-slate-200">
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-orange-500 to-blue-700" />

        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <UserRoundCog className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight uppercase">
                  Vigilantes
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  <Radio className="h-2.5 w-2.5" />
                  En vivo
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Control de acceso y asistencia · {vigilantes.length}{" "}
                {vigilantes.length === 1 ? "operador" : "operadores"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ LISTA ═══════════ */}
      <CardContent className="p-0 bg-white">
        {loading ? (
          <TableSkeleton />
        ) : vigilantes.length === 0 ? (
          <div className="py-20 text-center">
            {busqueda ? (
              <>
                <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-[14px] font-semibold text-slate-800">
                  Sin resultados
                </p>
                <p className="text-[12px] text-slate-500 mt-1">
                  No se encontraron vigilantes para{" "}
                  <span className="font-mono text-slate-700">"{busqueda}"</span>
                </p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 mx-auto mb-4 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-blue-600" strokeWidth={2} />
                </div>
                <p className="text-[14px] font-semibold text-slate-800">
                  Aún no hay vigilantes
                </p>
                <p className="text-[12px] text-slate-500 mt-1 mb-5">
                  Crea el primer operador para comenzar.
                </p>
                {onCreate && (
                  <Button
                    onClick={onCreate}
                    className="gap-2 bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-900/20"
                  >
                    <ShieldPlus className="h-4 w-4" />
                    Crear el primero
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          vigilantes.map((v) => {
            const activo = v.estado === "ACTIVO";
            const gradient = getAvatarGradient(v.id, v.nombreCompleto);
            const nombreDisplay = toTitleCase(v.nombreCompleto);

            return (
              <div
                key={v.id}
                className="group relative flex items-center gap-4 px-6 py-2.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors duration-150"
              >
                {/* Avatar mediano con gradiente */}
                <div className="relative shrink-0">
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[13px] font-bold shadow-sm ring-2 ring-white`}
                  >
                    {getInitials(nombreDisplay)}
                  </div>
                </div>

                {/* Identidad */}
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight tracking-tight">
                    {nombreDisplay}
                  </p>
                  {/* Fix #4: secundario con menos contraste (slate-400) para que no compita con el nombre */}
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <AtSign className="h-3 w-3" />
                      {v.usuario}
                    </span>
                    <span>·</span>
                    <span className="font-mono">
                      ID-{String(v.id).padStart(3, "0")}
                    </span>
                  </div>
                </div>

                {/* Sede — mini-card embebida */}
                <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-blue-700" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9.5px] uppercase tracking-wider font-semibold text-slate-400 leading-none">
                      Sede
                    </p>
                    <p className="text-[12px] font-medium text-slate-800 truncate max-w-[130px] mt-0.5">
                      {v.sede || "—"}
                    </p>
                  </div>
                </div>

                {/* Estado */}
                <div className="shrink-0">
                  {activo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      ACTIVO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      INACTIVO
                    </span>
                  )}
                </div>

                {/* Acciones — cambiar contraseña + activar/desactivar */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          onClick={() => onChangePassword(v)}
                          className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-200"
                          aria-label={`Cambiar contraseña de ${v.usuario}`}
                        >
                          <KeyRound className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:scale-110" />
                        </button>
                      }
                    />
                    <TooltipContent className="bg-slate-900 text-white text-xs">
                      <p>Cambiar contraseña</p>
                    </TooltipContent>
                  </Tooltip>

                  {onToggleEstado && (
                    activo ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <button
                              onClick={() => onToggleEstado(v)}
                              className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-slate-50 border border-slate-200 text-amber-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-200"
                              aria-label={`Desactivar ${v.usuario}`}
                            >
                              <PowerOff className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:scale-110" />
                            </button>
                          }
                        />
                        <TooltipContent className="bg-slate-900 text-white text-xs">
                          <p>Desactivar vigilante</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <button
                              onClick={() => onToggleEstado(v)}
                              className="group/btn h-9 w-9 rounded-lg inline-flex items-center justify-center bg-slate-50 border border-slate-200 text-emerald-600 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all duration-200"
                              aria-label={`Activar ${v.usuario}`}
                            >
                              <RotateCcw className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:scale-110" />
                            </button>
                          }
                        />
                        <TooltipContent className="bg-slate-900 text-white text-xs">
                          <p>Activar vigilante</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* ═══════════ FOOTER ═══════════ */}
        {/* Fix #5: un solo mensaje coherente en vez de dos metadatos sueltos */}
        {!loading && vigilantes.length > 0 && (
          <div className="flex items-center justify-between bg-slate-50/60 border-t border-slate-100 px-6 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Users className="h-3.5 w-3.5" />
              <span>
                <span className="font-semibold text-slate-700">
                  {vigilantes.length}
                </span>{" "}
                {vigilantes.length === 1 ? "operador" : "operadores"} en el
                sistema
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}