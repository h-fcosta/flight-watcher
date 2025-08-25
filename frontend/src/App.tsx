import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Plane } from "lucide-react";
import "./globals.css";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Flight Watcher v2.0
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Sistema moderno de monitoramento de voos com React
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🛫 Ofertas de Voo</CardTitle>
              <CardDescription>
                Encontre as melhores ofertas de passagens aéreas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Ver Ofertas</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Dashboard</CardTitle>
              <CardDescription>
                Monitore preços e tendências de voos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔍 Buscar Rotas</CardTitle>
              <CardDescription>
                Configure rotas para monitoramento automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Gerenciar Rotas
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-6 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-semibold mb-4">🚀 Novidades da v2.0</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✅ Interface moderna com React + TypeScript</li>
            <li>✅ Design system com shadcn/ui</li>
            <li>✅ API FastAPI mantida (100% compatível)</li>
            <li>✅ Componentes reutilizáveis e escaláveis</li>
            <li>✅ Performance superior com SPA</li>
            <li>✅ Responsivo e mobile-first</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
