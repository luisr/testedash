import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(numValue);
}

export function formatPercentage(value: string | number | null | undefined): string {
  if (value === undefined || value === null) return '0%';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numValue.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20';
    case 'in_progress':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case 'delayed':
      return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20';
    case 'not_started':
      return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/20';
    default:
      return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/20';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
    case 'critical':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'low':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    default:
      return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/20';
  }
}

export function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
