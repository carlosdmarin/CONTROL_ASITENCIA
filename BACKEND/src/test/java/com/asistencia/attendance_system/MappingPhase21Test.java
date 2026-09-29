package com.asistencia.attendance_system;

import com.asistencia.attendance_system.model.entity.Administrador;
import com.asistencia.attendance_system.model.entity.Vigilante;
import com.asistencia.attendance_system.repository.AdministradorRepository;
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
    private AdministradorRepository administradorRepository;

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
    public void testLecturaAdministrador() {
        long count = administradorRepository.count();
        System.out.println("ADMINISTRADORES_COUNT=" + count);
        Optional<Administrador> a = administradorRepository.findById(1L);
        System.out.println("findById 1 present=" + a.isPresent());
        // Prueba findByUsuario (sin imprimir datos personales)
        System.out.println("existsByUsuario admin present=" + administradorRepository.existsByUsuario("admin"));
    }
}
