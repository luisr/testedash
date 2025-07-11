import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/../shared/schema';

interface DependencyManagerProps {
  activities: Activity[];
  dashboardId: number;
}

const DependencyManager: React.FC<DependencyManagerProps> = ({ activities, dashboardId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Dependências</CardTitle>
        <CardDescription>
          Configure dependências entre atividades do projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Funcionalidade em desenvolvimento. Em breve você poderá:
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Criar dependências entre atividades</li>
            <li>• Visualizar caminho crítico</li>
            <li>• Calcular cronogramas automaticamente</li>
            <li>• Gerenciar restrições de tempo</li>
          </ul>
          <Button variant="outline" disabled>
            Configurar Dependências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DependencyManager;