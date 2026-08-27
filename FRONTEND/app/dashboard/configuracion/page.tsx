
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConfiguracionPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-8 w-8 text-gray-700" />
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Perfil de usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input placeholder="tu@email.com" type="email" />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <Input placeholder="Nueva contraseña" type="password" />
          </div>
          <Button>Guardar cambios</Button>
        </CardContent>
      </Card>
    </div>
  );
}
