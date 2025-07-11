import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Edit2, 
  Trash2,
  Calendar
} from "lucide-react";
import { Activity } from "@shared/schema";

interface SimpleActivityTableProps {
  activities: Activity[];
  onUpdateActivity: (id: number, activity: Partial<Activity>) => void;
  onDeleteActivity: (id: number) => void;
  onEditActivity: (activity: Activity) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    not_started: { label: 'Não Iniciado', variant: 'secondary' as const },
    in_progress: { label: 'Em Andamento', variant: 'default' as const },
    completed: { label: 'Concluído', variant: 'success' as const },
    delayed: { label: 'Atrasado', variant: 'destructive' as const },
    cancelled: { label: 'Cancelado', variant: 'outline' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
};

const calculateSPI = (activity: Activity) => {
  // Simplified SPI calculation
  const completion = parseFloat(activity.completionPercentage || "0");
  const spi = completion > 0 ? (completion / 100).toFixed(2) : "0.00";
  return spi;
};

const calculateCPI = (activity: Activity) => {
  // Simplified CPI calculation
  const plannedCost = parseFloat(activity.plannedCost || "0");
  const realCost = parseFloat(activity.realCost || "0");
  const cpi = realCost > 0 ? (plannedCost / realCost).toFixed(2) : "1.00";
  return cpi;
};

export default function SimpleActivityTable({ 
  activities, 
  onUpdateActivity,
  onDeleteActivity,
  onEditActivity
}: SimpleActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="table-container shadow-elegant">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium text-muted-foreground">
                  Atividade
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Disciplina
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Responsável
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Progresso
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Datas
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentActivities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">
                        {activity.name}
                      </div>
                      {activity.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {activity.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {activity.discipline || 'Geral'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {activity.responsible ? activity.responsible.split(' ').map(n => n[0]).join('') : 'N/A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          {activity.responsible || 'Não atribuído'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activity.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Progress 
                        value={parseFloat(activity.completionPercentage || "0")} 
                        className="w-16 mr-2"
                      />
                      <span className="text-sm text-foreground">
                        {activity.completionPercentage || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {activity.startDate && activity.finishDate ? (
                        <>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.startDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-xs">
                            até {new Date(activity.finishDate).toLocaleDateString('pt-BR')}
                          </div>
                        </>
                      ) : (
                        'Datas não definidas'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary/80 h-8 w-8"
                        onClick={() => onEditActivity(activity)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80 h-8 w-8"
                        onClick={() => onDeleteActivity(activity.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, activities.length)} de {activities.length} atividades
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}