package com.asistencia.attendance_system.security;

import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
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
import java.util.Comparator;
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
 * FASE 2 — Aislamiento por sede contra la BD REAL (solo lectura).
 *
 * Las pruebas con mocks demuestran el contrato, pero no que el JPQL filtre de verdad.
 * Esta prueba consulta la base real en modo lectura y comprueba que un vigilante
 * autenticado solo recibe marcaciones de practicantes de SU sede.
 *
 * Seguridad de la prueba:
 *  - NO escribe nada: solo SELECT. El scheduler de cierre se mockea para que no genere
 *    ausencias y la transacción se revierte igualmente.
 *  - No requiere credenciales: el token se firma con el JwtService real, no se hace login.
 *  - Se salta sola (Assumptions) si la base no tiene vigilantes con sede asignada.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("real-db-test")
@Tag(value = "real-db")
@Transactional
public class VigilanteHistorialSedeRealDbTest {

    private static final String URL = "/api/asistencias/marcaciones/historial";

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private VigilanteRepository vigilanteRepository;
    @Autowired private PracticanteRepository practicanteRepository;
    @Autowired private MarcacionRepository marcacionRepository;
    @Autowired private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    /** Impide cualquier escritura automática del cierre automático durante la prueba. */
    @MockBean private AsistenciaCierreScheduler cierreScheduler;

    @Test
    @DisplayName("Vigilante real: solo recibe marcaciones de practicantes de su propia sede")
    void vigilanteReal_soloRecibeMarcacionesDeSuSede() throws Exception {
        List<Vigilante> vigilantes = vigilanteRepository.findAll();
        Vigilante vigilante = vigilantes.stream()
                .filter(v -> v.getSede() != null)
                .min(Comparator.comparing(Vigilante::getIdVigilante))
                .orElse(null);

        assumeTrue(vigilante != null, "Sin vigilantes con sede asignada en la base de datos real");

        Integer idSedeVigilante = vigilante.getSede().getIdSede();

        // --- Expectativa calculada de forma independiente (sin reutilizar la query del endpoint) ---
        Map<Long, Integer> idSedePorPracticante = practicanteRepository.findAll().stream()
                .filter(p -> p.getSede() != null)
                .collect(Collectors.toMap(Practicante::getIdPracticante, p -> p.getSede().getIdSede()));

        Set<Integer> sedesConMarcaciones = marcacionRepository.findAll().stream()
                .map(Marcacion::getPracticante)
                .map(p -> idSedePorPracticante.get(p.getIdPracticante()))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        // Elegimos una fecha con marcaciones de la sede del vigilante
        Map<LocalDate, List<Marcacion>> porFecha = marcacionRepository.findAll().stream()
                .filter(m -> Integer.valueOf(idSedeVigilante).equals(idSedePorPracticante.get(m.getPracticante().getIdPracticante())))
                .collect(Collectors.groupingBy(Marcacion::getFecha));

        assumeTrue(!porFecha.isEmpty(), "La sede del vigilante no tiene marcaciones en la base real");
        LocalDate fecha = porFecha.keySet().stream().sorted().findFirst().orElseThrow();

        List<Marcacion> esperadas = porFecha.get(fecha);

        // --- Petición real con JWT firmado del vigilante ---
        Cookie cookie = new Cookie("practiqr_token",
                jwtService.generateToken(String.valueOf(vigilante.getIdVigilante()), "VIGILANTE",
                        "vigilante:" + vigilante.getIdVigilante()));

        MvcResult result = mockMvc.perform(get(URL).cookie(cookie).param("fecha", fecha.toString()))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        List<MarcacionResponse> recibidas = objectMapper.readValue(json,
                new com.fasterxml.jackson.core.type.TypeReference<List<MarcacionResponse>>() {});

        // 1) Solo llegan marcaciones de la sede del vigilante
        Map<String, Integer> idSedePorDocumento = new java.util.HashMap<>();
        for (Map.Entry<Long, Integer> e : idSedePorPracticante.entrySet()) {
            practicanteRepository.findById(e.getKey())
                    .map(Practicante::getDocumento)
                    .ifPresent(doc -> idSedePorDocumento.put(doc, e.getValue()));
        }
        for (MarcacionResponse r : recibidas) {
            Integer sedeDelPracticante = idSedePorDocumento.get(r.getDocumento());
            assertTrue(sedeDelPracticante == null || sedeDelPracticante.equals(idSedeVigilante),
                    "Se filtró una marcación de otra sede: " + json);
        }

        // 2) No aparece ninguna marcación de otra sede
        List<String> documentosEsperados = esperadas.stream()
                .map(m -> m.getPracticante().getDocumento())
                .collect(Collectors.toList());
        for (MarcacionResponse r : recibidas) {
            assertTrue(documentosEsperados.contains(r.getDocumento()),
                    "Documento recibido que no pertenece a la sede del vigilante: " + r.getDocumento());
        }

        // 3) El total coincide con el conteo independiente de la sede
        assertEquals(documentosEsperados.size(), recibidas.size(),
                "El endpoint debe devolver exactamente las marcaciones de la sede del vigilante");

        // 4) Si hay otras sedes con marcaciones, ninguna debe aparecer
        if (sedesConMarcaciones.size() > 1) {
            Set<String> documentosOtrasSedes = marcacionRepository.findAll().stream()
                    .filter(m -> !Integer.valueOf(idSedeVigilante).equals(idSedePorPracticante.get(m.getPracticante().getIdPracticante())))
                    .map(m -> m.getPracticante().getDocumento())
                    .collect(Collectors.toSet());
            for (MarcacionResponse r : recibidas) {
                assertFalse(documentosOtrasSedes.contains(r.getDocumento()),
                        "Se filtró una marcación de otra sede: " + r.getDocumento());
            }
        }
    }

