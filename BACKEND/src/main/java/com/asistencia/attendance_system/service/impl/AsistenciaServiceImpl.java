package com.asistencia.attendance_system.service.impl;

import com.asistencia.attendance_system.model.dto.AsistenciaDiariaResponse;
import com.asistencia.attendance_system.model.dto.MarcacionRequest;
import com.asistencia.attendance_system.model.dto.MarcacionResponse;
import com.asistencia.attendance_system.model.dto.ResumenAsistenciaDTO;
import com.asistencia.attendance_system.model.entity.AsistenciaDiaria;
import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.entity.Justificacion;
import com.asistencia.attendance_system.model.entity.Marcacion;
import com.asistencia.attendance_system.model.entity.Practicante;
import com.asistencia.attendance_system.model.entity.Sede;
import com.asistencia.attendance_system.model.enums.Agencia;
import com.asistencia.attendance_system.model.enums.EstadoDia;
import com.asistencia.attendance_system.model.enums.EstadoJustificacion;
import com.asistencia.attendance_system.model.enums.MetodoRegistro;
import com.asistencia.attendance_system.model.enums.TipoJustificacion;
import com.asistencia.attendance_system.model.enums.TipoMarcacion;
import com.asistencia.attendance_system.repository.AsistenciaDiariaRepository;
import com.asistencia.attendance_system.repository.JustificacionRepository;
import com.asistencia.attendance_system.repository.MarcacionRepository;
import com.asistencia.attendance_system.repository.PracticanteRepository;
import com.asistencia.attendance_system.service.AsistenciaService;
import com.asistencia.attendance_system.service.CalculadoraEstadoAsistencia;
import com.asistencia.attendance_system.service.HorarioService;
import com.asistencia.attendance_system.utils.HorarioUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AsistenciaServiceImpl implements AsistenciaService {

    private static final ZoneId ZONA_LIMA = ZoneId.of("America/Lima");

    private final MarcacionRepository marcacionRepository;
    private final AsistenciaDiariaRepository asistenciaDiariaRepository;
    private final PracticanteRepository practicanteRepository;
    private final HorarioService horarioService;
    private final JustificacionRepository justificacionRepository;
    private final CalculadoraEstadoAsistencia calculadoraEstado;

    // ========== Helpers zona horaria ==========
    private LocalDate hoyLima() {
        return ZonedDateTime.now(ZONA_LIMA).toLocalDate();
    }
    private LocalTime ahoraLima() {
        return ZonedDateTime.now(ZONA_LIMA).toLocalTime();
    }

    private boolean tieneJustificacionAprobada(Long idPracticante, LocalDate fecha) {
        List<Justificacion> js = justificacionRepository.findJustificacionesEnRango(idPracticante, fecha, fecha);
        return js.stream().anyMatch(j -> j.getEstado() == EstadoJustificacion.APROBADO);
    }

    private String calcularEstadoVisual(AsistenciaDiaria ad) {
        EstadoDia e = ad.getEstadoDia() != null ? ad.getEstadoDia().normalizado() : EstadoDia.SIN_MARCAR;
        boolean just = Boolean.TRUE.equals(ad.getJustificado());
        if (just) {
            if (e == EstadoDia.TARDANZA) return "TARDANZA_JUSTIFICADA";
            if (e == EstadoDia.AUSENTE || e == EstadoDia.JUSTIFICADO) return "INASISTENCIA_JUSTIFICADA";
            if (e == EstadoDia.JUSTIFICADO) return "INASISTENCIA_JUSTIFICADA";
            return e.name() + "_JUSTIFICADA";
        }
        return e.name();
    }

    // ========== MARCACION QR ==========
    @Override
    public MarcacionResponse registrarMarcacion(MarcacionRequest request) {
        log.info("Registrando marcación para practicante: {}", request.getDocumento());

        Practicante practicante = practicanteRepository.findByDocumento(request.getDocumento())
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado con código: " + request.getDocumento()));

        // Usar zona America/Lima
        LocalDate fecha = hoyLima();
        LocalTime hora = ahoraLima();

        // Verificar si hoy es laborable según horario del practicante
        Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(practicante.getIdPracticante(), fecha);
        if (bloqueOpt.isEmpty()) {
            throw new RuntimeException("Hoy es tu día de descanso según tu horario. No puedes marcar asistencia.");
        }
        BloqueHorario bloque = bloqueOpt.get();
        LocalTime entradaEsperada = bloque.getHoraInicio();
        LocalTime salidaEsperada = bloque.getHoraFin();

        // Lógica automática ENTRADA/SALIDA: si ya marcó entrada, la siguiente es salida
        TipoMarcacion tipo;
        try {
            tipo = TipoMarcacion.valueOf(request.getTipoMarcacion());
        } catch (Exception e) {
            tipo = yaMarcoEntradaHoy(practicante.getIdPracticante()) ? TipoMarcacion.SALIDA : TipoMarcacion.ENTRADA;
        }

        // Auto-switch: si pide ENTRADA pero ya tiene entrada, cambiar a SALIDA
        if (tipo == TipoMarcacion.ENTRADA && yaMarcoEntradaHoy(practicante.getIdPracticante())) {
            if (!yaMarcoSalidaHoy(practicante.getIdPracticante())) {
                tipo = TipoMarcacion.SALIDA;
                log.info("Cambiando a SALIDA automáticamente para {}", practicante.getDocumento());
            } else {
                throw new RuntimeException("La jornada de hoy ya está registrada. Ya registraste entrada y salida hoy.");
            }
        }
        if (tipo == TipoMarcacion.SALIDA && yaMarcoSalidaHoy(practicante.getIdPracticante())) {
            throw new RuntimeException("Ya registraste tu salida hoy. La jornada de hoy ya está registrada.");
        }

        // REGLA 6: Si intenta registrar ENTRADA cuando jornada ya terminó => bloquear
        if (tipo == TipoMarcacion.ENTRADA) {
            // Si hora actual > salidaEsperada => jornada de ingreso ya terminó
            if (hora.isAfter(salidaEsperada)) {
                throw new RuntimeException("La jornada de ingreso ya terminó. No es posible registrar una entrada para esta jornada.");
            }
        }

        // Si pide SALIDA sin haber marcado ENTRADA, permitir pero advertir (RH podrá corregir manual)
        if (tipo == TipoMarcacion.SALIDA && !yaMarcoEntradaHoy(practicante.getIdPracticante())) {
            log.warn("Marcando SALIDA sin ENTRADA previa para {}", practicante.getDocumento());
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
        log.info("Marcación registrada: {} - {} a las {}", tipo, practicante.getDocumento(), hora);

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
        response.setMensaje(tipo == TipoMarcacion.ENTRADA ? "Entrada registrada correctamente" : "Salida registrada correctamente");
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
    public List<MarcacionResponse> obtenerMarcacionesRecientes(int limite) {
        int l = limite <= 0 ? 20 : Math.min(limite, 50);
        List<Marcacion> todas = marcacionRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaRegistro"));
        return todas.stream().limit(l).map(this::convertMarcacionToResponse).collect(Collectors.toList());
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
        return marcacionRepository.yaMarcoEntradaHoy(idPracticante, hoyLima());
    }

    @Override
    public boolean yaMarcoSalidaHoy(Long idPracticante) {
        return marcacionRepository.yaMarcoSalidaHoy(idPracticante, hoyLima());
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
        resumen.setHorasSemanalesRequeridas(practicante.getCargo().getHorasSemanales());

        long presentes = asistencias.stream().filter(a -> a.getEstadoDia() != null && a.getEstadoDia().normalizado() == EstadoDia.PRESENTE).count();
        long tardes = asistencias.stream().filter(a -> a.getEstadoDia() != null && a.getEstadoDia().esTardanza()).count();
        long faltas = asistencias.stream().filter(a -> a.getEstadoDia() != null && a.getEstadoDia().esAusente()).count();
        long justificados = asistencias.stream().filter(a -> Boolean.TRUE.equals(a.getJustificado()) || (a.getEstadoDia() != null && a.getEstadoDia() == EstadoDia.JUSTIFICADO)).count();

        resumen.setDiasPresente((int) presentes);
        resumen.setDiasTarde((int) tardes);
        resumen.setDiasFalta((int) faltas);
        resumen.setDiasJustificado((int) justificados);

        BigDecimal horasCumplidas = asistencias.stream()
                .map(a -> a.getHorasTrabajadas() != null ? a.getHorasTrabajadas() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resumen.setHorasCumplidas(horasCumplidas.intValue());
        resumen.setHorasPendientes(practicante.getCargo().getHorasSemanales() - horasCumplidas.intValue());
        double porcentaje = horasCumplidas.doubleValue() / practicante.getCargo().getHorasSemanales() * 100;
        resumen.setPorcentajeCumplimiento(Math.min(porcentaje, 100));
        resumen.setEstadoSemanal(horasCumplidas.doubleValue() >= practicante.getCargo().getHorasSemanales() ? "CUMPLIDO" : "INCOMPLETO");
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
        Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(idPracticante, fecha);

        // Si no hay horario ese día -> DESCANSO, no generar ausencia
        if (bloqueOpt.isEmpty()) {
            AsistenciaDiaria asistencia = asistenciaDiariaRepository
                    .findByPracticante_IdPracticanteAndFecha(idPracticante, fecha)
                    .orElse(new AsistenciaDiaria());
            asistencia.setPracticante(practicante);
            asistencia.setFecha(fecha);
            asistencia.setEstadoDia(EstadoDia.DESCANSO);
            asistencia.setHorasTrabajadas(BigDecimal.ZERO);
            asistencia.setMinutosTardanza(0);
            // No guardar si no existe? Guardamos solo si ya existía, sino no creamos registro de descanso
            // Para simplicidad, no creamos registro DESCANSO persistido si no había marcación
            if (asistencia.getIdAsistencia() != null) {
                asistenciaDiariaRepository.save(asistencia);
            }
            return;
        }

        BloqueHorario bloque = bloqueOpt.get();
        LocalTime entradaEsperada = bloque.getHoraInicio();
        LocalTime salidaEsperada = bloque.getHoraFin();

        boolean hasJustificacion = tieneJustificacionAprobada(idPracticante, fecha);

        if (marcaciones.isEmpty()) {
            EstadoDia estado = calculadoraEstado.estadoSinEntrada(bloque, fecha, hoyLima(), ahoraLima(), hasJustificacion);
            AsistenciaDiaria asistencia = asistenciaDiariaRepository
                    .findByPracticante_IdPracticanteAndFecha(idPracticante, fecha)
                    .orElse(new AsistenciaDiaria());
            // Si ya estaba justificado, mantener justificado
            Boolean yaJust = asistencia.getJustificado();
            if (hasJustificacion) {
                asistencia.setJustificado(true);
                if (asistencia.getJustificacionTipo() == null) asistencia.setJustificacionTipo("PERMISO");
            } else if (yaJust != null) {
                // mantener
            } else {
                asistencia.setJustificado(false);
            }
            asistencia.setPracticante(practicante);
            asistencia.setFecha(fecha);
            asistencia.setEstadoDia(estado);
            asistencia.setEntradaEsperada(entradaEsperada);
            asistencia.setSalidaEsperada(salidaEsperada);
            asistencia.setHorasTrabajadas(BigDecimal.ZERO);
            asistencia.setMinutosTardanza(0);
            // Si es SIN_MARCAR, no persistir si no existía? Sí persistimos para visualizar SIN_MARCAR
            asistenciaDiariaRepository.save(asistencia);
            return;
        }

        // Hay marcaciones: determinar entradaReal/salidaReal
        LocalTime entradaReal = null;
        LocalTime salidaReal = null;
        for (Marcacion m : marcaciones) {
            if (m.getTipoMarcacion() == TipoMarcacion.ENTRADA) {
                if (entradaReal == null || m.getHoraMarcacion().isBefore(entradaReal)) entradaReal = m.getHoraMarcacion();
            } else if (m.getTipoMarcacion() == TipoMarcacion.SALIDA) {
                if (salidaReal == null || m.getHoraMarcacion().isAfter(salidaReal)) salidaReal = m.getHoraMarcacion();
            }
        }
        // Si solo hay SALIDA sin ENTRADA, entradaReal queda null -> estado SIN_MARCAR o AUSENTE según hora

        BigDecimal horasTrabajadas = BigDecimal.ZERO;
        if (entradaReal != null && salidaReal != null) {
            long minutosTrabajados = HorarioUtils.calcularMinutosTrabajados(entradaReal, salidaReal);
            if (minutosTrabajados >= 0) {
                horasTrabajadas = BigDecimal.valueOf(minutosTrabajados / 60.0);
            }
        }

        EstadoDia estado;
        Integer minutosTardanza = 0;
        if (entradaReal != null) {
            estado = calculadoraEstado.estadoConEntrada(entradaReal, entradaEsperada);
            if (estado == EstadoDia.TARDANZA) {
                minutosTardanza = (int) java.time.Duration.between(entradaEsperada, entradaReal).toMinutes();
            }
        } else {
            estado = calculadoraEstado.estadoSinEntrada(bloque, fecha, hoyLima(), ahoraLima(), hasJustificacion);
        }

        AsistenciaDiaria asistencia = asistenciaDiariaRepository
                .findByPracticante_IdPracticanteAndFecha(idPracticante, fecha)
                .orElse(new AsistenciaDiaria());

        // Preservar justificación existente
        if (hasJustificacion) {
            asistencia.setJustificado(true);
        } else if (asistencia.getJustificado() == null) {
            asistencia.setJustificado(false);
        }

        asistencia.setPracticante(practicante);
        asistencia.setFecha(fecha);
        asistencia.setEstadoDia(estado);
        asistencia.setHorasTrabajadas(horasTrabajadas);
        asistencia.setMinutosTardanza(minutosTardanza);
        asistencia.setEntradaEsperada(entradaEsperada);
        asistencia.setSalidaEsperada(salidaEsperada);
        asistencia.setEntradaReal(entradaReal);
        asistencia.setSalidaReal(salidaReal);

        asistenciaDiariaRepository.save(asistencia);
        log.info("Asistencia diaria procesada para {} - Estado: {} (justificado={})", practicante.getDocumento(), estado, asistencia.getJustificado());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsistenciaDiariaResponse> obtenerAsistenciasDelDia(LocalDate fecha) {
        List<Practicante> activos = practicanteRepository.findBySituacion(com.asistencia.attendance_system.model.enums.Situacion.ACTIVO);
        LocalDate hoy = hoyLima();
        LocalTime ahora = ahoraLima();
        return activos.stream().map(p -> {
            AsistenciaDiaria ad = asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFecha(p.getIdPracticante(), fecha).orElse(null);
            if (ad == null) {
                boolean esLaborable = horarioService.esDiaLaborable(p.getIdPracticante(), fecha);
                if (!esLaborable) {
                    AsistenciaDiaria virtual = new AsistenciaDiaria();
                    virtual.setPracticante(p);
                    virtual.setFecha(fecha);
                    virtual.setEstadoDia(EstadoDia.DESCANSO);
                    virtual.setHorasTrabajadas(BigDecimal.ZERO);
                    virtual.setMinutosTardanza(0);
                    Optional<BloqueHorario> b = horarioService.obtenerBloqueDelDia(p.getIdPracticante(), fecha);
                    b.ifPresent(bloque -> {
                        virtual.setEntradaEsperada(bloque.getHoraInicio());
                        virtual.setSalidaEsperada(bloque.getHoraFin());
                    });
                    virtual.setJustificado(false);
                    return convertAsistenciaToResponse(virtual);
                }
                boolean hasJust = tieneJustificacionAprobada(p.getIdPracticante(), fecha);
                Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(p.getIdPracticante(), fecha);
                EstadoDia estado = calculadoraEstado.estadoSinEntrada(bloqueOpt.orElse(null), fecha, hoy, ahora, hasJust);
                AsistenciaDiaria virtual = new AsistenciaDiaria();
                virtual.setPracticante(p);
                virtual.setFecha(fecha);
                virtual.setEstadoDia(estado);
                virtual.setHorasTrabajadas(BigDecimal.ZERO);
                virtual.setMinutosTardanza(0);
                horarioService.obtenerBloqueDelDia(p.getIdPracticante(), fecha).ifPresent(bloque -> {
                    virtual.setEntradaEsperada(bloque.getHoraInicio());
                    virtual.setSalidaEsperada(bloque.getHoraFin());
                });
                virtual.setJustificado(hasJust);
                if (hasJust) {
                    var js = justificacionRepository.findJustificacionesEnRango(p.getIdPracticante(), fecha, fecha);
                    js.stream().filter(j -> j.getEstado() == EstadoJustificacion.APROBADO).findFirst().ifPresent(j -> {
                        virtual.setJustificacionMotivo(j.getMotivo());
                        virtual.setJustificacionTipo(j.getTipoJustificacion() != null ? j.getTipoJustificacion().name() : "PERMISO");
                    });
                }
                return convertAsistenciaToResponse(virtual);
            }
            // Solo cálculo visual, sin persistir: si es SIN_MARCAR y ya venció la jornada, mostrar como AUSENTE sin save()
            EstadoDia estadoActual = ad.getEstadoDia() != null ? ad.getEstadoDia().normalizado() : EstadoDia.SIN_MARCAR;
            boolean hasJust = tieneJustificacionAprobada(p.getIdPracticante(), fecha);
            EstadoDia estadoVisualizado = ad.getEstadoDia();
            if (estadoActual == EstadoDia.SIN_MARCAR && !hasJust && ad.getEstadoDia() != EstadoDia.DESCANSO) {
                Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(p.getIdPracticante(), fecha);
                EstadoDia estadoCalculado = calculadoraEstado.estadoSinEntrada(bloqueOpt.orElse(null), fecha, hoy, ahora, hasJust);
                if (estadoCalculado == EstadoDia.AUSENTE) {
                    // No se persiste aquí; el cierre lo hace el scheduler/proceso de escritura
                    // Se crea una copia virtual para no mutar la entidad gestionada
                    AsistenciaDiaria copia = new AsistenciaDiaria();
                    copia.setIdAsistencia(ad.getIdAsistencia());
                    copia.setPracticante(ad.getPracticante());
                    copia.setFecha(ad.getFecha());
                    copia.setEstadoDia(EstadoDia.AUSENTE);
                    copia.setHorasTrabajadas(ad.getHorasTrabajadas());
                    copia.setMinutosTardanza(ad.getMinutosTardanza());
                    copia.setEntradaEsperada(ad.getEntradaEsperada());
                    copia.setSalidaEsperada(ad.getSalidaEsperada());
                    copia.setEntradaReal(ad.getEntradaReal());
                    copia.setSalidaReal(ad.getSalidaReal());
                    copia.setObservaciones(ad.getObservaciones());
                    copia.setJustificado(ad.getJustificado());
                    copia.setJustificacionMotivo(ad.getJustificacionMotivo());
                    copia.setJustificacionObservacion(ad.getJustificacionObservacion());
                    copia.setJustificacionFecha(ad.getJustificacionFecha());
                    copia.setJustificacionTipo(ad.getJustificacionTipo());
                    return convertAsistenciaToResponse(copia);
                }
            }
            // Si tiene justificación aprobada, reflejar solo en respuesta sin mutar entidad
            if (!Boolean.TRUE.equals(ad.getJustificado()) && hasJust) {
                AsistenciaDiaria copiaJust = new AsistenciaDiaria();
                copiaJust.setIdAsistencia(ad.getIdAsistencia());
                copiaJust.setPracticante(ad.getPracticante());
                copiaJust.setFecha(ad.getFecha());
                copiaJust.setEstadoDia(ad.getEstadoDia());
                copiaJust.setHorasTrabajadas(ad.getHorasTrabajadas());
                copiaJust.setMinutosTardanza(ad.getMinutosTardanza());
                copiaJust.setEntradaEsperada(ad.getEntradaEsperada());
                copiaJust.setSalidaEsperada(ad.getSalidaEsperada());
                copiaJust.setEntradaReal(ad.getEntradaReal());
                copiaJust.setSalidaReal(ad.getSalidaReal());
                copiaJust.setObservaciones(ad.getObservaciones());
                copiaJust.setJustificado(true);
                copiaJust.setJustificacionMotivo(ad.getJustificacionMotivo());
                copiaJust.setJustificacionObservacion(ad.getJustificacionObservacion());
                copiaJust.setJustificacionFecha(ad.getJustificacionFecha());
                copiaJust.setJustificacionTipo(ad.getJustificacionTipo());
                return convertAsistenciaToResponse(copiaJust);
            }
            return convertAsistenciaToResponse(ad);
        }).collect(Collectors.toList());
    }

    @Override
    public ResumenAsistenciaDTO obtenerResumenDiario(LocalDate fecha) {
        List<AsistenciaDiariaResponse> delDia = obtenerAsistenciasDelDia(fecha);
        long total = delDia.size();
        long presentes = delDia.stream().filter(a -> "PRESENTE".equals(a.getEstadoDia()) || "PRESENTE".equals(a.getEstadoVisual())).count();
        long tardanzas = delDia.stream().filter(a -> "TARDANZA".equals(a.getEstadoDia())).count();
        long ausentes = delDia.stream().filter(a -> "AUSENTE".equals(a.getEstadoDia())).filter(a -> !Boolean.TRUE.equals(a.getJustificado())).count();
        long justificados = delDia.stream().filter(a -> Boolean.TRUE.equals(a.getJustificado()) || "JUSTIFICADO".equals(a.getEstadoDia())).count();
        long descansos = delDia.stream().filter(a -> "DESCANSO".equals(a.getEstadoDia())).count();
        long sinMarcar = delDia.stream().filter(a -> "SIN_MARCAR".equals(a.getEstadoDia())).count();
        ResumenAsistenciaDTO r = new ResumenAsistenciaDTO();
        r.setIdPracticante(0L);
        r.setNombreCompleto("Resumen Diario");
        r.setSede("");
        r.setCargo("");
        r.setHorasSemanalesRequeridas(0);
        r.setHorasCumplidas((int) presentes);
        r.setHorasPendientes((int) ausentes);
        r.setDiasPresente((int) presentes);
        r.setDiasTarde((int) tardanzas);
        r.setDiasFalta((int) ausentes);
        r.setDiasJustificado((int) justificados);
        r.setPorcentajeCumplimiento(total == 0 ? 0 : (presentes * 100.0 / total));
        r.setEstadoSemanal(total == 0 ? "INCOMPLETO" : (ausentes == 0 ? "CUMPLIDO" : "INCOMPLETO"));
        return r;
    }

    @Override
    public void procesarAsistenciasPendientes(LocalDate fecha) {
        log.info("Procesando asistencias pendientes para fecha: {}", fecha);
        cerrarJornadaDelDia(fecha);
    }

    @Override
    public void generarJornadaSemanal(Long idPracticante, LocalDate fechaInicio) {
        log.info("Generando jornada semanal para practicante ID: {} - semana: {}", idPracticante, fechaInicio);
    }

    // ========== JUSTIFICAR / PERMISO / CORRECCION ==========
    @Override
    public AsistenciaDiariaResponse justificarAsistencia(Long idAsistencia, String motivo, String observacion, String tipo) {
        AsistenciaDiaria ad = asistenciaDiariaRepository.findById(idAsistencia)
                .orElseThrow(() -> new RuntimeException("Asistencia no encontrada"));
        ad.setJustificado(true);
        ad.setJustificacionMotivo(motivo);
        ad.setJustificacionObservacion(observacion);
        ad.setJustificacionTipo(tipo != null ? tipo : "OTRO");
        ad.setJustificacionFecha(LocalDateTime.now(ZONA_LIMA));

        // También crear registro en Justificacion para trazabilidad
        try {
            Justificacion j = new Justificacion();
            j.setPracticante(ad.getPracticante());
            j.setFechaInicio(ad.getFecha());
            j.setFechaFin(ad.getFecha());
            j.setMotivo(motivo);
            j.setObservaciones(observacion);
            j.setEstado(EstadoJustificacion.APROBADO);
            j.setFechaAprobacion(LocalDateTime.now(ZONA_LIMA));
            // mapear tipo
            try {
                j.setTipoJustificacion(TipoJustificacion.valueOf(tipo.toUpperCase()));
            } catch (Exception e) {
                j.setTipoJustificacion(TipoJustificacion.OTRO);
            }
            justificacionRepository.save(j);
        } catch (Exception e) {
            log.warn("No se pudo crear Justificacion asociada: {}", e.getMessage());
        }

        asistenciaDiariaRepository.save(ad);
        return convertAsistenciaToResponse(ad);
    }

    @Override
    public Justificacion registrarPermiso(Long idPracticante, LocalDate fecha, String motivo, String observacion, String tipoJustificacion) {
        Practicante p = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado"));
        Justificacion j = new Justificacion();
        j.setPracticante(p);
        j.setFechaInicio(fecha);
        j.setFechaFin(fecha);
        j.setMotivo(motivo);
        j.setObservaciones(observacion);
        j.setEstado(EstadoJustificacion.APROBADO);
        j.setFechaAprobacion(LocalDateTime.now(ZONA_LIMA));
        try {
            j.setTipoJustificacion(TipoJustificacion.valueOf(tipoJustificacion.toUpperCase()));
        } catch (Exception e) {
            j.setTipoJustificacion(TipoJustificacion.OTRO);
        }
        Justificacion saved = justificacionRepository.save(j);
        // Si ya existe asistencia ese día sin marcar, actualizar a JUSTIFICADO
        asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFecha(idPracticante, fecha).ifPresent(ad -> {
            ad.setJustificado(true);
            ad.setJustificacionMotivo(motivo);
            ad.setJustificacionObservacion(observacion);
            ad.setJustificacionTipo(tipoJustificacion);
            ad.setJustificacionFecha(LocalDateTime.now(ZONA_LIMA));
            if (ad.getEstadoDia() != null && (ad.getEstadoDia().normalizado() == EstadoDia.AUSENTE || ad.getEstadoDia().normalizado() == EstadoDia.SIN_MARCAR)) {
                ad.setEstadoDia(EstadoDia.JUSTIFICADO);
            }
            asistenciaDiariaRepository.save(ad);
        });
        return saved;
    }

    @Override
    public AsistenciaDiariaResponse corregirAsistenciaManual(Long idPracticante, LocalDate fecha, String horaEntrada, String horaSalida, String observaciones) {
        Practicante practicante = practicanteRepository.findById(idPracticante)
                .orElseThrow(() -> new RuntimeException("Practicante no encontrado"));
        AsistenciaDiaria ad = asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFecha(idPracticante, fecha)
                .orElse(new AsistenciaDiaria());
        ad.setPracticante(practicante);
        ad.setFecha(fecha);

        LocalTime entrada = null;
        LocalTime salida = null;
        try { if (horaEntrada != null && !horaEntrada.isBlank()) entrada = LocalTime.parse(horaEntrada); } catch (Exception e) { throw new RuntimeException("Formato horaEntrada inválido, use HH:mm"); }
        try { if (horaSalida != null && !horaSalida.isBlank()) salida = LocalTime.parse(horaSalida); } catch (Exception e) { throw new RuntimeException("Formato horaSalida inválido, use HH:mm"); }

        if (entrada != null && salida != null && !entrada.isBefore(salida)) {
            throw new RuntimeException("La hora de entrada debe ser anterior a la de salida");
        }

        ad.setEntradaReal(entrada);
        ad.setSalidaReal(salida);
        if (observaciones != null) ad.setObservaciones(observaciones);

        // Recalcular según horario esperado
        Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(idPracticante, fecha);
        if (bloqueOpt.isPresent()) {
            BloqueHorario b = bloqueOpt.get();
            ad.setEntradaEsperada(b.getHoraInicio());
            ad.setSalidaEsperada(b.getHoraFin());
            if (entrada != null) {
                ad.setEstadoDia(calculadoraEstado.estadoConEntrada(entrada, b.getHoraInicio()));
                if (ad.getEstadoDia() == EstadoDia.TARDANZA) {
                    ad.setMinutosTardanza((int) java.time.Duration.between(b.getHoraInicio(), entrada).toMinutes());
                } else {
                    ad.setMinutosTardanza(0);
                }
            } else {
                boolean hasJust = tieneJustificacionAprobada(idPracticante, fecha) || Boolean.TRUE.equals(ad.getJustificado());
                ad.setEstadoDia(calculadoraEstado.estadoSinEntrada(b, fecha, hoyLima(), ahoraLima(), hasJust));
                ad.setMinutosTardanza(0);
            }
            // horas trabajadas
            if (entrada != null && salida != null) {
                long mins = HorarioUtils.calcularMinutosTrabajados(entrada, salida);
                ad.setHorasTrabajadas(mins >= 0 ? BigDecimal.valueOf(mins / 60.0) : BigDecimal.ZERO);
            } else {
                ad.setHorasTrabajadas(BigDecimal.ZERO);
            }
        } else {
            // Sin bloque -> DESCANSO, pero si RH fuerza corrección, mantener PRESENTE si hay horas
            ad.setEstadoDia(EstadoDia.DESCANSO);
            ad.setHorasTrabajadas(BigDecimal.ZERO);
            ad.setMinutosTardanza(0);
        }

        AsistenciaDiaria saved = asistenciaDiariaRepository.save(ad);

        // Sincronizar Marcaciones para mantener consistencia historial: crear/actualizar marcaciones MANUAL
        // Si RH corrige entrada/salida, aseguramos que exista Marcacion de tipo ENTRADA/SALIDA con metodo MANUAL
        if (entrada != null) {
            Optional<Marcacion> existente = marcacionRepository.findEntradaDelDia(idPracticante, fecha);
            Marcacion m = existente.orElse(new Marcacion());
            m.setPracticante(practicante);
            m.setFecha(fecha);
            m.setHoraMarcacion(entrada);
            m.setTipoMarcacion(TipoMarcacion.ENTRADA);
            m.setMetodoRegistro(MetodoRegistro.MANUAL);
            m.setObservaciones("Corrección manual RH");
            marcacionRepository.save(m);
        }
        if (salida != null) {
            Optional<Marcacion> existente = marcacionRepository.findSalidaDelDia(idPracticante, fecha);
            Marcacion m = existente.orElse(new Marcacion());
            m.setPracticante(practicante);
            m.setFecha(fecha);
            m.setHoraMarcacion(salida);
            m.setTipoMarcacion(TipoMarcacion.SALIDA);
            m.setMetodoRegistro(MetodoRegistro.MANUAL);
            m.setObservaciones("Corrección manual RH");
            marcacionRepository.save(m);
        }

        return convertAsistenciaToResponse(saved);
    }

    @Override
    public int cerrarJornadaDelDia(LocalDate fecha) {
        // Regla: fecha futura no genera registros (America/Lima)
        if (fecha.isAfter(hoyLima())) {
            log.info("Cierre omitido para fecha futura {} (hoy {})", fecha, hoyLima());
            return 0;
        }
        // Convierte SIN_MARCAR -> AUSENTE para todos los activos laborables sin justificación una vez terminada la jornada
        List<Practicante> activos = practicanteRepository.findBySituacion(com.asistencia.attendance_system.model.enums.Situacion.ACTIVO);
        int actualizados = 0;
        for (Practicante p : activos) {
            Optional<BloqueHorario> bloqueOpt = horarioService.obtenerBloqueDelDia(p.getIdPracticante(), fecha);
            if (bloqueOpt.isEmpty()) continue; // descanso no genera ausencia
            boolean hasJust = tieneJustificacionAprobada(p.getIdPracticante(), fecha);
            if (hasJust) continue;
            AsistenciaDiaria ad = asistenciaDiariaRepository.findByPracticante_IdPracticanteAndFecha(p.getIdPracticante(), fecha).orElse(null);
            if (ad == null) {
                EstadoDia estado = calculadoraEstado.estadoSinEntrada(bloqueOpt.get(), fecha, hoyLima(), ahoraLima(), false);
                // Solo persiste si laborable (bloque != null); nunca AUSENTE futuro ya bloqueado por early return
                AsistenciaDiaria nueva = new AsistenciaDiaria();
                nueva.setPracticante(p);
                nueva.setFecha(fecha);
                nueva.setEstadoDia(estado);
                nueva.setEntradaEsperada(bloqueOpt.get().getHoraInicio());
                nueva.setSalidaEsperada(bloqueOpt.get().getHoraFin());
                nueva.setHorasTrabajadas(BigDecimal.ZERO);
                nueva.setMinutosTardanza(0);
                nueva.setJustificado(false);
                asistenciaDiariaRepository.save(nueva);
                if (estado == EstadoDia.AUSENTE) actualizados++;
            } else if (ad.getEstadoDia() != null && ad.getEstadoDia().normalizado() == EstadoDia.SIN_MARCAR) {
                if (calculadoraEstado.jornadaTerminada(bloqueOpt.get(), fecha, hoyLima(), fecha.equals(hoyLima()) ? ahoraLima() : LocalTime.MAX)) {
                    ad.setEstadoDia(EstadoDia.AUSENTE);
                    asistenciaDiariaRepository.save(ad);
                    actualizados++;
                }
            }
        }
        log.info("Cierre de jornada {}: {} asistencias actualizadas a AUSENTE", fecha, actualizados);
        return actualizados;
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
        response.setEstadoDia(asistencia.getEstadoDia() != null ? asistencia.getEstadoDia().normalizado().name() : EstadoDia.SIN_MARCAR.name());
        response.setHorasTrabajadas(asistencia.getHorasTrabajadas());
        response.setMinutosTardanza(asistencia.getMinutosTardanza());
        response.setEntradaEsperada(asistencia.getEntradaEsperada());
        response.setSalidaEsperada(asistencia.getSalidaEsperada());
        response.setEntradaReal(asistencia.getEntradaReal());
        response.setSalidaReal(asistencia.getSalidaReal());
        response.setObservaciones(asistencia.getObservaciones());
        response.setJustificado(asistencia.getJustificado());
        response.setJustificacionMotivo(asistencia.getJustificacionMotivo());
        response.setJustificacionObservacion(asistencia.getJustificacionObservacion());
        response.setJustificacionTipo(asistencia.getJustificacionTipo());
        if (asistencia.getJustificacionFecha() != null) response.setJustificacionFecha(asistencia.getJustificacionFecha().toString());
        response.setEstadoVisual(calcularEstadoVisual(asistencia));
        return response;
    }
}
