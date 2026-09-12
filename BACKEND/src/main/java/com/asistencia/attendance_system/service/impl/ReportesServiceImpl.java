package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.dto.ReporteDiarioResponse;
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
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
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