    @Test
    @DisplayName("Dos vigilantes reales de sedes distintas no comparten historial")
    void dosVigilantesReales_noCompartenHistorial() throws Exception {
        List<Vigilante> vigilantesConSede = vigilanteRepository.findAll().stream()
                .filter(v -> v.getSede() != null)
                .collect(Collectors.toList());

        Map<Long, Integer> idSedePorPracticante = practicanteRepository.findAll().stream()
                .filter(p -> p.getSede() != null)
                .collect(Collectors.toMap(Practicante::getIdPracticante, p -> p.getSede().getIdSede()));

        // Un vigilante por sede como máximo
        Map<Integer, Vigilante> unoPorSede = new java.util.LinkedHashMap<>();
        for (Vigilante v : vigilantesConSede) {
            unoPorSede.putIfAbsent(v.getSede().getIdSede(), v);
        }

        assumeTrue(unoPorSede.size() >= 2,
                "Se necesitan al menos 2 sedes con vigilante asignado; la base real tiene "
                        + unoPorSede.size() + " sede(s) con vigilante y "
                        + vigilantesConSede.size() + " vigilante(s) con sede");

        List<Marcacion> todas = marcacionRepository.findAll();
        Set<LocalDate> fechasUtiles = todas.stream()
                .map(Marcacion::getFecha)
                .collect(Collectors.toCollection(java.util.TreeSet::new));

        boolean verificoAlMenosUnaPareja = false;

        for (LocalDate fecha : fechasUtiles) {
            for (Map.Entry<Integer, Vigilante> e1 : unoPorSede.entrySet()) {
                for (Map.Entry<Integer, Vigilante> e2 : unoPorSede.entrySet()) {
                    if (e1.getKey().equals(e2.getKey())) continue;

                    Set<String> docsSede1 = documentosDe(todas, fecha, idSedePorPracticante, e1.getKey());
                    Set<String> docsSede2 = documentosDe(todas, fecha, idSedePorPracticante, e2.getKey());
                    if (docsSede1.isEmpty() || docsSede2.isEmpty()) continue;

                    Set<String> r1 = pedir(fecha, e1.getValue());
                    Set<String> r2 = pedir(fecha, e2.getValue());

                    assertTrue(docsSede1.containsAll(r1), "Sede " + e1.getKey() + " recibió datos ajenos");
                    assertTrue(docsSede2.containsAll(r2), "Sede " + e2.getKey() + " recibió datos ajenos");
                    verificoAlMenosUnaPareja = true;
                }
            }
            if (verificoAlMenosUnaPareja) break;
        }

        assumeTrue(verificoAlMenosUnaPareja,
                "No hay fecha con marcaciones simultáneas en dos sedes distintas entre las "
                        + unoPorSede.size() + " sede(s) con vigilante; fechas con marcaciones: "
                        + fechasUtiles.size());
    }

    private Set<String> documentosDe(List<Marcacion> todas, LocalDate fecha,
                                     Map<Long, Integer> idSedePorPracticante, Integer idSede) {
        return todas.stream()
                .filter(m -> m.getFecha().equals(fecha))
                .filter(m -> Integer.valueOf(idSede).equals(idSedePorPracticante.get(m.getPracticante().getIdPracticante())))
                .map(m -> m.getPracticante().getDocumento())
                .collect(Collectors.toSet());
    }

    private Set<String> pedir(LocalDate fecha, Vigilante v) throws Exception {
        Cookie cookie = new Cookie("practiqr_token",
                jwtService.generateToken(String.valueOf(v.getIdVigilante()), "VIGILANTE",
                        "vigilante:" + v.getIdVigilante()));
        MvcResult res = mockMvc.perform(get(URL).cookie(cookie).param("fecha", fecha.toString()))
                .andExpect(status().isOk())
                .andReturn();
        List<MarcacionResponse> lista = objectMapper.readValue(res.getResponse().getContentAsString(),
                new com.fasterxml.jackson.core.type.TypeReference<List<MarcacionResponse>>() {});
        return lista.stream().map(MarcacionResponse::getDocumento).collect(Collectors.toSet());
    }
}
