package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.entity.AsistenciaDiaria;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.enums.EstadoDia;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.model.enums.TipoMarcacion;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * NORMAL y CORRIDO mantienen las mismas reglas de estado (PRESENTE/TARDANZA/AUSENTE)
 * pero producen horas distintas (8.50 vs 9.50 para 07:30-17:00).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AsistenciaJornadaTest {

    @Mock private MarcacionRepository marcacionRepository;
    @Mock private AsistenciaDiariaRepository asistenciaDiariaRepository;
    @Mock private PracticanteRepository practicanteRepository;
    @Mock private VigilanteRepository vigilanteRepository;
    @Mock private HorarioService horarioService;
    @Mock private JustificacionRepository justificacionRepository;
    @Mock private AsistenciaSituacionRepository asistenciaSituacionRepository;

    private AsistenciaServiceImpl service;
    private final LocalDate fecha = LocalDate.of(2026, 9, 28);

    @BeforeEach
    public void setup() {
        service = new AsistenciaServiceImpl(marcacionRepository, asistenciaDiariaRepository,
                practicanteRepository, vigilanteRepository, horarioService,
                justificacionRepository, new CalculadoraEstadoAsistencia(),
                asistenciaSituacionRepository);
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(new Practicante()));
        when(justificacionRepository.findJustificacionesEnRango(any(), any(), any()))
                .thenReturn(List.of());
        when(asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFecha(any(), any()))
                .thenReturn(Optional.empty());
        when(asistenciaDiariaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    private void mockBloque(Boolean descuenta) {
        BloqueHorario b = new BloqueHorario();
        b.setHoraInicio(LocalTime.of(7, 30));
        b.setHoraFin(LocalTime.of(17, 0));
        b.setTipoBloque(TipoBloque.TRABAJO);
        b.setDescuentaAlmuerzo(descuenta);
        when(horarioService.obtenerBloqueDelDia(7L, fecha)).thenReturn(Optional.of(b));
    }

    private void mockMarcaciones(String entrada, String salida) {
        Marcacion e = new Marcacion();
        e.setTipoMarcacion(TipoMarcacion.ENTRADA);
        e.setHoraMarcacion(LocalTime.parse(entrada));
        Marcacion s = new Marcacion();
        s.setTipoMarcacion(TipoMarcacion.SALIDA);
        s.setHoraMarcacion(LocalTime.parse(salida));
        when(marcacionRepository.findByPracticante_IdPracticanteAndFecha(7L, fecha))
                .thenReturn(List.of(e, s));
    }

    private AsistenciaDiaria procesada() {
        ArgumentCaptor<AsistenciaDiaria> cap = ArgumentCaptor.forClass(AsistenciaDiaria.class);
        verify(asistenciaDiariaRepository).save(cap.capture());
        return cap.getValue();
    }

    @Test
    public void normal_presente_850() {
        mockBloque(true);
        mockMarcaciones("07:30", "17:00");
        service.procesarAsistenciaDiaria(7L, fecha);
        AsistenciaDiaria ad = procesada();
        assertEquals(EstadoDia.PRESENTE, ad.getEstadoDia());
        assertEquals(new BigDecimal("8.50"), ad.getHorasTrabajadas());
    }

    @Test
    public void corrido_presente_950() {
        mockBloque(false);
        mockMarcaciones("07:30", "17:00");
        service.procesarAsistenciaDiaria(7L, fecha);
        AsistenciaDiaria ad = procesada();
        assertEquals(EstadoDia.PRESENTE, ad.getEstadoDia());
        assertEquals(new BigDecimal("9.50"), ad.getHorasTrabajadas());
    }

    @Test
    public void tardanza_mismoEstado_distintasHoras() {
        mockBloque(true);
        mockMarcaciones("07:45", "17:00");
        service.procesarAsistenciaDiaria(7L, fecha);
        AsistenciaDiaria normal = procesada();
        assertEquals(EstadoDia.TARDANZA, normal.getEstadoDia());
        assertEquals(new BigDecimal("8.25"), normal.getHorasTrabajadas());
        assertEquals(15, normal.getMinutosTardanza());
    }

    @Test
    public void tardanza_corrido_mismoEstado_masHoras() {
        mockBloque(false);
        mockMarcaciones("07:45", "17:00");
        service.procesarAsistenciaDiaria(7L, fecha);
        AsistenciaDiaria ad = procesada();
        assertEquals(EstadoDia.TARDANZA, ad.getEstadoDia());
        assertEquals(new BigDecimal("9.25"), ad.getHorasTrabajadas());
    }
}
