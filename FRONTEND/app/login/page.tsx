"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Sparkles,
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (data.email && data.password.length >= 6) {
        // ✅ GUARDAR SESIÓN EN LOCALSTORAGE
        const userData = {
          email: data.email,
          role: data.email.includes("admin") ? "admin" : "practicante",
          name: data.email.split("@")[0] || "Usuario",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        // ✅ REDIRIGIR A MARCACION
        router.push("/marcacion");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 from-slate-200">
      <div className="flex h-full w-full p-4 max-w-6xl">
        {/* ====== COLUMNA IZQUIERDA (FORMULARIO) ====== */}
        <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 bg-white/90 backdrop-blur-sm rounded-l-2xl">
          <div className="w-full max-w-sm space-y-5">
            {/* ====== LOGO ====== */}
            <div className="text-center">
              <Image
                src="/images/ONE.png"
                alt="Logo XEO - Sistema de Asistencias"
                width={160}
                height={160}
                className="mx-auto h-40 w-auto"
                priority
              />
              <p className="text-sm text-slate-500">
                Ingresa tus credenciales para ingresar
              </p>
            </div>

            {/* ====== SEPARADOR ====== */}
            <div className="flex w-full items-center gap-4">
              <div className="flex-1 border-t border-slate-200" />
              <Sparkles className="h-4 w-4 text-slate-300" />
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* ====== ERROR ====== */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* ====== FORMULARIO ====== */}
            <form
              className="w-full space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {/* ====== EMAIL ====== */}
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-slate-700">Correo</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <MailIcon className="h-4 w-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        className="border-0 shadow-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400"
                        placeholder="tucorreo@empresa.com"
                        type="email"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        disabled={isLoading}
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {/* ====== CONTRASEÑA ====== */}
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-slate-700">
                      Contraseña
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <LockIcon className="h-4 w-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        className="border-0 shadow-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        aria-invalid={fieldState.invalid}
                        disabled={isLoading}
                      />
                      <InputGroupAddon align="inline-end">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {/* ====== RECORDARME + OLVIDASTE ====== */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-600">Recordarme</span>
                </label>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* ====== BOTÓN INICIAR SESIÓN ====== */}
              <Button
                className="mt-2 w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              {/* ====== BOTÓN VOLVER ====== */}
              <a href="/landing">
                <Button
                  className="w-full h-10 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-300 border border-slate-200"
                  variant="outline"
                >
                  Volver
                </Button>
              </a>
            </form>

            {/* ====== CREDENCIALES DE PRUEBA ====== */}
            <div className="rounded-lg bg-slate-50/50 p-3 text-center text-xs border border-slate-200">
              <p className="text-slate-500">
                🔑 <span className="font-medium">Prueba:</span>
                <br />
                <span className="text-blue-600 font-mono">
                  admin@asistpro.com
                </span>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-blue-600 font-mono">123456</span>
              </p>
            </div>
          </div>
        </div>

        {/* ====== COLUMNA DERECHA (IMAGEN CON EFECTOS) ====== */}
        <div className="relative hidden lg:block lg:w-1/2 rounded-r-2xl overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Login"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://www.olamsa.com.pe/images/planta.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent transition-all duration-700 group-hover:bg-gradient-to-b group-hover:from-slate-900/70 group-hover:via-slate-900/30" />
          <div className="absolute top-0 left-0 right-0 p-8 text-white transition-all duration-700 group-hover:translate-y-[-4px]">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              Gestiona la <span className="text-blue-400">asistencia</span>
              <br />
              de tu equipo
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-300 max-w-xs transition-all duration-700 group-hover:text-white/90">
              Registra entradas, controla horarios y genera reportes en
              segundos.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 w-10 bg-blue-400 rounded-full transition-all duration-700 group-hover:w-16 group-hover:bg-blue-300" />
              <span className="text-xs text-gray-400 transition-all duration-700 group-hover:text-gray-200">
                Sistema de Asistencias
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;