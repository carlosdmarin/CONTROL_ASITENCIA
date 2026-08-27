
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportesPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold">Reportes</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Reporte de ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Reporte mensual de ventas</p>
            <Button className="mt-4" size="sm">Descargar</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reporte de empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Reporte de desempeño</p>
            <Button className="mt-4" size="sm">Descargar</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reporte de proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Estado de proyectos</p>
            <Button className="mt-4" size="sm">Descargar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
