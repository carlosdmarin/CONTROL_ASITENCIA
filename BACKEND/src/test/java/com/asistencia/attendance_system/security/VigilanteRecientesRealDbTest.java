package com.asistencia.attendance_system.security;

import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.MarcacionRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import com.asistencia.attendance_system.scheduler.AsistenciaCierreScheduler;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FASE 2.1 — "Historial reciente" contra la BD real (solo lectura).
 *
 * Demuestra con datos reales que un VIGILANTE recibe solo las marcaciones de SU sede
 * y solo las de HOY. Es la prueba que faltaba en la auditoría: los tests con mocks
 * prueban el contrato, este prueba que el JPQL filtra de verdad.
 *
 * Seguridad de la prueba: solo SELECT, sin migraciones ni escrituras; el scheduler de
 * cierre se mockea para que no genere ausencias y la transacción se revierte.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("real-db-test")
@Tag(value = "real-db")
@Transactional
public class VigilanteRecientesRealDbTest {

    private static final String URL = "/api/asistencias/marcaciones/recientes";

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    @Autowired private VigilanteRepository vigilanteRepository;
    @Autowired private PracticanteRepository practicanteRepository;
    @Autowired private MarcacionRepository marcacionRepository;

    /** Impide cualquier escritura automática del cierre automático. */
    @MockBean private AsistenciaCierreScheduler cierreScheduler;

    private static LocalDate hoyLima() {
        return ZonedDateTime.now(ZoneId.of("America/Lima")).toLocalDate();
    }

