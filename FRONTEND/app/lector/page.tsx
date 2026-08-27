"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Calendar,
  QrCode,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react";

// ====== DATOS DE PRUEBA ======
const empleadosDB = [
  { id: 1, name: "Carlos Daniel Marín Panduro", initials: "CM", role: "Gerente" },
  { id: 2, name: "Ana García Ruiz", initials: "AG", role: "Diseñadora" },
  { id: 3, name: "Luis Pérez Gómez", initials: "LP", role: "Desarrollador" },
  { id: 4, name: "Marta López Castro", initials: "ML", role: "QA" },
  { id: 5, name: "José Ramírez Soto", initials: "JR", role: "DevOps" },
];

type Asistencia = {
  id: number;
  empleadoId: number;
  nombre: string;
  hora: string;
  tipo: "entrada" | "salida";
};

export default function LectorPage() {
  const [horaActual, setHoraActual] = useState(new Date());
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [dni, setDni] = useState("");
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState<
    (typeof empleadosDB)[0] | null
  >(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "success" | "error" } | null>(null);

  // ====== RELOJ EN TIEMPO REAL ======
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ====== FORMATEAR FECHA ======
  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).toUpperCase();
  };

  // ====== FORMATEAR HORA ======
  const formatearHora = (fecha: Date) => {
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ====== BUSCAR EMPLEADO POR DNI ======
  const buscarPorDNI = (dniIngresado: string) => {
    const encontrado = empleadosDB.find(
      (emp) =>
        emp.id.toString() === dniIngresado ||
        emp.name.toLowerCase().includes(dniIngresado.toLowerCase())
    );

    if (encontrado) {
      setEmpleadoEncontrado(encontrado);
      setMensaje({ texto: `✅ ${encontrado.name} encontrado`, tipo: "success" });
      setTimeout(() => {
        registrarAsistencia(encontrado);
      }, 800);
    } else {
      setEmpleadoEncontrado(null);
      setMensaje({ texto: "❌ Empleado no encontrado", tipo: "error" });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  // ====== REGISTRAR ASISTENCIA ======
  const registrarAsistencia = (empleado: (typeof empleadosDB)[0]) => {
    const ahora = new Date();
    const nuevaAsistencia: Asistencia = {
      id: asistencias.length + 1,
      empleadoId: empleado.id,
      nombre: empleado.name,
      hora: formatearHora(ahora),
      tipo: "entrada",
    };

    setAsistencias([nuevaAsistencia, ...asistencias]);
    setMensaje({ texto: `✅ ${empleado.name} registrado correctamente`, tipo: "success" });
    setDni("");
    setEmpleadoEncontrado(null);

    setTimeout(() => setMensaje(null), 6000);
  };

  // ====== MANEJAR ENTER ======
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && dni.trim()) {
      buscarPorDNI(dni.trim());
    }
  };

  // ====== OBTENER INICIALES ======
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* ====== HEADER CON FECHA Y HORA ====== */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>{formatearFecha(horaActual)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-400" />
            <span className="text-4xl md:text-5xl font-mono font-bold tracking-wider text-white">
              {formatearHora(horaActual)}
            </span>
          </div>
          <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            SISTEMA ACTIVO
          </Badge>
        </div>

        {/* ====== TARJETA PRINCIPAL ====== */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20">
                <QrCode className="h-4 w-4" />
                Acerque su DNI al lector
              </div>
              <p className="text-gray-400 text-sm mt-3">
                Escanea tu código de barras o escribe el DNI manualmente
              </p>
            </div>

            {/* ====== INPUT DE DNI ====== */}
            <div className="flex gap-3 max-w-md mx-auto">
              <Input
                placeholder="Ingresa el DNI o nombre"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 text-center text-lg h-14"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            {/* ====== BOTONES DE PRUEBA RÁPIDA ====== */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md mx-auto">
              <span className="text-xs text-gray-500 w-full text-center mb-1">
                ⚡ Prueba rápida (haz clic para registrar):
              </span>
              {empleadosDB.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setDni(emp.id.toString());
                    buscarPorDNI(emp.id.toString());
                  }}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition-colors"
                >
                  {emp.initials}
                </button>
              ))}
            </div>

            {/* ====== MENSAJE DE FEEDBACK ====== */}
            {mensaje && (
              <div
                className={`mt-4 p-3 rounded-lg text-center text-sm font-medium max-w-md mx-auto ${
                  mensaje.tipo === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {mensaje.texto}
              </div>
            )}

            {/* ====== EMPLEADO ENCONTRADO (Vista previa) ====== */}
            {empleadoEncontrado && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-blue-500/20 text-blue-400">
                    <AvatarFallback>{getInitials(empleadoEncontrado.name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {empleadoEncontrado.name}
                    </p>
                    <p className="text-xs text-gray-400">{empleadoEncontrado.role}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Encontrado
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====== ÚLTIMOS REGISTROS ====== */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              ÚLTIMOS REGISTROS
            </h3>
            <Badge variant="outline" className="border-gray-700 text-gray-400">
              {asistencias.length} hoy
            </Badge>
          </div>

          {asistencias.length === 0 ? (
            <div className="bg-gray-900/30 rounded-lg p-8 text-center border border-gray-800">
              <p className="text-gray-500 text-sm">No hay registros hoy</p>
              <p className="text-gray-600 text-xs mt-1">
                Haz clic en una inicial arriba para probar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {asistencias.slice(0, 20).map((asistencia) => {
                const empleado = empleadosDB.find(
                  (e) => e.id === asistencia.empleadoId
                );
                return (
                  <div
                    key={asistencia.id}
                    className="flex items-center justify-between bg-gray-900/30 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-8 w-8 bg-gray-700 text-gray-300">
                        <AvatarFallback>
                          {empleado ? getInitials(empleado.name) : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {asistencia.nombre}
                        </p>
                        <p className="text-xs text-gray-400">
                          {empleado?.role || "Empleado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-mono text-gray-400">
                        {asistencia.hora}
                      </span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Entrada
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ====== BOTÓN VOLVER ====== */}
        <div className="mt-8 flex justify-center">
          <Link href="/landing">
            <Button
              variant="outline"
              className="border-gray-700 text-black hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}