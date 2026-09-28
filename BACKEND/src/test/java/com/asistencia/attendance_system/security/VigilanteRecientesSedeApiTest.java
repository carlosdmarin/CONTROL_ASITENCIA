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

import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FASE 2.1 — "Historial reciente" de /marcacion (capa HTTP).
 *
 * Verifica que un VIGILANTE NUNCA entra en el camino global, que la sede no se puede
 * manipular desde el cliente y que RRHH conserva la vista global que le corresponde.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class VigilanteRecientesSedeApiTest {

    private static final String URL = "/api/asistencias/marcaciones/recientes";

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

    private Cookie vigilanteCookie;     // sede A
    private Cookie otroVigilanteCookie; // sede B
    private Cookie rrhhCookie;
    private Cookie practicanteCookie;

    private MarcacionResponse m1;

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

        m1 = new MarcacionResponse();
        m1.setIdMarcacion(1L);
        m1.setDocumento("70000001");
        m1.setNombreCompleto("Juan Perez");
        m1.setHoraMarcacion(LocalTime.of(7, 34));
        m1.setTipoMarcacion("ENTRADA");
        m1.setEstado("EXITOSA");

        when(asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(any(), anyInt()))
                .thenReturn(List.of(m1));
        when(asistenciaService.obtenerMarcacionesRecientes(anyInt())).thenReturn(List.of(m1));
    }

    // ---------- E. ROLES ----------

    @Test
    @DisplayName("E: VIGILANTE autenticado obtiene 200")
    void vigilante_200() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("limite", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].documento").value("70000001"));
    }

    @Test
    @DisplayName("E: sin sesión responde 401")
    void sinAutenticacion_401() throws Exception {
        mockMvc.perform(get(URL)).andExpect(status().isUnauthorized());
        verify(asistenciaService, never()).obtenerMarcacionesRecientesDeSedeDelVigilante(any(), anyInt());
    }

    @Test
    @DisplayName("E: PRACTICANTE recibe 403")
    void practicante_403() throws Exception {
        mockMvc.perform(get(URL).cookie(practicanteCookie)).andExpect(status().isForbidden());
        verify(asistenciaService, never()).obtenerMarcacionesRecientesDeSedeDelVigilante(any(), anyInt());
        verify(asistenciaService, never()).obtenerMarcacionesRecientes(anyInt());
    }

    @Test
    @DisplayName("E: RRHH conserva la vista global y no entra al camino de sede")
    void rrhh_conservaVistaGlobal() throws Exception {
        mockMvc.perform(get(URL).cookie(rrhhCookie).param("limite", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(asistenciaService).obtenerMarcacionesRecientes(10);
        verify(asistenciaService, never()).obtenerMarcacionesRecientesDeSedeDelVigilante(any(), anyInt());
    }

    @Test
    @DisplayName("E: un VIGILANTE nunca cae en el camino global")
    void vigilante_nuncaUsaElCaminoGlobal() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("limite", "10"))
                .andExpect(status().isOk());

        verify(asistenciaService).obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);
        verify(asistenciaService, never()).obtenerMarcacionesRecientes(anyInt());
    }

    @Test
    @DisplayName("El id del vigilante se toma del subject del JWT")
    void idVigilanteProvieneDelJwt() throws Exception {
        mockMvc.perform(get(URL).cookie(otroVigilanteCookie)).andExpect(status().isOk());

        ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
        verify(asistenciaService).obtenerMarcacionesRecientesDeSedeDelVigilante(captor.capture(), anyInt());
        assertEquals(11, captor.getValue());
    }

    // ---------- F. INYECCIÓN DE SEDE ----------

    @Test
    @DisplayName("F: enviar sede, sedeId o idSede desde el cliente no cambia la sede consultada")
    void inyeccionDeSede_seIgnora() throws Exception {
        mockMvc.perform(get(URL)
                        .cookie(vigilanteCookie)
                        .param("limite", "10")
                        .param("sede", "SEDE PUCALLPA")
                        .param("sedeId", "3")
                        .param("idSede", "3")
                        .param("vigilanteId", "11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].documento").value("70000001"));

        // El servicio se invoca solo con el id del JWT y el limite: la sede nunca es parámetro
        verify(asistenciaService).obtenerMarcacionesRecientesDeSedeDelVigilante(eq(10), eq(10));
        verify(asistenciaService, never()).obtenerMarcacionesRecientes(anyInt());
    }

    @Test
    @DisplayName("F: el endpoint no acepta ningún parámetro de sede ni de fecha")
    void elContratoNoExponeSedeNiFecha() throws Exception {
        var metodo = com.asistencia.attendance_system.controller.AsistenciaController.class
                .getMethod("obtenerMarcacionesRecientes",
                        org.springframework.security.core.Authentication.class, int.class);

        var parametros = metodo.getParameters();

        // Solo 'limite' (int) y la identidad autenticada. Nada más.
        assertEquals(2, parametros.length);
        assertEquals(int.class, parametros[1].getType());
        assertTrue(java.util.Arrays.stream(parametros).noneMatch(p -> p.getType() == String.class),
                "no debe aceptar parámetros de texto: sede o fecha no deben ser parte del contrato");

        // Y la sede no puede entrar por ninguna vía consultable
        assertTrue(java.util.Arrays.stream(metodo.getAnnotations())
                        .noneMatch(a -> a.annotationType().getSimpleName().equals("RequestParamSede")),
                "sin parámetros de sede");
    }

    // ---------- LÍMITE A TRAVÉS DE HTTP ----------

    @Test
    @DisplayName("El límite travels del cliente al servicio")
    void limitePropagado() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("limite", "10"))
                .andExpect(status().isOk());
        verify(asistenciaService).obtenerMarcacionesRecientesDeSedeDelVigilante(10, 10);
    }

    @Test
    @DisplayName("Sin límite se aplica el default del backend (20)")
    void limitePorDefecto() throws Exception {
        mockMvc.perform(get(URL).cookie(vigilanteCookie)).andExpect(status().isOk());
        verify(asistenciaService).obtenerMarcacionesRecientesDeSedeDelVigilante(10, 20);
    }

    // ---------- ESTADOS ----------

    @Test
    @DisplayName("Sede sin marcaciones hoy devuelve 200 con lista vacía")
    void sedeSinMarcaciones_200_listaVacia() throws Exception {
        when(asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(any(), anyInt()))
                .thenReturn(List.of());

        mockMvc.perform(get(URL).cookie(vigilanteCookie).param("limite", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Vigilante inexistente devuelve 401 con mensaje, no datos")
    void vigilanteInexistente_401() throws Exception {
        when(asistenciaService.obtenerMarcacionesRecientesDeSedeDelVigilante(any(), anyInt()))
                .thenThrow(new com.asistencia.attendance_system.excepcion.BusinessException(
                        "Vigilante no encontrado", org.springframework.http.HttpStatus.UNAUTHORIZED));

        mockMvc.perform(get(URL).cookie(vigilanteCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Vigilante no encontrado"));
    }

}
