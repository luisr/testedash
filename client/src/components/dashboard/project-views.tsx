import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from '@/../shared/schema';
import KanbanView from './kanban-view';
import CalendarView from './calendar-view';
import GanttView from './gantt-view';
import DatalogView from './datalog-view';
import RoadmapView from './roadmap-view';
import { 
  Kanban, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  FileText,
  MapPin
} from 'lucide-react';

interface ProjectViewsProps {
  activities: Activity[];
  projects: any[];
  onUpdateActivity: (id: number, data: Partial<Activity>) => void;
}

export default function ProjectViews({ activities, projects, onUpdateActivity }: ProjectViewsProps) {
  const [activeTab, setActiveTab] = useState('kanban');

  const tabs = [
    {
      id: 'kanban',
      label: 'Kanban',
      icon: Kanban,
      component: KanbanView
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      component: CalendarView
    },
    {
      id: 'gantt',
      label: 'Gantt',
      icon: TrendingUp,
      component: GanttView
    },
    {
      id: 'datalog',
      label: 'Datalog',
      icon: FileText,
      component: DatalogView
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      icon: MapPin,
      component: RoadmapView
    }
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Visualizações do Projeto
        </CardTitle>
      </CardHeader>
      
      <CardContent className="h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <div className="flex-1 mt-4">
            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
                <tab.component
                  activities={activities}
                  projects={projects}
                  onUpdateActivity={onUpdateActivity}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}