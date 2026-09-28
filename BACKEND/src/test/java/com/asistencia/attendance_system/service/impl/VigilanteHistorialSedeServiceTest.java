package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.model.enums.MetodoRegistro;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

/**
 * FASE 2 — Aislamiento por sede del VIGILANTE (capa de servicio).
 *
 * Prueba el punto crítico de seguridad: la sede consultada sale de la entidad Vigilante
 * en base de datos, nunca de un parámetro del cliente, y el servicio no expone ninguna
 * sede como entrada.
 */
@ExtendWith(MockitoExtension.class)
class VigilanteHistorialSedeServiceTest {

    private static final Integer SEDE_A = 1; // NESHUYA
    private static final Integer SEDE_B = 2; // CAMPO VERDE
    private static final LocalDate FECHA = LocalDate.of(2026, 9, 4);

    @Mock private MarcacionRepository marcacionRepository;
    @Mock private VigilanteRepository vigilanteRepository;
    @Mock private AsistenciaDiariaRepository asistenciaDiariaRepository;
    @Mock private PracticanteRepository practicanteRepository;
    @Mock private HorarioService horarioService;
    @Mock private JustificacionRepository justificacionRepository;
    @Mock private CalculadoraEstadoAsistencia calculadoraEstado;
    @Mock private AsistenciaSituacionRepository asistenciaSituacionRepository;

    @InjectMocks private AsistenciaServiceImpl asistenciaService;

    private Vigilante vigilante;
    private Sede sedeA;
    private Sede sedeB;

    @BeforeEach
    void setUp() {
        sedeA = new Sede();
        sedeA.setIdSede(SEDE_A);
        sedeA.setNombre("PLANTA NESHUYA");

        sedeB = new Sede();
        sedeB.setIdSede(SEDE_B);
        sedeB.setNombre("PLANTA CAMPO VERDE");

        // Vigilante autenticado con sede A asignada
        vigilante = new Vigilante();
        vigilante.setIdVigilante(10);
        vigilante.setNombre("Juan");
        vigilante.setApellido("Perez");
        vigilante.setUsuario("vig1");
        vigilante.setEstado(true);
        vigilante.setSede(sedeA);
    }

    private Marcacion marcacionDeSede(Sede sede, long id, String nombre, LocalTime hora) {
        Practicante p = new Practicante();
        p.setIdPracticante((long) id);
        p.setNombre(nombre);
        p.setApellido("Apellido");
        p.setDocumento("700000" + id);
        p.setSede(sede);

        Marcacion m = new Marcacion();
        m.setIdMarcacion(id);
        m.setPracticante(p);
        m.setFecha(FECHA);
        m.setHoraMarcacion(hora);
        m.setTipoMarcacion(TipoMarcacion.ENTRADA);
        m.setMetodoRegistro(MetodoRegistro.QR);
        return m;
    }

