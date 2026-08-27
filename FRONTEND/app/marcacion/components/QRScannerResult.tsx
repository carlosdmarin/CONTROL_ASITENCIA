"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Building2, Briefcase, Clock, User, Sparkles } from "lucide-react";

interface QRScannerResultProps {
  codigo: string;
  onClose: () => void;
}

// Datos simulados del practicante (ahora por documento, sin codigoTrabajador)
const getPracticanteData = (documento: string) => {
  const practicantes: Record<string, { nombre: string; apellido: string; documento: string; sede: string; puesto: string; cargo: string; horas: number; foto: string }> = {
    "70000001": {
      nombre: "Carlos",
      apellido: "Ramirez Torres",
      documento: "70000001",
      sede: "OFICINA PUCALLPA",
      puesto: "Tecnología de la Información",
      cargo: "PRACTICANTE PRE PROFESIONAL",
      horas: 30,
      foto: "",
    },
    "70000002": {
      nombre: "Daniela",
      apellido: "Flores Mendoza",
      documento: "70000002",
      sede: "OFICINA PUCALLPA",
      puesto: "Recursos Humanos",
      cargo: "PRACTICANTE PRE PROFESIONAL",
      horas: 30,
      foto: "",
    },
    "70000003": {
      nombre: "Miguel",
      apellido: "Sanchez Lopez",
      documento: "70000003",
      sede: "PLANTA NESHUYA",
      puesto: "Mantenimiento",
      cargo: "PRACTICANTE PRE PROFESIONAL",
      horas: 30,
      foto: "",
    },
  };

  return practicantes[documento] || null;
};

type PracticanteData = NonNullable<ReturnType<typeof getPracticanteData>>;

export default function QRScannerResult({ codigo, onClose }: QRScannerResultProps) {
  const [practicante, setPracticante] = useState<PracticanteData | null>(null);
  const [hora, setHora] = useState("");
  const [fecha, setFecha] = useState("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Obtener datos del practicante (simulado)
    const data = getPracticanteData(codigo);
    setPracticante(data);

    // Obtener hora y fecha actual
    const now = new Date();
    setHora(now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setFecha(now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }));

    // Auto-cerrar después de 4 segundos
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
   
  }, [codigo, onClose]);

  if (!visible) return null;

  if (!practicante) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <Card className="max-w-sm w-full mx-4 border-red-200 shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">❌ Practicante no encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-gray-500 mb-4">
              No se encontró ningún practicante con el documento:
            </p>
            <code className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-sm">{codigo}</code>
            <Button 
              className="w-full mt-4"
              onClick={onClose}
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtener iniciales para el avatar
  const getInitials = () => {
    return (practicante.nombre?.charAt(0) || "") + (practicante.apellido?.charAt(0) || "");
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setVisible(false);
          setTimeout(onClose, 300);
        }
      }}
    >
      <Card className="max-w-sm w-full mx-4 border-green-200 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* ====== BANNER SUPERIOR ====== */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
          <span className="text-white font-semibold text-sm">¡Marcación exitosa!</span>
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
        </div>

        {/* ====== CONTENIDO ====== */}
        <CardHeader className="text-center pb-2">
          <div className="mx-auto relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2 relative">
              <Avatar className="w-20 h-20 border-4 border-green-200">
                <AvatarImage src={practicante.foto} />
                <AvatarFallback className="text-2xl bg-green-200 text-green-700">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            {practicante.nombre} {practicante.apellido}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              PRESENTE
            </Badge>
            <Badge variant="outline" className="text-gray-500">
              {fecha}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* ====== DETALLES ====== */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>Sede</span>
              </div>
              <span className="font-medium text-gray-800">{practicante.sede}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Briefcase className="h-4 w-4" />
                <span>Cargo</span>
              </div>
              <span className="font-medium text-gray-800">{practicante.cargo}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <User className="h-4 w-4" />
                <span>Documento</span>
              </div>
              <span className="font-medium text-gray-800">{practicante.documento}</span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Hora</span>
              </div>
              <span className="font-mono font-medium text-green-600">{hora}</span>
            </div>
          </div>

          {/* ====== BOTONES ====== */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              Cerrar
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
            >
              Escanear otro
            </Button>
          </div>

          {/* ====== TEXTO DE AUTO-CIERRE ====== */}
          <p className="text-center text-xs text-gray-400 animate-pulse">
            Esta ventana se cerrará automáticamente en 3 segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}