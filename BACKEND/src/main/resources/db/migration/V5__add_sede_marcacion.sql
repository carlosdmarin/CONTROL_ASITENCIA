-- Migración: sede donde ocurrió el evento de marcación (multi-sede).
-- La sede asignada del practicante (Practicante.id_sede) NO se modifica: son conceptos distintos.
-- Nullable para conservar el historial existente (sede desconocida).
ALTER TABLE Marcacion ADD COLUMN sede_id INT(11) NULL AFTER id_practicante;
ALTER TABLE Marcacion ADD CONSTRAINT fk_marcacion_sede FOREIGN KEY (sede_id) REFERENCES sedes (IdSede);
