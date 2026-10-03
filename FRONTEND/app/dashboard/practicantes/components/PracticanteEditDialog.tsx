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
  TipoPracticante,
  Oficina,
  TipoInstituto,
  ActualizarPracticante,
  BloqueHorarioRequest,
} from "@/types/practicante";
import { sedeApi } from "@/lib/api/sedes";
import { oficinasApi } from "@/lib/api/oficinas";
import { tiposPracticanteApi } from "@/lib/api/tiposPracticante";
import { tiposInstitutoApi } from "@/lib/api/tipos-instituto";
import { practicantesApi } from "@/lib/api/practicantes";
import {
  calcularMinutosTrabajados,
  formatHorasMinutos,
} from "@/lib/utils/horas";
import { toast } from "sonner";

interface PracticanteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
  onSave: (
    practicanteEditado: ActualizarPracticante & {
      idPracticante: number;
      horario?: BloqueHorarioRequest[];
    },
  ) => void;
}

interface DiaHorario {
  activo: boolean;
  entrada: string;
  salida: string;
  jornada: "NORMAL" | "CORRIDO"; // NORMAL descuenta refrigerio, CORRIDO no
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
  descuentaAlmuerzo?: boolean; // true = NORMAL, false = CORRIDO
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
  LUNES: { activo: true, entrada: "07:30", salida: "17:00", jornada: "NORMAL" },
  MARTES: { activo: true, entrada: "07:30", salida: "17:00", jornada: "NORMAL" },
  MIERCOLES: { activo: true, entrada: "07:30", salida: "17:00", jornada: "NORMAL" },
  JUEVES: { activo: true, entrada: "07:30", salida: "17:00", jornada: "NORMAL" },
  VIERNES: { activo: true, entrada: "07:30", salida: "17:00", jornada: "NORMAL" },
  SABADO: { activo: false, entrada: "07:30", salida: "13:00", jornada: "NORMAL" },
};

// ====== FUNCIÓN PARA NORMALIZAR TEXTO ======
const normalizar = (texto: string) => {
  return texto?.toUpperCase().trim().replace(/\s+/g, " ") || "";
};

