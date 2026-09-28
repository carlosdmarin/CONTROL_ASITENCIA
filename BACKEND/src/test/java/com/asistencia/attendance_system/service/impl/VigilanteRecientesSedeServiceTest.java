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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
 * FASE 2.1 — "Historial reciente" de /marcacion acotado a la sede del VIGILANTE.
 *
 * Contrasta con la auditoría previa, que encontró un findAll() global sin filtro de sede.
 * Aquí se demuestra: sede propia + solo hoy + límite aplicado en la consulta.
 */
@ExtendWith(MockitoExtension.class)
class VigilanteRecientesSedeServiceTest {

    private static final Integer SEDE_A = 1; // sede del vigilante
    private static final Integer SEDE_B = 3; // sede ajena

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

    private static LocalDate hoyLima() {
        return ZonedDateTime.now(ZoneId.of("America/Lima")).toLocalDate();
    }

    @BeforeEach
    void setUp() {
        sedeA = new Sede();
        sedeA.setIdSede(SEDE_A);
        sedeA.setNombre("SEDE A");

        sedeB = new Sede();
        sedeB.setIdSede(SEDE_B);
        sedeB.setNombre("SEDE B");

        vigilante = new Vigilante();
        vigilante.setIdVigilante(10);
        vigilante.setUsuario("vig1");
        vigilante.setEstado(true);
        vigilante.setSede(sedeA);
    }

    private Marcacion marcacion(Sede sede, long id, String nombre, String documento, LocalTime hora) {
        Practicante p = new Practicante();
        p.setIdPracticante(id);
        p.setNombre(nombre);
        p.setApellido("Apellido");
        p.setDocumento(documento);
        p.setSede(sede);

        Marcacion m = new Marcacion();
        m.setIdMarcacion(id);
        m.setPracticante(p);
        m.setFecha(hoyLima());
        m.setHoraMarcacion(hora);
        m.setTipoMarcacion(TipoMarcacion.ENTRADA);
        m.setMetodoRegistro(MetodoRegistro.QR);
        m.setFechaRegistro(LocalDateTime.now());
        return m;
    }

    // ---------- A. SEDE PROPIA ----------

