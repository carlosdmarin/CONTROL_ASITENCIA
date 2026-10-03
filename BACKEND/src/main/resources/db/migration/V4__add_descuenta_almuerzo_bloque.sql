-- Migración: modalidad de jornada por bloque horario (NORMAL=1 descuenta refrigerio, CORRIDO=0 no descuenta)
-- Los registros existentes quedan en 1 para conservar el comportamiento actual.
ALTER TABLE Bloque_Horario ADD COLUMN descuenta_almuerzo TINYINT(1) NOT NULL DEFAULT 1 AFTER tipo_bloque;
UPDATE Bloque_Horario SET descuenta_almuerzo = 1 WHERE descuenta_almuerzo IS NULL OR descuenta_almuerzo <> 0;
