package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.MarcacionRequest;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Oficina;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.repository.AsistenciaDiariaRepository;
import com.asistencia.attendance_system.repository.AsistenciaSituacionRepository;
import com.asistencia.attendance_system.repository.JustificacionRepository;
import com.asistencia.attendance_system.repository.MarcacionRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.service.CalculadoraEstadoAsistencia;
import com.asistencia.attendance_system.service.HorarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * C-05: una violación de unicidad concurrente se rechaza de forma controlada
 * (mensaje YA_REGISTRADO) en lugar de error técnico.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class MarcacionDuplicadaTest {

    @Mock private MarcacionRepository marcacionRepository;
    @Mock private AsistenciaDiariaRepository asistenciaDiariaRepository;
    @Mock private PracticanteRepository practicanteRepository;
    @Mock private VigilanteRepository vigilanteRepository;
    @Mock private HorarioService horarioService;
    @Mock private JustificacionRepository justificacionRepository;
    @Mock private AsistenciaSituacionRepository asistenciaSituacionRepository;

    private AsistenciaServiceImpl service;

    @BeforeEach
    public void setup() {
        service = new AsistenciaServiceImpl(marcacionRepository, asistenciaDiariaRepository,
                practicanteRepository, vigilanteRepository, horarioService,
                justificacionRepository, new CalculadoraEstadoAsistencia(),
                asistenciaSituacionRepository);

        Practicante p = new Practicante();
        p.setIdPracticante(7L);
        p.setDocumento("60563764");
        p.setNombre("T");
        p.setApellido("C");
        Sede s = new Sede();
        s.setIdSede(3);
        p.setSede(s);
        Oficina ofi = new Oficina();
        ofi.setEstado(1);
        p.setOficina(ofi);
        when(practicanteRepository.findByDocumento("60563764")).thenReturn(Optional.of(p));

        BloqueHorario b = new BloqueHorario();
        b.setHoraInicio(LocalTime.of(0, 0));
        b.setHoraFin(LocalTime.of(23, 59));
        b.setTipoBloque(TipoBloque.TRABAJO);
        when(horarioService.obtenerBloqueDelDia(any(), any())).thenReturn(Optional.of(b));

        when(marcacionRepository.yaMarcoEntradaHoy(any(), any())).thenReturn(false);
        when(marcacionRepository.yaMarcoSalidaHoy(any(), any())).thenReturn(false);
    }

    @Test
    public void duplicadoConcurrente_rechazoControlado() {
        when(marcacionRepository.saveAndFlush(any()))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry"));
        MarcacionRequest r = new MarcacionRequest();
        r.setDocumento("60563764");
        r.setTipoMarcacion("ENTRADA");
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.registrarMarcacion(r));
        String msg = ex.getMessage().toLowerCase();
        assertTrue(msg.contains("ya registraste") || msg.contains("jornada de hoy ya está registrada"),
                "Mensaje fue: " + ex.getMessage());
    }
}