    @Test
    @DisplayName("A: el vigilante recibe únicamente marcaciones de su sede")
    void devuelveSoloMarcacionesDeSuSede() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), eq(hoyLima()), any(Pageable.class)))
                .thenReturn(List.of(
                        marcacion(sedeA, 1L, "Juan", "70000001", LocalTime.of(7, 34)),
                        marcacion(sedeA, 2L, "Pedro", "70000002", LocalTime.of(7, 30))
                ));

        List<MarcacionResponse> r = asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);

        assertEquals(2, r.size());
        assertEquals("70000001", r.get(0).getDocumento());
        assertEquals("70000002", r.get(1).getDocumento());
        verify(marcacionRepository, times(1))
                .findRecientesBySedeIdAndFecha(SEDE_A, hoyLima(), PageRequest.of(0, 10));
    }

    // ---------- B. AISLAMIENTO (contenido, no solo 200) ----------

    @Test
    @DisplayName("B: aislamiento - la sede ajena nunca se consulta ni se devuelve")
    void nuncaConsultaNiDevuelveLaSedeAjena() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), eq(hoyLima()), any(Pageable.class)))
                .thenReturn(List.of(marcacion(sedeA, 1L, "Juan", "70000001", LocalTime.of(7, 34))));
        // Control: si se consultara la sede ajena devolvería estos registros
        lenient().when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_B), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of(marcacion(sedeB, 9L, "Intruso", "70000009", LocalTime.of(8, 0))));

        List<MarcacionResponse> r = asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);

        assertEquals(1, r.size());
        assertFalse(r.stream().anyMatch(x -> "70000009".equals(x.getDocumento())),
                "no debe exponer documentos de otra sede");
        assertFalse(r.stream().anyMatch(x -> "Intruso Apellido".equals(x.getNombreCompleto())),
                "no debe exponer practicantes de otra sede");
        assertTrue(r.stream().allMatch(x -> "70000001".equals(x.getDocumento())));

        verify(marcacionRepository, never())
                .findRecientesBySedeIdAndFecha(eq(SEDE_B), any(LocalDate.class), any(Pageable.class));
        verifyNoMoreInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("B: dos vigilantes de sedes distintas obtienen historiales distintos")
    void dosVigilantesNoCompartenMarcaciones() {
        Vigilante vigilanteB = new Vigilante();
        vigilanteB.setIdVigilante(11);
        vigilanteB.setUsuario("vig2");
        vigilanteB.setEstado(true);
        vigilanteB.setSede(sedeB);

        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(vigilanteRepository.findById(11)).thenReturn(Optional.of(vigilanteB));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), eq(hoyLima()), any(Pageable.class)))
                .thenReturn(List.of(marcacion(sedeA, 1L, "Juan", "70000001", LocalTime.of(7, 34))));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_B), eq(hoyLima()), any(Pageable.class)))
                .thenReturn(List.of(marcacion(sedeB, 9L, "Intruso", "70000009", LocalTime.of(8, 0))));

        List<MarcacionResponse> rA = asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);
        List<MarcacionResponse> rB = asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(11, 10);

        assertEquals(1, rA.size());
        assertEquals("70000001", rA.get(0).getDocumento());
        assertEquals(1, rB.size());
        assertEquals("70000009", rB.get(0).getDocumento());
    }

    // ---------- C. FECHA: HOY, NO AYER ----------

    @Test
    @DisplayName("C: la consulta se hace con la fecha de hoy en America/Lima, nunca con otra")
    void consultaSiempreConHoyEnLima() {
        LocalDate hoy = hoyLima();
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), eq(hoy), any(Pageable.class)))
                .thenReturn(List.of());

        asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);

        // Hoy sí
        verify(marcacionRepository, times(1)).findRecientesBySedeIdAndFecha(SEDE_A, hoy, PageRequest.of(0, 10));
        // Ayer y anteayer no
        verify(marcacionRepository, never()).findRecientesBySedeIdAndFecha(eq(SEDE_A), eq(hoy.minusDays(1)), any(Pageable.class));
        verify(marcacionRepository, never()).findRecientesBySedeIdAndFecha(eq(SEDE_A), eq(hoy.minusDays(2)), any(Pageable.class));
        // Y no se hace ninguna consulta adicional con otra fecha
        verifyNoMoreInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("C: no seAccepta fecha del cliente: el método no la tiene como parámetro")
    void laFechaNoEsParametroDelServicio() throws Exception {
        // El servicio no expone ningún parámetro de fecha: la fecha solo sale de hoyLima()
        for (var m : AsistenciaServiceImpl.class.getMethods()) {
            if (m.getName().equals("obtenerMarcacionesRecientesDeSedeDelVigilante")) {
                assertEquals(2, m.getParameterCount(), "solo idVigilante y limite");
                assertEquals(Integer.class, m.getParameterTypes()[0]);
                assertEquals(int.class, m.getParameterTypes()[1]);
            }
        }
    }

    // ---------- D. LÍMITE APLICADO EN LA CONSULTA ----------

    @Test
    @DisplayName("D: limite=10 se aplica como tamaño de página en la consulta")
    void limiteSeAplicaEnLaConsulta() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());

        asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);

        verify(marcacionRepository, times(1))
                .findRecientesBySedeIdAndFecha(SEDE_A, hoyLima(), PageRequest.of(0, 10));
    }

    @Test
    @DisplayName("D: limite por defecto 20 cuando no se informa o es inválido")
    void limitePorDefectoEs20() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());

        // limite = 0 y limite = -7 caen ambos en el default de 20
        asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 0);
        asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, -7);

        verify(marcacionRepository, times(2))
                .findRecientesBySedeIdAndFecha(SEDE_A, hoyLima(), PageRequest.of(0, 20));
    }

    @Test
    @DisplayName("D: limite máximo 50 aunque se pida más")
    void limiteMaximoEs50() {
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));
        when(marcacionRepository.findRecientesBySedeIdAndFecha(eq(SEDE_A), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());

        asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 9999);

        verify(marcacionRepository, times(1))
                .findRecientesBySedeIdAndFecha(SEDE_A, hoyLima(), PageRequest.of(0, 50));
    }

    @Test
    @DisplayName("D: la vista global de RRHH también limita en la consulta, no carga toda la tabla")
    void laVistaGlobalTambienLimitaEnLaConsulta() {
        when(marcacionRepository.findAllByOrderByFechaRegistroDesc(PageRequest.of(0, 10)))
                .thenReturn(List.of(marcacion(sedeA, 1L, "Juan", "70000001", LocalTime.of(7, 34))));

        List<MarcacionResponse> r = asistenciaService.obtenerMarcacionesRecientes(10);

        assertEquals(1, r.size());
        verify(marcacionRepository, times(1)).findAllByOrderByFechaRegistroDesc(PageRequest.of(0, 10));
        // No se usa findAll() sin límite
        verify(marcacionRepository, never()).findAll();
        verifyNoMoreInteractions(marcacionRepository);
    }

    // ---------- FAIL CLOSED ----------

    @Test
    @DisplayName("Vigilante sin sede asignada devuelve vacío y no consulta marcaciones")
    void vigilanteSinSede_devuelveVacioYNoConsulta() {
        vigilante.setSede(null);
        when(vigilanteRepository.findById(10)).thenReturn(Optional.of(vigilante));

        List<MarcacionResponse> r = asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);

        assertTrue(r.isEmpty());
        verifyNoInteractions(marcacionRepository);
    }

    @Test
    @DisplayName("Vigilante inexistente devuelve 401, no datos")
    void vigilanteInexistente_lanza401() {
        when(vigilanteRepository.findById(99)).thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(99, 10));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        verifyNoInteractions(marcacionRepository);
    }
}
