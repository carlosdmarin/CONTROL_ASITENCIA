package com.asistencia.attendance_system.service;

import com.asistencia.attendance_system.utils.HorarioUtils;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Modalidad de jornada por bloque: NORMAL descuenta refrigerio 13:00-14:00,
 * CORRIDO no descuenta. El overload de 2 args conserva el comportamiento histórico.
 */
public class HorarioJornadaTest {

    private static LocalTime t(int h, int m) {
        return LocalTime.of(h, m);
    }

    @Test
    public void normal_0730_1700_descuentaUnaHora() {
        assertEquals(510, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(17, 0), true));
        assertEquals(510, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(17, 0)));
        assertEquals(510, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(17, 0), null));
    }

    @Test
    public void corrido_0730_1700_noDescuenta() {
        assertEquals(570, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(17, 0), false));
    }

    @Test
    public void sinCruceRefrigerio_igualEnAmbas() {
        assertEquals(330, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(13, 0), true));
        assertEquals(330, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(13, 0), false));
    }

    @Test
    public void cruceParcial_soloNormalDescuentaSolape() {
        // 12:00-15:00 = 180 min, solapa 60 con 13:00-14:00
        assertEquals(120, HorarioUtils.calcularMinutosTrabajados(t(12, 0), t(15, 0), true));
        assertEquals(180, HorarioUtils.calcularMinutosTrabajados(t(12, 0), t(15, 0), false));
    }

    @Test
    public void horarioCorto_igualEnAmbas() {
        assertEquals(30, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(8, 0), true));
        assertEquals(30, HorarioUtils.calcularMinutosTrabajados(t(7, 30), t(8, 0), false));
    }

    @Test
    public void casosInvalidos_menosUnoEnAmbas() {
        assertEquals(-1, HorarioUtils.calcularMinutosTrabajados(t(17, 0), t(7, 30), true));
        assertEquals(-1, HorarioUtils.calcularMinutosTrabajados(t(17, 0), t(7, 30), false));
        assertEquals(-1, HorarioUtils.calcularMinutosTrabajados(t(8, 0), t(8, 0), false));
        assertEquals(-1, HorarioUtils.calcularMinutosTrabajados(null, t(8, 0), false));
        assertEquals(-1, HorarioUtils.calcularMinutosTrabajados(t(8, 0), null, true));
    }
}
