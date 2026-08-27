
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function GraficosPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">Gráficos</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ventas totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">$45,678</p>
            <p className="text-xs text-gray-400">+12% vs mes anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuarios activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-xs text-gray-400">+5% esta semana</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasa de conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">23.5%</p>
            <p className="text-xs text-gray-400">+2% vs mes anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
