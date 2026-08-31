"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IdCard,
  BriefcaseBusiness,
  BookUser,
  Building2,
  School,
  UserPlus,
  SaveCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  User,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Target,
  Check,
  X,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  NuevoPracticante, 
  Sede, 
  Cargo, 
  Puesto, 
  TipoInstituto 
} from "@/types/practicante";
import { sedeApi } from "@/lib/api/agencias";
import { cargosApi } from "@/lib/api/cargos";
import { puestosApi } from "@/lib/api/puestos";
import { tiposInstitutoApi } from "@/lib/api/tipos-instituto";
import { calcularMinutosTrabajados, formatHorasMinutos } from "@/lib/utils/horas";

interface PracticanteCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nuevoPracticante: NuevoPracticante) => void;
}

// ====== TIPOS PARA EL HORARIO ======
interface DiaHorario {
  activo: boolean;
  entrada: string;
  salida: string;
}

interface HorarioSemanal {
  LUNES: DiaHorario;
  MARTES: DiaHorario;
  MIERCOLES: DiaHorario;
  JUEVES: DiaHorario;
  VIERNES: DiaHorario;
  SABADO: DiaHorario;
}

// ====== DIAS DE LA SEMANA ======
const DIAS_SEMANA = [
  { key: 'LUNES', label: 'Lunes' },
  { key: 'MARTES', label: 'Martes' },
  { key: 'MIERCOLES', label: 'Miércoles' },
  { key: 'JUEVES', label: 'Jueves' },
  { key: 'VIERNES', label: 'Viernes' },
  { key: 'SABADO', label: 'Sábado' },
];

// ====== HORARIO POR DEFECTO ======
const HORARIO_DEFAULT: HorarioSemanal = {
  LUNES: { activo: true, entrada: '07:00', salida: '17:00' },
  MARTES: { activo: true, entrada: '07:00', salida: '17:00' },
  MIERCOLES: { activo: true, entrada: '07:00', salida: '17:00' },
  JUEVES: { activo: true, entrada: '07:00', salida: '17:00' },
  VIERNES: { activo: true, entrada: '07:00', salida: '17:00' },
  SABADO: { activo: false, entrada: '07:00', salida: '13:00' },
};

// ====== HELPERS CENTRALIZADOS (almuerzo 13:00-14:00 descontado por solapamiento) ======
const minutosDelDia = (dia: DiaHorario): number => {
  if (!dia.activo) return 0;
  return calcularMinutosTrabajados(dia.entrada, dia.salida);
};

// ====== DATOS MOCK PARA PRUEBAS ======
const MOCK_SEDES: Sede[] = [
  { idSede: 1, nombre: "OFICINA PUCALLPA", descripcion: "Oficina principal", activo: true },
  { idSede: 2, nombre: "PLANTA NESHUYA", descripcion: "Planta de producción", activo: true },
  { idSede: 3, nombre: "PLANTA CAMPOVERDE", descripcion: "Planta de producción", activo: true },
];

const MOCK_CARGOS: Cargo[] = [
  { idCargo: 1, nombre: "PRACTICANTE PROFESIONAL", descripcion: "Nivel profesional", horasSemanales: 48, activo: true },
  { idCargo: 2, nombre: "PRACTICANTE PRE PROFESIONAL", descripcion: "Nivel pre-profesional", horasSemanales: 30, activo: true },
];

const MOCK_PUESTOS: Puesto[] = [
  { idPuesto: 1, nombrePuesto: "Logística y servicios", area: "Logística", descripcion: "", activo: true },
  { idPuesto: 2, nombrePuesto: "Mantenimiento", area: "Operaciones", descripcion: "", activo: true },
  { idPuesto: 3, nombrePuesto: "Recursos Humanos", area: "Administración", descripcion: "", activo: true },
  { idPuesto: 4, nombrePuesto: "Tecnología de la Información", area: "Sistemas", descripcion: "", activo: true },
];

const MOCK_TIPOS_INSTITUTO: TipoInstituto[] = [
  { idTipoInstituto: 1, nombre: "SENATI", descripcion: "Servicio Nacional de Adiestramiento", activo: true },
  { idTipoInstituto: 2, nombre: "UNIVERSIDAD", descripcion: "Estudios universitarios", activo: true },
];

