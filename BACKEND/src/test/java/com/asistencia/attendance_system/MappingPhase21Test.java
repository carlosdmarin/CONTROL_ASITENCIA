package com.asistencia.attendance_system;

import com.asistencia.attendance_system.model.entity.Trabajador;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.TrabajadorRepository;
import com.asistencia.attendance_system.repository.VigilanteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

@SpringBootTest
public class MappingPhase21Test {

    @Autowired
    private VigilanteRepository vigilanteRepository;

    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Test
    public void testLecturaVigilante() {
        long count = vigilanteRepository.count();
        System.out.println("VIGILANTE_COUNT=" + count);
        // Verificar que la nueva columna Estado existe y es mapeada
        Vigilante transientVig = new Vigilante();
        System.out.println("Vigilante.estado default=" + transientVig.getEstado());
        Optional<Vigilante> v = vigilanteRepository.findById(1);
        if (v.isPresent()) {
            Vigilante vig = v.get();
            System.out.println("Vigilante: id=" + vig.getIdVigilante() + " usuario=" + vig.getUsuario() + " nombre=" + vig.getNombre() + " " + vig.getApellido() + " estado=" + vig.getEstado());
        } else {
            System.out.println("Vigilante id 1 no encontrado, count=" + count + " estado columna OK");
            vigilanteRepository.findAll().stream().findFirst().ifPresent(vig ->
                System.out.println("Vigilante sample: id=" + vig.getIdVigilante() + " usuario=" + vig.getUsuario() + " estado=" + vig.getEstado())
            );
            // Probar findByUsuarioAndEstado con tabla vacía (no debe fallar)
            System.out.println("findByUsuarioAndEstado present=" + vigilanteRepository.findByUsuarioAndEstado("noexiste", true).isPresent());
        }
    }

    @Test
    public void testLecturaTrabajador() {
        long count = trabajadorRepository.count();
        System.out.println("TRABAJADOR_COUNT=" + count);
        Optional<Trabajador> t = trabajadorRepository.findById(87);
        if (t.isPresent()) {
            Trabajador tr = t.get();
            System.out.println("Trabajador 87: id=" + tr.getIdTrabajador() + " cod=" + tr.getCodTrab() + " nombre=" + tr.getNombres() + " " + tr.getApellidos() + " usuario=" + tr.getUsuario() + " estado=" + tr.getEstado() + " estadoUsuario=" + tr.getEstadoUsuario() + " idRol=" + tr.getIdRol());
        } else {
            System.out.println("Trabajador 87 no encontrado");
        }
        // Prueba findByUsuario
        Optional<Trabajador> byUser = trabajadorRepository.findByUsuario("75257890");
        System.out.println("findByUsuario 75257890 present=" + byUser.isPresent());
    }
}
