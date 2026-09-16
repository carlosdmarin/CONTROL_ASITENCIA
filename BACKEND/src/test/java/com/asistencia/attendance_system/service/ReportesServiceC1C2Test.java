package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.model.entity.BloqueHorario;
import com.asistencia.attendance_system.model.enums.DiaSemana;
import com.asistencia.attendance_system.model.enums.TipoBloque;
import com.asistencia.attendance_system.utils.HorarioUtils;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ReportesServiceC1C2Test {

    private static final ZoneId ZONA_LIMA = ZoneId.of("America/Lima");

    private BigDecimal calcularHorasEsperadas(BloqueHorario bloque) {
        if (bloque == null || bloque.getHoraInicio() == null || bloque.getHoraFin() == null) return BigDecimal.ZERO;
        long mins = HorarioUtils.calcularMinutosTrabajados(bloque.getHoraInicio(), bloque.getHoraFin());
        if (mins < 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(mins).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    @Test
    void c1_510_minutos_es_8_50_horas() {
        BloqueHorario b = new BloqueHorario();
        b.setDiaSemana(DiaSemana.LUNES);
        b.setHoraInicio(LocalTime.of(7, 30));
        b.setHoraFin(LocalTime.of(17, 0));
        b.setTipoBloque(TipoBloque.TRABAJO);
        // 07:30-17:00 = 570 -60 almuerzo =510
        assertEquals(510, HorarioUtils.calcularMinutosTrabajados(b.getHoraInicio(), b.getHoraFin()));
        assertEquals(new BigDecimal("8.50"), calcularHorasEsperadas(b));
    }

    @Test
    void c1_330_minutos_es_5_50_horas() {
        BloqueHorario b = new BloqueHorario();
        b.setDiaSemana(DiaSemana.SABADO);
        b.setHoraInicio(LocalTime.of(7, 30));
        b.setHoraFin(LocalTime.of(13, 0));
        b.setTipoBloque(TipoBloque.TRABAJO);
        assertEquals(330, HorarioUtils.calcularMinutosTrabajados(b.getHoraInicio(), b.getHoraFin()));
        assertEquals(new BigDecimal("5.50"), calcularHorasEsperadas(b));
    }

    @Test
    void c1_no_usar_double_510_entre_60() {
        // Verifica que BigDecimal divide es exacto vs double
        BigDecimal viaBigDecimal = BigDecimal.valueOf(510).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        BigDecimal viaDouble = BigDecimal.valueOf(510 / 60.0); // double impreciso
        // viaDouble may be 8.5 but via string not exact 8.50
        assertEquals(new BigDecimal("8.50"), viaBigDecimal);
        // double path would be 8.5 with scale 1, not 2
        assertNotEquals(new BigDecimal("8.50"), viaDouble.stripTrailingZeros()); // ensure difference in scale handling
    }

    @Test
    void c2_futuro_no_evaluable() {
        CalculadoraEstadoAsistencia calc = new CalculadoraEstadoAsistencia();
        BloqueHorario bloque = new BloqueHorario();
        bloque.setHoraInicio(LocalTime.of(7, 30));
        bloque.setHoraFin(LocalTime.of(17, 0));
        bloque.setTipoBloque(TipoBloque.TRABAJO);
        bloque.setDiaSemana(DiaSemana.MARTES);
        LocalDate hoy = LocalDate.of(2026, 9, 16);
        LocalTime ahora10 = LocalTime.of(10, 0);
        LocalTime ahora1730 = LocalTime.of(17, 30);
        LocalDate futuro = LocalDate.of(2026, 9, 20);
        LocalDate hoyMismo = hoy;

        // A futuro siempre no terminada
        assertFalse(calc.jornadaTerminada(bloque, futuro, hoy, ahora10));
        // Hoy 10:00 antes de 17:00 -> no terminada
        assertFalse(calc.jornadaTerminada(bloque, hoyMismo, hoy, ahora10));
        // Hoy 17:30 después -> terminada
        assertTrue(calc.jornadaTerminada(bloque, hoyMismo, hoy, ahora1730));
        // Pasado siempre terminada
        assertTrue(calc.jornadaTerminada(bloque, LocalDate.of(2026, 9, 15), hoy, ahora10));
    }

    @Test
    void c2_mensual_isFuture_logica() {
        // Simula isFuture de mensual con jornadaTerminada
        CalculadoraEstadoAsistencia calc = new CalculadoraEstadoAsistencia();
        BloqueHorario bloque = new BloqueHorario();
        bloque.setHoraInicio(LocalTime.of(7, 30));
        bloque.setHoraFin(LocalTime.of(17, 0));
        bloque.setTipoBloque(TipoBloque.TRABAJO);
        LocalDate hoy = LocalDate.of(2026, 9, 16);
        LocalTime ahora10 = LocalTime.of(10, 0);
        LocalTime ahora1730 = LocalTime.of(17, 30);

        LocalDate futuro = LocalDate.of(2026, 9, 20);
        // isFuture = fecha.isAfter(hoy) || (hoy && !jornadaTerminada)
        boolean isFutureFuturo = futuro.isAfter(hoy) || (futuro.isEqual(hoy) && !calc.jornadaTerminada(bloque, futuro, hoy, ahora10));
        assertTrue(isFutureFuturo, "futuro debe ser evaluado como no evaluable");

        LocalDate hoyNotFinished = hoy;
        boolean isFutureHoy10 = hoyNotFinished.isAfter(hoy) || (hoyNotFinished.isEqual(hoy) && !calc.jornadaTerminada(bloque, hoyNotFinished, hoy, ahora10));
        assertTrue(isFutureHoy10, "hoy 10:00 no terminado debe ser futuro/no evaluable (Caso B/C)");

        boolean isFutureHoy1730 = hoyNotFinished.isAfter(hoy) || (hoyNotFinished.isEqual(hoy) && !calc.jornadaTerminada(bloque, hoyNotFinished, hoy, ahora1730));
        assertFalse(isFutureHoy1730, "hoy 17:30 terminado debe ser evaluable (Caso D)");

        LocalDate pasado = LocalDate.of(2026, 9, 15);
        boolean isFuturePasado = pasado.isAfter(hoy) || (pasado.isEqual(hoy) && !calc.jornadaTerminada(bloque, pasado, hoy, ahora10));
        assertFalse(isFuturePasado, "pasado debe ser evaluable (Caso E)");
    }
}
