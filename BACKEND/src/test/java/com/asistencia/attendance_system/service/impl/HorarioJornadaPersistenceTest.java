package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.BloqueHorarioResponseDTO;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.enums.DiaSemana;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.repository.BloqueHorarioRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * La modalidad NORMAL/CORRIDO se persiste por bloque y sobrevive al GET.
 */
@ExtendWith(MockitoExtension.class)
public class HorarioJornadaPersistenceTest {

    @Mock private BloqueHorarioRepository bloqueHorarioRepository;
    @Mock private PracticanteRepository practicanteRepository;

    private HorarioServiceImpl service;

    @BeforeEach
    public void setup() {
        service = new HorarioServiceImpl(bloqueHorarioRepository, practicanteRepository);
    }

    private BloqueHorarioRequest req(String dia, Boolean descuenta) {
        BloqueHorarioRequest r = new BloqueHorarioRequest();
        r.setDiaSemana(dia);
        r.setHoraInicio("07:30");
        r.setHoraFin("17:00");
        r.setActivo(true);
        r.setDescuentaAlmuerzo(descuenta);
        return r;
    }

    private void mockPracticante() {
        Practicante p = new Practicante();
        p.setFechaInicioPracticas(LocalDate.of(2026, 10, 1));
        p.setFechaFinPracticas(LocalDate.of(2026, 12, 31));
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(p));
    }

    @SuppressWarnings("unchecked")
    private List<BloqueHorario> saved() {
        ArgumentCaptor<List<BloqueHorario>> cap = ArgumentCaptor.forClass(List.class);
        verify(bloqueHorarioRepository).saveAll(cap.capture());
        return cap.getValue();
    }

    @Test
    public void guardarHorario_corrido_persisteFalse() {
        mockPracticante();
        service.guardarHorario(7L, List.of(req("LUNES", false)));
        List<BloqueHorario> bloques = saved();
        assertEquals(1, bloques.size());
        assertEquals(Boolean.FALSE, bloques.get(0).getDescuentaAlmuerzo());
        assertEquals(TipoBloque.TRABAJO, bloques.get(0).getTipoBloque());
    }

    @Test
    public void guardarHorario_normal_persisteTrue() {
        mockPracticante();
        service.guardarHorario(7L, List.of(req("LUNES", true)));
        assertEquals(Boolean.TRUE, saved().get(0).getDescuentaAlmuerzo());
    }

    @Test
    public void guardarHorario_sinModalidad_defectoNormal() {
        mockPracticante();
        service.guardarHorario(7L, List.of(req("LUNES", null)));
        assertEquals(Boolean.TRUE, saved().get(0).getDescuentaAlmuerzo());
    }

    @Test
    public void getHorario_devuelveModalidad() {
        BloqueHorario b = new BloqueHorario();
        b.setIdBloque(1L);
        b.setDiaSemana(DiaSemana.LUNES);
        b.setHoraInicio(LocalTime.of(7, 30));
        b.setHoraFin(LocalTime.of(17, 0));
        b.setTipoBloque(TipoBloque.TRABAJO);
        b.setActivo(true);
        b.setDescuentaAlmuerzo(false);
        when(bloqueHorarioRepository.findByPracticante_IdPracticanteAndActivoTrue(7L))
                .thenReturn(List.of(b));
        List<BloqueHorarioResponseDTO> dtos = service.obtenerHorarioActivoPorPracticante(7L);
        assertEquals(1, dtos.size());
        assertEquals(Boolean.FALSE, dtos.get(0).getDescuentaAlmuerzo());
        assertEquals("LUNES", dtos.get(0).getDiaSemana());
    }
}
