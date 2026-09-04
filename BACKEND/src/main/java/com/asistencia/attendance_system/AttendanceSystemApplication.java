package com.asistencia.attendance_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = "com.asistencia.attendance_system")
@EnableScheduling
public class AttendanceSystemApplication {
	public static void main(String[] args) {
		SpringApplication.run(AttendanceSystemApplication.class, args);
	}
}