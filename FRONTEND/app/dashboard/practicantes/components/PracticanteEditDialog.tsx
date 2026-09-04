"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IdCard,
  BriefcaseBusiness,
  BookUser,
  Building2,
  School,
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
  Check,
  X,
  Info,
  CircleCheck,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Practicante,
  Sede,
  Cargo,
  Puesto,
  TipoInstituto,
} from "@/types/practicante";
import { sedeApi } from "@/lib/api/agencias";
import { cargosApi } from "@/lib/api/cargos";
import { puestosApi } from "@/lib/api/puestos";
import { tiposInstitutoApi } from "@/lib/api/tipos-instituto";
import { practicantesApi } from "@/lib/api/practicantes";
import {
  calcularMinutosTrabajados,
  formatHorasMinutos,
} from "@/lib/utils/horas";

interface PracticanteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
  onSave: (practicanteEditado: any) => void;
}

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

interface HorarioBackend {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

const DIAS_SEMANA = [
  { key: "LUNES", label: "Lunes" },
  { key: "MARTES", label: "Martes" },
  { key: "MIERCOLES", label: "Miércoles" },
  { key: "JUEVES", label: "Jueves" },
  { key: "VIERNES", label: "Viernes" },
  { key: "SABADO", label: "Sábado" },
];

const HORARIO_DEFAULT: HorarioSemanal = {
  LUNES: { activo: true, entrada: "07:30", salida: "17:00" },
  MARTES: { activo: true, entrada: "07:30", salida: "17:00" },
  MIERCOLES: { activo: true, entrada: "07:30", salida: "17:00" },
  JUEVES: { activo: true, entrada: "07:30", salida: "17:00" },
  VIERNES: { activo: true, entrada: "07:30", salida: "17:00" },
  SABADO: { activo: false, entrada: "07:30", salida: "13:00" },
};

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

// ====== FUNCIÓN PARA NORMALIZAR TEXTO ======
const normalizar = (texto: string) => {
  return texto?.toUpperCase().trim().replace(/\s+/g, ' ') || '';
};

// ====== HELPERS ======
const minutosDelDia = (dia: DiaHorario): number => {
  if (!dia.activo) return 0;
  return calcularMinutosTrabajados(dia.entrada, dia.salida);
};

export function PracticanteEditDialog({
  open,
  onOpenChange,
  practicante,
  onSave,
}: PracticanteEditDialogProps) {
  // ====== STATE ======
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [sedes, setSedes] = useState<Sede[]>(MOCK_SEDES);
  const [cargos, setCargos] = useState<Cargo[]>(MOCK_CARGOS);
  const [puestos, setPuestos] = useState<Puesto[]>(MOCK_PUESTOS);
  const [tiposInstituto, setTiposInstituto] = useState<TipoInstituto[]>(MOCK_TIPOS_INSTITUTO);
  const [loadingSelects, setLoadingSelects] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    idSede: 0,
    idCargo: 0,
    idPuesto: 0,
    idTipoInstituto: 0,
    correoElectronico: "",
    telefono: "",
    fechaInicioPracticas: "",
    fechaFinPracticas: "",
  });

  const [dniError, setDniError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [telefonoError, setTelefonoError] = useState<string>("");
  const [horario, setHorario] = useState<HorarioSemanal>(HORARIO_DEFAULT);

  // ====== CÁLCULO REACTIVO DE HORAS ======
  const cargoSeleccionado = cargos.find(
    (c) => c.idCargo === Number(formData.idCargo),
  );
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
    const porcentaje =
      horasObjetivoMinutos > 0
        ? Math.min((minutosTotales / horasObjetivoMinutos) * 100, 100)
        : 0;

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
      } catch (error) {
        console.error("Error al cargar selects:", error);
      } finally {
        setLoadingSelects(false);
      }
    };

    cargarSelects();
  }, [open]);

  // ====== CARGAR DATOS DEL PRACTICANTE ======
  useEffect(() => {
    if (!practicante || !open) return;

    setCurrentStep(1);
    setInitialLoadDone(false);
    setLoadingHorario(true);
    setDniError("");
    setEmailError("");
    setTelefonoError("");

    const nombreCompleto = practicante.nombreCompleto || "";
    const partes = nombreCompleto.split(" ");
    const nombre = partes[0] || "";
    const apellido = partes.slice(1).join(" ") || "";

    // --- BUSCAR COINCIDENCIAS DE FORMA FLEXIBLE ---
    const buscarSede = (nombreSede: string) => {
      if (!nombreSede) return null;
      const normalizado = normalizar(nombreSede);
      return sedes.find(s => normalizar(s.nombre) === normalizado);
    };

    const buscarCargo = (nombreCargo: string) => {
      if (!nombreCargo) return null;
      const normalizado = normalizar(nombreCargo);
      return cargos.find(c => normalizar(c.nombre) === normalizado);
    };

    const buscarPuesto = (nombrePuesto: string) => {
      if (!nombrePuesto) return null;
      const normalizado = normalizar(nombrePuesto);
      return puestos.find(p => normalizar(p.nombrePuesto) === normalizado);
    };

    const buscarTipoInstituto = (nombreTipo: string) => {
      if (!nombreTipo) return null;
      const normalizado = normalizar(nombreTipo);
      return tiposInstituto.find(t => normalizar(t.nombre) === normalizado);
    };

    let sedeEncontrada = buscarSede(practicante.sede);
    if (!sedeEncontrada && practicante.agencia) {
      sedeEncontrada = buscarSede(practicante.agencia);
    }

    const cargoEncontrado = buscarCargo(practicante.cargo);
    const puestoEncontrado = buscarPuesto(practicante.puesto);
    const tipoEncontrado = buscarTipoInstituto(practicante.tipoInstituto);

    const idSedeFinal = sedeEncontrada?.idSede || (sedes.length > 0 ? sedes[0].idSede : 0);
    const idCargoFinal = cargoEncontrado?.idCargo || (cargos.length > 0 ? cargos[0].idCargo : 0);
    const idPuestoFinal = puestoEncontrado?.idPuesto || (puestos.length > 0 ? puestos[0].idPuesto : 0);
    const idTipoFinal = tipoEncontrado?.idTipoInstituto || (tiposInstituto.length > 0 ? tiposInstituto[0].idTipoInstituto : 0);

    console.log("🔍 Búsqueda de IDs:", {
      sede: { buscado: practicante.sede, encontrado: sedeEncontrada?.nombre, id: idSedeFinal },
      cargo: { buscado: practicante.cargo, encontrado: cargoEncontrado?.nombre, id: idCargoFinal },
      puesto: { buscado: practicante.puesto, encontrado: puestoEncontrado?.nombrePuesto, id: idPuestoFinal },
      tipo: { buscado: practicante.tipoInstituto, encontrado: tipoEncontrado?.nombre, id: idTipoFinal },
    });

    setFormData({
      nombre: nombre,
      apellido: apellido,
      documento: practicante.documento || "",
      idSede: idSedeFinal,
      idCargo: idCargoFinal,
      idPuesto: idPuestoFinal,
      idTipoInstituto: idTipoFinal,
      correoElectronico: practicante.correoElectronico || "",
      telefono: practicante.telefono || "",
      fechaInicioPracticas: practicante.fechaInicioPracticas || "",
      fechaFinPracticas: practicante.fechaFinPracticas || "",
    });

    const cargarHorario = async () => {
      try {
        setLoadingHorario(true);
        const horarioData = await practicantesApi.getHorario(practicante.idPracticante);

        if (horarioData && horarioData.length > 0) {
          const nuevoHorario = { ...HORARIO_DEFAULT };
          horarioData.forEach((bloque: HorarioBackend) => {
            const diaKey = bloque.diaSemana as keyof HorarioSemanal;
            if (nuevoHorario[diaKey]) {
              nuevoHorario[diaKey] = {
                activo: bloque.activo,
                entrada: bloque.horaInicio.substring(0, 5),
                salida: bloque.horaFin.substring(0, 5),
              };
            }
          });
          setHorario(nuevoHorario);
        } else {
          const horarioVacio = { ...HORARIO_DEFAULT };
          DIAS_SEMANA.forEach((dia) => {
            horarioVacio[dia.key as keyof HorarioSemanal] = {
              ...horarioVacio[dia.key as keyof HorarioSemanal],
              activo: false,
            };
          });
          setHorario(horarioVacio);
        }
      } catch (error) {
        console.error("Error al cargar horario:", error);
        const horarioVacio = { ...HORARIO_DEFAULT };
        DIAS_SEMANA.forEach((dia) => {
          horarioVacio[dia.key as keyof HorarioSemanal] = {
            ...horarioVacio[dia.key as keyof HorarioSemanal],
            activo: false,
          };
        });
        setHorario(horarioVacio);
      } finally {
        setLoadingHorario(false);
        setInitialLoadDone(true);
      }
    };

    cargarHorario();
  }, [practicante, open, sedes, cargos, puestos, tiposInstituto]);

  // ====== HANDLERS ======
  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const soloNumeros = value.replace(/\D/g, "");
    const dniLimitado = soloNumeros.slice(0, 8);

    if (dniLimitado.length > 0 && dniLimitado.length < 8) {
      setDniError("El DNI debe tener 8 dígitos");
    } else if (dniLimitado.length === 8 && dniLimitado === "00000000") {
      setDniError("DNI inválido");
    } else {
      setDniError("");
    }

    setFormData({ ...formData, documento: dniLimitado });
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const soloLetra = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    setFormData({ ...formData, nombre: soloLetra.slice(0, 50) });
  };

  const handleApellidoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    setFormData({ ...formData, apellido: soloLetras.slice(0, 50) });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const emailSinEspacios = value.replace(/\s/g, "");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailSinEspacios.length === 0) {
      setEmailError("El email es obligatorio");
    } else if (!emailRegex.test(emailSinEspacios)) {
      setEmailError("Ingresa un email válido (ej: usuario@dominio.com)");
    } else {
      setEmailError("");
    }

    setFormData({ ...formData, correoElectronico: emailSinEspacios });
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const soloNumeros = value.replace(/\D/g, "");
    const telefonoLimitado = soloNumeros.slice(0, 15);

    if (telefonoLimitado.length === 0) {
      setTelefonoError("El teléfono es obligatorio");
    } else if (telefonoLimitado.length < 9) {
      setTelefonoError("El teléfono debe tener al menos 9 dígitos");
    } else {
      setTelefonoError("");
    }

    setFormData({ ...formData, telefono: telefonoLimitado });
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleHorarioChange = (
    dia: string,
    campo: keyof DiaHorario,
    valor: string | boolean,
  ) => {
    setHorario((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia as keyof HorarioSemanal],
        [campo]: valor,
      },
    }));
  };

  // ====== VALIDACIONES ======
  const validateStep1 = (): boolean => {
    return (
      formData.documento.length === 8 &&
      formData.documento !== "00000000" &&
      formData.nombre.trim().length >= 2 &&
      formData.apellido.trim().length >= 2 &&
      formData.correoElectronico.length > 0 &&
      !emailError &&
      formData.telefono.length >= 9 &&
      !telefonoError &&
      formData.fechaInicioPracticas !== "" &&
      formData.idSede > 0 &&
      formData.idPuesto > 0 &&
      formData.idCargo > 0 &&
      formData.idTipoInstituto > 0
    );
  };

  const validateStep2 = (): boolean => {
    const { diasActivos, horasValidas, minutosTotales, horasObjetivoMinutos } = resumenHorario;
    return (
      diasActivos > 0 &&
      horasValidas &&
      horasObjetivoMinutos > 0 &&
      minutosTotales === horasObjetivoMinutos
    );
  };

  // ====== NAVEGACIÓN ======
  const goToNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ====== ENVÍO ======
  const handleSubmit = () => {
    if (!validateStep1()) return;

    const nombreCompleto = `${formData.nombre} ${formData.apellido}`.trim();

    const practicanteEditado = {
      idPracticante: practicante?.idPracticante,
      nombreCompleto: nombreCompleto,
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
        activo: data.activo,
      })),
    };

    onSave(practicanteEditado);
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
                    ${
                      currentStep === step.num
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : currentStep > step.num
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400"
                    }
                  `}
                >
                  {currentStep > step.num ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`
                  text-xs font-medium whitespace-nowrap
                  ${currentStep === step.num ? "text-blue-600 font-semibold" : "text-gray-400"}
                `}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                  w-10 h-0.5 mx-1 transition-colors
                  ${currentStep > step.num ? "bg-green-500" : "bg-gray-200"}
                `}
                />
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
            <Label
              htmlFor="documento"
              className="text-xs font-medium flex items-center gap-1"
            >
              Documento / DNI *
              <span className="text-xs text-gray-400 font-normal">
                (8 dígitos)
              </span>
            </Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleDniChange}
                placeholder="DNI del practicante"
                className={`w-full pl-9 h-9 text-sm ${
                  dniError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : formData.documento.length === 8
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                }`}
                maxLength={8}
                inputMode="numeric"
                required
              />
            </div>
            <div className="h-5 flex items-center gap-1 mt-0.5">
              {dniError ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-600">{dniError}</span>
                </>
              ) : formData.documento.length === 8 ? (
                <>
                  <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="text-xs text-green-600">DNI válido</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Ingresa 8 dígitos</span>
              )}
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
                onChange={handleNombreChange}
                placeholder="Nombre del practicante"
                className={`w-full pl-9 h-9 text-sm ${
                  formData.nombre.length > 0 && formData.nombre.length < 2
                    ? "border-red-500 focus-visible:ring-red-500"
                    : formData.nombre.length >= 2
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                }`}
                required
              />
            </div>
            <div className="h-5 flex items-center gap-1">
              {formData.nombre.length > 0 && formData.nombre.length < 2 ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-600">
                    Mínimo 2 caracteres
                  </span>
                </>
              ) : formData.nombre.length >= 2 ? (
                <>
                  <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="text-xs text-green-600">Nombre válido</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Obligatorio</span>
              )}
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
                onChange={handleApellidoChange}
                placeholder="Apellido del practicante"
                className={`w-full pl-9 h-9 text-sm ${
                  formData.apellido.length > 0 && formData.apellido.length < 2
                    ? "border-red-500 focus-visible:ring-red-500"
                    : formData.apellido.length >= 2
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                }`}
                required
              />
            </div>
            <div className="h-5 flex items-center gap-1">
              {formData.apellido.length > 0 && formData.apellido.length < 2 ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-600">
                    Mínimo 2 caracteres
                  </span>
                </>
              ) : formData.apellido.length >= 2 ? (
                <>
                  <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="text-xs text-green-600">
                    Apellido válido
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Obligatorio</span>
              )}
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
                onChange={handleSelectChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                <option value="0">Seleccionar sede</option>
                {sedes.map((sede) => (
                  <option key={sede.idSede} value={sede.idSede}>
                    {sede.nombre}
                  </option>
                ))}
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
                onChange={handleSelectChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                <option value="0">Seleccionar área</option>
                {puestos.map((puesto) => (
                  <option key={puesto.idPuesto} value={puesto.idPuesto}>
                    {puesto.nombrePuesto}
                  </option>
                ))}
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
                onChange={handleSelectChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                <option value="0">Seleccionar cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo.idCargo} value={cargo.idCargo}>
                    {cargo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Centro de Estudios */}
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
                onChange={handleSelectChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                <option value="0">Seleccionar centro</option>
                {tiposInstituto.map((tipo) => (
                  <option key={tipo.idTipoInstituto} value={tipo.idTipoInstituto}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Email */}
          <div className="grid gap-1.5">
            <Label htmlFor="correoElectronico" className="text-xs font-medium">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="correoElectronico"
                name="correoElectronico"
                value={formData.correoElectronico}
                onChange={handleEmailChange}
                placeholder="correo@empresa.com"
                type="email"
                className={`w-full pl-9 h-9 text-sm ${
                  emailError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : formData.correoElectronico.length > 0 && !emailError
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                }`}
                required
              />
            </div>
            <div className="h-5 flex items-center gap-1">
              {emailError ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-600">{emailError}</span>
                </>
              ) : formData.correoElectronico.length > 0 && !emailError ? (
                <>
                  <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="text-xs text-green-600">Email válido</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Obligatorio</span>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="grid gap-1.5">
            <Label htmlFor="telefono" className="text-xs font-medium">
              Teléfono *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                placeholder="987654321"
                className={`w-full pl-9 h-9 text-sm ${
                  telefonoError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : formData.telefono.length >= 9
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                }`}
                inputMode="numeric"
                required
              />
            </div>
            <div className="h-5 flex items-center gap-1">
              {telefonoError ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-red-600">{telefonoError}</span>
                </>
              ) : formData.telefono.length >= 9 ? (
                <>
                  <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="text-xs text-green-600">
                    Teléfono válido
                  </span>
                </>
              ) : formData.telefono.length > 0 ? (
                <span className="text-xs text-gray-400">Faltan dígitos</span>
              ) : (
                <span className="text-xs text-gray-400">Obligatorio</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Fecha Inicio */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="fechaInicioPracticas"
              className="text-xs font-medium"
            >
              Fecha de inicio *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fechaInicioPracticas"
                name="fechaInicioPracticas"
                value={formData.fechaInicioPracticas}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                type="date"
                className="w-full pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {!validateStep1() && (
          <p className="text-xs text-amber-600 mt-1">
            * Completa todos los campos obligatorios para continuar
          </p>
        )}
      </div>
    );
  };

  // ====== RENDER STEP 2: HORARIO ======
  const renderStep2 = () => {
    const {
      minutosTotales,
      horasObjetivo,
      horasObjetivoMinutos,
      diffMinutos,
      porcentaje,
      estado,
      erroresPorDia,
    } = resumenHorario;
    const horasConfigFmt = formatHorasMinutos(minutosTotales);
    const horasObjetivoFmt = `${horasObjetivo} h`;
    const diffAbsFmt = formatHorasMinutos(Math.abs(diffMinutos));

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
    const config =
      estadoConfig[currentEstado as keyof typeof estadoConfig] ||
      estadoConfig.vacio;
    const IconComponent = config.icon;
    const progressValue =
      horasObjetivo > 0
        ? estado === "excedido"
          ? 100
          : Math.min(porcentaje, 100)
        : 0;

    if (loadingHorario || !initialLoadDone) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Cargando horario...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-5 ${config.bg} ${config.border} transition-all duration-300`}
        >
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
              <p
                className={`text-2xl font-bold ${config.color} transition-all duration-300`}
              >
                {horasObjetivo > 0 ? `${Math.round(progressValue)}%` : "—"}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Progreso
              </p>
            </div>
          </div>

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
                  {estado === "completo" && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                  {estado === "incompleto" ? `-${diffAbsFmt}` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${config.progressColor}`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
                <p
                  className={`text-sm font-medium ${config.color} transition-all duration-300`}
                >
                  {horasObjetivo > 0
                    ? config.message
                    : "Selecciona un cargo para ver el objetivo"}
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

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <p className="text-sm text-gray-500">
            Activa los días y ajusta entrada/salida. La duración por día se
            calcula al instante.
          </p>

          <div
            className="space-y-4 overflow-y-auto pr-1"
            style={{ maxHeight: "calc(55vh - 200px)" }}
          >
            {DIAS_SEMANA.map((dia) => {
              const diaData = horario[dia.key as keyof HorarioSemanal];
              const minutosDia = minutosDelDia(diaData);
              const duracionFmt = Number.isNaN(minutosDia)
                ? null
                : formatHorasMinutos(minutosDia);
              const tieneError = !!erroresPorDia[dia.key];
              return (
                <Card
                  key={dia.key}
                  className={`border ${tieneError ? "border-red-200 bg-red-50/30" : ""}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-25">
                        <Switch
                          checked={diaData.activo}
                          onCheckedChange={(checked) =>
                            handleHorarioChange(dia.key, "activo", checked)
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span
                          className={`text-sm font-medium ${diaData.activo ? "text-gray-900" : "text-gray-400"}`}
                        >
                          {dia.label}
                        </span>
                      </div>

                      {diaData.activo ? (
                        <div className="flex items-center gap-2 flex-1 min-w-65 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <Input
                              type="time"
                              value={diaData.entrada}
                              onChange={(e) =>
                                handleHorarioChange(
                                  dia.key,
                                  "entrada",
                                  e.target.value,
                                )
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
                                handleHorarioChange(
                                  dia.key,
                                  "salida",
                                  e.target.value,
                                )
                              }
                              className={`w-28 h-8 text-sm ${tieneError ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                            />
                          </div>
                          <span
                            className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full border ${tieneError ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                          >
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
                        <AlertTriangle className="h-3 w-3" />{" "}
                        {erroresPorDia[dia.key]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ====== RENDER STEP 3: CONFIRMACIÓN ======
  const renderStep3 = () => {
    // Buscar los nombres de forma segura
    const sedeItem = sedes.find((a) => a.idSede === Number(formData.idSede));
    const cargoItem = cargos.find(
      (c) => c.idCargo === Number(formData.idCargo),
    );
    const puestoItem = puestos.find(
      (p) => p.idPuesto === Number(formData.idPuesto),
    );
    const tipoItem = tiposInstituto.find(
      (t) => t.idTipoInstituto === Number(formData.idTipoInstituto),
    );

    // 1. Intentar por ID
    let sedeFinal = sedeItem?.nombre || "—";
    let cargoFinal = cargoItem?.nombre || "—";
    let puestoFinal = puestoItem?.nombrePuesto || "—";
    let tipoFinal = tipoItem?.nombre || "—";

    // 2. Si no, usar el practicante original como fallback
    if (sedeFinal === "—" && practicante) {
      sedeFinal = practicante.sede || practicante.agencia || "—";
    }
    if (cargoFinal === "—" && practicante) {
      cargoFinal = practicante.cargo || "—";
    }
    if (puestoFinal === "—" && practicante) {
      puestoFinal = practicante.puesto || "—";
    }
    if (tipoFinal === "—" && practicante) {
      tipoFinal = practicante.tipoInstituto || "—";
    }

    // 3. Si aún es "—", buscar por nombre en los arrays
    if (sedeFinal === "—" && practicante?.sede) {
      const encontrado = sedes.find(
        (s) => normalizar(s.nombre) === normalizar(practicante.sede)
      );
      sedeFinal = encontrado?.nombre || practicante.sede || "—";
    }
    if (cargoFinal === "—" && practicante?.cargo) {
      const encontrado = cargos.find(
        (c) => normalizar(c.nombre) === normalizar(practicante.cargo)
      );
      cargoFinal = encontrado?.nombre || practicante.cargo || "—";
    }
    if (puestoFinal === "—" && practicante?.puesto) {
      const encontrado = puestos.find(
        (p) => normalizar(p.nombrePuesto) === normalizar(practicante.puesto)
      );
      puestoFinal = encontrado?.nombrePuesto || practicante.puesto || "—";
    }
    if (tipoFinal === "—" && practicante?.tipoInstituto) {
      const encontrado = tiposInstituto.find(
        (t) => normalizar(t.nombre) === normalizar(practicante.tipoInstituto)
      );
      tipoFinal = encontrado?.nombre || practicante.tipoInstituto || "—";
    }

    // Debug
    console.log("📋 Step 3 - Mostrando:", {
      sede: sedeFinal,
      cargo: cargoFinal,
      puesto: puestoFinal,
      tipo: tipoFinal,
      idSede: formData.idSede,
      idCargo: formData.idCargo,
      idPuesto: formData.idPuesto,
      idTipo: formData.idTipoInstituto,
    });

    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Revisa los datos antes de guardar los cambios
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            Datos personales
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500">Nombre:</span>
            <span className="font-medium">{formData.nombre}</span>
            <span className="text-gray-500">Apellido:</span>
            <span className="font-medium">{formData.apellido}</span>
            <span className="text-gray-500">Documento:</span>
            <span className="font-medium">{formData.documento}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Información laboral
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm bg-gray-50 rounded-lg p-3">
            <span className="text-gray-500">Sede:</span>
            <span className="font-medium">{sedeFinal}</span>
            <span className="text-gray-500">Área:</span>
            <span className="font-medium">{puestoFinal}</span>
            <span className="text-gray-500">Cargo:</span>
            <span className="font-medium">{cargoFinal}</span>
            <span className="text-gray-500">Centro de Estudios:</span>
            <span className="font-medium">{tipoFinal}</span>
            <span className="text-gray-500">Inicio:</span>
            <span className="font-medium">{formData.fechaInicioPracticas}</span>
            {formData.fechaFinPracticas && (
              <>
                <span className="text-gray-500">Fin:</span>
                <span className="font-medium">
                  {formData.fechaFinPracticas}
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            Horario semanal
          </h4>
          <div className="grid grid-cols-1 gap-0.5 text-sm bg-gray-50 rounded-lg p-3">
            {DIAS_SEMANA.map((dia) => {
              const diaData = horario[dia.key as keyof HorarioSemanal];
              return (
                <div
                  key={dia.key}
                  className="flex justify-between py-0.5 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-600">{dia.label}</span>
                  <span
                    className={
                      diaData.activo ? "font-medium" : "text-gray-400 italic"
                    }
                  >
                    {diaData.activo
                      ? `${diaData.entrada} - ${diaData.salida}`
                      : "Descanso"}
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

        <div className="flex flex-col sm:flex-row gap-2">
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

          {currentStep === 3 && (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              <SaveCheck className="h-4 w-4 mr-1" />
              Guardar cambios
            </Button>
          )}

          {currentStep < 3 && (
            <Button
              type="button"
              onClick={goToNextStep}
              className={`flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 ${
                (currentStep === 1 ? !isStep1Valid : !isStep2Valid)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogFooter>
    );
  };

  // ====== MAIN RENDER ======
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! w-full! max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <Pencil className="h-6 w-6 text-blue-700" />
            <DialogTitle className="text-xl">Editar practicante</DialogTitle>
          </div>
          <DialogDescription>
            Modifica los datos del practicante en{" "}
            {currentStep === 1
              ? "3 pasos"
              : currentStep === 2
                ? "paso 2 de 3"
                : "paso 3 de 3"}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 p-5 overflow-hidden px-6">
          {renderStepIndicator()}
          <div className="mt-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </div>

        <div className="p-6 pt-2 shrink-0">{renderFooter()}</div>
      </DialogContent>
    </Dialog>
  );
}