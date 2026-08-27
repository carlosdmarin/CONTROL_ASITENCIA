package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.MarcacionRequest;
import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.dto.ResumenAsistenciaDTO;
import com.asistencia.attendance_system.model.entity.AsistenciaDiaria;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.enums.Agencia;
import com.asistencia.attendance_system.model.enums.EstadoDia;
import com.asistencia.attendance_system.model.enums.MetodoRegistro;
import com.asistencia.attendance_system.model.enums.TipoMarcacion;
import com.asistencia.attendance_system.repository.AsistenciaDiariaRepository;
import com.asistencia.attendance_system.repository.MarcacionRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.service.AsistenciaService;
import com.asistencia.attendance_system.service.HorarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AsistenciaServiceImpl implements AsistenciaService {

    private final MarcacionRepository marcacionRepository;
    private final AsistenciaDiariaRepository asistenciaDiariaRepository;
    private final PracticanteRepository practicanteRepository;
    private final HorarioService horarioService;

    @Override
    public MarcacionResponse registrarMarcacion(MarcacionRequest request) {
        log.info("Registrando marcación para practicante: {}", request.getDocumento());

        Practicante practicante = practicanteRepository.findByDocumento(request.getDocumento())
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con código: " + request.getDocumento()));

        LocalDate fecha = LocalDate.now();
        LocalTime hora = LocalTime.now();

        if (!horarioService.esDiaLaborable(practicante.getIdPracticante(), fecha)) {
            throw new RuntimeException("El practicante no tiene actividades programadas para hoy");
        }

        if (!horarioService.debeEstarEnEmpresa(practicante.getIdPracticante(), fecha, hora.toString())) {
            throw new RuntimeException("El practicante no debe estar en la empresa en este momento");
        }

        TipoMarcacion tipo = TipoMarcacion.valueOf(request.getTipoMarcacion());

        if (tipo == TipoMarcacion.ENTRADA && yaMarcoEntradaHoy(practicante.getIdPracticante())) {
            throw new RuntimeException("El practicante ya marcó entrada hoy");
        }

        if (tipo == TipoMarcacion.SALIDA && yaMarcoSalidaHoy(practicante.getIdPracticante())) {
            throw new RuntimeException("El practicante ya marcó salida hoy");
        }

        Marcacion marcacion = new Marcacion();
        marcacion.setPracticante(practicante);
        marcacion.setFecha(fecha);
        marcacion.setHoraMarcacion(hora);
        marcacion.setTipoMarcacion(tipo);
        marcacion.setMetodoRegistro(MetodoRegistro.valueOf(request.getMetodoRegistro() != null ? request.getMetodoRegistro() : "QR"));
        marcacion.setCodigoQr(request.getCodigoQr());
        marcacion.setLatitud(request.getLatitud());
        marcacion.setLongitud(request.getLongitud());
        marcacion.setObservaciones(request.getObservaciones());

        Marcacion saved = marcacionRepository.save(marcacion);
        log.info("Marcación registrada: {} - {}", tipo, practicante.getDocumento());

        procesarAsistenciaDiaria(practicante.getIdPracticante(), fecha);

        MarcacionResponse response = new MarcacionResponse();
        response.setIdMarcacion(saved.getIdMarcacion());
        response.setDocumento(practicante.getDocumento());
        response.setNombreCompleto(practicante.getNombre() + " " + practicante.getApellido());
        response.setFecha(saved.getFecha());
        response.setHoraMarcacion(saved.getHoraMarcacion());
        response.setTipoMarcacion(saved.getTipoMarcacion().toString());
        response.setMetodoRegistro(saved.getMetodoRegistro().toString());
        response.setEstado("EXITOSA");
        response.setMensaje("Marcación registrada correctamente");
        response.setFechaRegistro(saved.getFechaRegistro());

        return response;
    }

    @Override
    public MarcacionResponse registrarEntrada(String documento) {
        MarcacionRequest request = new MarcacionRequest();
        request.setDocumento(documento);
        request.setTipoMarcacion("ENTRADA");
        request.setMetodoRegistro("QR");
        return registrarMarcacion(request);
    }

    @Override
    public MarcacionResponse registrarSalida(String documento) {
        MarcacionRequest request = new MarcacionRequest();
        request.setDocumento(documento);
        request.setTipoMarcacion("SALIDA");
        request.setMetodoRegistro("QR");
        return registrarMarcacion(request);
    }

    @Override
    public List<MarcacionResponse> obtenerMarcacionesPorPracticante(Long idPracticante) {
        return marcacionRepository.findByPracticante_IdPracticante(idPracticante).stream()
                .map(this::convertMarcacionToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MarcacionResponse> obtenerMarcacionesPorFecha(LocalDate fecha) {
        return marcacionRepository.findAll().stream()
                .filter(m -> m.getFecha().equals(fecha))
                .map(this::convertMarcacionToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MarcacionResponse> obtenerMarcacionesPorPracticanteYFecha(Long idPracticante, LocalDate fecha) {
        return marcacionRepository.findByPracticante_IdPracticanteAndFecha(idPracticante, fecha).stream()
                .map(this::convertMarcacionToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AsistenciaDiariaResponse obtenerAsistenciaDiaria(Long idPracticante, LocalDate fecha) {
        AsistenciaDiaria asistencia = asistenciaDiariaRepository
                .findByPracticante_IdPracticanteAndFecha(idPracticante, fecha)
                .orElseThrow(() -> new RuntimeException("No se encontró asistencia para la fecha"));
        return convertAsistenciaToResponse(asistencia);
    }

    @Override
    public List<AsistenciaDiariaResponse> obtenerAsistenciasPorPracticante(Long idPracticante) {
        return asistenciaDiariaRepository.findByPracticante_IdPracticante(idPracticante).stream()
                .map(this::convertAsistenciaToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AsistenciaDiariaResponse> obtenerAsistenciasPorPracticanteYMes(Long idPracticante, Integer mes, Integer anio) {
        LocalDate inicio = LocalDate.of(anio, mes, 1);
        LocalDate fin = inicio.with(TemporalAdjusters.lastDayOfMonth());

        return asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFechaBetween(idPracticante, inicio, fin).stream()
                .map(this::convertAsistenciaToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean yaMarcoEntradaHoy(Long idPracticante) {
        return marcacionRepository.yaMarcoEntradaHoy(idPracticante, LocalDate.now());
    }

    @Override
    public boolean yaMarcoSalidaHoy(Long idPracticante) {
        return marcacionRepository.yaMarcoSalidaHoy(idPracticante, LocalDate.now());
    }

    @Override
    public ResumenAsistenciaDTO obtenerResumenSemanal(Long idPracticante, LocalDate fechaInicio) {
        log.info("Generando resumen semanal para practicante ID: {}", idPracticante);

        Practicante practicante = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado"));

        LocalDate fechaFin = fechaInicio.plusDays(6);

        List<AsistenciaDiaria> asistencias = asistenciaDiariaRepository
                .findByPracticante_IdPracticanteAndFechaBetween(idPracticante, fechaInicio, fechaFin);

        ResumenAsistenciaDTO resumen = new ResumenAsistenciaDTO();
        resumen.setIdPracticante(idPracticante);
        resumen.setNombreCompleto(practicante.getNombre() + " " + practicante.getApellido());
        resumen.setDocumento(practicante.getDocumento());
        resumen.setSede(practicante.getSede().getNombre());
        resumen.setCargo(practicante.getCargo().getNombre());

        // ✅ CORREGIDO: Obtener horas desde el objeto Cargo
        resumen.setHorasSemanalesRequeridas(practicante.getCargo().getHorasSemanales());

        long presentes = asistencias.stream().filter(a -> a.getEstadoDia() == EstadoDia.PRESENTE).count();
        long tardes = asistencias.stream().filter(a -> a.getEstadoDia() == EstadoDia.TARDE).count();
        long faltas = asistencias.stream().filter(a -> a.getEstadoDia() == EstadoDia.FALTA).count();
        long justificados = asistencias.stream().filter(a -> a.getEstadoDia() == EstadoDia.JUSTIFICADO).count();

        resumen.setDiasPresente((int) presentes);
        resumen.setDiasTarde((int) tardes);
        resumen.setDiasFalta((int) faltas);
        resumen.setDiasJustificado((int) justificados);

        BigDecimal horasCumplidas = asistencias.stream()
                .map(AsistenciaDiaria::getHorasTrabajadas)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        resumen.setHorasCumplidas(horasCumplidas.intValue());

        // ✅ CORREGIDO: Obtener horas desde el objeto Cargo
        resumen.setHorasPendientes(practicante.getCargo().getHorasSemanales() - horasCumplidas.intValue());

        // ✅ CORREGIDO: Obtener horas desde el objeto Cargo
        double porcentaje = (horasCumplidas.doubleValue() / practicante.getCargo().getHorasSemanales()) * 100;
        resumen.setPorcentajeCumplimiento(Math.min(porcentaje, 100));

        // ✅ CORREGIDO: Obtener horas desde el objeto Cargo
        if (horasCumplidas.doubleValue() >= practicante.getCargo().getHorasSemanales()) {
            resumen.setEstadoSemanal("CUMPLIDO");
        } else {
            resumen.setEstadoSemanal("INCOMPLETO");
        }

        return resumen;
    }

    @Override
    public List<ResumenAsistenciaDTO> obtenerResumenSemanalPorSede(Sede sede, LocalDate fechaInicio) {
        return List.of();
    }

    @Override
    public List<ResumenAsistenciaDTO> obtenerResumenSemanalPorAgencia(Agencia agencia, LocalDate fechaInicio) {
        return List.of();
    }

    @Override
    public void procesarAsistenciaDiaria(Long idPracticante, LocalDate fecha) {
        log.info("Procesando asistencia diaria para practicante ID: {} - fecha: {}", idPracticante, fecha);

        Practicante practicante = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado"));

        List<Marcacion> marcaciones = marcacionRepository.findByPracticante_IdPracticanteAndFecha(idPracticante, fecha);

        if (marcaciones.isEmpty()) {
            AsistenciaDiaria asistencia = new AsistenciaDiaria();
            asistencia.setPracticante(practicante);
            asistencia.setFecha(fecha);
            asistencia.setEstadoDia(EstadoDia.FALTA);
            asistencia.setHorasTrabajadas(BigDecimal.ZERO);
            asistencia.setMinutosTardanza(0);
            asistenciaDiariaRepository.save(asistencia);
            return;
        }

        LocalTime entradaReal = null;
        LocalTime salidaReal = null;

        for (Marcacion m : marcaciones) {
            if (m.getTipoMarcacion() == TipoMarcacion.ENTRADA) {
                entradaReal = m.getHoraMarcacion();
            } else if (m.getTipoMarcacion() == TipoMarcacion.SALIDA) {
                salidaReal = m.getHoraMarcacion();
            }
        }

        BigDecimal horasTrabajadas = BigDecimal.ZERO;
        if (entradaReal != null && salidaReal != null) {
            long minutos = java.time.Duration.between(entradaReal, salidaReal).toMinutes();
            horasTrabajadas = BigDecimal.valueOf(minutos / 60.0);
        }

        EstadoDia estado = EstadoDia.PRESENTE;
        Integer minutosTardanza = 0;

        if (entradaReal != null) {
            LocalTime entradaEsperada = LocalTime.of(8, 0);
            if (entradaReal.isAfter(entradaEsperada.plusMinutes(5))) {
                estado = EstadoDia.TARDE;
                minutosTardanza = (int) java.time.Duration.between(entradaEsperada, entradaReal).toMinutes();
            }
        }

        AsistenciaDiaria asistencia = asistenciaDiariaRepository
                .findByPracticante_IdPracticanteAndFecha(idPracticante, fecha)
                .orElse(new AsistenciaDiaria());

        asistencia.setPracticante(practicante);
        asistencia.setFecha(fecha);
        asistencia.setEstadoDia(estado);
        asistencia.setHorasTrabajadas(horasTrabajadas);
        asistencia.setMinutosTardanza(minutosTardanza);
        asistencia.setEntradaReal(entradaReal);
        asistencia.setSalidaReal(salidaReal);

        asistenciaDiariaRepository.save(asistencia);
        log.info("Asistencia diaria procesada para {} - Estado: {}", practicante.getDocumento(), estado);
    }

    @Override
    public void procesarAsistenciasPendientes(LocalDate fecha) {
        log.info("Procesando asistencias pendientes para fecha: {}", fecha);
    }

    @Override
    public void generarJornadaSemanal(Long idPracticante, LocalDate fechaInicio) {
        log.info("Generando jornada semanal para practicante ID: {} - semana: {}", idPracticante, fechaInicio);
    }

    // ========== MÉTODOS PRIVADOS ==========

    private MarcacionResponse convertMarcacionToResponse(Marcacion marcacion) {
        MarcacionResponse response = new MarcacionResponse();
        response.setIdMarcacion(marcacion.getIdMarcacion());
        response.setDocumento(marcacion.getPracticante().getDocumento());
        response.setNombreCompleto(marcacion.getPracticante().getNombre() + " " + marcacion.getPracticante().getApellido());
        response.setFecha(marcacion.getFecha());
        response.setHoraMarcacion(marcacion.getHoraMarcacion());
        response.setTipoMarcacion(marcacion.getTipoMarcacion().toString());
        response.setMetodoRegistro(marcacion.getMetodoRegistro().toString());
        response.setFechaRegistro(marcacion.getFechaRegistro());
        response.setEstado("EXITOSA");
        response.setMensaje("Marcación registrada");
        return response;
    }

    private AsistenciaDiariaResponse convertAsistenciaToResponse(AsistenciaDiaria asistencia) {
        AsistenciaDiariaResponse response = new AsistenciaDiariaResponse();
        response.setIdAsistencia(asistencia.getIdAsistencia());
        response.setIdPracticante(asistencia.getPracticante().getIdPracticante());
        response.setNombreCompleto(asistencia.getPracticante().getNombre() + " " + asistencia.getPracticante().getApellido());
        response.setFecha(asistencia.getFecha());
        response.setEstadoDia(asistencia.getEstadoDia().toString());
        response.setHorasTrabajadas(asistencia.getHorasTrabajadas());
        response.setMinutosTardanza(asistencia.getMinutosTardanza());
        response.setEntradaEsperada(asistencia.getEntradaEsperada());
        response.setSalidaEsperada(asistencia.getSalidaEsperada());
        response.setEntradaReal(asistencia.getEntradaReal());
        response.setSalidaReal(asistencia.getSalidaReal());
        response.setObservaciones(asistencia.getObservaciones());
        return response;
    }
}