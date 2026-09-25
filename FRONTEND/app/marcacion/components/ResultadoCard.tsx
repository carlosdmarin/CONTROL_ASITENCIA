// TEMPORAL - borrar después de la Fase 2B - Componente de presentación puro, sin lógica
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  CheckCheck,
  Clock,
  CalendarOff,
  UserX,
  AlertTriangle,
  Building2,
  Briefcase,
  User,
} from "lucide-react";

type Variant = "entrada" | "salida" | "ya_registrado" | "jornada_finalizada" | "descanso" | "inactivo" | "inactivo_exito" | "error";

type Practicante = {
  nombreCompleto?: string;
  cargo?: string;
  area?: string;
  sede?: string;
  documento?: string;
};

type Props = {
  variant: Variant;
  title?: string;
  subtitle?: string;
  message?: string;
  practicante?: Practicante | null;
  hora?: string;
  fecha?: string;
  onClose?: () => void;
  autoCloseMs?: number;
  closing?: boolean;
  actionLabel?: string;
};

const CONFIG: Record<Variant, { color: string; soft: string; fg: string; icon: any; title: string; role: string; live: "polite" | "assertive" }> = {
  entrada: { color: "bg-success", soft: "bg-success-soft", fg: "text-success-fg", icon: LogIn, title: "Entrada registrada", role: "status", live: "polite" },
  salida: { color: "bg-brand", soft: "bg-brand/10", fg: "text-brand-fg", icon: LogOut, title: "Salida registrada", role: "status", live: "polite" },
  ya_registrado: { color: "bg-neutral", soft: "bg-neutral-soft", fg: "text-neutral-fg", icon: CheckCheck, title: "Asistencia completa", role: "alert", live: "assertive" },
  jornada_finalizada: { color: "bg-warning", soft: "bg-warning-soft", fg: "text-warning-fg", icon: Clock, title: "Jornada finalizada", role: "alert", live: "assertive" },
  descanso: { color: "bg-rest", soft: "bg-rest-soft", fg: "text-rest-fg", icon: CalendarOff, title: "Día de descanso", role: "alert", live: "assertive" },
  inactivo: { color: "bg-danger", soft: "bg-danger-soft", fg: "text-danger-fg", icon: UserX, title: "Practicante no activo", role: "alert", live: "assertive" },
  inactivo_exito: { color: "bg-warning", soft: "bg-warning-soft", fg: "text-warning-fg", icon: UserX, title: "Practicante inactivo", role: "alert", live: "assertive" },
  error: { color: "bg-danger", soft: "bg-danger-soft", fg: "text-danger-fg", icon: AlertTriangle, title: "No se pudo registrar", role: "alert", live: "assertive" },
};