    @Test
    @DisplayName("Devuelve únicamente marcaciones de la sede asignada al vigilante")
    void devuelveSoloMarcacionesDeLaSedeDelVigilante() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_A, FECHA))
                .thenReturn(List.of(
                        marcacionDeSede(sedeA, 1L, "Ana", LocalTime.of(7, 30)),
                        marcacionDeSede(sedeA, 2L, "Luis", LocalTime.of(7, 45))
                ));

        List<MarcacionResponse> r = asistenciaService
                .obtenerHistorialMarcacionesDeSedeDelVigilante(10, FECHA);

        assertEquals(2, r.size());
        assertEquals("Ana Apellido", r.get(0).getNombreCompleto());
        assertEquals("Luis Apellido", r.get(1).getNombreCompleto());

        // La sede consultada es la del vigilante
        verify(marcacionRepository, times(1)).findHistorialBySedeIdAndFecha(SEDE_A, FECHA);
        // Y NUNCA la de otra sede, en ninguna fecha
        verify(marcacionRepository, never()).findHistorialBySedeIdAndFecha(eq(SEDE_B), any(LocalDate.class));
        // Una sola consulta en total: no hay ruta global sin filtro de sede
        verifyNoMoreInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("Aislamiento: vigilante de sede A no obtiene marcaciones de sede B")
    void vigilanteSedeA_noObtieneMarcacionesDeSedeB() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_A, FECHA))
                .thenReturn(List.of(marcacionDeSede(sedeA, 1L, "Ana", LocalTime.of(7, 30))));
        // Control: si el servicio consultara la sede B obtendría estas marcaciones.
        // Se declara lenient porque la prueba demuestra que NUNCA se ejecuta.
        lenient().when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_B, FECHA))
                .thenReturn(List.of(marcacionDeSede(sedeB, 9L, "Intruso", LocalTime.of(8, 0))));

        List<MarcacionResponse> r = asistenciaService
                .obtenerHistorialMarcacionesDeSedeDelVigilante(10, FECHA);

        assertEquals(1, r.size(), "solo debe devolver registros de su propia sede");
        assertTrue(r.stream().noneMatch(x -> "Intruso".equals(x.getNombreCompleto())),
                "no debe filtrar marcaciones de otra sede");
        assertTrue(r.stream().noneMatch(x -> "7000009".equals(x.getDocumento())),
                "no debe exponer documentos de otra sede");
        verify(marcacionRepository, never()).findHistorialBySedeIdAndFecha(eq(SEDE_B), any(LocalDate.class));
        verifyNoMoreInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("Dos vigilantes de sedes distintas obtienen historiales distintos")
    void dosVigilantesDeSedesDistintasObtienenHistorialesDistintos() {
        Vigilante vigilanteB = new Vigilante();
        vigilanteB.setIdVigilante(11);
        vigilanteB.setUsuario("vig2");
        vigilanteB.setEstado(true);
        vigilanteB.setSede(sedeB);

        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(vigilanteRepository.findById(11)).thenReturn(Optional.of(vigilanteB));
        when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_A, FECHA))
                .thenReturn(List.of(marcacionDeSede(sedeA, 1L, "Ana", LocalTime.of(7, 30))));
        when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_B, FECHA))
                .thenReturn(List.of(marcacionDeSede(sedeB, 9L, "Intruso", LocalTime.of(8, 0))));

        List<MarcacionResponse> rA = asistenciaService
                .obtenerHistorialMarcacionesDeSedeDelVigilante(10, FECHA);
        List<MarcacionResponse> rB = asistenciaService
                .obtenerHistorialMarcacionesDeSedeDelVigilante(11, FECHA);

        assertEquals(1, rA.size());
        assertEquals(1, rB.size());
        assertEquals("Ana Apellido", rA.get(0).getNombreCompleto());
        assertEquals("Intruso Apellido", rB.get(0).getNombreCompleto());
    }

    @Test
    @DisplayName("Fail-closed: vigilante sin sede asignada devuelve lista vacía y no consulta marcaciones")
    void vigilanteSinSede_devuelveVacioYNoConsulta() {
        vigilante.setSede(null);
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));

        List<MarcacionResponse> r = asistenciaService
                .obtenerHistorialMarcacionesDeSedeDelVigilante(10, FECHA);

        assertTrue(r.isEmpty(), "sin sede no debe devolver datos de ninguna sede");
        verifyNoInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("Fail-closed: sede desasignada en BD no cae a otra sede")
    void sedeDesasignada_noDevuelveDatosDeNingunaSede() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_A, FECHA)).thenReturn(List.of());

        // Aunque el repositorio devolviera datos de otras sedes si se consultara sin filtro,
        // el servicio jamás hace una consulta global (no existe findAll en esta ruta).
        List<MarcacionResponse> r = asistenciaService
                .obtenerHistorialMarcacionesDeSedeDelVigilante(10, FECHA);

        assertTrue(r.isEmpty());
        verify(marcacionRepository, times(1)).findHistorialBySedeIdAndFecha(SEDE_A, FECHA);
        verifyNoMoreInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("Vigilante inexistente en BD devuelve 401, no datos")
    void vigilanteInexistente_lanzaUnauthorized() {
        when(vigilanteRepository.findById(99)).thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class, () ->
                asistenciaService.obtenerHistorialMarcacionesDeSedeDelVigilante(99, FECHA));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        verifyNoInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("Sin fecha explícita usa el día actual en America/Lima")
    void sinFecha_usaHoyEnAmericaLima() {
        LocalDate hoyLima = ZonedDateTime.now(ZoneId.of("America/Lima")).toLocalDate();

        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findHistorialBySedeIdAndFecha(SEDE_A, hoyLima)).thenReturn(List.of());

        asistenciaService.obtenerHistorialMarcacionesDeSedeDelVigilante(10, null);

        verify(marcacionRepository, times(1)).findHistorialBySedeIdAndFecha(SEDE_A, hoyLima);
        verifyNoMoreInteractions(marcacionRepository);
    }
}
