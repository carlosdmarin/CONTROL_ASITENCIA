package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.MarcacionRequest;
import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Oficina;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.repository.AsistenciaDiariaRepository;
import com.asistencia.attendance_system.repository.AsistenciaSituacionRepository;
import com.asistencia.attendance_system.repository.JustificacionRepository;
import com.asistencia.attendance_system.repository.MarcacionRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.service.CalculadoraEstadoAsistencia;
import com.asistencia.attendance_system.service.HorarioService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * C-01: la sede del evento se registra desde el vigilante autenticado;
 * la sede asignada del practicante no se modifica (multi-sede permitido).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class MarcacionSedeEventoTest {

    @Mock private MarcacionRepository marcacionRepository;
    @Mock private AsistenciaDiariaRepository asistenciaDiariaRepository;
    @Mock private PracticanteRepository practicanteRepository;
    @Mock private VigilanteRepository vigilanteRepository;
    @Mock private HorarioService horarioService;
    @Mock private JustificacionRepository justificacionRepository;
    @Mock private AsistenciaSituacionRepository asistenciaSituacionRepository;

    private AsistenciaServiceImpl service;
    private Practicante practicante;

    private Sede sede(Integer id) {
        Sede s = new Sede();
        s.setIdSede(id);
        s.setNombre("SEDE " + id);
        return s;
    }

    @BeforeEach
    public void setup() {
        SecurityContextHolder.clearContext();
        service = new AsistenciaServiceImpl(marcacionRepository, asistenciaDiariaRepository,
                practicanteRepository, vigilanteRepository, horarioService,
                justificacionRepository, new CalculadoraEstadoAsistencia(),
                asistenciaSituacionRepository);

        practicante = new Practicante();
        practicante.setIdPracticante(7L);
        practicante.setNombre("T");
        practicante.setApellido("C");
        practicante.setDocumento("60563764");
        practicante.setSede(sede(3));
        Oficina ofi = new Oficina();
        ofi.setEstado(1);
        practicante.setOficina(ofi);
        when(practicanteRepository.findByDocumento("60563764"))
                .thenReturn(Optional.of(practicante));
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(practicante));

        Vigilante v = new Vigilante();
        v.setIdVigilante(244);
        v.setSede(sede(1));
        when(vigilanteRepository.findById(244)).thenReturn(Optional.of(v));

        BloqueHorario b = new BloqueHorario();
        b.setHoraInicio(LocalTime.of(0, 0));
        b.setHoraFin(LocalTime.of(23, 59));
        b.setTipoBloque(TipoBloque.TRABAJO);
        b.setDescuentaAlmuerzo(true);
        when(horarioService.obtenerBloqueDelDia(any(), any())).thenReturn(Optional.of(b));

        when(marcacionRepository.yaMarcoEntradaHoy(any(), any())).thenReturn(false);
        when(marcacionRepository.yaMarcoSalidaHoy(any(), any())).thenReturn(false);
        when(justificacionRepository.findJustificacionesEnRango(any(), any(), any()))
                .thenReturn(List.of());
        when(asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFecha(any(), any()))
                .thenReturn(Optional.empty());
        when(marcacionRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        when(asistenciaDiariaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("244", "vigilante:244",
                        List.of(new SimpleGrantedAuthority("ROLE_VIGILANTE"))));
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private MarcacionRequest entrada() {
        MarcacionRequest r = new MarcacionRequest();
        r.setDocumento("60563764");
        r.setTipoMarcacion("ENTRADA");
        r.setMetodoRegistro("QR");
        return r;
    }

    private Marcacion guardada() {
        ArgumentCaptor<Marcacion> cap = ArgumentCaptor.forClass(Marcacion.class);
        org.mockito.Mockito.verify(marcacionRepository).saveAndFlush(cap.capture());
        return cap.getValue();
    }

    @Test
    public void entrada_sedeVigilante_quedaComoSedeEvento() {
        MarcacionResponse res = service.registrarMarcacion(entrada());
        assertEquals(Integer.valueOf(1), res.getSedeId());
        assertEquals("SEDE 1", res.getSedeNombre());
        assertEquals(Integer.valueOf(1), guardada().getSede().getIdSede());
    }

    @Test
    public void multiseda_noModificaSedeAsignada() {
        service.registrarMarcacion(entrada());
        assertEquals(Integer.valueOf(3), practicante.getSede().getIdSede());
    }

    @Test
    public void sinContextoVigilante_sedeNullPeroRegistra() {
        SecurityContextHolder.clearContext();
        MarcacionResponse res = service.registrarMarcacion(entrada());
        assertNull(res.getSedeId());
        assertNull(guardada().getSede());
    }
}
