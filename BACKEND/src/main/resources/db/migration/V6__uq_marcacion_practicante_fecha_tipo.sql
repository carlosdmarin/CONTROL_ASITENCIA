-- Migración: impedir ENTRADA/SALIDA duplicadas el mismo día por concurrencia.
-- Alcance exacto: (id_practicante, fecha, tipo_marcacion). Permite ENTRADA+SALIDA el mismo
-- día y cualquier marcación de días distintos. Verificar antes de aplicar que no existan
-- duplicados: SELECT id_practicante, fecha, tipo_marcacion, COUNT(*) FROM Marcacion
-- GROUP BY 1,2,3 HAVING COUNT(*) > 1; debe devolver 0 filas.
ALTER TABLE Marcacion ADD CONSTRAINT uq_marcacion_practicante_fecha_tipo UNIQUE (id_practicante, fecha, tipo_marcacion);
