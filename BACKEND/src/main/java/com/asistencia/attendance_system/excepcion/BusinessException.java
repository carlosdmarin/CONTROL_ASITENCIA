package com.asistencia.attendance_system.excepcion;

import org.springframework.http.HttpStatus;

/**
 * Excepción de negocio para reglas Áreas → Practicantes → Asistencia
 * Permite devolver 409 CONFLICT o 400 BAD_REQUEST con mensaje claro para el frontend.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public BusinessException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    public HttpStatus getStatus() {
        return status;
    }
}
