"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  SaveCheck,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  User,
  IdCard,
  BriefcaseBusiness,
  BookUser,
  Building2,
  School,
} from "lucide-react";
import { Practicante, Sede, Cargo, Puesto, TipoInstituto } from "@/types/practicante";
import { sedeApi } from "@/lib/api/agencias";
import { cargosApi } from "@/lib/api/cargos";
import { puestosApi } from "@/lib/api/puestos";
import { tiposInstitutoApi } from "@/lib/api/tipos-instituto";
import { practicantesApi } from "@/lib/api/practicantes";

interface PracticanteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practicante: Practicante | null;
  onSave: (practicante: Practicante) => void;
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

export function PracticanteEditDialog({
  open,
  onOpenChange,
  practicante,
  onSave,
}: PracticanteEditDialogProps) {
  // ====== STATE ======
  const [currentStep, setCurrentStep] = useState(1);

  // Datos de selects
  const [sedes, setSedes] = useState<Sede[]>(MOCK_SEDES);
  const [cargos, setCargos] = useState<Cargo[]>(MOCK_CARGOS);
  const [puestos, setPuestos] = useState<Puesto[]>(MOCK_PUESTOS);
  const [tiposInstituto, setTiposInstituto] = useState<TipoInstituto[]>(MOCK_TIPOS_INSTITUTO);
  const [loadingSelects, setLoadingSelects] = useState(false);

  // Datos del practicante
  const [formData, setFormData] = useState<Practicante | null>(null);

  // Horario semanal
  const [horario, setHorario] = useState<HorarioSemanal>(HORARIO_DEFAULT);

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
        console.error("Error al cargar selects, usando mock:", error);
      } finally {
        setLoadingSelects(false);
      }
    };

    cargarSelects();
    setCurrentStep(1);
    setHorario(HORARIO_DEFAULT);
  }, [open]);

  // ====== CARGAR DATOS DEL PRACTICANTE ======
  useEffect(() => {
    if (practicante) {
      setFormData(practicante);
    }
  }, [practicante]);

  // ====== CARGAR HORARIO DEL PRACTICANTE AL EDITAR ======
  useEffect(() => {
    if (practicante && practicante.idPracticante) {
      const cargarHorario = async () => {
        try {
          const horarioData = await practicantesApi.getHorario(practicante.idPracticante);
          if (horarioData && horarioData.length > 0) {
            const nuevoHorario = { ...HORARIO_DEFAULT };
            horarioData.forEach((bloque: any) => {
              const diaKey = bloque.diaSemana as keyof HorarioSemanal;
              if (nuevoHorario[diaKey]) {
                nuevoHorario[diaKey] = {
                  activo: bloque.activo,
                  entrada: bloque.horaInicio.substring(0, 5),
                  salida: bloque.horaFin.substring(0, 5)
                };
              }
            });
            setHorario(nuevoHorario);
          }
        } catch (error) {
          console.error("Error al cargar horario:", error);
        }
      };
      
      cargarHorario();
    }
  }, [practicante]);

  // ====== HANDLERS ======
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
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

  // ====== VALIDACIÓN POR PASO ======
  const validateStep1 = (): boolean => {
    if (!formData) return false;
    return !!(
      formData.nombreCompleto?.trim() &&
      formData.documento?.trim() &&
      formData.fechaInicioPracticas
    );
  };

  const validateStep2 = (): boolean => {
    return Object.values(horario).some((dia) => dia.activo);
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
    if (!formData || !validateStep1()) return;

    // Construir el objeto con los datos del practicante + horario
    const practicanteEditado = {
      ...formData,
      horario: Object.entries(horario).map(([dia, data]) => ({
        diaSemana: dia,
        horaInicio: data.entrada,
        horaFin: data.salida,
        activo: data.activo
      }))
    };

    onSave(practicanteEditado);
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
    if (!formData) return null;

    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Nombre completo (solo lectura) */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-nombre" className="text-xs font-medium">
              Nombre completo
            </Label>
            <div className="relative">
              <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-nombre"
                value={formData.nombreCompleto}
                disabled
                className="w-full pl-9 h-9 text-sm bg-gray-100"
              />
            </div>
          </div>

          {/* Documento */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-documento" className="text-xs font-medium">
              Documento / DNI *
            </Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-documento"
                name="documento"
                value={formData.documento || ""}
                onChange={handleChange}
                placeholder="DNI del practicante"
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
            <Label htmlFor="edit-sede" className="text-xs font-medium">
              Sede *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="edit-sede"
                name="sede"
                value={formData.sede || (formData as any).agencia || ""}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  sedes.map((sede) => (
                    <option key={sede.idSede} value={sede.nombre}>
                      {sede.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Área / Puesto */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-puesto" className="text-xs font-medium">
              Área *
            </Label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="edit-puesto"
                name="puesto"
                value={formData.puesto || ""}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  puestos.map((puesto) => (
                    <option key={puesto.idPuesto} value={puesto.nombrePuesto}>
                      {puesto.nombrePuesto}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Cargo */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-cargo" className="text-xs font-medium">
              Cargo *
            </Label>
            <div className="relative">
              <BriefcaseBusiness className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="edit-cargo"
                name="cargo"
                value={formData.cargo || ""}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  cargos.map((cargo) => (
                    <option key={cargo.idCargo} value={cargo.nombre}>
                      {cargo.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Tipo Instituto */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-tipo-instituto" className="text-xs font-medium">
              Centro de Estudios *
            </Label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="edit-tipo-instituto"
                name="tipoInstituto"
                value={formData.tipoInstituto || ""}
                onChange={handleChange}
                className="w-full pl-9 rounded-md border border-gray-200 px-3 py-1.5 text-sm bg-white h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingSelects}
              >
                {loadingSelects ? (
                  <option value="0">Cargando...</option>
                ) : (
                  tiposInstituto.map((tipo) => (
                    <option key={tipo.idTipoInstituto} value={tipo.nombre}>
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
            <Label htmlFor="edit-email" className="text-xs font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-email"
                name="correoElectronico"
                value={formData.correoElectronico || ""}
                onChange={handleChange}
                placeholder="correo@empresa.com"
                type="email"
                className="w-full pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-telefono" className="text-xs font-medium">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-telefono"
                name="telefono"
                value={formData.telefono || ""}
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
            <Label htmlFor="edit-fecha-inicio" className="text-xs font-medium">
              Fecha de inicio *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-fecha-inicio"
                name="fechaInicioPracticas"
                value={formData.fechaInicioPracticas || ""}
                onChange={handleChange}
                type="date"
                className="w-full pl-9 h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Fecha Fin */}
          <div className="grid gap-1.5">
            <Label htmlFor="edit-fecha-fin" className="text-xs font-medium">
              Fecha de fin (opcional)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-fecha-fin"
                name="fechaFinPracticas"
                value={formData.fechaFinPracticas || ""}
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

  // ====== RENDER STEP 2: HORARIO ======
  const renderStep2 = () => {
    return (
      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        <p className="text-sm text-gray-500">
          Configura el horario semanal del practicante. Los días desactivados se marcarán como "Descanso".
        </p>

        <div className="space-y-2">
          {DIAS_SEMANA.map((dia) => {
            const diaData = horario[dia.key as keyof HorarioSemanal];
            return (
              <Card key={dia.key} className="border">
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
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <Input
                            type="time"
                            value={diaData.entrada}
                            onChange={(e) =>
                              handleHorarioChange(dia.key, 'entrada', e.target.value)
                            }
                            className="w-28 h-8 text-sm"
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
                            className="w-28 h-8 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Descanso
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!validateStep2() && (
          <p className="text-xs text-amber-600 mt-1">
            * Debe seleccionar al menos un día de trabajo
          </p>
        )}
      </div>
    );
  };

  // ====== RENDER STEP 3: CONFIRMACIÓN ======
  const renderStep3 = () => {
    if (!formData) return null;

    return (
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Revisa los datos antes de actualizar al practicante
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
            <span className="font-medium">{formData.nombreCompleto}</span>
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
            <span className="font-medium">{formData.sede || (formData as any).agencia || '—'}</span>
            <span className="text-gray-500">Área:</span>
            <span className="font-medium">{formData.puesto || '—'}</span>
            <span className="text-gray-500">Cargo:</span>
            <span className="font-medium">{formData.cargo || '—'}</span>
            <span className="text-gray-500">Tipo instituto:</span>
            <span className="font-medium">{formData.tipoInstituto || '—'}</span>
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
              Guardar cambios
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
            <Pencil className="h-6 w-6 text-blue-700" />
            <DialogTitle className="text-xl">Editar practicante</DialogTitle>
          </div>
          <DialogDescription>
            Modifica los datos del practicante en {currentStep === 1 ? '3 pasos' : currentStep === 2 ? 'paso 2 de 3' : 'paso 3 de 3'}.
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