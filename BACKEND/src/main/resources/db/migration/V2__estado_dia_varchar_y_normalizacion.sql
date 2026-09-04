-- Migración segura: ENUM -> VARCHAR(20) y normalización histórica
-- Ejecutar manualmente en MySQL/MariaDB asistencia_db
-- No borra registros, solo amplía tipo y normaliza valores antiguos

-- 1) Verificar valores existentes antes de migrar
-- SELECT estado_dia, COUNT(*) FROM Asistencia_Diaria GROUP BY estado_dia;

-- 2) Ampliar columna de ENUM a VARCHAR(20) para evitar Data truncated
ALTER TABLE Asistencia_Diaria MODIFY COLUMN estado_dia VARCHAR(20) NOT NULL;

-- 3) Normalizar históricos: FALTA -> AUSENTE, TARDE -> TARDANZA (canónicos)
UPDATE Asistencia_Diaria SET estado_dia = 'AUSENTE' WHERE estado_dia = 'FALTA';
UPDATE Asistencia_Diaria SET estado_dia = 'TARDANZA' WHERE estado_dia = 'TARDE';

-- 4) Verificar después
-- SELECT estado_dia, COUNT(*) FROM Asistencia_Diaria GROUP BY estado_dia;
-- SHOW COLUMNS FROM Asistencia_Diaria LIKE 'estado_dia';
