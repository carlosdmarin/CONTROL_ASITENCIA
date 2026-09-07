"use client";
// → Este componente corre en el navegador (usa hooks, eventos, etc.)

// ============================
// 📦 IMPORTS PRINCIPALES
// ============================
import { useState, useEffect, useMemo } from "react";
// useState → Guardar datos que cambian
// useEffect → Ejecutar algo al cargar o cuando cambia algo
// useMemo → Guardar cálculos para no repetirlos

import { toast } from "sonner";
// → Notificaciones emergentes (éxito/error)

// Componentes de nuestra propia interfaz, cada uno componen una parte de la página.
import AsistenciaHeader from "./components/AsistenciaHeader";
import AsistenciaStats from "./components/AsistenciaStats";
import AsistenciaFilters from "./components/AsistenciaFilters";
import AsistenciaTable from "./components/AsistenciaTable";

// asistenciasApi: objeto con funciones para hablar con el backend (pedir asistencias, cerrar jornada, registrar permiso, etc).
import { asistenciasApi } from "@/lib/api/asistencias";

// practicantesApi: objeto para pedir la lista de practicantes al backend.
import { practicantesApi } from "@/lib/api/practicantes";

import {
  AsistenciaDiaria, // Tipo para la tabla de UI (id, practicante, entrada, salida, horas, estado)
  AsistenciaDiariaResponse, // Tipo tal cual viene del backend (con muchos más campos)
  normalizeEstadoDia, // Función que normaliza "TARDE" -> "TARDANZA" etc.
  isTardanza, // Función helper: ¿es tardanza?
  isAusente, // Función helper: ¿es ausente?
} from "@/types/asistencia";
// → Tipos y funciones para manejar estados de asistencia

// --- FUNCIONES SUELTAS (helpers) ---

// formatFechaISO: convierte un objeto Date a texto "YYYY-MM-DD" que entiende el backend.
// Ejemplo: new Date(2024,0,5) -> "2024-01-05"
// function ... (date: Date): string  significa: recibe un Date y devuelve un string.
function formatFechaISO(date: Date): string {
  const y = date.getFullYear(); // año
  const m = String(date.getMonth() + 1).padStart(2, "0"); // mes (0-11) +1 y con 2 dígitos
  const d = String(date.getDate()).padStart(2, "0"); // día con 2 dígitos
  return `${y}-${m}-${d}`; // une con guiones
}

// formatHoras: convierte horas en número (ej 7.5) a texto "7h 30m".
// number | null | undefined significa: puede ser un número, o null, o undefined (es decir, puede no haber valor).
// : string | null significa: devuelve un string o null si no hay horas.
function formatHoras(horas: number | null | undefined): string | null {
  // || significa "o". && significa "y".
  // aquí: si horas es null/undefined o es 0, no mostramos nada -> return null
  if (horas == null || horas === 0) return null;
  const h = Math.floor(horas); // parte entera de horas
  const m = Math.round((horas - h) * 60); // parte decimal *60 para minutos
  return `${h}h ${m}m`;
}

function mapEstado(
  estadoDia: AsistenciaDiariaResponse["estadoDia"],
): AsistenciaDiaria["estado"] {
  // switch compara estadoDia con cada caso
  switch (estadoDia) {
    case "SIN_MARCAR":
      return "SIN_MARCAR";
    case "PRESENTE":
      return "PRESENTE";
    case "TARDE":
    case "TARDANZA":
      return "TARDANZA";
    case "FALTA":
    case "AUSENTE":
      return "AUSENTE";
    case "DESCANSO":
      return "DESCANSO";
    case "JUSTIFICADO":
      return "JUSTIFICADO";
    default: {
      // Si llega un valor que no esperábamos, TypeScript lo detecta aquí.
      // never significa "nunca debería llegar nada aquí". Si llega, lo marcamos como error de tipo.
      const _exhaustiveCheck: never = estadoDia;
      // void ... es para decirle a TypeScript "sí, sé que no uso esta variable, no me molestes"
      void _exhaustiveCheck;
      return "AUSENTE";
    }
  }
}
// → Traduce el estado del backend al de la tabla (unifica "TARDE" y "TARDANZA")

