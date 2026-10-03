package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.dto.ReporteMensualResponse;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.enums.DiaSemana;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.service.AsistenciaService;
import com.asistencia.attendance_system.service.CalculadoraEstadoAsistencia;
import com.asistencia.attendance_system.service.HorarioService;
import com.asistencia.attendance_system.service.PracticanteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Semana mixta en septiembre 2026 (mes pasado, todo evaluable):
 * LUN NORMAL 07:30-17:00 (8.50), MIE CORRIDO 07:30-17:00 (9.50),
 * JUE NORMAL, VIE CORRIDO, MAR/SAB/DOM descanso.
 * Programadas = 4*8.50 + 5*9.50 + 4*8.50 + 4*9.50 = 153.50
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ReporteMensualJornadaTest {

    @Mock private PracticanteRepository practicanteRepository;
    @Mock private PracticanteService practicanteService;
    @Mock private AsistenciaService asistenciaService;
    @Mock private HorarioService horarioService;

    private ReportesServiceImpl service;

    @BeforeEach
    public void setup() {
        service = new ReportesServiceImpl(practicanteRepository, practicanteService,
                asistenciaService, horarioService, new CalculadoraEstadoAsistencia());
        Practicante p = new Practicante();
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(p));
        PracticanteResponse pr = new PracticanteResponse();
        pr.setNombreCompleto("T C");
        when(practicanteService.obtenerPorId(7L)).thenReturn(pr);
    }

    private boolean esCorrido(LocalDate fecha) {
        DayOfWeek dow = fecha.getDayOfWeek();
        return dow == DayOfWeek.WEDNESDAY || dow == DayOfWeek.FRIDAY;
    }

    private boolean esDescanso(LocalDate fecha) {
        DayOfWeek dow = fecha.getDayOfWeek();
        return dow == DayOfWeek.TUESDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
    }

    private void mockDia(LocalDate fecha) {
        // Los bloques se resuelven con el stub genérico de thenAnswer (misma regla).
        if (esDescanso(fecha)) {
            return;
        }
        // Todo PRESENTE con sus horas salvo el jueves 3 (AUSENTE sin horas)
        AsistenciaDiariaResponse a = new AsistenciaDiariaResponse();
        boolean ausente = fecha.equals(LocalDate.of(2026, 9, 3));
        a.setEstadoDia(ausente ? "AUSENTE" : "PRESENTE");
        BigDecimal esperadas = esCorrido(fecha) ? new BigDecimal("9.50") : new BigDecimal("8.50");
        a.setHorasTrabajadas(ausente ? BigDecimal.ZERO : esperadas);
        a.setJustificado(false);
        a.setSituacion("NINGUNA");
        a.setEntradaReal(ausente ? null : LocalTime.of(7, 30));
        a.setSalidaReal(ausente ? null : LocalTime.of(17, 0));
        a.setMinutosTardanza(0);
        when(asistenciaService.obtenerAsistenciaDiaria(eq(7L), eq(fecha))).thenReturn(a);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void mensual_mixto_sumaPorModalidad() throws Exception {
        LocalDate inicio = LocalDate.of(2026, 9, 1);
        LocalDate fin = LocalDate.of(2026, 9, 30);
        for (LocalDate f = inicio; !f.isAfter(fin); f = f.plusDays(1)) {
            mockDia(f);
        }
        // stub genérico por si el servicio consulta otras fechas del mes (no debería)
        when(horarioService.obtenerBloqueDelDia(eq(7L), any(LocalDate.class)))
                .thenAnswer(i -> {
                    LocalDate f = i.getArgument(1);
                    if (esDescanso(f)) return Optional.empty();
                    BloqueHorario b = new BloqueHorario();
                    b.setHoraInicio(LocalTime.of(7, 30));
                    b.setHoraFin(LocalTime.of(17, 0));
                    b.setTipoBloque(TipoBloque.TRABAJO);
                    b.setDescuentaAlmuerzo(!esCorrido(f));
                    return Optional.of(b);
                });

        ReporteMensualResponse rep = service.generarMensual(7L, LocalDate.of(2026, 9, 15));
        assertEquals(17, rep.getResumen().getDiasProgramados());
        assertEquals(new BigDecimal("153.50"), rep.getResumen().getHorasProgramadas());
        // Trabajadas: todo menos el jueves 3 AUSENTE (8.50) = 145.00
        assertEquals(new BigDecimal("145.00"), rep.getResumen().getHorasTrabajadas());
        assertEquals(new BigDecimal("8.50"), rep.getResumen().getHorasFaltantes());
        assertEquals(new BigDecimal("94.46"), rep.getResumen().getPorcentajeCumplimiento());
        assertEquals(1, rep.getResumen().getAusencias());
    }

    @Test
    public void diaSemana_mapeoSeptiembre2026() {
        // Sanity del calendario usado: 2026-09-07 es lunes, 2026-09-02 miércoles
        assertEquals(DayOfWeek.MONDAY, LocalDate.of(2026, 9, 7).getDayOfWeek());
        assertEquals(DayOfWeek.WEDNESDAY, LocalDate.of(2026, 9, 2).getDayOfWeek());
        assertEquals(DiaSemana.LUNES.name(), "LUNES");
    }
}
