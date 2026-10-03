package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.BloqueHorarioRequest;
import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.entity.AsistenciaDiaria;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.enums.TipoMarcacion;
import com.asistencia.attendance_system.repository.AsistenciaDiariaRepository;
import com.asistencia.attendance_system.repository.BloqueHorarioRepository;
import com.asistencia.attendance_system.repository.MarcacionRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.service.AsistenciaService;
import com.asistencia.attendance_system.service.HorarioService;
import com.asistencia.attendance_system.service.PracticanteService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

/**
 * C-05: 8 solicitudes concurrentes del mismo evento -> 1 sola ENTRADA.
 * Crea datos temporales y los elimina al final (sin rastro).
 */
@SpringBootTest
public class MarcacionConcurrenteIT {

    @Autowired private AsistenciaService asistenciaService;
    @Autowired private PracticanteService practicanteService;
    @Autowired private HorarioService horarioService;
    @Autowired private PracticanteRepository practicanteRepository;
    @Autowired private MarcacionRepository marcacionRepository;
    @Autowired private AsistenciaDiariaRepository asistenciaDiariaRepository;
    @Autowired private BloqueHorarioRepository bloqueHorarioRepository;

    private Long idPracticante;
    private String documento;

    private static void contextoVigilante() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("244", "vigilante:244",
                        List.of(new SimpleGrantedAuthority("ROLE_VIGILANTE"))));
    }

    @BeforeEach
    public void crearPracticanteTemporal() {
        SecurityContextHolder.clearContext();
        documento = "T" + (System.currentTimeMillis() % 1000000);
        PracticanteRequest req = new PracticanteRequest();
        req.setNombre("Temp");
        req.setApellido("Conc");
        req.setDocumento(documento);
        req.setIdSede(3);
        req.setIdOficina(12);
        req.setIdTipoInstituto(5L);
        req.setIdTipoPracticante(5L);
        req.setFechaInicioPracticas(LocalDate.now().minusDays(1));
        idPracticante = practicanteService.crear(req).getIdPracticante();

        List<BloqueHorarioRequest> horario = new ArrayList<>();
        for (String dia : List.of("LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO")) {
            BloqueHorarioRequest b = new BloqueHorarioRequest();
            b.setDiaSemana(dia);
            b.setHoraInicio("00:00");
            b.setHoraFin("23:59");
            b.setActivo(true);
            b.setDescuentaAlmuerzo(true);
            horario.add(b);
        }
        horarioService.guardarHorario(idPracticante, horario);
    }

    @AfterEach
    public void limpiar() {
        SecurityContextHolder.clearContext();
        asistenciaDiariaRepository.deleteAll(
                asistenciaDiariaRepository.findByPracticante_IdPracticante(idPracticante));
        asistenciaDiariaRepository.flush();
        marcacionRepository.deleteAll(
                marcacionRepository.findByPracticante_IdPracticante(idPracticante));
        marcacionRepository.flush();
        bloqueHorarioRepository.deleteAll(
                bloqueHorarioRepository.findByPracticante_IdPracticante(idPracticante));
        bloqueHorarioRepository.flush();
        practicanteRepository.findById(idPracticante).ifPresent(p -> {
            practicanteRepository.delete(p);
            practicanteRepository.flush();
        });
        org.junit.jupiter.api.Assertions.assertTrue(
                practicanteRepository.findById(idPracticante).isEmpty(),
                "Limpieza incompleta del practicante temporal " + idPracticante);
    }

    private long contarEntradasHoy() {
        return marcacionRepository.findByPracticante_IdPracticante(idPracticante).stream()
                .filter(m -> m.getFecha().equals(LocalDate.now())
                        && m.getTipoMarcacion() == TipoMarcacion.ENTRADA)
                .count();
    }

    @Test
    public void concurrentes_mismaEntrada_unaSola() throws Exception {
        int hilos = 8;
        ExecutorService pool = Executors.newFixedThreadPool(hilos);
        CountDownLatch listo = new CountDownLatch(hilos);
        CountDownLatch ya = new CountDownLatch(1);
        List<Future<String>> futuros = new ArrayList<>();
        for (int i = 0; i < hilos; i++) {
            futuros.add(pool.submit(() -> {
                contextoVigilante();
                listo.countDown();
                ya.await(10, TimeUnit.SECONDS);
                try {
                    asistenciaService.registrarEntrada(documento);
                    return "OK";
                } catch (Exception e) {
                    return "RECHAZADA:" + e.getMessage();
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }));
        }
        assertTrue(listo.await(15, TimeUnit.SECONDS));
        ya.countDown();
        int ok = 0;
        for (Future<String> f : futuros) {
            if ("OK".equals(f.get(60, TimeUnit.SECONDS))) {
                ok++;
            }
        }
        pool.shutdownNow();
        assertEquals(1, ok, "Debe ganar exactamente 1 solicitud");
        assertEquals(1, contarEntradasHoy(), "Debe existir 1 sola ENTRADA de hoy");
    }

    @Test
    public void salidaPosteriorLegitima_funciona() {
        contextoVigilante();
        try {
            asistenciaService.registrarEntrada(documento);
            asistenciaService.registrarSalida(documento);
        } finally {
            SecurityContextHolder.clearContext();
        }
        assertEquals(1, contarEntradasHoy());
        long salidas = marcacionRepository.findByPracticante_IdPracticante(idPracticante).stream()
                .filter(m -> m.getFecha().equals(LocalDate.now())
                        && m.getTipoMarcacion() == TipoMarcacion.SALIDA)
                .count();
        assertEquals(1, salidas);
    }

    @Test
    public void diasDiferentes_noBloqueadosPorUnique() {
        Marcacion ayer = new Marcacion();
        ayer.setFecha(LocalDate.now().minusDays(1));
        ayer.setHoraMarcacion(java.time.LocalTime.of(7, 30));
        ayer.setTipoMarcacion(TipoMarcacion.ENTRADA);
        ayer.setMetodoRegistro(com.asistencia.attendance_system.model.enums.MetodoRegistro.MANUAL);
        ayer.setPracticante(practicanteRepository.findById(idPracticante).orElseThrow());
        Marcacion hoy = new Marcacion();
        hoy.setFecha(LocalDate.now());
        hoy.setHoraMarcacion(java.time.LocalTime.of(7, 30));
        hoy.setTipoMarcacion(TipoMarcacion.ENTRADA);
        hoy.setMetodoRegistro(com.asistencia.attendance_system.model.enums.MetodoRegistro.MANUAL);
        hoy.setPracticante(practicanteRepository.findById(idPracticante).orElseThrow());
        marcacionRepository.save(ayer);
        marcacionRepository.save(hoy);
        assertEquals(2, marcacionRepository.findByPracticante_IdPracticante(idPracticante).size());
    }
}
