import { useMemo } from "react";
import { Activity } from "@shared/schema";

export function useActivityMetrics(
  activities: Activity[],
  searchTerm: string,
  filterStatus: string,
  filterResponsible: string,
  startDate: string,
  endDate: string
) {
  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = searchTerm === '' ||
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.responsible.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
      const matchesResponsible = filterResponsible === 'all' || activity.responsible === filterResponsible;

      let matchesDate = true;
      if (startDate && endDate) {
        const activityDate = activity.actualStartDate || activity.plannedStartDate;
        if (activityDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const currentActivityDate = new Date(activityDate);
          matchesDate = currentActivityDate >= start && currentActivityDate <= end;
        } else {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesResponsible && matchesDate;
    });
  }, [activities, searchTerm, filterStatus, filterResponsible, startDate, endDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalActivities = filteredActivities.length;
    const completedActivities = filteredActivities.filter(a => a.status === 'completed').length;
    const overallCompletionPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    // Calculate totals
    const totalPlannedCost = filteredActivities.reduce((sum, a) => sum + parseFloat(a.plannedValue || "0"), 0);
    const totalRealCost = filteredActivities.reduce((sum, a) => sum + parseFloat(a.actualCost || "0"), 0);
    const totalEarnedValue = filteredActivities.reduce((sum, a) => sum + parseFloat(a.earnedValue || "0"), 0);

    // Calculate average SPI and CPI
    const activitiesWithSPI = filteredActivities.filter(a => parseFloat(a.plannedValue || "0") > 0);
    const activitiesWithCPI = filteredActivities.filter(a => parseFloat(a.actualCost || "0") > 0);

    const averageSPI = activitiesWithSPI.length > 0 
      ? activitiesWithSPI.reduce((sum, a) => {
          const earnedValue = parseFloat(a.earnedValue || "0");
          const plannedValue = parseFloat(a.plannedValue || "0");
          return sum + (earnedValue / plannedValue);
        }, 0) / activitiesWithSPI.length
      : 0;

    const averageCPI = activitiesWithCPI.length > 0
      ? activitiesWithCPI.reduce((sum, a) => {
          const earnedValue = parseFloat(a.earnedValue || "0");
          const actualCost = parseFloat(a.actualCost || "0");
          return sum + (earnedValue / actualCost);
        }, 0) / activitiesWithCPI.length
      : 0;

    // Status distribution
    const statusDistribution = [
      { name: 'Concluído', value: filteredActivities.filter(a => a.status === 'completed').length, color: '#10B981' },
      { name: 'Em Andamento', value: filteredActivities.filter(a => a.status === 'in_progress').length, color: '#3B82F6' },
      { name: 'Atrasado', value: filteredActivities.filter(a => a.status === 'delayed').length, color: '#F59E0B' },
      { name: 'Não Iniciado', value: filteredActivities.filter(a => a.status === 'not_started').length, color: '#64748B' }
    ];

    // Monthly progress (mock data for now)
    const monthlyProgress = [
      { month: 'Jan', planned: 10, actual: 8 },
      { month: 'Fev', planned: 25, actual: 20 },
      { month: 'Mar', planned: 40, actual: 35 },
      { month: 'Abr', planned: 55, actual: 45 },
      { month: 'Mai', planned: 70, actual: 60 },
      { month: 'Jun', planned: 85, actual: 72 }
    ];

    // Discipline progress
    const disciplineProgress = filteredActivities.reduce((acc: any, activity) => {
      if (!acc[activity.discipline]) {
        acc[activity.discipline] = { total: 0, completed: 0 };
      }
      acc[activity.discipline].total++;
      if (activity.status === 'completed') {
        acc[activity.discipline].completed++;
      }
      return acc;
    }, {});

    const disciplineProgressArray = Object.keys(disciplineProgress).map(discipline => ({
      discipline,
      completion: disciplineProgress[discipline].total > 0 
        ? (disciplineProgress[discipline].completed / disciplineProgress[discipline].total) * 100 
        : 0
    }));

    return {
      filteredActivities,
      totalActivities,
      completedActivities,
      overallCompletionPercentage,
      totalPlannedCost,
      totalRealCost,
      totalEarnedValue,
      averageSPI,
      averageCPI,
      statusDistribution,
      monthlyProgress,
      disciplineProgress: disciplineProgressArray
    };
  }, [filteredActivities]);

  return metrics;
}