export function PracticanteCreateDialog({
  open,
  onOpenChange,
  onSave,
}: PracticanteCreateDialogProps) {
  // ====== STATE ======
  const [currentStep, setCurrentStep] = useState(1);
  
  // Datos de selects
  const [sedes, setSedes] = useState<Sede[]>(MOCK_SEDES);
  const [cargos, setCargos] = useState<Cargo[]>(MOCK_CARGOS);
  const [puestos, setPuestos] = useState<Puesto[]>(MOCK_PUESTOS);
  const [tiposInstituto, setTiposInstituto] = useState<TipoInstituto[]>(MOCK_TIPOS_INSTITUTO);
  const [loadingSelects, setLoadingSelects] = useState(false);

  // Datos del practicante (SIN código de trabajador)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    idSede: 1,
    idCargo: 1,
    idPuesto: 1,
    idTipoInstituto: 1,
    correoElectronico: "",
    telefono: "",
    fechaInicioPracticas: new Date().toISOString().split("T")[0],
    fechaFinPracticas: "",
  });

  // Horario semanal
  const [horario, setHorario] = useState<HorarioSemanal>(HORARIO_DEFAULT);

  // ====== CÁLCULO REACTIVO DE HORAS (NO QUEMA 48/30, USA cargoSeleccionado) ======
  const cargoSeleccionado = cargos.find((c) => c.idCargo === Number(formData.idCargo));
  const horasObjetivo = cargoSeleccionado?.horasSemanales ?? 0;
  const horasObjetivoMinutos = horasObjetivo * 60;

  const resumenHorario = useMemo(() => {
    let minutosTotales = 0;
    let diasActivos = 0;
    let horasValidas = true;
    const erroresPorDia: Record<string, string> = {};

    for (const [key, dia] of Object.entries(horario)) {
      if (!dia.activo) continue;
      diasActivos++;
      const min = minutosDelDia(dia);
      if (Number.isNaN(min)) {
        horasValidas = false;
        erroresPorDia[key] = "Entrada debe ser menor que salida";
      } else {
        minutosTotales += min;
      }
    }

    const diffMinutos = minutosTotales - horasObjetivoMinutos;
    const porcentaje = horasObjetivoMinutos > 0 ? Math.min((minutosTotales / horasObjetivoMinutos) * 100, 100) : 0;

    let estado: "vacio" | "incompleto" | "completo" | "excedido" | "invalido" = "vacio";
    if (!horasValidas) estado = "invalido";
    else if (diasActivos === 0) estado = "vacio";
    else if (minutosTotales < horasObjetivoMinutos) estado = "incompleto";
    else if (minutosTotales === horasObjetivoMinutos) estado = "completo";
    else estado = "excedido";

    return {
      minutosTotales,
      horasConfiguradas: minutosTotales / 60,
      horasObjetivo,
      horasObjetivoMinutos,
      diffMinutos,
      porcentaje,
      diasActivos,
      horasValidas,
      erroresPorDia,
      estado,
    };
  }, [horario, horasObjetivo, horasObjetivoMinutos]);

  // ====== CARGAR SELECTS DESDE API ======
  useEffect(() => {
    if (!open) return;

    const cargarSelects = async () => {
      try {
        setLoadingSelects(true);
        const [sedesData, cargosData, puestosData, tiposData] = await Promise.all([
          sedeApi.getAll().catch(() => MOCK_SEDES),
          cargosApi.getAll().catch(() => MOCK_CARGOS),
          puestosApi.getAll().catch(() => MOCK_PUESTOS),
          tiposInstitutoApi.getAll().catch(() => MOCK_TIPOS_INSTITUTO),
        ]);

        setSedes(sedesData.length > 0 ? sedesData : MOCK_SEDES);
        setCargos(cargosData.length > 0 ? cargosData : MOCK_CARGOS);
        setPuestos(puestosData.length > 0 ? puestosData : MOCK_PUESTOS);
        setTiposInstituto(tiposData.length > 0 ? tiposData : MOCK_TIPOS_INSTITUTO);

        // Setear valores por defecto si hay datos
        if (sedesData.length > 0) {
          setFormData((prev) => ({ ...prev, idSede: sedesData[0].idSede }));
        }
        if (cargosData.length > 0) {
          setFormData((prev) => ({ ...prev, idCargo: cargosData[0].idCargo }));
        }
        if (puestosData.length > 0) {
          setFormData((prev) => ({ ...prev, idPuesto: puestosData[0].idPuesto }));
        }
        if (tiposData.length > 0) {
          setFormData((prev) => ({ ...prev, idTipoInstituto: tiposData[0].idTipoInstituto }));
        }
      } catch (error) {
        console.error("Error al cargar selects, usando mock:", error);
      } finally {
        setLoadingSelects(false);
      }
    };

    cargarSelects();
    setCurrentStep(1);
    setHorario(HORARIO_DEFAULT);
  }, [open]);

  // ====== HANDLERS ======
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleHorarioChange = (
    dia: string,
    campo: keyof DiaHorario,
    valor: string | boolean
  ) => {
    setHorario((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia as keyof HorarioSemanal],
        [campo]: valor,
      },
    }));
  };

  // ====== VALIDACIÓN POR PASO (SIN código de trabajador) ======
  const validateStep1 = (): boolean => {
    return !!(
      formData.nombre.trim() &&
      formData.apellido.trim() &&
      formData.documento.trim() &&
      formData.fechaInicioPracticas
    );
  };

  const validateStep2 = (): boolean => {
    const { diasActivos, horasValidas, minutosTotales, horasObjetivoMinutos } = resumenHorario;
    return diasActivos > 0 && horasValidas && horasObjetivoMinutos > 0 && minutosTotales === horasObjetivoMinutos;
  };

  // ====== NAVEGACIÓN ======
  const goToNextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ====== ENVÍO (CON HORARIO) ======
  const handleSubmit = () => {
    if (!validateStep1()) return;

    // Construir el objeto con los datos del practicante + horario
    const nuevoPracticante = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      idSede: formData.idSede,
      idPuesto: formData.idPuesto,
      idTipoInstituto: formData.idTipoInstituto,
      idCargo: formData.idCargo,
      correoElectronico: formData.correoElectronico || undefined,
      telefono: formData.telefono || undefined,
      fechaInicioPracticas: formData.fechaInicioPracticas,
      fechaFinPracticas: formData.fechaFinPracticas || undefined,
      horario: Object.entries(horario).map(([dia, data]) => ({
        diaSemana: dia,
        horaInicio: data.entrada,
        horaFin: data.salida,
        activo: data.activo
      }))
    };

    onSave(nuevoPracticante);

    // Resetear
    setFormData({
      nombre: "",
      apellido: "",
      documento: "",
      idSede: sedes.length > 0 ? sedes[0].idSede : 1,
      idCargo: cargos.length > 0 ? cargos[0].idCargo : 1,
      idPuesto: puestos.length > 0 ? puestos[0].idPuesto : 1,
      idTipoInstituto: tiposInstituto.length > 0 ? tiposInstituto[0].idTipoInstituto : 1,
      correoElectronico: "",
      telefono: "",
      fechaInicioPracticas: new Date().toISOString().split("T")[0],
      fechaFinPracticas: "",
    });
    setHorario(HORARIO_DEFAULT);
    setCurrentStep(1);
    onOpenChange(false);
  };

  // ====== RENDER STEP INDICATOR ======
  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Datos" },
      { num: 2, label: "Horario" },
      { num: 3, label: "Confirmar" },
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all shrink-0
                    ${currentStep === step.num 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : currentStep > step.num 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {currentStep > step.num ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <span className={`
                  text-xs font-medium whitespace-nowrap
                  ${currentStep === step.num ? 'text-blue-600 font-semibold' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-10 h-0.5 mx-1 transition-colors
                  ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ====== RENDER STEP 1: DATOS DEL PRACTICANTE ======
  const renderStep1 = () => {
    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Documento */}
          <div className="grid gap-1.5">
            <Label htmlFor="documento" className="text-xs font-medium">
              Documento / DNI *
            </Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="DNI del practicante"
                className="w-full pl-9 h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Nombre */}
          <div className="grid gap-1.5">
            <Label htmlFor="nombre" className="text-xs font-medium">
              Nombre *
            </Label>
            <div className="relative">
              <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre del practicante"
                className="w-full pl-9 h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Apellido */}
          <div className="grid gap-1.5">
            <Label htmlFor="apellido" className="text-xs font-medium">
              Apellido *
            </Label>
            <div className="relative">
              <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Apellido del practicante"
                className="w-full pl-9 h-9 text-sm"
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Sede */}
          <div className="grid gap-1.5">
            <Label htmlFor="idSede" className="text-xs font-medium">
              Sede *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="idSede"
                name="idSede"
                value={formData.idSede}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  sedes.map((sede) => (
                    <option key={sede.idSede} value={sede.idSede}>
                      {sede.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Puesto / Área */}
          <div className="grid gap-1.5">
            <Label htmlFor="idPuesto" className="text-xs font-medium">
              Área *
            </Label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="idPuesto"
                name="idPuesto"
                value={formData.idPuesto}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  puestos.map((puesto) => (
                    <option key={puesto.idPuesto} value={puesto.idPuesto}>
                      {puesto.nombrePuesto}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Cargo */}
          <div className="grid gap-1.5">
            <Label htmlFor="idCargo" className="text-xs font-medium">
              Cargo *
            </Label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="idCargo"
                name="idCargo"
                value={formData.idCargo}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  cargos.map((cargo) => (
                    <option key={cargo.idCargo} value={cargo.idCargo}>
                      {cargo.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Tipo Instituto */}
          <div className="grid gap-1.5">
            <Label htmlFor="idTipoInstituto" className="text-xs font-medium">
              Centro de Estudios *
            </Label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="idTipoInstituto"
                name="idTipoInstituto"
                value={formData.idTipoInstituto}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  tiposInstituto.map((tipo) => (
                    <option key={tipo.idTipoInstituto} value={tipo.idTipoInstituto}>
                      {tipo.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Email */}
          <div className="grid gap-1.5">
            <Label htmlFor="correoElectronico" className="text-xs font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="correoElectronico"
                name="correoElectronico"
                value={formData.correoElectronico}
                onChange={handleChange}
                placeholder="correo@empresa.com"
                type="email"
                className="w-full pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="grid gap-1.5">
            <Label htmlFor="telefono" className="text-xs font-medium">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="987654321"
                className="w-full pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fecha Inicio */}
          <div className="grid gap-1.5">
            <Label htmlFor="fechaInicioPracticas" className="text-xs font-medium">
              Fecha de inicio *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fechaInicioPracticas"
                name="fechaInicioPracticas"
                value={formData.fechaInicioPracticas}
                onChange={handleChange}
                type="date"
                className="w-full pl-9 h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Fecha Fin */}
          <div className="grid gap-1.5">
            <Label htmlFor="fechaFinPracticas" className="text-xs font-medium">
              Fecha de fin (opcional)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fechaFinPracticas"
                name="fechaFinPracticas"
                value={formData.fechaFinPracticas}
                onChange={handleChange}
                type="date"
                className="w-full pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {!validateStep1() && (
          <p className="text-xs text-amber-600 mt-1">
            * Completa los campos obligatorios para continuar
          </p>
        )}
      </div>
    );
  };

  // ====== RENDER STEP 2: HORARIO CON TARJETA DE PROGRESO MEJORADA ======
  const renderStep2 = () => {
    const { minutosTotales, horasObjetivo, horasObjetivoMinutos, diffMinutos, porcentaje, estado, erroresPorDia } = resumenHorario;
    const horasConfigFmt = formatHorasMinutos(minutosTotales);
    const horasObjetivoFmt = `${horasObjetivo} h`;
    const diffAbsFmt = formatHorasMinutos(Math.abs(diffMinutos));

    // Configuración de colores según estado
    const estadoConfig = {
      incompleto: {
        color: "text-amber-600",
        progressColor: "bg-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-200",
        message: `Faltan ${diffAbsFmt} para completar`,
        icon: AlertTriangle,
        iconColor: "text-amber-600",
      },
      completo: {
        color: "text-emerald-600",
        progressColor: "bg-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        message: "Horario completo",
        icon: Check,
        iconColor: "text-emerald-600",
      },
      excedido: {
        color: "text-rose-600",
        progressColor: "bg-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-200",
        message: `Excede por ${diffAbsFmt}`,
        icon: AlertCircle,
        iconColor: "text-rose-600",
      },
      invalido: {
        color: "text-red-600",
        progressColor: "bg-red-500",
        bg: "bg-red-50",
        border: "border-red-200",
        message: "Corrige horarios inválidos",
        icon: X,
        iconColor: "text-red-600",
      },
      vacio: {
        color: "text-slate-500",
        progressColor: "bg-slate-300",
        bg: "bg-slate-50",
        border: "border-slate-200",
        message: "Selecciona al menos un día",
        icon: Info,
        iconColor: "text-slate-500",
      },
    };

    const currentEstado = estado || "vacio";
    const config = estadoConfig[currentEstado as keyof typeof estadoConfig] || estadoConfig.vacio;
    const IconComponent = config.icon;
    const progressValue = horasObjetivo > 0 ? (estado === "excedido" ? 100 : Math.min(porcentaje, 100)) : 0;

    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        {/* ====== TARJETA DE PROGRESO MEJORADA ====== */}
        <div className={`rounded-xl border p-5 ${config.bg} ${config.border} transition-all duration-300`}>
          {/* Cabecera: título + porcentaje */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Horas semanales
              </p>
              <p className="text-sm font-medium text-slate-700">
                {cargoSeleccionado?.nombre || "Selecciona un cargo"}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${config.color} transition-all duration-300`}>
                {horasObjetivo > 0 ? `${Math.round(progressValue)}%` : "—"}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Progreso</p>
            </div>
          </div>

          {/* Resumen principal: Configuradas vs Objetivo */}
          <div className="mt-4 flex items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-slate-900 transition-all duration-300">
                {horasConfigFmt}
              </p>
              <p className="text-xs text-slate-500">Configuradas</p>
            </div>
            <div className="pb-1">
              <p className="text-xl font-medium text-slate-400">
                {horasObjetivo > 0 ? horasObjetivoFmt : "—"}
              </p>
              <p className="text-xs text-slate-400">Objetivo</p>
            </div>
            {horasObjetivo > 0 && (
              <div className="ml-auto flex items-center gap-1.5">
                <TrendingUp className={`h-4 w-4 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>
                  {estado === "completo" && <Check className="h-4 w-4 text-emerald-600" />}
                  {estado === "incompleto" ? `-${diffAbsFmt}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${config.progressColor}`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
            {/* Mensaje contextual */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
                <p className={`text-sm font-medium ${config.color} transition-all duration-300`}>
                  {horasObjetivo > 0 ? config.message : "Selecciona un cargo para ver el objetivo"}
                </p>
              </div>
              {horasObjetivo > 0 && (
                <span className="text-xs text-slate-400">
                  {horasConfigFmt} / {horasObjetivoFmt}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Activa los días y ajusta entrada/salida. La duración por día se calcula al instante.
        </p>

        <div className="space-y-2">
          {DIAS_SEMANA.map((dia) => {
            const diaData = horario[dia.key as keyof HorarioSemanal];
            const minutosDia = minutosDelDia(diaData);
            const duracionFmt = Number.isNaN(minutosDia) ? null : formatHorasMinutos(minutosDia);
            const tieneError = !!erroresPorDia[dia.key];
            return (
              <Card key={dia.key} className={`border ${tieneError ? "border-red-200 bg-red-50/30" : ""}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Switch
                        checked={diaData.activo}
                        onCheckedChange={(checked) =>
                          handleHorarioChange(dia.key, 'activo', checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className={`text-sm font-medium ${diaData.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                        {dia.label}
                      </span>
                    </div>

                    {diaData.activo ? (
                      <div className="flex items-center gap-2 flex-1 min-w-[260px] flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <Input
                            type="time"
                            value={diaData.entrada}
                            onChange={(e) =>
                              handleHorarioChange(dia.key, 'entrada', e.target.value)
                            }
                            className={`w-28 h-8 text-sm ${tieneError ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                          />
                        </div>
                        <span className="text-xs text-gray-400">—</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <Input
                            type="time"
                            value={diaData.salida}
                            onChange={(e) =>
                              handleHorarioChange(dia.key, 'salida', e.target.value)
                            }
                            className={`w-28 h-8 text-sm ${tieneError ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                          />
                        </div>
                        <span className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full border ${tieneError ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                          {tieneError ? "Inválido" : duracionFmt}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Descanso
                      </span>
                    )}
                  </div>
                  {tieneError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {erroresPorDia[dia.key]}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // ====== RENDER STEP 3: CONFIRMACIÓN ======
  const renderStep3 = () => {
    const sedeNombre = sedes.find(a => a.idSede === formData.idSede)?.nombre || '—';
    const cargoNombre = cargos.find(c => c.idCargo === formData.idCargo)?.nombre || '—';
    const puestoNombre = puestos.find(p => p.idPuesto === formData.idPuesto)?.nombrePuesto || '—';
    const tipoInstitutoNombre = tiposInstituto.find(t => t.idTipoInstituto === formData.idTipoInstituto)?.nombre || '—';

    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Revisa los datos antes de registrar al practicante
          </p>
        </div>

        {/* DATOS PERSONALES */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            Datos personales
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500">Nombre completo:</span>
            <span className="font-medium">{formData.nombre} {formData.apellido}</span>
            <span className="text-gray-500">Documento:</span>
            <span className="font-medium">{formData.documento}</span>
          </div>
        </div>

        {/* INFORMACIÓN LABORAL */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Información laboral
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500">Sede:</span>
            <span className="font-medium">{sedeNombre}</span>
            <span className="text-gray-500">Área:</span>
            <span className="font-medium">{puestoNombre}</span>
            <span className="text-gray-500">Cargo:</span>
            <span className="font-medium">{cargoNombre}</span>
            <span className="text-gray-500">Tipo instituto:</span>
            <span className="font-medium">{tipoInstitutoNombre}</span>
            <span className="text-gray-500">Inicio:</span>
            <span className="font-medium">{formData.fechaInicioPracticas}</span>
            {formData.fechaFinPracticas && (
              <>
                <span className="text-gray-500">Fin:</span>
                <span className="font-medium">{formData.fechaFinPracticas}</span>
              </>
            )}
          </div>
        </div>

        {/* HORARIO */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            Horario semanal
          </h4>
          <div className="grid grid-cols-1 gap-0.5 text-sm bg-gray-50 rounded-lg p-3">
            {DIAS_SEMANA.map((dia) => {
              const diaData = horario[dia.key as keyof HorarioSemanal];
              return (
                <div key={dia.key} className="flex justify-between py-0.5 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{dia.label}</span>
                  <span className={diaData.activo ? 'font-medium' : 'text-gray-400 italic'}>
                    {diaData.activo ? `${diaData.entrada} - ${diaData.salida}` : 'Descanso'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ====== RENDER FOOTER ======
  const renderFooter = () => {
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();

    return (
      <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <div className="flex gap-2 w-full">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
          )}

          {currentStep < 3 && (
            <Button
              type="button"
              onClick={goToNextStep}
              className={`flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 ${!isStep1Valid || !isStep2Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}

          {currentStep === 3 && (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              <SaveCheck className="h-4 w-4 mr-1" />
              Registrar practicante
            </Button>
          )}
        </div>

        {currentStep === 1 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none text-gray-500"
          >
            Cancelar
          </Button>
        )}
      </DialogFooter>
    );
  };

  // ====== MAIN RENDER ======
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl !w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-700" />
            <DialogTitle className="text-xl">Agregar practicante</DialogTitle>
          </div>
          <DialogDescription>
            Completa los datos del nuevo practicante en {currentStep === 1 ? '3 pasos' : currentStep === 2 ? 'paso 2 de 3' : 'paso 3 de 3'}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-5 overflow-hidden px-6">
          {/* Step Indicator - Centrado y sin cortes */}
          {renderStepIndicator()}

          {/* Step Content */}
          <div className="mt-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex-shrink-0">
          {renderFooter()}
        </div>
      </DialogContent>
    </Dialog>
  );
}