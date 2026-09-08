package com.asistencia.attendance_system.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenRangoDTO {
    private LocalDate fecha;
    private Integer presentes;
    private Integer tardanzas;
    private Integer faltas;
    private Integer total;
}