// ============================
// 🧩 COMPONENTE PRINCIPAL
// ============================
export default function AsistenciaPage() {
  // ============================
  // 📦 ESTADOS
  // ============================
  const [fecha, setFecha] = useState<Date>(new Date());
  // → Fecha actual que se está viendo

  const [asistencias, setAsistencias] = useState<AsistenciaDiariaResponse[]>(
    [],
  );
  // → Lista de asistencias del día desde el backend

  // resumen guarda 5 números para las tarjetitas de arriba.
  // useState sin <Tipo> porque TypeScript lo infiere solo a partir del objeto inicial.
  const [resumen, setResumen] = useState({
    total: 0,
    presentes: 0,
    tardanzas: 0,
    ausentes: 0,
    descansos: 0,
  });

  // loading es true mientras esperamos al backend, false cuando ya tenemos datos.
  const [loading, setLoading] = useState(true);

  // busqueda guarda lo que el usuario escribe en la cajita de "Buscar practicante"
  const [busqueda, setBusqueda] = useState("");

  // filtroEstado guarda qué filtro eligió el usuario: "todos", "presente", "tardanza", etc.
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Estados para el diálogo de "Registrar permiso previo"
  const [permisoOpen, setPermisoOpen] = useState(false);
  // formatFechaISO(new Date()) -> fecha de hoy en texto para el input de fecha
  const [permisoFecha, setPermisoFecha] = useState(formatFechaISO(new Date()));
  const [permisoMotivo, setPermisoMotivo] = useState("");
  const [permisoObs, setPermisoObs] = useState("");
  const [permisoTipo, setPermisoTipo] = useState("PERSONAL");
  const [permisoPracticante, setPermisoPracticante] = useState("");

  // any[] significa: lista de cualquier cosa. Aquí no tipamos fino porque viene directo del backend y puede variar.
  const [practicantes, setPracticantes] = useState<any[]>([]);

  // fechaISO es la fecha actual pero en texto "YYYY-MM-DD".
  // No es un estado, es una variable que se recalcula en cada render a partir de fecha.
  const fechaISO = formatFechaISO(fecha);

  // ============================
  // 📥 CARGAR DATOS DEL BACKEND
  // ============================
  const cargarDatos = async () => {
    // try intenta hacer algo que puede fallar (internet caído, backend con error)
    try {
      setLoading(true); // mostramos "cargando..."
      // await asistenciasApi.getAsistenciasDelDia(...) espera la respuesta
      // .catch(() => [] as ... ) significa: si falla, en vez de romper, devuelve una lista vacía.
      // as AsistenciaDiariaResponse[] es un "cast": le decimos a TypeScript "trátalo como si fuera de este tipo"
      const data = await asistenciasApi
        .getAsistenciasDelDia(fechaISO)
        .catch(() => [] as AsistenciaDiariaResponse[]);
      // Array.isArray(data) ? data : [] -> si lo que vino no es un array, lo convertimos a array vacío para no romper
      const dataArray: AsistenciaDiariaResponse[] = Array.isArray(data)
        ? data
        : [];
      setAsistencias(dataArray); // guardamos la lista y React vuelve a pintar la tabla
      // Cálculo de los números para AsistenciaStats (las tarjetitas)
      const total = dataArray.length; // length es cuántos elementos hay
      // filter() recorre la lista y se queda solo con los que cumplen la condición
      // (a) => ... es una arrow function: "para cada elemento a, devuelve true/false"
      // || es "o": si es PRESENTE o es tardanza, cuenta como presente
      const presentes = dataArray.filter(
        (a) => a.estadoDia === "PRESENTE" || isTardanza(a.estadoDia),
      ).length;
      const tardanzas = dataArray.filter((a) => isTardanza(a.estadoDia)).length;
      const descansos = dataArray.filter(
        (a) => a.estadoDia === "DESCANSO",
      ).length;
      const ausentes = dataArray.filter((a) => isAusente(a.estadoDia)).length;
      // también contar SIN_MARCAR separado pero para resumen lo agrupamos
      setResumen({ total, presentes, tardanzas, ausentes, descansos });
      // catch atrapa el error si algo dentro del try falló
      // e: unknown significa: "no sabemos qué tipo de error es" (TypeScript te obliga a comprobarlo antes de usarlo)
    } catch (e: unknown) {
      // e instanceof Error pregunta: "¿es un Error de verdad con .message?"
      // ? : es operador ternario: condición ? valor_si_true : valor_si_false
      const msg =
        e instanceof Error ? e.message : "Error al cargar asistencias";
      toast.error(msg); // muestra el error en un toast
      // finally siempre se ejecuta, haya error o no
    } finally {
      setLoading(false); // quitamos el estado de cargando
    }
  };

  // useEffect sirve para ejecutar algo automáticamente.
  // En este caso, cada vez que cambia fechaISO, volvemos a cargar las asistencias de ese día.
  // () => { cargarDatos() } es una función sin parámetros que llama a cargarDatos.
  // [fechaISO] es el array de dependencias: "solo vuelve a ejecutar si fechaISO cambió".
  useEffect(() => {
    cargarDatos();
  }, [fechaISO]);

  // handlePrev: ir un día atrás
  // () => ... es arrow function sin parámetros
  // setFecha((d) => { ... }) es la forma segura de actualizar un estado que depende del valor anterior
  // d es el valor anterior de fecha. Creamos una copia con new Date(d) para no modificar el original.
  const handlePrev = () =>
    setFecha((d) => {
      const n = new Date(d); // new Date(d) crea una copia de la fecha d
      n.setDate(n.getDate() - 1); // le resta 1 día
      return n; // React guarda esta nueva fecha
    });
  // handleNext: ir un día adelante, igual pero +1
  const handleNext = () =>
    setFecha((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 1);
      return n;
    });
  // handleFechaChange: cuando el usuario elige una fecha en el calendario, viene como texto "2024-01-05"
  // (iso: string) significa: recibe un string llamado iso
  const handleFechaChange = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number); // split corta por "-", map(Number) convierte cada parte a número
    setFecha(new Date(y, m - 1, d)); // mes -1 porque en Date los meses van 0-11
  };

  // Mapear backend -> UI para tabla
  // useMemo sirve para no recalcular esto en cada render si asistencias no cambió.
  // Es como decir: "calcula esto una vez y guárdalo, solo recalcula si [asistencias] cambia"
  const asistenciasUI = useMemo(() => {
    // map() transforma cada elemento de la lista en otra cosa
    // (a) => ({...}) es arrow function que para cada a devuelve un objeto nuevo
    return asistencias.map((a) => ({
      id: a.idAsistencia || a.idPracticante, // || significa "si no hay idAsistencia, usa idPracticante"
      practicante: a.nombreCompleto,
      // ?. es optional chaining: si a.entradaReal es null/undefined, no intenta hacer .substring y devuelve undefined
      // substring(0,5) corta el texto para quedarse con "HH:mm" de "HH:mm:ss"
      entrada: a.entradaReal ? a.entradaReal.substring(0, 5) : null,
      salida: a.salidaReal ? a.salidaReal.substring(0, 5) : null,
      horas: formatHoras(a.horasTrabajadas),
      estado: mapEstado(a.estadoDia),
    }));
  }, [asistencias]); // solo se recalcula si asistencias cambia

  // Filtros en memoria (sin filtro por área)
  // Otro useMemo: solo refiltra si cambian asistenciasUI, busqueda o filtroEstado
  const filtradasIndices = useMemo(() => {
    return (
      asistenciasUI
        // .map((a, idx) => ({ ...a, _idx: idx })) copia cada objeto y le agrega _idx que es su posición original
        // { ...a, _idx: idx } usa spread ...a que significa "copia todas las propiedades de a"
        .map((a, idx) => ({ ...a, _idx: idx }))
        // filter se queda solo con los que pasan las dos condiciones
        .filter((a) => {
          // !busqueda es true si busqueda está vacía. Si está vacía, no filtramos por nombre.
          // toLowerCase() pasa a minúsculas para que la búsqueda no distinga mayúsculas
          // includes() pregunta si el texto contiene la búsqueda
          const matchBusqueda =
            !busqueda ||
            a.practicante.toLowerCase().includes(busqueda.toLowerCase());
          // Si filtro es "todos" pasa todo, si no solo los que su estado coincida (también sin mayúsculas)
          const matchEstado =
            filtroEstado === "todos" ||
            a.estado.toLowerCase() === filtroEstado.toLowerCase();
          // && significa "y": debe cumplir búsqueda Y estado
          return matchBusqueda && matchEstado;
        })
    );
  }, [asistenciasUI, busqueda, filtroEstado]);

  // filtradas es solo un alias para no renombrar todo abajo
  const filtradas = filtradasIndices;
  // filtradasRaw: necesitamos los datos completos del backend (con justificación, etc) pero solo de los que pasaron el filtro
  // map((f) => asistencias[f._idx]) busca en la lista original usando el índice que guardamos
  const filtradasRaw = filtradasIndices.map((f) => asistencias[f._idx]);

  // handleCerrarJornada: botón para cerrar el día (convierte SIN_MARCAR en AUSENTE)
  // async/await porque habla con el backend

  // openPermiso: abre el diálogo y carga la lista de practicantes activos
  const openPermiso = async () => {
    setPermisoOpen(true); // abre el modal
    try {
      const list = await practicantesApi.getActivos();
      setPracticantes(list);
    } catch {}
    // catch vacío significa: si falla, no hacemos nada (no mostramos error)
  };
  // handlePermiso: envía el permiso al backend
  const handlePermiso = async () => {
    // Validaciones simples antes de enviar
    if (!permisoPracticante) {
      toast.error("Seleccione practicante");
      return; // return corta la función aquí
    }
    if (!permisoMotivo.trim()) {
      toast.error("Motivo obligatorio");
      return;
    }
    try {
      // Number(...) convierte texto a número
      await asistenciasApi.registrarPermiso(
        Number(permisoPracticante),
        permisoFecha,
        permisoMotivo,
        permisoObs,
        permisoTipo,
      );
      toast.success("Permiso registrado. No se generará AUSENTE ese día.");
      setPermisoOpen(false);
      setPermisoMotivo("");
      setPermisoObs("");
      cargarDatos();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // return es lo que React va a pintar en pantalla
  return (
    <div className="space-y-6">
      <AsistenciaHeader
        fecha={fecha}
        onPrev={handlePrev}
        onNext={handleNext}
        onFechaChange={handleFechaChange}
        loading={loading}
      />

      <AsistenciaStats resumen={resumen} loading={loading} />
      <div className="flex justify-end gap-2">
        <button
          onClick={openPermiso}
          className="text-xs border rounded px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700"
        >
          Registrar permiso previo
        </button>
      </div>

      <AsistenciaFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        loading={loading}
      />

      <AsistenciaTable
        asistencias={filtradas.map(({ _idx, ...rest }) => rest)}
        rawData={filtradasRaw}
        loading={loading}
        onRefresh={cargarDatos}
      />
    </div>
  );
}
