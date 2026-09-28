package com.asistencia.attendance_system.security;

import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.repository.CargoRepository;
import com.asistencia.attendance_system.repository.OficinaRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.SedeRepository;
import com.asistencia.attendance_system.repository.TipoInstitutoRepository;
import com.asistencia.attendance_system.repository.TrabajadorRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.service.AsistenciaService;
import com.asistencia.attendance_system.service.HorarioService;
import com.asistencia.attendance_system.service.PracticanteService;
import com.asistencia.attendance_system.service.ReportesService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FASE 2 — Historial de marcaciones por sede del VIGILANTE (capa HTTP).
 *
 * Verifica:
 *  - matriz de acceso: solo VIGILANTE; RRHH, PRACTICANTE y anónimo quedan fuera
 *  - el id del vigilante se toma del subject del JWT firmado, no de la petición
 *  - los intentos de inyectar la sede desde el cliente se ignoran
 *  - validación de fecha
 *
 * El aislamiento real por sede (sede A nunca ve sede B) se prueba en
 * VigilanteHistorialSedeServiceTest y en VigilanteHistorialSedeRealDbTest.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class VigilanteHistorialSedeApiTest {

    private static final String URL = "/api/asistencias/marcaciones/historial";

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;

    @MockBean private PracticanteService practicanteService;
    @MockBean private AsistenciaService asistenciaService;
    @MockBean private ReportesService reportesService;
    @MockBean private HorarioService horarioService;
    @MockBean private CargoRepository cargoRepository;
    @MockBean private SedeRepository sedeRepository;
    @MockBean private OficinaRepository oficinaRepository;
    @MockBean private TipoInstitutoRepository tipoInstitutoRepository;
    @MockBean private PracticanteRepository practicanteRepository;
    @MockBean private VigilanteRepository vigilanteRepository;
    @MockBean private TrabajadorRepository trabajadorRepository;

    private Cookie vigilanteCookie;   // id 10, sede A
    private Cookie otroVigilanteCookie; // id 11, sede B
    private Cookie rrhhCookie;
    private Cookie practicanteCookie;

    @BeforeEach
    void setupMocks() {
        vigilanteCookie = new Cookie("practiqr_token",
                jwtService.generateToken("10", "VIGILANTE", "vigilante:10"));
        otroVigilanteCookie = new Cookie("practiqr_token",
                jwtService.generateToken("11", "VIGILANTE", "vigilante:11"));
        rrhhCookie = new Cookie("practiqr_token",
                jwtService.generateToken("87", "RRHH", "trabajadores:87"));
        practicanteCookie = new Cookie("practiqr_token",
                jwtService.generateToken("1", "PRACTICANTE", "practicante:1"));

        MarcacionResponse m1 = new MarcacionResponse();
        m1.setIdMarcacion(1L);
        m1.setDocumento("70000001");
        m1.setNombreCompleto("Ana Apellido");
        m1.setFecha(LocalDate.of(2026, 9, 4));
        m1.setHoraMarcacion(LocalTime.of(7, 30));
        m1.setTipoMarcacion("ENTRADA");
        m1.setMetodoRegistro("QR");
        m1.setEstado("EXITOSA");
        m1.setMensaje("Marcación registrada");

        when(asistenciaService.obtenerHistorialMarcacionesDeSedeDelVigilante(any(), any()))
                .thenReturn(List.of(m1));
    }

    @Test
    @DisplayName("VIGILANTE autenticado obtiene 200 con el historial de su sede")
    void vigilante_200() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].nombreCompleto").value("Ana Apellido"))
                .andExpect(jsonPath("$[0].documento").value("70000001"))
                .andExpect(jsonPath("$[0].horaMarcacion").value("07:30:00"))
                .andExpect(jsonPath("$[0].tipoMarcacion").value("ENTRADA"));
    }

    @Test
    @DisplayName("El id del vigilante se toma del JWT firmado")
    void vigilante_idProvieneDelJwt() throws Exception {
        mockMvc.perform(get(URL).cookie(otroVigilanteCookie))
                .andExpect(status().isOk());

        ArgumentCaptor<Integer> idCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(asistenciaService).obtenerHistorialMarcacionesDeSedeDelVigilante(
                idCaptor.capture(), any());
        assertEquals(11, idCaptor.getValue());
    }

    @Test
    @DisplayName("La sede enviada por el cliente se ignora: el servicio recibe el id del JWT")
    void vigilante_paramSedeAjeno_seIgnora() throws Exception {
        // Intento de forzar la sede de otro vigilante por query params
        mockMvc.perform(get(URL)
                        .cookie(vigilanteCookie)
                        .param("sede", "PLANTA CAMPO VERDE")
                        .param("sedeId", "2")
                        .param("idSede", "2")
                        .param("vigilanteId", "11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombreCompleto").value("Ana Apellido"));

        // El servicio se invoca con el id del vigilante autenticado y SIN sede por parámetro
        ArgumentCaptor<Integer> idCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(asistenciaService).obtenerHistorialMarcacionesDeSedeDelVigilante(
                idCaptor.capture(), any());
        assertEquals(10, idCaptor.getValue(), "la sede nunca se toma del cliente");
    }

    @Test
    @DisplayName("Dos vigilantes invokes con su propio id y reciben historiales independientes")
    void dosVigilantes_sonAtendidosPorSuPropioId() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie)).andExpect(status().isOk());
        mockMvc.perform(get(URL).cookie(otroVigilanteCookie)).andExpect(status().isOk());

        ArgumentCaptor<Integer> idCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(asistenciaService, org.mockito.Mockito.times(2))
                .obtenerHistorialMarcacionesDeSedeDelVigilante(idCaptor.capture(), any());
        assertEquals(List.of(10, 11), idCaptor.getAllValues());
    }

    @Test
    @DisplayName("Sin sesión responde 401")
    void sinAutenticacion_401() throws Exception {
        mockMvc.perform(get(URL))
                .andExpect(status().isUnauthorized());
        verify(asistenciaService, never()).obtenerHistorialMarcacionesDeSedeDelVigilante(any(), any());
    }

    @Test
    @DisplayName("PRACTICANTE no puede ver el historial de sede: 403")
    void practicante_403() throws Exception {
        mockMvc.perform(get(URL).cookie(practicanteCookie))
                .andExpect(status().isForbidden());
        verify(asistenciaService, never()).obtenerHistorialMarcacionesDeSedeDelVigilante(any(), any());
    }

    @Test
    @DisplayName("RRHH no entra por este endpoint: 403")
    void rrhh_403() throws Exception {
        mockMvc.perform(get(URL).cookie(rrhhCookie))
                .andExpect(status().isForbidden());
        verify(asistenciaService, never()).obtenerHistorialMarcacionesDeSedeDelVigilante(any(), any());
    }

    @Test
    @DisplayName("Fecha válida se propaga al servicio")
    void fechaValida_sePropaga() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("fecha", "2026-09-04"))
                .andExpect(status().isOk());

        ArgumentCaptor<LocalDate> fechaCaptor = ArgumentCaptor.forClass(LocalDate.class);
        verify(asistenciaService).obtenerHistorialMarcacionesDeSedeDelVigilante(
                eq(10), fechaCaptor.capture());
        assertEquals(LocalDate.of(2026, 9, 4), fechaCaptor.getValue());
    }

    @Test
    @DisplayName("Sin fecha el servicio aplica el día actual en America/Lima")
    void sinFecha_servicioAplicaHoyLima() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie))
                .andExpect(status().isOk());

        ArgumentCaptor<LocalDate> fechaCaptor = ArgumentCaptor.forClass(LocalDate.class);
        verify(asistenciaService).obtenerHistorialMarcacionesDeSedeDelVigilante(
                eq(10), fechaCaptor.capture());
        assertNull(fechaCaptor.getValue(), "sin fecha el servicio decide el día de Lima");

        LocalDate hoyLima = ZonedDateTime.now(ZoneId.of("America/Lima")).toLocalDate();
        org.junit.jupiter.api.Assertions.assertNotNull(hoyLima);
    }

    @Test
    @DisplayName("Fecha inválida responde 400 y no consulta datos")
    void fechaInvalida_400() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("fecha", "ayer"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("fecha", "04-09-2026"))
                .andExpect(status().isBadRequest());

        verify(asistenciaService, never()).obtenerHistorialMarcacionesDeSedeDelVigilante(any(), any());
    }

    @Test
    @DisplayName("Sede sin Practicantes devuelve 200 con lista vacía (fail-closed visible)")
    void sedeSinMarcaciones_200_listaVacia() throws Exception {
        when(asistenciaService.obtenerHistorialMarcacionesDeSedeDelVigilante(any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get(URL).cookie(vigilanteCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }
}
