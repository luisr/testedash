import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search, 
  Filter, 
  Settings, 
  Edit2, 
  Eye, 
  Trash2 
} from "lucide-react";
import { Activity } from "@shared/schema";

interface ActivityTableProps {
  activities: Activity[];
  customColumns: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterResponsible: string;
  onFilterResponsibleChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onActivityUpdate: (id: number, data: Partial<Activity>) => void;
  onActivityDelete: (id: number) => void;
}

export default function ActivityTable({ 
  activities, 
  customColumns, 
  searchTerm, 
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterResponsible,
  onFilterResponsibleChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onActivityUpdate,
  onActivityDelete
}: ActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="status-completed font-medium px-3 py-1">Concluído</Badge>;
      case "in_progress":
        return <Badge className="status-in-progress font-medium px-3 py-1">Em Andamento</Badge>;
      case "delayed":
        return <Badge className="status-delayed font-medium px-3 py-1">Atrasado</Badge>;
      case "not_started":
        return <Badge className="status-not-started font-medium px-3 py-1">Não Iniciado</Badge>;
      case "cancelled":
        return <Badge className="status-cancelled font-medium px-3 py-1">Cancelado</Badge>;
      default:
        return <Badge className="status-not-started font-medium px-3 py-1">{status}</Badge>;
    }
  };

  const calculateSPI = (activity: Activity) => {
    const earnedValue = parseFloat(activity.earnedValue || "0");
    const plannedValue = parseFloat(activity.plannedValue || "0");
    return plannedValue > 0 ? (earnedValue / plannedValue).toFixed(2) : "0.00";
  };

  const calculateCPI = (activity: Activity) => {
    const earnedValue = parseFloat(activity.earnedValue || "0");
    const actualCost = parseFloat(activity.actualCost || "0");
    return actualCost > 0 ? (earnedValue / actualCost).toFixed(2) : "0.00";
  };

  return (
    <Card className="table-container shadow-elegant animate-fade-in">
      <CardHeader className="table-header p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Atividades Recentes
          </h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64 focus-ring"
              />
            </div>
            <Button variant="ghost" size="icon" className="hover-lift focus-ring">
              <Filter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-lift focus-ring">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
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
                  SPI
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  CPI
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentActivities.map((activity) => (
                <TableRow key={activity.id} className="table-row hover:bg-table-row-hover transition-colors">
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">
                        {activity.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projeto {activity.projectId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {activity.discipline}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`} />
                        <AvatarFallback>
                          {activity.responsible.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          {activity.responsible}
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
                        {activity.completionPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {calculateSPI(activity)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {calculateCPI(activity)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary/80 hover-lift focus-ring h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover-lift focus-ring h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80 hover-lift focus-ring h-8 w-8"
                        onClick={() => onActivityDelete(activity.id)}
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
        
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, activities.length)}
            </span> de{" "}
            <span className="font-medium">{activities.length}</span> resultados
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            {totalPages > 1 && (
              <Button
                variant={currentPage === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(2)}
              >
                2
              </Button>
            )}
            {totalPages > 2 && (
              <Button
                variant={currentPage === 3 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(3)}
              >
                3
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </nav>
        </div>
      </CardContent>
    </Card>
  );
}
