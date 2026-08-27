import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export default function AyudaPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Ayuda</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Preguntas frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion defaultValue={["shipping"]} className="max-w-7xl">
              <AccordionItem value="shipping">
                <AccordionTrigger>
                  Como creo un nuevo cargo?
                </AccordionTrigger>
                <AccordionContent>
                  En la seccion <span className="text-blue-700">Cargo</span> ingresas, y completas el pequeno formulario con el nombre del
                  cargo, y luego le das click al boton crear.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>Como se agrega un nuevo turno?</AccordionTrigger>
                <AccordionContent>
                  En la seccion <span className="text-blue-700">Turno</span>, ingresas y completas los respectivos campos para el turno nuevo,
                  luego le das click a crear, y Listo!!.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="support">
                <AccordionTrigger>
                  Como se agrega un nuevo empleado?
                </AccordionTrigger>
                <AccordionContent>
                  Reach us via email, live chat, or phone. We respond within 24
                  hours during business days.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
