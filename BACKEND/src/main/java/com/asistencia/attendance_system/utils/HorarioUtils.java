package com.asistencia.attendance_system.utils;

import java.time.LocalTime;

/**
 * Utilidad centralizada para cálculo de horas trabajadas.
 * Regla: Almuerzo 13:00-14:00 NO cuenta. Solo se descuenta el solapamiento real.
 */
public final class HorarioUtils {

    private static final LocalTime ALMUERZO_INICIO = LocalTime.of(13, 0);
    private static final LocalTime ALMUERZO_FIN = LocalTime.of(14, 0);
    private static final int ALMUERZO_MAX_MINUTOS = 60;

    private HorarioUtils() {}

    /**
     * Calcula solapamiento en minutos entre [inicio, fin) y [13:00, 14:00)
     */
    public static long calcularSolapamientoAlmuerzo(LocalTime inicio, LocalTime fin) {
        if (inicio == null || fin == null || !inicio.isBefore(fin)) return 0;
        LocalTime solapamientoInicio = inicio.isAfter(ALMUERZO_INICIO) ? inicio : ALMUERZO_INICIO;
        LocalTime solapamientoFin = fin.isBefore(ALMUERZO_FIN) ? fin : ALMUERZO_FIN;
        if (!solapamientoInicio.isBefore(solapamientoFin)) return 0;
        long minutos = java.time.Duration.between(solapamientoInicio, solapamientoFin).toMinutes();
        return Math.min(minutos, ALMUERZO_MAX_MINUTOS);
    }

    /**
     * Calcula minutos efectivamente trabajados entre entrada y salida,
     * descontando solo el solapamiento real con 13:00-14:00.
     * Retorna -1 si entrada >= salida o nulo (indica inválido).
     */
    public static long calcularMinutosTrabajados(LocalTime entrada, LocalTime salida) {
        if (entrada == null || salida == null || !entrada.isBefore(salida)) return -1;
        long duracionTotal = java.time.Duration.between(entrada, salida).toMinutes();
        long solapamiento = calcularSolapamientoAlmuerzo(entrada, salida);
        return duracionTotal - solapamiento;
    }

    /**
     * Formatea minutos a "X h" o "X h Y min" para logs
     */
    public static String formatHorasMinutos(long minutos) {
        long h = minutos / 60;
        long m = minutos % 60;
        if (m == 0) return h + " h";
        return h + " h " + m + " min";
    }
}
