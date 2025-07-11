export interface Theme {
  name: string;
  background: string;
  cardBackground: string;
  textColor: string;
  secondaryTextColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  dangerColor: string;
  warningColor: string;
  chartPrimary: string;
  chartSecondary: string;
  chartAccent: string;
  chartPriority: string;
  chartRisk: string;
  tableHeaderBg: string;
  tableBorder: string;
}

export interface KPIMetrics {
  totalActivities: number;
  completedActivities: number;
  overallCompletionPercentage: number;
  averageSPI: number;
  averageCPI: number;
  totalPlannedCost: number;
  totalRealCost: number;
  totalEarnedValue: number;
  costDeviation: number;
  scheduleVariance: number;
}

export interface ChartData {
  statusDistribution: { name: string; value: number; color: string }[];
  monthlyProgress: { month: string; planned: number; actual: number }[];
  disciplineProgress: { discipline: string; completion: number }[];
  costByDiscipline: { discipline: string; planned: number; actual: number }[];
  priorityDistribution: { priority: string; count: number }[];
  riskDistribution: { risk: string; count: number }[];
}

export interface FilterOptions {
  searchTerm: string;
  filterStatus: string;
  filterResponsible: string;
  filterDiscipline: string;
  filterPriority: string;
  startDate: string;
  endDate: string;
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'status' | 'priority' | 'formula';
  visible: boolean;
  sortable: boolean;
  formula?: string;
  width?: number;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeCharts: boolean;
  includeFilters: boolean;
  columns: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
