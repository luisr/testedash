import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity } from '@/../shared/schema';
import { GitBranch, ArrowRight } from 'lucide-react';

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  dashboardId: number;
}

const DependencyModal: React.FC<DependencyModalProps> = ({
  isOpen,
  onClose,
  activities,
  dashboardId
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Gerenciamento de Dependências
          </DialogTitle>
          <DialogDescription>
            Configure as dependências entre as atividades do projeto para otimizar o cronograma.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Funcionalidades Disponíveis</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Criar dependências entre atividades
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Visualizar caminho crítico do projeto
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Calcular cronogramas automaticamente
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Gerenciar restrições de tempo
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Status do Desenvolvimento</h3>
            <p className="text-sm text-yellow-700">
              O sistema de dependências está em desenvolvimento avançado. As funcionalidades básicas 
              de hierarquia já estão implementadas através do drag-and-drop na tabela principal.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Atividades Disponíveis</h3>
            <div className="text-sm text-gray-600">
              {activities.length} atividades encontradas no dashboard
            </div>
            <div className="mt-2 space-y-1">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{activity.name}</span>
                  {activity.parentActivityId && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Sub
                    </span>
                  )}
                </div>
              ))}
              {activities.length > 5 && (
                <div className="text-xs text-gray-500 mt-1">
                  ... e mais {activities.length - 5} atividades
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button disabled>
              Configurar Dependências
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyModal;