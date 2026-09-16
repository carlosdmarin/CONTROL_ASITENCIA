package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.dto.ReporteDiarioResponse;
import com.asistencia.attendance_system.model.dto.ReporteSemanalDetalleDTO;
import com.asistencia.attendance_system.model.dto.ReporteSemanalResponse;
import com.asistencia.attendance_system.model.dto.ReporteSemanalResumenDTO;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.enums.DiaSemana;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.service.AsistenciaService;
import com.asistencia.attendance_system.service.HorarioService;
import com.asistencia.attendance_system.service.PracticanteService;
import com.asistencia.attendance_system.service.ReportesService;
import com.asistencia.attendance_system.utils.HorarioUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportesServiceImpl implements ReportesService {

    private static final ZoneId ZONA_LIMA = ZoneId.of("America/Lima");

    private final PracticanteRepository practicanteRepository;
    private final PracticanteService practicanteService;
    private final AsistenciaService asistenciaService;
    private final HorarioService horarioService;

    @Override
    public ReporteDiarioResponse generarDiario(Long practicanteId, LocalDate fecha) {
        log.info("Generando reporte diario practicanteId={} fecha={}", practicanteId, fecha);

        // Practicante (permite INACTIVO con historial)
        PracticanteResponse practicante = practicanteRepository.findById(practicanteId)
                .map(p -> practicanteService.obtenerPorId(practicanteId))
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + practicanteId));

        // Horario del día
        Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(practicanteId, fecha);
        boolean esDescanso = bloqueOpt.isEmpty();
        LocalTime horaInicio = bloqueOpt.map(BloqueHorario::getHoraInicio).orElse(null);
        LocalTime horaFin = bloqueOpt.map(BloqueHorario::getHoraFin).orElse(null);
        String diaSemana = toDiaSemana(fecha);

        BigDecimal horasEsperadas = BigDecimal.ZERO;
        if (!esDescanso && horaInicio != null && horaFin != null) {
            long minutosEsperados = HorarioUtils.calcularMinutosTrabajados(horaInicio, horaFin);
            if (minutosEsperados >= 0) {
                horasEsperadas = BigDecimal.valueOf(minutosEsperados / 60.0);
            }
        }

        // Asistencia (usa lógica existente, respeta DESCANSO/SIN_MARCAR/JUSTIFICADO y no crea AUSENTE futuro)
        AsistenciaDiariaResponse asistencia;
        try {
            asistencia = asistenciaService.obtenerAsistenciaDiaria(practicanteId, fecha);
        } catch (RuntimeException e) {
            // Si no existe registro (ej. futuro sin marcación y sin bloque), crear virtual via diaria
            // obtenerAsistenciasDelDia genera virtual, pero obtenerAsistenciaDiaria lanza. Para reporte, construimos virtual mínimo
            // Reutilizamos obtenerAsistenciasDelDia logic: buscamos en lista
            asistencia = null;
            try {
                var lista = asistenciaService.obtenerAsistenciasDelDia(fecha);
                asistencia = lista.stream().filter(a -> a.getIdPracticante().equals(practicanteId)).findFirst().orElse(null);
            } catch (Exception ex) {
                log.warn("No se pudo obtener asistencia virtual para reporte diario: {}", ex.getMessage());
            }
            if (asistencia == null) {
                asistencia = new AsistenciaDiariaResponse();
                asistencia.setIdPracticante(practicanteId);
                asistencia.setNombreCompleto(practicante.getNombreCompleto());
                asistencia.setFecha(fecha);
                // Determinar estado via horarioService + calculadora (reutilizar lógica de obtenerAsistenciasDelDia virtual)
                // Si es descanso, estado DESCANSO, horas 0
                if (esDescanso) {
                    asistencia.setEstadoDia("DESCANSO");
                    asistencia.setHorasTrabajadas(BigDecimal.ZERO);
                    asistencia.setMinutosTardanza(0);
                } else {
                    asistencia.setEstadoDia("SIN_MARCAR");
                    asistencia.setHorasTrabajadas(BigDecimal.ZERO);
                    asistencia.setMinutosTardanza(0);
                    asistencia.setEntradaEsperada(horaInicio);
                    asistencia.setSalidaEsperada(horaFin);
                }
                asistencia.setJustificado(false);
            }
        }

        // Horas extra = max(0, trabajadas - esperadas) — misma HorarioUtils, almuerzo 13-14 ya descontado en ambas
        BigDecimal horasTrabajadas = asistencia.getHorasTrabajadas() != null ? asistencia.getHorasTrabajadas() : BigDecimal.ZERO;
        BigDecimal horasExtra = BigDecimal.ZERO;
        if (!esDescanso && horasEsperadas.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = horasTrabajadas.subtract(horasEsperadas);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                horasExtra = diff;
            }
        }

        return ReporteDiarioResponse.builder()
                .practicante(practicante)
                .fecha(fecha)
                .diaSemana(diaSemana)
                .horaInicio(horaInicio)
                .horaFin(horaFin)
                .esDescanso(esDescanso)
                .horasEsperadas(horasEsperadas)
                .asistencia(asistencia)
                .horasExtra(horasExtra)
                .fechaGeneracion(LocalDateTime.now(ZONA_LIMA))
                .build();
    }

    @Override
    public ReporteSemanalResponse generarSemanal(Long practicanteId, LocalDate fechaReferencia) {
        log.info("Generando reporte semanal practicanteId={} fechaReferencia={}", practicanteId, fechaReferencia);
        PracticanteResponse practicante = practicanteRepository.findById(practicanteId)
                .map(p -> practicanteService.obtenerPorId(practicanteId))
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + practicanteId));

        LocalDate lunes = fechaReferencia.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sabado = lunes.plusDays(5);

        List<ReporteSemanalDetalleDTO> detalle = new ArrayList<>();
        BigDecimal horasProgramadasTotal = BigDecimal.ZERO;
        BigDecimal horasTrabajadasTotal = BigDecimal.ZERO;

        int diasProgramados = 0;
        int diasTrabajados = 0;
        int diasPresentes = 0;
        int tardanzas = 0;
        int ausencias = 0;
        int justificaciones = 0;
        int descansos = 0;

        List<String> incidencias = new ArrayList<>();

        for (int i = 0; i < 6; i++) {
            LocalDate fecha = lunes.plusDays(i);
            String diaSemana = toDiaSemana(fecha);
            Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(practicanteId, fecha);
            boolean esDescanso = bloqueOpt.isEmpty();
            LocalTime horaInicio = bloqueOpt.map(BloqueHorario::getHoraInicio).orElse(null);
            LocalTime horaFin = bloqueOpt.map(BloqueHorario::getHoraFin).orElse(null);

            BigDecimal horasEsperadas = BigDecimal.ZERO;
            if (!esDescanso && horaInicio != null && horaFin != null) {
                long mins = HorarioUtils.calcularMinutosTrabajados(horaInicio, horaFin);
                if (mins >= 0) {
                    horasEsperadas = BigDecimal.valueOf(mins / 60.0);
                    horasProgramadasTotal = horasProgramadasTotal.add(horasEsperadas);
                    diasProgramados++;
                } else {
                    esDescanso = true;
                }
            }

            if (esDescanso) {
                descansos++;
                // Asistencia virtual descanso
                AsistenciaDiariaResponse asistenciaDescanso = new AsistenciaDiariaResponse();
                asistenciaDescanso.setIdPracticante(practicanteId);
                asistenciaDescanso.setNombreCompleto(practicante.getNombreCompleto());
                asistenciaDescanso.setFecha(fecha);
                asistenciaDescanso.setEstadoDia("DESCANSO");
                asistenciaDescanso.setHorasTrabajadas(BigDecimal.ZERO);
                asistenciaDescanso.setMinutosTardanza(0);
                asistenciaDescanso.setEntradaEsperada(null);
                asistenciaDescanso.setSalidaEsperada(null);
                asistenciaDescanso.setEntradaReal(null);
                asistenciaDescanso.setSalidaReal(null);
                asistenciaDescanso.setJustificado(false);
                asistenciaDescanso.setSituacion("NINGUNA");

                ReporteSemanalDetalleDTO det = ReporteSemanalDetalleDTO.builder()
                        .fecha(fecha)
                        .diaSemana(diaSemana)
                        .horaInicio(null)
                        .horaFin(null)
                        .esDescanso(true)
                        .horasEsperadas(BigDecimal.ZERO)
                        .asistencia(asistenciaDescanso)
                        .estado("DESCANSO")
                        .situacion("NINGUNA")
                        .horasTrabajadas(BigDecimal.ZERO)
                        .situacionesDetalle(null)
                        .build();
                detalle.add(det);
                continue;
            }

            // Día laborable: obtener asistencia
            AsistenciaDiariaResponse asistencia;
            try {
                asistencia = asistenciaService.obtenerAsistenciaDiaria(practicanteId, fecha);
            } catch (RuntimeException e) {
                asistencia = null;
                try {
                    var lista = asistenciaService.obtenerAsistenciasDelDia(fecha);
                    asistencia = lista.stream().filter(a -> a.getIdPracticante().equals(practicanteId)).findFirst().orElse(null);
                } catch (Exception ex) {
                    log.warn("No se pudo obtener asistencia virtual semanal para {}: {}", fecha, ex.getMessage());
                }
                if (asistencia == null) {
                    asistencia = new AsistenciaDiariaResponse();
                    asistencia.setIdPracticante(practicanteId);
                    asistencia.setNombreCompleto(practicante.getNombreCompleto());
                    asistencia.setFecha(fecha);
                    asistencia.setEstadoDia("SIN_MARCAR");
                    asistencia.setHorasTrabajadas(BigDecimal.ZERO);
                    asistencia.setMinutosTardanza(0);
                    asistencia.setEntradaEsperada(horaInicio);
                    asistencia.setSalidaEsperada(horaFin);
                    asistencia.setJustificado(false);
                    asistencia.setSituacion("NINGUNA");
                }
            }

            String estadoNorm = asistencia.getEstadoDia() != null ? asistencia.getEstadoDia().toUpperCase() : "SIN_MARCAR";
            // normalizar legacy TARDE->TARDANZA FALTA->AUSENTE
            if ("TARDE".equals(estadoNorm)) estadoNorm = "TARDANZA";
            if ("FALTA".equals(estadoNorm)) estadoNorm = "AUSENTE";

            BigDecimal ht = asistencia.getHorasTrabajadas() != null ? asistencia.getHorasTrabajadas() : BigDecimal.ZERO;
            horasTrabajadasTotal = horasTrabajadasTotal.add(ht);

            // diasTrabajados = con marcación efectiva (entradaReal no null y estado != AUSENTE/DESCANSO/SIN_MARCAR)
            boolean tieneTrabajo = ht.compareTo(BigDecimal.ZERO) > 0 || "PRESENTE".equals(estadoNorm) || "TARDANZA".equals(estadoNorm);
            if (tieneTrabajo) diasTrabajados++;
            if ("PRESENTE".equals(estadoNorm)) diasPresentes++;
            if ("TARDANZA".equals(estadoNorm)) tardanzas++;
            if ("AUSENTE".equals(estadoNorm)) ausencias++;
            boolean esJust = Boolean.TRUE.equals(asistencia.getJustificado()) || "JUSTIFICADO".equals(asistencia.getEstadoDia());
            if (esJust) justificaciones++;

            // incidencias
            if ("TARDANZA".equals(estadoNorm)) {
                int mins = asistencia.getMinutosTardanza() != null ? asistencia.getMinutosTardanza() : 0;
                incidencias.add(diaSemana + " " + fecha + ": TARDANZA (" + mins + " min)");
            }
            if ("AUSENTE".equals(estadoNorm) && !esJust) {
                incidencias.add(diaSemana + " " + fecha + ": AUSENCIA");
            }
            if (esJust) {
                String sit = asistencia.getSituacion() != null ? asistencia.getSituacion() : "JUSTIFICADO";
                incidencias.add(diaSemana + " " + fecha + ": JUSTIFICADO (" + sit + ")");
            }
            if (asistencia.getSituacion() != null && asistencia.getSituacion().contains("SALIDA_ANTICIPADA")) {
                // ya contado como justificación, pero resaltamos salida anticipada
            }
            if (asistencia.getEntradaReal() == null && asistencia.getSalidaReal() != null) {
                incidencias.add(diaSemana + " " + fecha + ": MARCACIÓN INCOMPLETA (solo salida)");
            }
            if (asistencia.getEntradaReal() != null && asistencia.getSalidaReal() == null && !"DESCANSO".equals(estadoNorm) && !"AUSENTE".equals(estadoNorm) && !"SIN_MARCAR".equals(estadoNorm)) {
                // jornada incompleta: hay entrada pero no salida
                if (ht.compareTo(BigDecimal.ZERO) == 0) {
                    incidencias.add(diaSemana + " " + fecha + ": JORNADA INCOMPLETA (sin salida)");
                }
            }

            ReporteSemanalDetalleDTO det = ReporteSemanalDetalleDTO.builder()
                    .fecha(fecha)
                    .diaSemana(diaSemana)
                    .horaInicio(horaInicio)
                    .horaFin(horaFin)
                    .esDescanso(false)
                    .horasEsperadas(horasEsperadas)
                    .asistencia(asistencia)
                    .estado(estadoNorm)
                    .situacion(asistencia.getSituacion() != null ? asistencia.getSituacion() : "NINGUNA")
                    .horasTrabajadas(ht)
                    .situacionesDetalle(asistencia.getSituacionesDetalle())
                    .build();
            detalle.add(det);
        }

        BigDecimal horasFaltantes = BigDecimal.ZERO;
        BigDecimal horasAdicionales = BigDecimal.ZERO;
        String estadoBalance = "CUMPLIDA";
        if (horasProgramadasTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = horasTrabajadasTotal.subtract(horasProgramadasTotal);
            if (diff.compareTo(BigDecimal.ZERO) < 0) {
                horasFaltantes = diff.abs();
                estadoBalance = "FALTANTES";
            } else if (diff.compareTo(BigDecimal.ZERO) > 0) {
                horasAdicionales = diff;
                estadoBalance = "ADICIONALES";
            }
        }

        BigDecimal porcentaje = BigDecimal.ZERO;
        if (horasProgramadasTotal.compareTo(BigDecimal.ZERO) > 0) {
            porcentaje = horasTrabajadasTotal.multiply(BigDecimal.valueOf(100))
                    .divide(horasProgramadasTotal, 2, RoundingMode.HALF_UP);
            if (porcentaje.compareTo(BigDecimal.valueOf(100)) > 0) porcentaje = BigDecimal.valueOf(100);
        }

        ReporteSemanalResumenDTO resumen = ReporteSemanalResumenDTO.builder()
                .diasProgramados(diasProgramados)
                .diasTrabajados(diasTrabajados)
                .diasPresentes(diasPresentes)
                .tardanzas(tardanzas)
                .ausencias(ausencias)
                .justificaciones(justificaciones)
                .descansos(descansos)
                .horasProgramadas(horasProgramadasTotal)
                .horasTrabajadas(horasTrabajadasTotal)
                .horasFaltantes(horasFaltantes)
                .horasAdicionales(horasAdicionales)
                .porcentajeCumplimiento(porcentaje)
                .estadoBalance(estadoBalance)
                .build();

        String semanaLabel = "Semana del lunes " + formatSpanishFecha(lunes) + " al sábado " + formatSpanishFecha(sabado);

        return ReporteSemanalResponse.builder()
                .practicante(practicante)
                .semanaInicio(lunes)
                .semanaFin(sabado)
                .semanaLabel(semanaLabel)
                .resumen(resumen)
                .detalleDiario(detalle)
                .incidencias(incidencias)
                .fechaGeneracion(LocalDateTime.now(ZONA_LIMA))
                .build();
    }

    private String formatSpanishFecha(LocalDate fecha) {
        // ej: 14 de septiembre de 2026
        String dia = String.valueOf(fecha.getDayOfMonth());
        String mes = fecha.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "ES"));
        return dia + " de " + mes + " de " + fecha.getYear();
    }

    private String toDiaSemana(LocalDate fecha) {
        DayOfWeek dow = fecha.getDayOfWeek();
        return switch (dow) {
            case MONDAY -> DiaSemana.LUNES.name();
            case TUESDAY -> DiaSemana.MARTES.name();
            case WEDNESDAY -> DiaSemana.MIERCOLES.name();
            case THURSDAY -> DiaSemana.JUEVES.name();
            case FRIDAY -> DiaSemana.VIERNES.name();
            case SATURDAY -> DiaSemana.SABADO.name();
            case SUNDAY -> DiaSemana.DOMINGO.name();
        };
    }
}
