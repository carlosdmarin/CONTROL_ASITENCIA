package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponse;
import com.asistencia.attendance_system.model.dto.HorarioSemanalDTO;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Practicante;
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
    public BloqueHorarioResponse crearBloque(BloqueHorarioRequest request) {
        log.info("Creando bloque horario para practicante ID: {}", request.getIdPracticante());

        Practicante practicante = practicanteRepository.findById(request.getIdPracticante())
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + request.getIdPracticante()));

        BloqueHorario bloque = new BloqueHorario();
        bloque.setPracticante(practicante);
        bloque.setDiaSemana(request.getDiaSemana());
        bloque.setHoraInicio(request.getHoraInicio());
        bloque.setHoraFin(request.getHoraFin());
        bloque.setTipoBloque(TipoBloque.valueOf(request.getTipoBloque()));
        bloque.setDescripcion(request.getDescripcion());
        bloque.setFechaInicio(request.getFechaInicio());
        bloque.setFechaFin(request.getFechaFin());
        bloque.setActivo(true);

        BloqueHorario saved = bloqueHorarioRepository.save(bloque);
        log.info("Bloque horario creado con ID: {}", saved.getIdBloque());

        return convertToResponse(saved);
    }

    @Override
    public BloqueHorarioResponse actualizarBloque(Long id, BloqueHorarioRequest request) {
        log.info("Actualizando bloque horario ID: {}", id);

        BloqueHorario bloque = bloqueHorarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bloque horario no encontrado con ID: " + id));

        bloque.setDiaSemana(request.getDiaSemana());
        bloque.setHoraInicio(request.getHoraInicio());
        bloque.setHoraFin(request.getHoraFin());
        bloque.setTipoBloque(TipoBloque.valueOf(request.getTipoBloque()));
        bloque.setDescripcion(request.getDescripcion());
        bloque.setFechaInicio(request.getFechaInicio());
        bloque.setFechaFin(request.getFechaFin());

        BloqueHorario updated = bloqueHorarioRepository.save(bloque);
        return convertToResponse(updated);
    }

    @Override
    public void eliminarBloque(Long id) {
        log.info("Eliminando bloque horario ID: {}", id);
        bloqueHorarioRepository.deleteById(id);
    }

    @Override
    public BloqueHorarioResponse obtenerBloquePorId(Long id) {
        BloqueHorario bloque = bloqueHorarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bloque horario no encontrado con ID: " + id));
        return convertToResponse(bloque);
    }

    @Override
    public List<BloqueHorarioResponse> obtenerBloquesPorPracticante(Long idPracticante) {
        return bloqueHorarioRepository.findByPracticante_IdPracticante(idPracticante).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BloqueHorarioResponse> obtenerBloquesActivosPorPracticante(Long idPracticante) {
        return bloqueHorarioRepository.findByPracticante_IdPracticanteAndActivoTrue(idPracticante).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HorarioSemanalDTO obtenerHorarioSemanal(Long idPracticante) {
        log.info("Obteniendo horario semanal para practicante ID: {}", idPracticante);

        Practicante practicante = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con ID: " + idPracticante));

        List<BloqueHorario> bloques = bloqueHorarioRepository.findHorarioSemanalCompleto(idPracticante);

        HorarioSemanalDTO horario = new HorarioSemanalDTO();
        horario.setIdPracticante(idPracticante);
        horario.setNombreCompleto(practicante.getNombre() + " " + practicante.getApellido());
        horario.setDocumento(practicante.getDocumento());

        horario.setLunes(new ArrayList<>());
        horario.setMartes(new ArrayList<>());
        horario.setMiercoles(new ArrayList<>());
        horario.setJueves(new ArrayList<>());
        horario.setViernes(new ArrayList<>());
        horario.setSabado(new ArrayList<>());
        horario.setDomingo(new ArrayList<>());

        for (BloqueHorario bloque : bloques) {
            BloqueHorarioResponse response = convertToResponse(bloque);
            switch (bloque.getDiaSemana().toUpperCase()) {
                case "LUNES":
                    horario.getLunes().add(response);
                    break;
                case "MARTES":
                    horario.getMartes().add(response);
                    break;
                case "MIERCOLES":
                    horario.getMiercoles().add(response);
                    break;
                case "JUEVES":
                    horario.getJueves().add(response);
                    break;
                case "VIERNES":
                    horario.getViernes().add(response);
                    break;
                case "SABADO":
                    horario.getSabado().add(response);
                    break;
                case "DOMINGO":
                    horario.getDomingo().add(response);
                    break;
            }
        }

        return horario;
    }

    @Override
    public List<BloqueHorarioResponse> obtenerBloquesPorDia(Long idPracticante, String diaSemana) {
        return bloqueHorarioRepository.findByIdPracticanteAndDiaSemana(idPracticante, diaSemana).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean esDiaLaborable(Long idPracticante, LocalDate fecha) {
        String diaSemana = getDiaSemana(fecha);
        return bloqueHorarioRepository.existeBloqueEnFecha(idPracticante, diaSemana, fecha);
    }

    @Override
    public boolean debeEstarEnEmpresa(Long idPracticante, LocalDate fecha, String hora) {
        String diaSemana = getDiaSemana(fecha);
        LocalTime horaActual = LocalTime.parse(hora);

        List<BloqueHorario> bloques = bloqueHorarioRepository.findByIdPracticanteAndDiaSemana(idPracticante, diaSemana);

        for (BloqueHorario bloque : bloques) {
            if (bloque.getTipoBloque() == TipoBloque.TRABAJO &&
                    !horaActual.isBefore(bloque.getHoraInicio()) &&
                    !horaActual.isAfter(bloque.getHoraFin())) {
                return true;
            }
        }
        return false;
    }

    @Override
    public String obtenerEstadoDia(Long idPracticante, LocalDate fecha) {
        String diaSemana = getDiaSemana(fecha);
        List<BloqueHorario> bloques = bloqueHorarioRepository.findByIdPracticanteAndDiaSemana(idPracticante, diaSemana);

        if (bloques.isEmpty()) {
            return "DIA_LIBRE";
        }

        boolean tieneTrabajo = bloques.stream().anyMatch(b -> b.getTipoBloque() == TipoBloque.TRABAJO);
        boolean tieneClases = bloques.stream().anyMatch(b -> b.getTipoBloque() == TipoBloque.CLASES);

        if (tieneTrabajo && tieneClases) {
            return "DIA_MIXTO";
        } else if (tieneTrabajo) {
            return "DIA_TRABAJO";
        } else if (tieneClases) {
            return "DIA_CLASES";
        } else {
            return "DIA_DESCANSO";
        }
    }

    @Override
    public void copiarHorarioSemana(Long idPracticante, LocalDate fechaInicio, LocalDate fechaFin) {
        log.info("Copiando horario semanal para practicante ID: {}", idPracticante);

        List<BloqueHorario> bloques = bloqueHorarioRepository.findByPracticante_IdPracticanteAndActivoTrue(idPracticante);

        for (BloqueHorario bloque : bloques) {
            BloqueHorario nuevaCopia = new BloqueHorario();
            nuevaCopia.setPracticante(bloque.getPracticante());
            nuevaCopia.setDiaSemana(bloque.getDiaSemana());
            nuevaCopia.setHoraInicio(bloque.getHoraInicio());
            nuevaCopia.setHoraFin(bloque.getHoraFin());
            nuevaCopia.setTipoBloque(bloque.getTipoBloque());
            nuevaCopia.setDescripcion(bloque.getDescripcion());
            nuevaCopia.setFechaInicio(fechaInicio);
            nuevaCopia.setFechaFin(fechaFin);
            nuevaCopia.setActivo(true);

            bloqueHorarioRepository.save(nuevaCopia);
        }

        log.info("Horario copiado exitosamente para el rango: {} - {}", fechaInicio, fechaFin);
    }

    // ========== MÉTODOS PRIVADOS ==========

    private String getDiaSemana(LocalDate fecha) {
        return fecha.getDayOfWeek().toString();
    }

    private BloqueHorarioResponse convertToResponse(BloqueHorario bloque) {
        BloqueHorarioResponse response = new BloqueHorarioResponse();
        response.setIdBloque(bloque.getIdBloque());
        response.setIdPracticante(bloque.getPracticante().getIdPracticante());
        response.setPracticanteNombre(bloque.getPracticante().getNombre() + " " + bloque.getPracticante().getApellido());
        response.setDiaSemana(bloque.getDiaSemana());
        response.setHoraInicio(bloque.getHoraInicio());
        response.setHoraFin(bloque.getHoraFin());
        response.setTipoBloque(bloque.getTipoBloque().toString());
        response.setDescripcion(bloque.getDescripcion());
        response.setActivo(bloque.getActivo());
        response.setFechaInicio(bloque.getFechaInicio());
        response.setFechaFin(bloque.getFechaFin());
        return response;
    }
}