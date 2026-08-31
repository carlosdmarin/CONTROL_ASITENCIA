package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponseDTO;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.enums.DiaSemana;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.repository.BloqueHorarioRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.service.HorarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HorarioServiceImpl implements HorarioService {

    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final PracticanteRepository practicanteRepository;

    @Override
    public List<BloqueHorarioResponseDTO> obtenerHorarioPorPracticante(Long idPracticante) {
        log.info("Obteniendo horario del practicante ID: {}", idPracticante);
        List<BloqueHorario> entidades = bloqueHorarioRepository.findByPracticante_IdPracticante(idPracticante);
        return entidades.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BloqueHorarioResponseDTO> obtenerHorarioActivoPorPracticante(Long idPracticante) {
        log.info("Obteniendo horario activo del practicante ID: {}", idPracticante);
        List<BloqueHorario> entidades = bloqueHorarioRepository.findByPracticante_IdPracticanteAndActivoTrue(idPracticante);
        return entidades.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private BloqueHorarioResponseDTO toDTO(BloqueHorario e) {
        BloqueHorarioResponseDTO dto = new BloqueHorarioResponseDTO();
        dto.setIdBloque(e.getIdBloque());
        dto.setDiaSemana(e.getDiaSemana() != null ? e.getDiaSemana().name() : null);
        dto.setHoraInicio(e.getHoraInicio() != null ? e.getHoraInicio().toString() : null);
        dto.setHoraFin(e.getHoraFin() != null ? e.getHoraFin().toString() : null);
        dto.setActivo(e.getActivo());
        dto.setTipoBloque(e.getTipoBloque() != null ? e.getTipoBloque().name() : null);
        return dto;
    }

    @Override
    public void guardarHorario(Long idPracticante, List<BloqueHorarioRequest> horarioRequests) {
        log.info("Guardando horario para practicante ID: {}", idPracticante);

        // 1. Eliminar horario existente
        bloqueHorarioRepository.deleteByPracticanteIdPracticante(idPracticante);
        log.info("Horario anterior eliminado para practicante ID: {}", idPracticante);

        // 2. Obtener el practicante
        Practicante practicante = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + idPracticante));

        // 3. Guardar nuevo horario
        if (horarioRequests != null && !horarioRequests.isEmpty()) {
            List<BloqueHorario> bloques = new ArrayList<>();

            for (BloqueHorarioRequest req : horarioRequests) {
                // Solo guardar si está activo (trabaja ese día)
                if (req.getActivo() != null && req.getActivo()) {
                    try {
                        BloqueHorario bloque = new BloqueHorario();
                        bloque.setPracticante(practicante);
                        // CONVERTIR String → Enum
                        bloque.setDiaSemana(DiaSemana.valueOf(req.getDiaSemana()));
                        bloque.setHoraInicio(LocalTime.parse(req.getHoraInicio()));
                        bloque.setHoraFin(LocalTime.parse(req.getHoraFin()));
                        bloque.setTipoBloque(TipoBloque.TRABAJO);
                        bloque.setActivo(true);
                        bloque.setFechaInicio(practicante.getFechaInicioPracticas());
                        bloque.setFechaFin(practicante.getFechaFinPracticas());

                        bloques.add(bloque);
                    } catch (IllegalArgumentException e) {
                        log.warn("Día de semana inválido '{}' para practicante ID {}: {}",
                                req.getDiaSemana(), idPracticante, e.getMessage());
                    } catch (Exception e) {
                        log.warn("Error al procesar bloque horario para día {}: {}", req.getDiaSemana(), e.getMessage());
                    }
                }
            }

            if (!bloques.isEmpty()) {
                bloqueHorarioRepository.saveAll(bloques);
                log.info("Guardados {} bloques horarios para practicante ID: {}", bloques.size(), idPracticante);
            }
        }
    }

    @Override
    public void eliminarHorario(Long idPracticante) {
        log.info("Eliminando horario del practicante ID: {}", idPracticante);
        bloqueHorarioRepository.deleteByPracticanteIdPracticante(idPracticante);
    }

    @Override
    public boolean esDiaLaborable(Long idPracticante, LocalDate fecha) {
        DiaSemana dia = mapToDiaSemana(fecha);
        if (dia == null) return false;
        List<BloqueHorario> bloques = bloqueHorarioRepository
                .findByPracticanteIdPracticanteAndDiaSemanaAndActivoTrue(idPracticante, dia);
        // Si no hay bloque TRABAJO activo ese día, es descanso
        return bloques.stream().anyMatch(b -> b.getTipoBloque() == TipoBloque.TRABAJO);
    }

    @Override
    public boolean debeEstarEnEmpresa(Long idPracticante, LocalDate fecha, String hora) {
        try {
            LocalTime horaActual = LocalTime.parse(hora);
            DiaSemana dia = mapToDiaSemana(fecha);
            if (dia == null) return true;
            List<BloqueHorario> bloques = bloqueHorarioRepository
                    .findByPracticanteIdPracticanteAndDiaSemanaAndActivoTrue(idPracticante, dia);
            return bloques.stream()
                    .filter(b -> b.getTipoBloque() == TipoBloque.TRABAJO)
                    .anyMatch(b -> !horaActual.isBefore(b.getHoraInicio()) && !horaActual.isAfter(b.getHoraFin()));
        } catch (Exception e) {
            log.warn("Error al validar horario para practicante {}: {}", idPracticante, e.getMessage());
            return true; // Si no se puede parsear hora, permitir marcación
        }
    }

    private DiaSemana mapToDiaSemana(LocalDate fecha) {
        return switch (fecha.getDayOfWeek()) {
            case MONDAY -> DiaSemana.LUNES;
            case TUESDAY -> DiaSemana.MARTES;
            case WEDNESDAY -> DiaSemana.MIERCOLES;
            case THURSDAY -> DiaSemana.JUEVES;
            case FRIDAY -> DiaSemana.VIERNES;
            case SATURDAY -> DiaSemana.SABADO;
            case SUNDAY -> DiaSemana.DOMINGO;
        };
    }
}