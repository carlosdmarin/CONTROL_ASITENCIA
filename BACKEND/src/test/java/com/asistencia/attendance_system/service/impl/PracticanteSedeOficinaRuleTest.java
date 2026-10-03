package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.excepcion.BusinessException;
import com.asistencia.attendance_system.model.dto.PracticanteRequest;
import com.asistencia.attendance_system.model.dto.PracticanteResponse;
import com.asistencia.attendance_system.model.entity.Oficina;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.entity.TipoInstituto;
import com.asistencia.attendance_system.model.entity.TipoPracticante;
import com.asistencia.attendance_system.repository.BloqueHorarioRepository;
import com.asistencia.attendance_system.repository.OficinaRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.repository.SedeRepository;
import com.asistencia.attendance_system.repository.TipoInstitutoRepository;
import com.asistencia.attendance_system.repository.TipoPracticanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Regla de negocio: IdSede e IdOficina del practicante son independientes.
 * Una oficina activa puede registrarse con cualquiera de las 3 sedes.
 * oficinas.IdSede es dato histórico/informativo y no restringe crear/actualizar.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class PracticanteSedeOficinaRuleTest {

    @Mock private PracticanteRepository practicanteRepository;
    @Mock private SedeRepository sedeRepository;
    @Mock private TipoPracticanteRepository tipoPracticanteRepository;
    @Mock private TipoInstitutoRepository tipoInstitutoRepository;
    @Mock private BloqueHorarioRepository bloqueHorarioRepository;
    @Mock private OficinaRepository oficinaRepository;

    private PracticanteServiceImpl service;

    @BeforeEach
    public void setup() {
        service = new PracticanteServiceImpl(practicanteRepository, sedeRepository,
                tipoPracticanteRepository, tipoInstitutoRepository,
                bloqueHorarioRepository, oficinaRepository);
    }

    private Sede sede(Integer id) {
        Sede s = new Sede();
        s.setIdSede(id);
        s.setNombre("SEDE " + id);
        return s;
    }

    private Oficina oficina(Integer id, Integer idSede, int estado) {
        Oficina o = new Oficina();
        o.setIdOficina(id);
        o.setOficina("OFICINA " + id);
        o.setEstado(estado);
        o.setIdSede(idSede);
        return o;
    }

    private TipoInstituto instituto() {
        TipoInstituto t = new TipoInstituto();
        t.setIdTipoInstituto(5L);
        t.setNombre("SENATI");
        return t;
    }

    private TipoPracticante tipo() {
        TipoPracticante t = new TipoPracticante();
        t.setIdTipoPracticante(5L);
        t.setNombre("PRE");
        t.setHorasSemanales(30);
        return t;
    }

    private PracticanteRequest req(Integer idSede, Integer idOficina, String doc) {
        PracticanteRequest r = new PracticanteRequest();
        r.setNombre("T");
        r.setApellido("C");
        r.setDocumento(doc);
        r.setIdSede(idSede);
        r.setIdOficina(idOficina);
        r.setIdTipoInstituto(5L);
        r.setIdTipoPracticante(5L);
        r.setFechaInicioPracticas(LocalDate.of(2026, 10, 1));
        return r;
    }

    private void mockCatalogos(Integer idSede, Oficina ofi) {
        when(practicanteRepository.findByDocumento(any())).thenReturn(Optional.empty());
        when(sedeRepository.findById(idSede)).thenReturn(Optional.of(sede(idSede)));
        when(oficinaRepository.findById(ofi.getIdOficina())).thenReturn(Optional.of(ofi));
        when(tipoInstitutoRepository.findById(5L)).thenReturn(Optional.of(instituto()));
        when(tipoPracticanteRepository.findById(5L)).thenReturn(Optional.of(tipo()));
        when(practicanteRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    public void crear_sede1_oficinaActivaIdSede3_permite() {
        Oficina ofi = oficina(3, 3, 1);
        mockCatalogos(1, ofi);
        PracticanteResponse res = service.crear(req(1, 3, "D1"));
        assertEquals(1, res.getIdSede());
        assertEquals(3, res.getIdOficina());
    }

    @Test
    public void crear_sede2_oficinaActivaIdSede3_permite() {
        Oficina ofi = oficina(3, 3, 1);
        mockCatalogos(2, ofi);
        PracticanteResponse res = service.crear(req(2, 3, "D2"));
        assertEquals(2, res.getIdSede());
        assertEquals(3, res.getIdOficina());
    }

    @Test
    public void crear_sede3_oficinaActivaIdSede3_permite() {
        Oficina ofi = oficina(3, 3, 1);
        mockCatalogos(3, ofi);
        PracticanteResponse res = service.crear(req(3, 3, "D3"));
        assertEquals(3, res.getIdSede());
        assertEquals(3, res.getIdOficina());
    }

    @Test
    public void crear_oficinaInactiva_rechaza() {
        Oficina ofi = oficina(6, 3, 0);
        mockCatalogos(1, ofi);
        assertThrows(BusinessException.class, () -> service.crear(req(1, 6, "D4")));
    }

    @Test
    public void crear_oficinaInexistente_rechaza() {
        when(practicanteRepository.findByDocumento(any())).thenReturn(Optional.empty());
        when(sedeRepository.findById(1)).thenReturn(Optional.of(sede(1)));
        when(oficinaRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.crear(req(1, 999, "D5")));
    }

    @Test
    public void crear_sedeInexistente_rechaza() {
        when(practicanteRepository.findByDocumento(any())).thenReturn(Optional.empty());
        when(sedeRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.crear(req(99, 3, "D6")));
    }

    @Test
    public void actualizar_sede2_oficinaActivaIdSede3_permite() {
        Oficina ofi = oficina(3, 3, 1);
        Practicante existente = new Practicante();
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(existente));
        mockCatalogos(2, ofi);
        PracticanteResponse res = service.actualizar(7L, req(2, 3, "D7"));
        assertEquals(2, res.getIdSede());
        assertEquals(3, res.getIdOficina());
    }

    @Test
    public void actualizar_oficinaInactiva_rechaza() {
        Oficina ofi = oficina(6, 3, 0);
        Practicante existente = new Practicante();
        when(practicanteRepository.findById(7L)).thenReturn(Optional.of(existente));
        mockCatalogos(1, ofi);
        assertThrows(BusinessException.class, () -> service.actualizar(7L, req(1, 6, "D8")));
    }
}