function getInitials(name?: string) {
  if (!name) return "??";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ResultadoCardBody({ variant, title, subtitle, message, practicante, hora, fecha, onClose, autoCloseMs, closing, actionLabel }: Props) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;
  const displayTitle = title ?? cfg.title;
  const displaySubtitle =
    subtitle ?? (variant === "jornada_finalizada" ? "El horario de hoy ya terminó" : undefined);

  const hasPracticante = !!practicante?.nombreCompleto;

  // Botón: entrada/salida outline, resto relleno - feedback táctil sutil
  const isOutline = variant === "entrada" || variant === "salida";
  const buttonClass = isOutline
    ? `w-full h-12 min-h-[48px] rounded-xl border-2 bg-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-0 transition-all duration-150 active:scale-[0.98] ${variant === "entrada" ? "border-success text-success hover:bg-success-soft focus-visible:ring-success/20" : "border-brand text-brand hover:bg-brand/10 focus-visible:ring-brand/20"}`
    : `w-full h-12 min-h-[48px] rounded-xl text-white focus-visible:ring-2 ${cfg.color} hover:opacity-95 focus-visible:ring-offset-0 transition-all duration-150 active:scale-[0.98] ${variant === "descanso" ? "focus-visible:ring-rest/20" : variant === "ya_registrado" ? "focus-visible:ring-neutral/20" : variant === "jornada_finalizada" || variant === "inactivo_exito" ? "focus-visible:ring-warning/20" : "focus-visible:ring-danger/20"}`;

  return (
    <div
      role={cfg.role}
      aria-live={cfg.live}
      className={`w-[calc(100%-1rem)] max-w-100 sm:max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col ${closing ? "resultado-card-exit" : "resultado-card-enter"}`}
      style={autoCloseMs ? ({ ["--auto-close-ms" as any]: `${autoCloseMs}ms` } as React.CSSProperties) : undefined}
    >
      {/* NIVEL 1 — Qué pasó */}
      <div className={`rounded-t-2xl px-4 sm:px-6 pt-5 sm:pt-7 pb-4 sm:pb-6 flex flex-col items-center text-center ${cfg.soft}`}>
        <div className={`w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center shrink-0 ${cfg.color} animate-icon-pop`}>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" strokeWidth={2} />
        </div>
        <h2 className={`mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold tracking-tight ${cfg.fg}`}>{displayTitle}</h2>
        {displaySubtitle && <p className={`mt-1 sm:mt-1.5 text-sm sm:text-base ${cfg.fg} opacity-80`}>{displaySubtitle}</p>}
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
        {/* NIVEL 2 — La prueba (solo si hay practicante) */}
        {hasPracticante && (
          <>
            {(hora || fecha) && (
              <div className="text-center">
                {hora && <p className="text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{hora}</p>}
                {fecha && <p className="text-xs sm:text-sm text-slate-600 mt-1">{fecha}</p>}
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 bg-slate-100">
                <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">{getInitials(practicante?.nombreCompleto)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl font-semibold leading-tight break-words line-clamp-2 text-slate-900" title={practicante?.nombreCompleto}>
                  {practicante?.nombreCompleto}
                </p>
                {practicante?.cargo && (
                  <p className="text-sm text-slate-600 line-clamp-2 break-words" title={practicante?.cargo}>
                    {practicante.cargo}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Mensaje */}
        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed border ${cfg.soft} ${cfg.fg} border-current/10`}>
            {message}
          </div>
        )}

        {/* NIVEL 3 — Detalle */}
        {hasPracticante && (
          <div className="rounded-xl border border-slate-100 divide-y divide-slate-100">
            {practicante?.sede && (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-slate-500 shrink-0"><Building2 className="h-4 w-4" /> Sede</span>
                <span className="text-sm font-medium text-slate-700 break-words text-right">{practicante.sede}</span>
              </div>
            )}
            {practicante?.area && (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-slate-500 shrink-0"><Briefcase className="h-4 w-4" /> Área</span>
                <span className="text-sm font-medium text-slate-700 break-words text-right line-clamp-2" title={practicante.area}>{practicante.area}</span>
              </div>
            )}
            {practicante?.documento && (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-slate-500 shrink-0"><User className="h-4 w-4" /> Documento</span>
                <span className="text-sm font-medium text-slate-700 break-words text-right font-mono">{practicante.documento}</span>
              </div>
            )}
          </div>
        )}

        {/* Botón único */}
        {onClose && (
          <Button onClick={onClose} className={buttonClass}>
            {actionLabel ?? "Entendido"}
          </Button>
        )}
      </div>

      {/* Barra autocierre */}
      {autoCloseMs && !closing && <div className={`h-1 w-full ${cfg.color} resultado-progress`} style={{ ["--auto-close-ms" as any]: `${autoCloseMs}ms` } as React.CSSProperties} aria-hidden="true" />}
    </div>
  );
}

export function ResultadoCard(props: Props) {
  const isAlert = CONFIG[props.variant].role === "alert";
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 md:backdrop-blur-sm ${props.closing ? "resultado-card-exit" : "resultado-card-enter"}`}
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" } as React.CSSProperties}
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
    >
      <ResultadoCardBody {...props} />
    </div>
  );
}
