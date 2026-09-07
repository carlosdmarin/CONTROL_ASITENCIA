-- Migración: agregar fecha de desactivación para soft-delete de practicantes
ALTER TABLE Practicante ADD COLUMN fecha_desactivacion DATETIME NULL AFTER situacion;