    private List<MarcacionResponse> pedir(Vigilante v, int limite) throws Exception {
        Cookie cookie = new Cookie("practiqr_token",
                jwtService.generateToken(String.valueOf(v.getIdVigilante()), "VIGILANTE",
                        "vigilante:" + v.getIdVigilante()));
        MvcResult res = mockMvc.perform(get(URL).cookie(cookie).param("limite", String.valueOf(limite)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(res.getResponse().getContentAsString(),
                new com.fasterxml.jackson.core.type.TypeReference<List<MarcacionResponse>>() {});
    }

    @Test
    @DisplayName("Cada vigilante real recibe solo las marcaciones de HOY de su propia sede")
    void cadaVigilanteRecibeSoloHoyDeSuSede() throws Exception {
        List<Vigilante> vigilantes = vigilanteRepository.findAll().stream()
                .filter(v -> v.getSede() != null)
                .toList();
        assumeTrue(!vigilantes.isEmpty(), "Sin vigilantes con sede asignada en la base real");

        LocalDate hoy = hoyLima();

        // Mapas calculados de forma independiente de la query del endpoint
        Map<Long, Integer> idSedePorPracticante = practicanteRepository.findAll().stream()
                .filter(p -> p.getSede() != null)
                .collect(Collectors.toMap(Practicante::getIdPracticante, p -> p.getSede().getIdSede()));

        List<Marcacion> todas = marcacionRepository.findAll();

        Set<String> documentosDeHoy = todas.stream()
                .filter(m -> m.getFecha().equals(hoy))
                .map(m -> m.getPracticante().getDocumento())
                .collect(Collectors.toSet());

        Set<String> documentosDeDiasAnteriores = todas.stream()
                .filter(m -> !m.getFecha().equals(hoy))
                .map(m -> m.getPracticante().getDocumento())
                .collect(Collectors.toSet());

        for (Vigilante v : vigilantes) {
            Integer idSede = v.getSede().getIdSede();

            List<String> esperados = todas.stream()
                    .filter(m -> m.getFecha().equals(hoy))
                    .filter(m -> Integer.valueOf(idSede).equals(idSedePorPracticante.get(m.getPracticante().getIdPracticante())))
                    .map(m -> m.getPracticante().getDocumento())
                    .toList();

            List<MarcacionResponse> recibidos = pedir(v, 10);

            // 1) Solo marcaciones de HOY de SU sede
            for (MarcacionResponse r : recibidos) {
                assertTrue(esperados.contains(r.getDocumento()),
                        "Vigilante " + v.getIdVigilante() + " (sede " + idSede + ") recibió un documento "
                                + r.getDocumento() + " que no es de su sede ni de hoy");
            }

            // 2) El total coincide con el conteo independiente (salvo el tope de limite)
            assertEquals(Math.min(10, esperados.size()), recibidos.size(),
                    "Vigilante " + v.getIdVigilante() + " (sede " + idSede + ") devolvió una cantidad inesperada");

            // 3) Nunca datos de días anteriores
            for (MarcacionResponse r : recibidos) {
                if (documentosDeDiasAnteriores.contains(r.getDocumento())) {
                    // solo es violation si ese practicante no tiene marcaciones hoy
                    boolean tieneMarcacionHoy = todas.stream()
                            .anyMatch(m -> m.getFecha().equals(hoy)
                                    && m.getPracticante().getDocumento().equals(r.getDocumento()));
                    assertTrue(tieneMarcacionHoy,
                            "Vigilante " + v.getIdVigilante() + " recibió una marcación de un día anterior");
                }
            }
        }
    }

    @Test
    @DisplayName("Un vigilante cuya sede no tiene practicantes NO recibe nada de otras sedes")
    void vigilanteDeSedeSinPracticantes_noRecibeNada() throws Exception {
        List<Vigilante> sinPracticantes = vigilanteRepository.findAll().stream()
                .filter(v -> v.getSede() != null)
                .filter(v -> practicanteRepository.findAll().stream()
                        .noneMatch(p -> p.getSede() != null
                                && p.getSede().getIdSede().equals(v.getSede().getIdSede())))
                .toList();

        assumeTrue(!sinPracticantes.isEmpty(), "Todos los vigilantes tienen practicantes en su sede");

        // Documentos que existen en la BD y que este vigilante NO debe ver
        Set<String> documentosDeOtrasSedes = marcacionRepository.findAll().stream()
                .filter(m -> sinPracticantes.stream().noneMatch(v ->
                        v.getSede().getIdSede() != null && m.getPracticante().getSede() != null
                                && m.getPracticante().getSede().getIdSede().equals(v.getSede().getIdSede())))
                .map(m -> m.getPracticante().getDocumento())
                .collect(Collectors.toSet());

        for (Vigilante v : sinPracticantes) {
            List<MarcacionResponse> recibidos = pedir(v, 10);
            assertTrue(recibidos.isEmpty(),
                    "Vigilante " + v.getIdVigilante() + " (sede " + v.getSede().getIdSede()
                            + ", sin practicantes) recibió datos: " + recibidos.size());
            for (MarcacionResponse r : recibidos) {
                assertFalse(documentosDeOtrasSedes.contains(r.getDocumento()),
                        "Se filtró una marcación de otra sede: " + r.getDocumento());
            }
        }
    }

    @Test
    @DisplayName("El límite se respeta contra datos reales")
    void limiteSeRespeta() throws Exception {
        List<Vigilante> conMarcaciones = vigilanteRepository.findAll().stream()
                .filter(v -> v.getSede() != null)
                .toList();

        LocalDate hoy = hoyLima();
        Map<Long, Integer> idSedePorPracticante = practicanteRepository.findAll().stream()
                .filter(p -> p.getSede() != null)
                .collect(Collectors.toMap(Practicante::getIdPracticante, p -> p.getSede().getIdSede()));

        boolean verifico = false;
        for (Vigilante v : conMarcaciones) {
            long total = marcacionRepository.findAll().stream()
                    .filter(m -> m.getFecha().equals(hoy))
                    .filter(m -> Integer.valueOf(v.getSede().getIdSede())
                            .equals(idSedePorPracticante.get(m.getPracticante().getIdPracticante())))
                    .count();
            if (total == 0) continue;

            assertTrue(pedir(v, 1).size() <= 1, "limite=1 no puede devolver más de 1");
            assertTrue(pedir(v, 3).size() <= 3, "limite=3 no puede devolver más de 3");
            verifico = true;
        }

        assumeTrue(verifico, "Ningún vigilante tiene marcaciones de hoy en la base real");
    }
}