// ====== HELPERS ======
const minutosDelDia = (dia: DiaHorario): number => {
  if (!dia.activo) return 0;
  return calcularMinutosTrabajados(dia.entrada, dia.salida, dia.jornada !== "CORRIDO");
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

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [tiposPracticante, setTiposPracticante] = useState<TipoPracticante[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [tiposInstituto, setTiposInstituto] = useState<TipoInstituto[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    idSede: 0,
    idTipoPracticante: 0,
    idOficina: 0,
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
  const tipoPracticanteSeleccionado = tiposPracticante.find(
    (c) => c.idTipoPracticante === Number(formData.idTipoPracticante),
  );
  const horasObjetivo = tipoPracticanteSeleccionado?.horasSemanales ?? 0;
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

    let estado: "vacio" | "incompleto" | "completo" | "excedido" | "invalido" =
      "vacio";
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
        const [sedesData, tiposPracticanteData, tiposData, oficinasData] =
          await Promise.all([
            sedeApi.getAll().catch(() => {
              toast.error("Error al cargar sedes");
              return [] as Sede[];
            }),
            tiposPracticanteApi.getAll().catch(() => {
              toast.error("Error al cargar tiposPracticante");
              return [] as TipoPracticante[];
            }),
            tiposInstitutoApi.getAll().catch(() => {
              toast.error("Error al cargar tipos de instituto");
              return [] as TipoInstituto[];
            }),
            oficinasApi.getActivas().catch(() => {
              toast.error("Error al cargar oficinas");
              return [] as Oficina[];
            }),
          ]);

        setSedes(sedesData);
        setTiposPracticante(tiposPracticanteData);
        // Mantener solo activas; si el practicante actual tiene área inactiva, se añadirá luego en el segundo useEffect

        setTiposInstituto(tiposData);
        setOficinas(oficinasData);
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
      return sedes.find((s) => normalizar(s.nombre) === normalizado);
    };

    const buscarTipoPracticante = (nombreTipo: string) => {
      if (!nombreTipo) return null;
      const normalizado = normalizar(nombreTipo);
      return tiposPracticante.find((c) => normalizar(c.nombre) === normalizado);
    };

    const buscarTipoInstituto = (nombreTipo: string) => {
      if (!nombreTipo) return null;
      const normalizado = normalizar(nombreTipo);
      return tiposInstituto.find((t) => normalizar(t.nombre) === normalizado);
    };

    let sedeEncontrada = buscarSede(practicante.sede);

    const tipoPracticanteEncontrado = buscarTipoPracticante(practicante.tipoPracticante);
    const tipoEncontrado = buscarTipoInstituto(practicante.tipoInstituto);

    const idSedeFinal =
      sedeEncontrada?.idSede || (sedes.length > 0 ? sedes[0].idSede : 0);
    const idTipoPracticanteFinal =
      tipoPracticanteEncontrado?.idTipoPracticante || (tiposPracticante.length > 0 ? tiposPracticante[0].idTipoPracticante : 0);
    const oficinaEncontrada = oficinas.find(
      (o) => o.idOficina === (practicante as any).idOficina,
    );
    const idOficinaFinal =
      oficinaEncontrada?.idOficina ??
      ((practicante as any).idOficina ||
        (oficinas.length > 0 ? oficinas[0].idOficina : 0));
    const idTipoFinal =
      tipoEncontrado?.idTipoInstituto ||
      (tiposInstituto.length > 0 ? tiposInstituto[0].idTipoInstituto : 0);

    setFormData({
      nombre: nombre,
      apellido: apellido,
      documento: practicante.documento || "",
      idSede: idSedeFinal,
      idTipoPracticante: idTipoPracticanteFinal,
      idOficina: idOficinaFinal,
      idTipoInstituto: idTipoFinal,
      correoElectronico: practicante.correoElectronico || "",
      telefono: practicante.telefono || "",
      fechaInicioPracticas: practicante.fechaInicioPracticas || "",
      fechaFinPracticas: practicante.fechaFinPracticas || "",
    });

    const cargarHorario = async () => {
      try {
        setLoadingHorario(true);
        const horarioData = await practicantesApi.getHorario(
          practicante.idPracticante,
        );

        if (horarioData && horarioData.length > 0) {
          // Base todo-inactivo: solo los días presentes en la API quedan ACTIVOS.
          // (HORARIO_DEFAULT trae Lun–Vie activos y no debe usarse como base aquí.)
          const nuevoHorario = Object.fromEntries(
            Object.entries(HORARIO_DEFAULT).map(([dia, data]) => [
              dia,
              { ...data, activo: false },
            ]),
          ) as HorarioSemanal;
          horarioData.forEach((bloque: HorarioBackend) => {
            const diaKey = bloque.diaSemana as keyof HorarioSemanal;
            if (nuevoHorario[diaKey]) {
              nuevoHorario[diaKey] = {
                activo: bloque.activo,
                entrada: bloque.horaInicio.substring(0, 5),
                salida: bloque.horaFin.substring(0, 5),
                jornada: bloque.descuentaAlmuerzo === false ? "CORRIDO" : "NORMAL",
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
  }, [practicante, open, sedes, tiposPracticante, oficinas, tiposInstituto]);

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
      formData.idOficina > 0 &&
      formData.idTipoPracticante > 0 &&
      formData.idTipoInstituto > 0
    );
  };

  const validateStep2 = (): boolean => {
    const { diasActivos, horasValidas, minutosTotales, horasObjetivoMinutos } =
      resumenHorario;
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

    if (!practicante?.idPracticante) return;
    const practicanteEditado = {
      idPracticante: practicante.idPracticante,
      nombre: formData.nombre,
      apellido: formData.apellido,
      nombreCompleto: nombreCompleto,
      documento: formData.documento,
      idSede: formData.idSede,
      idOficina: formData.idOficina,
      idTipoInstituto: formData.idTipoInstituto,
      idTipoPracticante: formData.idTipoPracticante,
      correoElectronico: formData.correoElectronico || undefined,
      telefono: formData.telefono || undefined,
      fechaInicioPracticas: formData.fechaInicioPracticas,
      fechaFinPracticas: formData.fechaFinPracticas || undefined,
      horario: Object.entries(horario).map(([dia, data]) => ({
        diaSemana: dia,
        horaInicio: data.entrada,
        horaFin: data.salida,
        activo: data.activo,
        descuentaAlmuerzo: data.jornada !== "CORRIDO",
      })),
    };

    onSave(practicanteEditado);
    onOpenChange(false);
  };

  // ====== RENDER STEP INDICATOR ======
  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Datos", icon: User },
      { num: 2, label: "Horario", icon: Clock },
      { num: 3, label: "Confirmar", icon: CheckCircle2 },
    ];

    return (
      <div className="flex items-center justify-center mb-4 sm:mb-5 px-1">
        <div className="flex items-center gap-1 sm:gap-2">
          {steps.map((step, index) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;
            const Icon = step.icon;

            return (
              <div key={step.num} className="flex items-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="relative shrink-0">
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-blue-400/40 animate-ping" />
                    )}
                    {isActive && (
                      <span className="absolute -inset-1 rounded-full bg-blue-100/60 blur-sm" />
                    )}
                    <div
                      className={`
                      relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[12px] sm:text-[13px] font-bold transition-all duration-500 shrink-0 cursor-default hover:scale-105
                      ${
                        isActive
                          ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white ring-4 ring-blue-100 shadow-md shadow-blue-900/20"
                          : isDone
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                      }
                    `}
                    >
                      {isDone ? (
                        <CheckCircle2
                          className="h-4 w-4 sm:h-4.5 sm:w-4.5 animate-in zoom-in duration-300"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Icon
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${
                            isActive ? "scale-110" : ""
                          }`}
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                  </div>

                  <span
                    className={`
                    text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-all duration-300
                    ${
                      isActive
                        ? "text-blue-700"
                        : isDone
                          ? "text-emerald-700"
                          : "text-slate-400"
                    }
                  `}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="relative w-6 sm:w-12 h-[2px] mx-1.5 sm:mx-2 rounded-full overflow-hidden bg-slate-200">
                    <div
                      className={`
                      absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                      ${
                        isDone
                          ? "w-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                          : isActive
                            ? "w-1/2 bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse"
                            : "w-0 bg-transparent"
                      }
                    `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ====== RENDER STEP 1: DATOS DEL PRACTICANTE ======
  const renderStep1 = () => {
    return (
      <div className="space-y-3 pr-0 sm:pr-1">
        {/* ═══════════ SECCIÓN: DATOS PERSONALES ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3 pb-5 mb-5 border-b border-slate-100">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <User className="h-4.5 w-4.5 text-blue-700" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight">
                Datos personales
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                Modificá la identificación y los datos de contacto del
                practicante
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            {/* Documento */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Documento / DNI
                <span className="text-red-500">*</span>
                <span className="text-[11px] text-slate-400 font-normal ml-1">
                  8 dígitos
                </span>
              </Label>
              <div className="relative">
                <IdCard
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
                    dniError
                      ? "text-red-500"
                      : formData.documento.length === 8
                        ? "text-emerald-500"
                        : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <Input
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleDniChange}
                  placeholder="60563764"
                  className={`w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl transition-all ${
                    dniError
                      ? "border-red-300 focus-visible:ring-red-400/20 focus-visible:border-red-400"
                      : formData.documento.length === 8
                        ? "border-emerald-300 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                        : "focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  }`}
                  maxLength={8}
                  inputMode="numeric"
                  required
                />
              </div>
              <div className="h-4 flex items-center gap-1.5">
                {dniError ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-[11.5px] text-red-600">
                      {dniError}
                    </span>
                  </>
                ) : formData.documento.length === 8 ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11.5px] text-emerald-600">
                      Documento válido
                    </span>
                  </>
                ) : (
                  <span className="text-[11.5px] text-slate-400">
                    Ingresá el número de documento
                  </span>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <BookUser
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
                    formData.nombre.length > 0 && formData.nombre.length < 2
                      ? "text-red-500"
                      : formData.nombre.length >= 2
                        ? "text-emerald-500"
                        : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleNombreChange}
                  placeholder="Carlos Daniel"
                  className={`w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl transition-all ${
                    formData.nombre.length > 0 && formData.nombre.length < 2
                      ? "border-red-300 focus-visible:ring-red-400/20 focus-visible:border-red-400"
                      : formData.nombre.length >= 2
                        ? "border-emerald-300 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                        : "focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  }`}
                  required
                />
              </div>
              <div className="h-4 flex items-center gap-1.5">
                {formData.nombre.length > 0 && formData.nombre.length < 2 ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-[11.5px] text-red-600">
                      Mínimo 2 caracteres
                    </span>
                  </>
                ) : formData.nombre.length >= 2 ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11.5px] text-emerald-600">
                      Nombre válido
                    </span>
                  </>
                ) : (
                  <span className="text-[11.5px] text-slate-400">
                    Campo obligatorio
                  </span>
                )}
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <BookUser
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
                    formData.apellido.length > 0 && formData.apellido.length < 2
                      ? "text-red-500"
                      : formData.apellido.length >= 2
                        ? "text-emerald-500"
                        : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <Input
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleApellidoChange}
                  placeholder="Marín Panduro"
                  className={`w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl transition-all ${
                    formData.apellido.length > 0 && formData.apellido.length < 2
                      ? "border-red-300 focus-visible:ring-red-400/20 focus-visible:border-red-400"
                      : formData.apellido.length >= 2
                        ? "border-emerald-300 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                        : "focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  }`}
                  required
                />
              </div>
              <div className="h-4 flex items-center gap-1.5">
                {formData.apellido.length > 0 &&
                formData.apellido.length < 2 ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-[11.5px] text-red-600">
                      Mínimo 2 caracteres
                    </span>
                  </>
                ) : formData.apellido.length >= 2 ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11.5px] text-emerald-600">
                      Apellido válido
                    </span>
                  </>
                ) : (
                  <span className="text-[11.5px] text-slate-400">
                    Campo obligatorio
                  </span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
                    emailError
                      ? "text-red-500"
                      : formData.correoElectronico.length > 0 && !emailError
                        ? "text-emerald-500"
                        : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <Input
                  id="correoElectronico"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleEmailChange}
                  placeholder="correo@empresa.com"
                  type="email"
                  className={`w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl transition-all ${
                    emailError
                      ? "border-red-300 focus-visible:ring-red-400/20 focus-visible:border-red-400"
                      : formData.correoElectronico.length > 0 && !emailError
                        ? "border-emerald-300 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                        : "focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  }`}
                  required
                />
              </div>
              <div className="h-4 flex items-center gap-1.5">
                {emailError ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-[11.5px] text-red-600">
                      {emailError}
                    </span>
                  </>
                ) : formData.correoElectronico.length > 0 && !emailError ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11.5px] text-emerald-600">
                      Email válido
                    </span>
                  </>
                ) : (
                  <span className="text-[11.5px] text-slate-400">
                    Campo obligatorio
                  </span>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
                    telefonoError
                      ? "text-red-500"
                      : formData.telefono.length >= 9
                        ? "text-emerald-500"
                        : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleTelefonoChange}
                  placeholder="987654321"
                  className={`w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl transition-all ${
                    telefonoError
                      ? "border-red-300 focus-visible:ring-red-400/20 focus-visible:border-red-400"
                      : formData.telefono.length >= 9
                        ? "border-emerald-300 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                        : "focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                  }`}
                  inputMode="numeric"
                  required
                />
              </div>
              <div className="h-4 flex items-center gap-1.5">
                {telefonoError ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-[11.5px] text-red-600">
                      {telefonoError}
                    </span>
                  </>
                ) : formData.telefono.length >= 9 ? (
                  <>
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11.5px] text-emerald-600">
                      Teléfono válido
                    </span>
                  </>
                ) : (
                  <span className="text-[11.5px] text-slate-400">
                    Campo obligatorio
                  </span>
                )}
              </div>
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Fecha de inicio <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${
                    formData.fechaInicioPracticas
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                  strokeWidth={2}
                />
                <Input
                  id="fechaInicioPracticas"
                  name="fechaInicioPracticas"
                  value={formData.fechaInicioPracticas}
                  onChange={handleInputChange}
                  type="date"
                  className="w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all"
                  required
                />
              </div>
              <div className="h-4" />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1">
                Fecha de fin
                <span className="text-[11px] text-slate-400 font-normal ml-1">
                  opcional
                </span>
              </Label>
              <div className="relative">
                <Calendar
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400"
                  strokeWidth={2}
                />
                <Input
                  id="fechaFinPracticas"
                  name="fechaFinPracticas"
                  value={formData.fechaFinPracticas}
                  onChange={handleInputChange}
                  type="date"
                  className="w-full pl-10 h-10 text-[13.5px] bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all"
                />
              </div>
              <div className="h-4" />
            </div>
          </div>
        </div>

        {/* ═══════════ SECCIÓN: INFORMACIÓN LABORAL ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3 pb-5 mb-5 border-b border-slate-100">
            <div className="h-10 w-10 rounded-full bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
              <BriefcaseBusiness
                className="h-4.5 w-4.5 text-violet-700"
                strokeWidth={2.2}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight">
                Información laboral
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                Actualizá la sede, oficina, tipo de practicante y centro de estudios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            {/* Sede */}
            <div className="space-y-2">
              <Label
                htmlFor="idSede"
                className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1"
              >
                Sede <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400 z-10"
                  strokeWidth={2}
                />
                <select
                  id="idSede"
                  name="idSede"
                  value={formData.idSede}
                  onChange={handleSelectChange}
                  className="w-full pl-10 h-10 rounded-xl border border-slate-200 bg-white text-[13.5px] font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 transition-all"
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

            {/* Oficina */}
            <div className="space-y-2">
              <Label
                htmlFor="idOficina"
                className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1"
              >
                Oficina <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400 z-10"
                  strokeWidth={2}
                />
                <select
                  id="idOficina"
                  name="idOficina"
                  value={formData.idOficina}
                  onChange={handleSelectChange}
                  className="w-full pl-10 h-10 rounded-xl border border-slate-200 bg-white text-[13.5px] font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 transition-all"
                  disabled={loadingSelects}
                >
                  <option value="0">Seleccionar oficina</option>
                  {oficinas.map((oficina) => (
                    <option key={oficina.idOficina} value={oficina.idOficina}>
                      {oficina.oficina}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tipo de practicante */}
            <div className="space-y-2">
              <Label
                htmlFor="idTipoPracticante"
                className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1"
              >
                Tipo de practicante <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <BriefcaseBusiness
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400 z-10"
                  strokeWidth={2}
                />
                <select
                  id="idTipoPracticante"
                  name="idTipoPracticante"
                  value={formData.idTipoPracticante}
                  onChange={handleSelectChange}
                  className="w-full pl-10 h-10 rounded-xl border border-slate-200 bg-white text-[13.5px] font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 transition-all"
                  disabled={loadingSelects}
                >
                  <option value="0">Seleccionar tipo de practicante</option>
                  {tiposPracticante.map((tp) => (
                    <option key={tp.idTipoPracticante} value={tp.idTipoPracticante}>
                      {tp.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Centro de Estudios */}
            <div className="space-y-2">
              <Label
                htmlFor="idTipoInstituto"
                className="text-[12.5px] font-medium text-slate-700 flex items-center gap-1"
              >
                Centro de Estudios <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <School
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400 z-10"
                  strokeWidth={2}
                />
                <select
                  id="idTipoInstituto"
                  name="idTipoInstituto"
                  value={formData.idTipoInstituto}
                  onChange={handleSelectChange}
                  className="w-full pl-10 h-10 rounded-xl border border-slate-200 bg-white text-[13.5px] font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-50 transition-all"
                  disabled={loadingSelects}
                >
                  <option value="0">Seleccionar centro</option>
                  {tiposInstituto.map((tipo) => (
                    <option
                      key={tipo.idTipoInstituto}
                      value={tipo.idTipoInstituto}
                    >
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
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
      <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden">
        <div
          className={`rounded-xl border p-3 sm:p-5 ${config.bg} ${config.border} transition-all duration-300 shrink-0`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Horas semanales
              </p>
              <p className="text-sm font-medium text-slate-700">
                {tipoPracticanteSeleccionado?.nombre || "Selecciona un tipo de practicante"}
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
                    : "Selecciona un tipo para ver el objetivo"}
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

        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          <p className="text-sm text-gray-500 shrink-0">
            Activa los días y ajusta entrada/salida. La duración por día se
            calcula al instante.
          </p>

          <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto min-h-0 pr-1 overscroll-contain">
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
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto sm:min-w-[140px]">
                        <div className="flex items-center gap-2">
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
                        <span
                          className={`sm:hidden text-xs font-medium px-2.5 py-1 rounded-full border ${tieneError ? "bg-red-100 text-red-700 border-red-200" : diaData.activo ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}
                        >
                          {diaData.activo
                            ? tieneError
                              ? "Inválido"
                              : duracionFmt
                            : "—"}
                        </span>
                      </div>

                      {diaData.activo ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 flex-1 w-full">
                          <div className="flex flex-col gap-1.5 flex-1">
                            <span className="text-[11px] font-medium text-slate-500 sm:hidden">
                              Entrada
                            </span>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400 hidden sm:block shrink-0" />
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
                                className={`w-full sm:w-28 h-10 text-sm ${tieneError ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                              />
                            </div>
                          </div>
                          <span className="hidden sm:block text-xs text-slate-400">
                            —
                          </span>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <span className="text-[11px] font-medium text-slate-500 sm:hidden">
                              Salida
                            </span>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400 hidden sm:block shrink-0" />
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
                                className={`w-full sm:w-28 h-10 text-sm ${tieneError ? "border-red-300 focus-visible:ring-red-200" : ""}`}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <span className="text-[11px] font-medium text-slate-500 sm:hidden">
                              Jornada
                            </span>
                            <select
                              value={diaData.jornada}
                              onChange={(e) =>
                                handleHorarioChange(
                                  dia.key,
                                  "jornada",
                                  e.target.value,
                                )
                              }
                              title="Normal descuenta 1 h de refrigerio; Corrido no descuenta"
                              className="w-full sm:w-28 h-10 text-sm rounded-md border border-slate-200 bg-white px-2 text-slate-700"
                            >
                              <option value="NORMAL">Normal</option>
                              <option value="CORRIDO">Corrido</option>
                            </select>
                          </div>
                          <span
                            className={`hidden sm:inline-flex ml-1 text-xs font-medium px-2.5 py-1 rounded-full border ${tieneError ? "bg-red-100 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}
                          >
                            {tieneError ? "Inválido" : duracionFmt}
                          </span>
                        </div>
                      ) : (
                        <span className="hidden sm:inline text-sm text-gray-400 italic">
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
    const sedeItem = sedes.find((a) => a.idSede === Number(formData.idSede));
    const tipoPracticanteItem = tiposPracticante.find(
      (c) => c.idTipoPracticante === Number(formData.idTipoPracticante),
    );
    const oficinaItemConfirm = oficinas.find(
      (o) => o.idOficina === Number(formData.idOficina),
    );
    const tipoItem = tiposInstituto.find(
      (t) => t.idTipoInstituto === Number(formData.idTipoInstituto),
    );

    let sedeFinal = sedeItem?.nombre || "—";
    let tipoPracticanteFinal = tipoPracticanteItem?.nombre || "—";
    let oficinaFinalConfirm = oficinaItemConfirm?.oficina || "—";
    let tipoFinal = tipoItem?.nombre || "—";

    if (sedeFinal === "—" && practicante) sedeFinal = practicante.sede || "—";
    if (tipoPracticanteFinal === "—" && practicante)
      tipoPracticanteFinal = practicante.tipoPracticante || "—";
    if (oficinaFinalConfirm === "—" && practicante) {
      oficinaFinalConfirm =
        (practicante as any).nombreOficina ||
        (practicante as any).oficina ||
        "—";
    }
    if (tipoFinal === "—" && practicante)
      tipoFinal = practicante.tipoInstituto || "—";

    if (sedeFinal === "—" && practicante?.sede) {
      const encontrado = sedes.find(
        (s) => normalizar(s.nombre) === normalizar(practicante.sede),
      );
      sedeFinal = encontrado?.nombre || practicante.sede || "—";
    }
    if (tipoPracticanteFinal === "—" && practicante?.tipoPracticante) {
      const encontrado = tiposPracticante.find(
        (c) => normalizar(c.nombre) === normalizar(practicante.tipoPracticante),
      );
      tipoPracticanteFinal = encontrado?.nombre || practicante.tipoPracticante || "—";
    }
    if (oficinaFinalConfirm === "—" && practicante) {
      const encontrado = oficinas.find(
        (o) =>
          normalizar(o.oficina) ===
          normalizar(
            (practicante as any).nombreOficina ||
              (practicante as any).oficina ||
              "",
          ),
      );
      oficinaFinalConfirm =
        encontrado?.oficina ||
        (practicante as any).nombreOficina ||
        (practicante as any).oficina ||
        "—";
    }
    if (tipoFinal === "—" && practicante?.tipoInstituto) {
      const encontrado = tiposInstituto.find(
        (t) => normalizar(t.nombre) === normalizar(practicante.tipoInstituto),
      );
      tipoFinal = encontrado?.nombre || practicante.tipoInstituto || "—";
    }

    // Iniciales del practicante
    const iniciales = (nombre: string) => {
      return nombre
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    };

    const nombreCompleto = `${formData.nombre} ${formData.apellido}`.trim();
    const diasActivos = DIAS_SEMANA.filter(
      (dia) => horario[dia.key as keyof HorarioSemanal].activo,
    ).length;

    return (
      <div className="space-y-4 pr-0 sm:pr-1">
        {/* ═══════════ HEADER HERO ═══════════ */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-5">
          {/* Halo decorativo */}
          <div
            className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex items-start gap-4">
            {/* Avatar con iniciales */}
            <div className="relative shrink-0">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <span className="text-[16px] font-bold text-white tracking-tight">
                  {iniciales(nombreCompleto)}
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <CheckCircle2
                  className="h-2.5 w-2.5 text-white"
                  strokeWidth={3}
                />
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Revisión final
                </span>
              </div>
              <h3 className="mt-1.5 text-[18px] font-bold text-slate-900 tracking-tight leading-tight truncate">
                {nombreCompleto}
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Verificá los datos antes de confirmar los cambios
              </p>
            </div>
          </div>

          {/* Chips resumen */}
          <div className="relative z-10 flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-700">
              <IdCard className="h-3 w-3 text-slate-400" strokeWidth={2.4} />
              {formData.documento || "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 truncate max-w-[180px]">
              <BriefcaseBusiness
                className="h-3 w-3 text-violet-500 shrink-0"
                strokeWidth={2.4}
              />
              <span className="truncate">{tipoPracticanteFinal}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 truncate max-w-[180px]">
              <Building2
                className="h-3 w-3 text-blue-500 shrink-0"
                strokeWidth={2.4}
              />
              <span className="truncate">{sedeFinal}</span>
            </span>
          </div>
        </div>

        {/* ═══════════ GRID 2 COLUMNAS: PERSONAL + LABORAL ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Datos personales */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <User
                    className="h-3.5 w-3.5 text-blue-700"
                    strokeWidth={2.4}
                  />
                </div>
                <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
                  Datos personales
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2.6} />
                Completado
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                  Email
                </p>
                <p className="text-[13px] font-medium text-slate-900 mt-1.5 break-all">
                  {formData.correoElectronico || "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    Teléfono
                  </p>
                  <p className="text-[13px] font-mono font-medium text-slate-900 mt-1.5">
                    {formData.telefono || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    DNI
                  </p>
                  <p className="text-[13px] font-mono font-medium text-slate-900 mt-1.5">
                    {formData.documento || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info laboral */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <BriefcaseBusiness
                    className="h-3.5 w-3.5 text-violet-700"
                    strokeWidth={2.4}
                  />
                </div>
                <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
                  Información laboral
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2.6} />
                Completado
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                  Oficina
                </p>
                <p className="text-[13px] font-medium text-slate-900 mt-1.5 break-words">
                  {oficinaFinalConfirm || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                  Centro de estudios
                </p>
                <p className="text-[13px] font-medium text-slate-900 mt-1.5 break-words">
                  {tipoFinal || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ PERÍODO DE PRÁCTICAS ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Calendar
                  className="h-3.5 w-3.5 text-emerald-700"
                  strokeWidth={2.4}
                />
              </div>
              <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
                Período de prácticas
              </h4>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3.5 py-3">
              <div className="h-10 w-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                <Calendar
                  className="h-4 w-4 text-emerald-700"
                  strokeWidth={2.2}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 leading-none">
                  Fecha de inicio
                </p>
                <p className="text-[14px] font-bold text-emerald-900 mt-1.5 truncate tabular-nums">
                  {formData.fechaInicioPracticas || "—"}
                </p>
              </div>
            </div>
            {formData.fechaFinPracticas ? (
              <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/40 px-3.5 py-3">
                <div className="h-10 w-10 rounded-lg bg-white border border-amber-200 flex items-center justify-center shrink-0">
                  <Calendar
                    className="h-4 w-4 text-amber-700"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 leading-none">
                    Fecha de fin
                  </p>
                  <p className="text-[14px] font-bold text-amber-900 mt-1.5 truncate tabular-nums">
                    {formData.fechaFinPracticas}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-3.5 py-3">
                <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Calendar
                    className="h-4 w-4 text-slate-400"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    Fecha de fin
                  </p>
                  <p className="text-[13px] font-medium text-slate-400 italic mt-1.5">
                    Sin definir
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ HORARIO SEMANAL ═══════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Clock
                  className="h-3.5 w-3.5 text-orange-700"
                  strokeWidth={2.4}
                />
              </div>
              <h4 className="text-[12px] font-bold text-slate-800 tracking-tight">
                Horario semanal
              </h4>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {diasActivos} {diasActivos === 1 ? "día" : "días"}
            </span>
          </div>
          <div className="p-3">
            <div className="space-y-1">
              {DIAS_SEMANA.map((dia) => {
                const diaData = horario[dia.key as keyof HorarioSemanal];
                return (
                  <div
                    key={dia.key}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors ${
                      diaData.activo ? "bg-slate-50/70" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          diaData.activo
                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                            : "bg-slate-300"
                        }`}
                      />
                      <span
                        className={`text-[12.5px] font-semibold ${
                          diaData.activo ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {dia.label}
                      </span>
                    </div>
                      {diaData.activo ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 font-mono text-[11.5px] font-semibold text-slate-700 tabular-nums">
                            {diaData.entrada}
                          </span>
                          <ArrowRight
                            className="h-3 w-3 text-slate-300"
                            strokeWidth={2.4}
                          />
                          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 font-mono text-[11.5px] font-semibold text-slate-700 tabular-nums">
                            {diaData.salida}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {diaData.jornada === "CORRIDO" ? "Corrido" : "Normal"}
                          </span>
                        </div>
                      ) : (
                      <span className="text-[11.5px] text-slate-400 italic">
                        Descanso
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════════ BANNER DE ADVERTENCIA ═══════════ */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-3">
          <AlertCircle
            className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"
            strokeWidth={2.4}
          />
          <p className="text-[12px] text-amber-800 leading-snug">
            Al confirmar, los cambios se guardarán y se actualizará el horario
            del practicante.
          </p>
        </div>
      </div>
    );
  };

  // ====== RENDER FOOTER ======
  const renderFooter = () => {
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const canContinue = currentStep === 1 ? isStep1Valid : isStep2Valid;

    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              className="flex-1 sm:flex-none h-10 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Atrás
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-10"
            >
              Cancelar
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {currentStep < 3 && (
            <Button
              type="button"
              onClick={goToNextStep}
              disabled={!canContinue}
              className={`flex-1 sm:flex-none h-10 gap-1.5 bg-blue-700 hover:bg-blue-800 text-[13px] font-semibold ${
                !canContinue ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-[13px] font-semibold shadow-sm"
            >
              <SaveCheck className="h-4 w-4" />
              Guardar cambios
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ====== MAIN RENDER ======
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full !max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border-slate-200 shadow-2xl gap-0">
        <DialogHeader className="p-0 shrink-0 border-b border-slate-100">
          <div className="flex items-start gap-3.5 px-5 sm:px-6 pt-5 pb-4">
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
                <Pencil className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                  Editar practicante
                </DialogTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Paso {currentStep} de 3
                </span>
              </div>
              <DialogDescription className="text-[12.5px] text-slate-500 mt-0.5">
                {currentStep === 1
                  ? "Modificá los datos personales y laborales del practicante."
                  : currentStep === 2
                    ? "Ajustá el horario semanal según el tipo asignado."
                    : "Revisá los cambios antes de guardar."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 sm:px-6 py-4 sm:py-5 bg-slate-50/30">
          {renderStepIndicator()}
          <div className="mt-2 sm:mt-3 flex-1 min-h-0 flex flex-col overflow-hidden">
            {currentStep === 1 && (
              <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
                {renderStep1()}
              </div>
            )}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && (
              <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
                {renderStep3()}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:px-6 sm:py-5 shrink-0 border-t border-slate-100 bg-white">
          {renderFooter()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
