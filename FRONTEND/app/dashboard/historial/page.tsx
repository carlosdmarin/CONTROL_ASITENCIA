
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function HistorialPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-8 w-8 text-purple-500" />
        <h1 className="text-3xl font-bold">Historial</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center border-b pb-2">
                <span>Proyecto Alpha actualizado</span>
                <span className="text-sm text-gray-400">Hace 2 horas</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span>Nuevo empleado agregado</span>
                <span className="text-sm text-gray-400">Hace 5 horas</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span>Reporte mensual generado</span>
                <span className="text-sm text-gray-400">Ayer</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Tarea completada: Diseñar UI</span>
                <span className="text-sm text-gray-400">Ayer</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
