"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getHomeForRole } from "@/lib/role";
import { Button } from "@/components/ui/button";
import { SplashScreen } from "@/components/auth/SplashScreen";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  User,
  AlertCircle,
} from "lucide-react";

const formSchema = z.object({
  usuario: z.string().min(1, "Usuario requerido"),
  contrasena: z.string().min(1, "Contraseña requerida"),
});

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  // Si ya hay sesión, redirigir según rol (client, backend autoridad via /me)
  // returnTo es string estable, evita que el objeto searchParams dispare el efecto en cada render
  useEffect(() => {
    if (auth.status === "authenticated" && auth.user) {
      const home = getHomeForRole(auth.user.rol);
      // Si returnTo existe y pertenece al home del rol, respetarlo, si no ir al home
      if (returnTo && returnTo.startsWith(home)) {
        router.replace(returnTo);
      } else {
        router.replace(home);
      }
    }
  }, [auth.status, (auth as any).user?.rol, router, returnTo]);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      usuario: "",
      contrasena: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: data.usuario.trim(),
          contrasena: data.contrasena,
        }),
      });

      const body = await response.json().catch(() => null);

      if (response.ok && body?.authenticated) {
        const rol = body?.user?.rol as string | undefined;
        form.setValue("contrasena", "");
        const home = getHomeForRole(rol);
        if (home === "/login") {
          setError("Tu cuenta no tiene un rol válido para PractiQR.");
          console.warn("Rol no reconocido:", rol);
          return;
        }
        if (returnTo && returnTo.startsWith(home)) {
          router.push(returnTo);
        } else {
          router.push(home);
        }
        return;
      }

      if (response.status === 401) {
        setError("Usuario o contraseña incorrectos");
        return;
      }
      if (response.status === 400) {
        const msg = body?.message || "Datos inválidos. Revisa los campos.";
        setError(msg);
        return;
      }
      const msg = body?.message || `Error inesperado (${response.status})`;
      setError(msg);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mientras verifica sesión existente, evita flash de formulario para usuarios ya autenticados
  if (auth.status === "authenticated") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
          <p className="text-sm text-slate-500">Redirigiendo…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplash && (
        <SplashScreen duration={1250} onComplete={() => setShowSplash(false)} />
      )}
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-6 lg:p-8">
        <div className="flex w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:max-w-[480px] lg:max-w-[1020px]">
          {/* ====== PANEL IZQUIERDO - FORMULARIO ====== */}
          <div className="flex w-full flex-col justify-center bg-white px-5 py-6 sm:px-8 sm:py-8 lg:w-[440px] lg:shrink-0 lg:px-8 xl:w-[460px] xl:px-10 lg:py-9">
            <div
              className="mx-auto w-full max-w-sm"
              style={
                !showSplash
                  ? { animation: "login-enter 420ms cubic-bezier(0.16,1,0.3,1) both" }
                  : undefined
              }
            >
              {/* Branding integrado */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  <Image
                    src="/images/practiQR_logo.png"
                    alt="PractiQR"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-none tracking-tight text-slate-900">
                    PractiQR
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                    Control de asistencias
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium tracking-wider text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  OLAMSA
                </span>
              </div>

              {/* Título con jerarquía clara */}
              <div className="mt-8 space-y-1.5">
                <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
                  Bienvenido de nuevo
                </h1>
                <p className="text-sm leading-relaxed text-slate-500">
                  Ingresa tus credenciales para acceder al sistema.
                </p>
              </div>

              {/* Error moderado, sin desplazar violentamente */}
              {error && (
                <div
                  className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-snug text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Formulario */}
              <form
                className="mt-6 space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
                <Controller
                  control={form.control}
                  name="usuario"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                      <FieldLabel htmlFor="login-email" className="text-[13px] font-medium text-slate-700">
                        Usuario
                      </FieldLabel>
                      <InputGroup className="h-11 rounded-xl border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 has-[[data-slot=input-group-control]:focus-visible]:border-brand/40 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-brand/15 has-[[data-slot][aria-invalid=true]]:border-red-300 has-[[data-slot][aria-invalid=true]]:ring-red-500/10">
                        <InputGroupAddon className="pl-3">
                          <User className="h-4 w-4 text-slate-400" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="login-email"
                          className="border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 sm:text-[14px]"
                          placeholder="Ingresa tu usuario"
                          type="text"
                          autoComplete="username"
                          {...field}
                          aria-invalid={fieldState.invalid}
                          disabled={isLoading}
                        />
                      </InputGroup>
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[12.5px] font-normal"
                      />
                    </Field>
                  )}
                />

                {/* Contraseña */}
                <Controller
                  control={form.control}
                  name="contrasena"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                      <FieldLabel htmlFor="login-password" className="text-[13px] font-medium text-slate-700">
                        Contraseña
                      </FieldLabel>
                      <InputGroup className="h-11 rounded-xl border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 has-[[data-slot=input-group-control]:focus-visible]:border-brand/40 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-brand/15 has-[[data-slot][aria-invalid=true]]:border-red-300 has-[[data-slot][aria-invalid=true]]:ring-red-500/10">
                        <InputGroupAddon className="pl-3">
                          <LockIcon className="h-4 w-4 text-slate-400" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="login-password"
                          className="border-0 bg-transparent text-[16px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 sm:text-[14px]"
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          {...field}
                          aria-invalid={fieldState.invalid}
                          disabled={isLoading}
                        />
                        <InputGroupAddon align="inline-end" className="pr-1">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            tabIndex={0}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-[12.5px] font-normal"
                      />
                    </Field>
                  )}
                />

                {/* Recordarme + Olvidaste - fila 44px clicable, sin quiebre */}
                <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
                  <label htmlFor="remember-me" className="flex min-h-[44px] cursor-pointer items-center gap-2 py-2 pr-2 text-sm">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 accent-brand focus:ring-brand/20 focus:ring-2 focus:ring-offset-0"
                      disabled={isLoading}
                    />
                    <span className="text-[13.5px] text-slate-600">Recordarme</span>
                  </label>
                  <Link
                    href="#"
                    className="flex min-h-[44px] items-center whitespace-nowrap rounded-md px-2 py-2 text-[13.5px] font-medium text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón principal - acento de marca con degradado sutil */}
                <Button
                  className="h-11 min-h-[44px] w-full rounded-xl bg-gradient-to-r from-brand to-brand-hover text-[14px] font-medium text-brand-foreground shadow-sm transition-all hover:opacity-[0.95] focus-visible:ring-2 focus-visible:ring-brand/20 active:scale-[0.99] disabled:opacity-60"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Ingresando...
                    </span>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
                © 2026 OLAMSA · Sistema interno de control
              </p>
            </div>
          </div>

          {/* ====== PANEL DERECHO - BRANDING VISUAL ====== */}
          <div className="relative hidden flex-1 overflow-hidden bg-slate-900 lg:flex">
            <Image
              alt=""
              aria-hidden="true"
              fill
              className="object-cover"
              src="/images/olamsa-planta.png"
              sizes="(min-width: 1024px) 50vw, 0vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/35 to-slate-900/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_400px_at_20%_10%,rgba(59,130,246,0.18),transparent_70%)]" />
            <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wider text-white/80 backdrop-blur">
                  OLAMSA · Ucayali, Perú
                </span>
                <h2 className="mt-6 max-w-[360px] text-[28px] font-bold leading-[1.15] tracking-tight text-white xl:text-[32px]">
                  Gestiona la <span className="text-blue-300">asistencia</span>
                  <br />
                  de tus practicantes
                </h2>
                <p className="mt-3 max-w-[340px] text-sm leading-relaxed text-slate-200/80">
                  Registra entradas, controla horarios y genera reportes en
                  segundos. Todo en un solo lugar.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-px w-10 bg-blue-400/80" />
                  <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                    Sistema de Asistencias
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                Fotografías: Planta OLAMSA KM 36.8
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes login-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="login-enter"] { animation: none !important; }
        }
      `}</style>
    </>
  );
};

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
