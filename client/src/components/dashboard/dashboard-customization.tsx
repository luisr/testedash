import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CustomStatusManager from './custom-status-manager';
import CustomChartBuilder from './custom-chart-builder';
import CustomKPIManager from './custom-kpi-manager';
import { 
  Settings, 
  Palette, 
  BarChart3, 
  TrendingUp, 
  Sparkles,
  Save,
  RotateCcw
} from 'lucide-react';

interface DashboardCustomizationProps {
  dashboardId: number;
  activities: any[];
  projects: any[];
  onCustomizationUpdate: () => void;
}

export default function DashboardCustomization({ 
  dashboardId, 
  activities, 
  projects, 
  onCustomizationUpdate 
}: DashboardCustomizationProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  const handleStatusUpdate = (statuses: any[]) => {
    setHasChanges(true);
    onCustomizationUpdate();
  };

  const handleChartsUpdate = (charts: any[]) => {
    setHasChanges(true);
    onCustomizationUpdate();
  };

  const handleKPIsUpdate = (kpis: any[]) => {
    setHasChanges(true);
    onCustomizationUpdate();
  };

  const resetCustomizations = async () => {
    if (confirm('Tem certeza que deseja resetar todas as personalizações? Esta ação não pode ser desfeita.')) {
      try {
        await fetch(`/api/dashboard-customizations/${dashboardId}/reset`, {
          method: 'POST'
        });
        onCustomizationUpdate();
        setHasChanges(false);
      } catch (error) {
        console.error('Error resetting customizations:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Personalização do Dashboard
          </h2>
          <p className="text-muted-foreground">
            Personalize status, gráficos e KPIs para atender às suas necessidades específicas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetCustomizations}
            className="text-orange-600 hover:text-orange-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar Tudo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Status Personalizados
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Gráficos Personalizados
              </TabsTrigger>
              <TabsTrigger value="kpis" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                KPIs Personalizados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="mt-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Status Personalizados</h4>
                  <p className="text-sm text-blue-700">
                    Crie status únicos para suas atividades com cores personalizadas. 
                    Você pode definir novos status além dos padrões (Não Iniciado, Em Andamento, etc.) 
                    e escolher cores que se alinhem com o seu fluxo de trabalho.
                  </p>
                </div>
                
                <CustomStatusManager
                  dashboardId={dashboardId}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Gráficos Personalizados</h4>
                  <p className="text-sm text-green-700">
                    Crie gráficos totalmente personalizados escolhendo o tipo de visualização 
                    (barras, pizza, linha, área), fonte de dados, campos para cruzar e agregações. 
                    Visualize seus dados da maneira que faz mais sentido para você.
                  </p>
                </div>
                
                <CustomChartBuilder
                  dashboardId={dashboardId}
                  activities={activities}
                  projects={projects}
                  onChartsUpdate={handleChartsUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="kpis" className="mt-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">KPIs Personalizados</h4>
                  <p className="text-sm text-purple-700">
                    Defina indicadores-chave de desempenho específicos para seu projeto. 
                    Escolha métricas, aplique filtros, defina metas e acompanhe o progresso 
                    com visualizações personalizadas e formatação apropriada.
                  </p>
                </div>
                
                <CustomKPIManager
                  dashboardId={dashboardId}
                  activities={activities}
                  projects={projects}
                  onKPIsUpdate={handleKPIsUpdate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-900">Alterações Detectadas</h4>
                  <p className="text-sm text-orange-700">
                    Suas personalizações foram salvas automaticamente e já estão ativas no dashboard.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setHasChanges(false)}
                className="text-orange-600 border-orange-200 hover:bg-orange-100"
              >
                OK
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}