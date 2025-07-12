import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as fs from 'fs';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportData {
  kpis: {
    spi: number;
    cpi: number;
    completionRate: number;
    budgetVariance: number;
    scheduleVariance: number;
    riskLevel: string;
  };
  criticalPath: {
    activities: any[];
    criticalPath: any[];
    totalDuration: number;
    criticalPathLength: number;
  };
  roadmap: {
    milestones: any[];
    roadmapByQuarter: any[];
  };
  activities: any[];
  projects: any[];
  geminiObservations: string;
  dashboardId: number;
}

export class AdvancedPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private yPosition: number;
  private pageNumber: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
    this.yPosition = this.margin;
    this.pageNumber = 1;
  }

  private addHeader(title: string) {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 10;
    
    // Add BeachPark logo text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('BeachPark - Tô Sabendo', this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 15;
    
    this.addLine();
  }

  private addLine() {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 10;
  }

  private checkPageBreak(additionalHeight: number = 20) {
    if (this.yPosition + additionalHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.yPosition = this.margin;
      this.pageNumber++;
      
      // Add page number
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Página ${this.pageNumber}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
    }
  }

  private addSection(title: string, content: string) {
    this.checkPageBreak(30);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.yPosition);
    this.yPosition += 10;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin);
    lines.forEach((line: string) => {
      this.checkPageBreak(5);
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += 5;
    });
    
    this.yPosition += 10;
  }

  private addKPISection(kpis: ReportData['kpis']) {
    this.checkPageBreak(50);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KPIs de Performance', this.margin, this.yPosition);
    this.yPosition += 15;

    const kpiData = [
      ['Indicador', 'Valor', 'Status'],
      ['SPI (Schedule Performance Index)', kpis.spi.toString(), kpis.spi >= 1 ? 'Bom' : 'Ruim'],
      ['CPI (Cost Performance Index)', kpis.cpi.toString(), kpis.cpi >= 1 ? 'Bom' : 'Ruim'],
      ['Taxa de Conclusão', `${kpis.completionRate}%`, kpis.completionRate >= 75 ? 'Excelente' : 'Regular'],
      ['Variação do Cronograma', `${kpis.scheduleVariance}%`, kpis.scheduleVariance >= 0 ? 'Positiva' : 'Negativa'],
      ['Variação do Orçamento', `${kpis.budgetVariance}%`, kpis.budgetVariance >= 0 ? 'Positiva' : 'Negativa'],
      ['Nível de Risco', this.translateRiskLevel(kpis.riskLevel), this.getRiskStatus(kpis.riskLevel)]
    ];

    this.doc.autoTable({
      head: [kpiData[0]],
      body: kpiData.slice(1),
      startY: this.yPosition,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addCriticalPathSection(criticalPath: ReportData['criticalPath']) {
    this.checkPageBreak(50);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Análise do Caminho Crítico', this.margin, this.yPosition);
    this.yPosition += 15;

    // Summary
    const summaryText = `
Total de Atividades: ${criticalPath.activities.length}
Atividades Críticas: ${criticalPath.criticalPathLength}
Duração Total: ${criticalPath.totalDuration} dias
Percentual Crítico: ${((criticalPath.criticalPathLength / criticalPath.activities.length) * 100).toFixed(1)}%
    `;
    this.addSection('Resumo do Caminho Crítico', summaryText);

    // Critical activities table
    if (criticalPath.criticalPath.length > 0) {
      const criticalActivities = criticalPath.criticalPath.map(activity => [
        activity.name,
        this.formatDate(activity.earlyStart),
        this.formatDate(activity.earlyFinish),
        `${activity.duration} dias`
      ]);

      this.doc.autoTable({
        head: [['Atividade', 'Início', 'Fim', 'Duração']],
        body: criticalActivities,
        startY: this.yPosition,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        alternateRowStyles: { fillColor: [255, 235, 238] },
        styles: { fontSize: 8 }
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private addRoadmapSection(roadmap: ReportData['roadmap']) {
    this.checkPageBreak(50);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Roadmap do Projeto', this.margin, this.yPosition);
    this.yPosition += 15;

    // Quarterly overview
    const quarterlyData = roadmap.roadmapByQuarter.map(quarter => [
      quarter.quarter,
      quarter.activities.toString(),
      quarter.milestones.toString(),
      `${quarter.completionRate.toFixed(1)}%`
    ]);

    this.doc.autoTable({
      head: [['Trimestre', 'Atividades', 'Marcos', 'Conclusão']],
      body: quarterlyData,
      startY: this.yPosition,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      alternateRowStyles: { fillColor: [235, 245, 255] },
      styles: { fontSize: 9 }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;

    // Milestones
    if (roadmap.milestones.length > 0) {
      this.checkPageBreak(30);
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Marcos do Projeto', this.margin, this.yPosition);
      this.yPosition += 10;

      const milestoneData = roadmap.milestones.map(milestone => [
        milestone.name,
        milestone.plannedStartDate ? this.formatDate(milestone.plannedStartDate) : 'Não planejado',
        milestone.responsible || 'Não atribuído',
        this.translateStatus(milestone.status)
      ]);

      this.doc.autoTable({
        head: [['Marco', 'Data Planejada', 'Responsável', 'Status']],
        body: milestoneData,
        startY: this.yPosition,
        theme: 'striped',
        headStyles: { fillColor: [241, 196, 15], textColor: 0 },
        alternateRowStyles: { fillColor: [255, 248, 220] },
        styles: { fontSize: 8 }
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private addGeminiObservationsSection(observations: string) {
    if (!observations) return;
    
    this.checkPageBreak(50);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Observações da Inteligência Artificial', this.margin, this.yPosition);
    this.yPosition += 15;

    // Add AI icon representation
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('🤖 Análise gerada por IA baseada nos dados do projeto', this.margin, this.yPosition);
    this.yPosition += 10;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const lines = this.doc.splitTextToSize(observations, this.pageWidth - 2 * this.margin);
    lines.forEach((line: string) => {
      this.checkPageBreak(5);
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += 5;
    });
    
    this.yPosition += 10;
  }

  private addActivitiesSummary(activities: any[]) {
    this.checkPageBreak(50);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resumo das Atividades', this.margin, this.yPosition);
    this.yPosition += 15;

    const statusCount = {
      'not_started': 0,
      'in_progress': 0,
      'completed': 0,
      'delayed': 0,
      'cancelled': 0
    };

    activities.forEach(activity => {
      statusCount[activity.status as keyof typeof statusCount]++;
    });

    const summaryData = [
      ['Status', 'Quantidade', 'Percentual'],
      ['Não Iniciado', statusCount.not_started.toString(), `${((statusCount.not_started / activities.length) * 100).toFixed(1)}%`],
      ['Em Andamento', statusCount.in_progress.toString(), `${((statusCount.in_progress / activities.length) * 100).toFixed(1)}%`],
      ['Concluído', statusCount.completed.toString(), `${((statusCount.completed / activities.length) * 100).toFixed(1)}%`],
      ['Atrasado', statusCount.delayed.toString(), `${((statusCount.delayed / activities.length) * 100).toFixed(1)}%`],
      ['Cancelado', statusCount.cancelled.toString(), `${((statusCount.cancelled / activities.length) * 100).toFixed(1)}%`]
    ];

    this.doc.autoTable({
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: this.yPosition,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 245, 250] },
      styles: { fontSize: 9 }
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd/MM/yyyy', { locale: ptBR });
  }

  private translateRiskLevel(level: string): string {
    const translations = {
      'low': 'Baixo',
      'medium': 'Médio',
      'high': 'Alto',
      'critical': 'Crítico'
    };
    return translations[level as keyof typeof translations] || level;
  }

  private getRiskStatus(level: string): string {
    const status = {
      'low': 'Excelente',
      'medium': 'Atenção',
      'high': 'Preocupante',
      'critical': 'Crítico'
    };
    return status[level as keyof typeof status] || level;
  }

  private translateStatus(status: string): string {
    const translations = {
      'not_started': 'Não Iniciado',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído',
      'delayed': 'Atrasado',
      'cancelled': 'Cancelado'
    };
    return translations[status as keyof typeof translations] || status;
  }

  async generateAdvancedReport(data: ReportData): Promise<Buffer> {
    // Title page
    this.addHeader('Relatório Avançado do Projeto');
    
    // Executive Summary
    const executiveSummary = `
Este relatório apresenta uma análise abrangente do projeto, incluindo:
- Indicadores de performance (KPIs)
- Análise do caminho crítico
- Roadmap e marcos do projeto
- Observações da inteligência artificial

Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
Dashboard ID: ${data.dashboardId}
Total de Atividades: ${data.activities.length}
Total de Projetos: ${data.projects.length}
    `;
    this.addSection('Resumo Executivo', executiveSummary);

    // KPIs Section
    this.addKPISection(data.kpis);

    // Critical Path Analysis
    this.addCriticalPathSection(data.criticalPath);

    // Roadmap Section
    this.addRoadmapSection(data.roadmap);

    // Activities Summary
    this.addActivitiesSummary(data.activities);

    // Gemini Observations
    this.addGeminiObservationsSection(data.geminiObservations);

    // Footer
    this.checkPageBreak(30);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} pelo Sistema Tô Sabendo - BeachPark`, 
                  this.pageWidth / 2, this.yPosition, { align: 'center' });

    return Buffer.from(this.doc.output('arraybuffer'));
  }
}