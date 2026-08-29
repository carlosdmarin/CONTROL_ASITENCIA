// app/marcacion/components/QRScannerResult.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Building2, 
  Briefcase, 
  Clock, 
  User, 
  Sparkles, 
  AlertTriangle,
  CalendarOff,
  DoorClosed
} from "lucide-react";
import { practicantesApi } from "@/lib/api/practicantes";

interface QRScannerResultProps {
  codigo: string;
  onClose: () => void;
  marcacionStatus?: {
    success: boolean;
    message: string;
    tipo?: 'ENTRADA' | 'SALIDA' | 'DESCANSO' | 'YA_REGISTRADO' | 'ERROR';
  } | null;
}

type PracticanteReal = {
  idPracticante: number;
  nombreCompleto: string;
  documento: string;
  sede: string;
  puesto: string;
  cargo: string;
  situacion: string;
} | null;

export default function QRScannerResult({ 
  codigo, 
  onClose, 
  marcacionStatus 
}: QRScannerResultProps) {
  const [practicante, setPracticante] = useState<PracticanteReal>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hora, setHora] = useState("");
  const [fecha, setFecha] = useState("");
  const [visible, setVisible] = useState(true);

  const isDescanso = marcacionStatus?.tipo === 'DESCANSO';
  const isYaRegistrado = marcacionStatus?.tipo === 'YA_REGISTRADO';
  const isError = marcacionStatus?.tipo === 'ERROR' || (!marcacionStatus?.success && marcacionStatus !== null);
  const isSuccess = marcacionStatus?.success === true;
  const isEntrada = isSuccess && marcacionStatus?.tipo === 'ENTRADA';
  const isSalida = isSuccess && marcacionStatus?.tipo === 'SALIDA';

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
          sede: (data as any).sede || (data as any).agencia || "—",
          puesto: data.puesto,
          cargo: data.cargo,
          situacion: data.situacion,
        });
      } catch (e: any) {
        if (!mounted) return;
        // Fallback a mock para pruebas
        const mock: Record<string, PracticanteReal> = {
          "60563764": { idPracticante: 1, nombreCompleto: "Carlos Ramirez Torres", documento: "60563764", sede: "OFICINA PUCALLPA", puesto: "Tecnología", cargo: "PRACTICANTE PRE PROFESIONAL", situacion: "ACTIVO" },
          "70000001": { idPracticante: 1, nombreCompleto: "Carlos Ramirez Torres", documento: "70000001", sede: "OFICINA PUCALLPA", puesto: "Tecnología de la Información", cargo: "PRACTICANTE PRE PROFESIONAL", situacion: "ACTIVO" },
          "70000002": { idPracticante: 2, nombreCompleto: "Daniela Flores Mendoza", documento: "70000002", sede: "OFICINA PUCALLPA", puesto: "Recursos Humanos", cargo: "PRACTICANTE PRE PROFESIONAL", situacion: "ACTIVO" },
          "70000003": { idPracticante: 3, nombreCompleto: "Miguel Sanchez Lopez", documento: "70000003", sede: "PLANTA NESHUYA", puesto: "Mantenimiento", cargo: "PRACTICANTE PRE PROFESIONAL", situacion: "ACTIVO" },
        };
        const mockData = mock[codigo];
        if (mockData) {
          setPracticante(mockData);
          setError(null);
        } else {
          setError(`No se encontró practicante con documento ${codigo}`);
          setPracticante(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    const now = new Date();
    setHora(now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setFecha(now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }));

    // Cerrar automático SOLO si es éxito
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [codigo, onClose, isSuccess]);

  if (!visible) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
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
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <Card className="max-w-sm w-full mx-4 border-amber-200 shadow-2xl overflow-hidden">
          <div className="px-6 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600">
            <CalendarOff className="h-5 w-5 text-white" />
            <span className="text-white font-semibold text-sm"> Día de Descanso</span>
            <CalendarOff className="h-5 w-5 text-white" />
          </div>

          <CardHeader className="text-center pb-2">
            <div className="mx-auto relative">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 relative">
                <Avatar className="w-20 h-20 border-4 border-amber-200">
                  <AvatarFallback className="text-2xl bg-amber-200 text-amber-700">
                    {practicante?.nombreCompleto?.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <CalendarOff className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              {practicante?.nombreCompleto || "Practicante"}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                DESCANSO
              </Badge>
              <Badge variant="outline" className="text-gray-500">
                {fecha}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {marcacionStatus?.message || "Hoy es tu día de descanso según tu horario."}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    No puedes marcar asistencia los días de descanso.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 className="h-4 w-4" />
                  <span>Sede</span>
                </div>
                <span className="font-medium text-gray-800">{practicante?.sede || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Briefcase className="h-4 w-4" />
                  <span>Cargo</span>
                </div>
                <span className="font-medium text-gray-800">{practicante?.cargo || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Documento</span>
                </div>
                <span className="font-medium text-gray-800">{practicante?.documento || codigo}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Hora</span>
                </div>
                <span className="font-mono font-medium text-amber-600">{hora}</span>
              </div>
            </div>

            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>
              Entendido
            </Button>
            <p className="text-center text-xs text-gray-400">
              Esta tarjeta permanece visible hasta que la cierres.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== CARD: YA REGISTRÓ ENTRADA Y SALIDA =====
  if (isYaRegistrado) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <Card className="max-w-sm w-full mx-4 border-blue-200 shadow-2xl overflow-hidden">
          <div className="px-6 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600">
            <DoorClosed className="h-5 w-5 text-white" />
            <span className="text-white font-semibold text-sm"> Jornada Completada</span>
            <DoorClosed className="h-5 w-5 text-white" />
          </div>

          <CardHeader className="text-center pb-2">
            <div className="mx-auto relative">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2 relative">
                <Avatar className="w-20 h-20 border-4 border-blue-200">
                  <AvatarFallback className="text-2xl bg-blue-200 text-blue-700">
                    {practicante?.nombreCompleto?.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              {practicante?.nombreCompleto || "Practicante"}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                COMPLETADO
              </Badge>
              <Badge variant="outline" className="text-gray-500">
                {fecha}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {marcacionStatus?.message || "Ya registraste entrada y salida hoy."}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Tu jornada de hoy está completa. ¡Buen trabajo!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 className="h-4 w-4" />
                  <span>Sede</span>
                </div>
                <span className="font-medium text-gray-800">{practicante?.sede || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Briefcase className="h-4 w-4" />
                  <span>Cargo</span>
                </div>
                <span className="font-medium text-gray-800">{practicante?.cargo || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Documento</span>
                </div>
                <span className="font-medium text-gray-800">{practicante?.documento || codigo}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Hora</span>
                </div>
                <span className="font-mono font-medium text-blue-600">{hora}</span>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>
              Entendido
            </Button>
            <p className="text-center text-xs text-gray-400">
              Esta tarjeta permanece visible hasta que la cierres.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== CARD: ERROR =====
  if (isError || error || !practicante) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <Card className="max-w-sm w-full mx-4 border-red-200 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-lg text-red-700"> Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6 space-y-3">
            <p className="text-sm text-slate-600">
              {marcacionStatus?.message || error || "Practicante no encontrado"}
            </p>
            <code className="block bg-slate-100 px-3 py-2 rounded-lg font-mono text-xs break-all">
              {codigo}
            </code>
            <Button className="w-full mt-2" onClick={onClose}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== CARD: ÉXITO (ENTRADA O SALIDA) =====
  const getInitials = () => {
    if (!practicante) return "??";
    return practicante.nombreCompleto.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
  };

  const isInactive = practicante?.situacion !== "ACTIVO";

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setVisible(false);
          setTimeout(onClose, 300);
        }
      }}
    >
      <Card className="max-w-sm w-full mx-4 border-green-200 shadow-2xl overflow-hidden">
        <div className={`px-6 py-3 flex items-center justify-center gap-2 ${isInactive ? 'bg-amber-500' : 'bg-gradient-to-r from-green-500 to-green-600'}`}>
          <Sparkles className="h-5 w-5 text-white" />
          <span className="text-white font-semibold text-sm">
            {isInactive ? "Practicante inactivo" : isEntrada ? " Entrada registrada" : isSalida ? "✅ Salida registrada" : "¡Marcación exitosa!"}
          </span>
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        <CardHeader className="text-center pb-2">
          <div className="mx-auto relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2 relative">
              <Avatar className="w-20 h-20 border-4 border-green-200">
                <AvatarFallback className="text-2xl bg-green-200 text-green-700">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${isInactive ? 'bg-amber-500' : 'bg-green-500'}`}>
                {isInactive ? <AlertTriangle className="h-4 w-4 text-white" /> : <CheckCircle className="h-4 w-4 text-white" />}
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-800">
            {practicante?.nombreCompleto || "Practicante"}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge className={isInactive ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}>
              {practicante?.situacion || "ACTIVO"}
            </Badge>
            <Badge variant="outline" className="text-gray-500">
              {fecha}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>Sede</span>
              </div>
              <span className="font-medium text-gray-800">{practicante?.sede || "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Briefcase className="h-4 w-4" />
                <span>Cargo</span>
              </div>
              <span className="font-medium text-gray-800">{practicante?.cargo || "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <User className="h-4 w-4" />
                <span>Documento</span>
              </div>
              <span className="font-medium text-gray-800">{practicante?.documento || codigo}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Hora</span>
              </div>
              <span className="font-mono font-medium text-green-600">{hora}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>
              Cerrar
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>
              Escanear otro
            </Button>
          </div>
          <p className="text-center text-xs text-gray-400">
            Ventana se cierra en 5 segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}