package com.asistencia.attendance_system.scheduler;

import com.asistencia.attendance_system.service.AsistenciaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AsistenciaCierreScheduler {

    private static final ZoneId ZONA_LIMA = ZoneId.of("America/Lima");
    private final AsistenciaService asistenciaService;

    /**
     * Cierre automático cada minuto en zona America/Lima.
     * Convierte SIN_MARCAR -> AUSENTE cuando ya se superó hora de salida individual.
     * También cubre cierre de ayer por si el servidor estuvo apagado.
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000)
    public void cierreAutomatico() {
        try {
            LocalDate hoy = ZonedDateTime.now(ZONA_LIMA).toLocalDate();
            int hoyCount = asistenciaService.cerrarJornadaDelDia(hoy);
            if (hoyCount > 0) log.info("[Scheduler] Cierre automático hoy {}: {} ausencias generadas", hoy, hoyCount);
            // Por si ayer quedó sin cerrar (servidor apagado), cerrar ayer también
            LocalDate ayer = hoy.minusDays(1);
            int ayerCount = asistenciaService.cerrarJornadaDelDia(ayer);
            if (ayerCount > 0) log.info("[Scheduler] Cierre automático ayer {}: {} ausencias generadas", ayer, ayerCount);
        } catch (Exception e) {
            log.error("[Scheduler] Error en cierre automático: {}", e.getMessage(), e);
        }
    }
}
