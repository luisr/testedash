import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GoogleGenAI } from '@google/genai';
import type { User, Project } from '@shared/schema';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyBQywFyLmbaX4fVftPhdsZ35umAnp-OD60" });

export class PDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.currentY = 20;
    this.margin = 20;
  }

  private addHeader(title: string) {
    // BeachPark Header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 102, 204); // Blue color
    this.doc.text('BeachPark - Tô Sabendo', this.margin, this.currentY);
    
    this.currentY += 15;
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, this.margin, this.currentY);
    
    this.currentY += 20;
    this.addLine();
  }

  private addLine() {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.doc.internal.pageSize.width - this.margin, this.currentY);
    this.currentY += 10;
  }

  private checkPageBreak(additionalHeight: number = 20) {
    if (this.currentY + additionalHeight > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addSection(title: string, content: string) {
    this.checkPageBreak(30);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 102, 204);
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const lines = this.doc.splitTextToSize(content, this.doc.internal.pageSize.width - 2 * this.margin);
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  private async generateGeminiObservations(data: any, reportType: string): Promise<string> {
    try {
      let prompt = '';
      
      switch (reportType) {
        case 'projects':
          prompt = `Analise os seguintes dados de projetos e forneça observações estratégicas em português:
          
          Projetos: ${JSON.stringify(data.projects, null, 2)}
          
          Forneça insights sobre:
          1. Status geral dos projetos
          2. Análise de orçamento vs gastos
          3. Cronograma e prazos
          4. Recomendações estratégicas
          5. Riscos identificados
          
          Responda em português de forma profissional e estruturada.`;
          break;
          
        case 'users':
          prompt = `Analise os seguintes dados de usuários e forneça observações sobre gestão de equipe em português:
          
          Usuários: ${JSON.stringify(data.users, null, 2)}
          
          Forneça insights sobre:
          1. Distribuição de funções
          2. Níveis de acesso
          3. Usuários ativos vs inativos
          4. Recomendações para gestão de equipe
          5. Segurança e controle de acesso
          
          Responda em português de forma profissional e estruturada.`;
          break;
          
        case 'financial':
          prompt = `Analise os seguintes dados financeiros de projetos e forneça observações econômicas em português:
          
          Dados: ${JSON.stringify(data, null, 2)}
          
          Forneça insights sobre:
          1. Performance financeira geral
          2. Variações orçamentárias
          3. Eficiência de gastos
          4. Projeções e tendências
          5. Recomendações financeiras
          
          Responda em português de forma profissional e estruturada.`;
          break;
          
        default:
          prompt = `Analise os seguintes dados executivos e forneça observações estratégicas em português:
          
          Dados: ${JSON.stringify(data, null, 2)}
          
          Forneça insights executivos sobre:
          1. Visão geral do desempenho
          2. Principais indicadores
          3. Oportunidades de melhoria
          4. Recomendações estratégicas
          5. Próximos passos sugeridos
          
          Responda em português de forma profissional e estruturada.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Não foi possível gerar observações automáticas no momento.";
    } catch (error) {
      console.error('Erro ao gerar observações com Gemini:', error);
      return "Observações automáticas não disponíveis no momento devido a erro de conectividade.";
    }
  }

  async generateProjectsReport(projects: Project[]): Promise<Buffer> {
    this.addHeader('RELATÓRIO DE PROJETOS');
    
    // Resumo Executivo
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    
    this.addSection('RESUMO EXECUTIVO', 
      `Total de Projetos: ${totalProjects}\n` +
      `Projetos Ativos: ${activeProjects}\n` +
      `Projetos Concluídos: ${completedProjects}\n` +
      `Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Economia/Excesso: R$ ${(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );

    // Tabela de Projetos
    const tableData = projects.map(project => [
      project.name,
      project.status,
      `R$ ${parseFloat(project.budget || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${parseFloat(project.actualCost || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/A',
      project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/A'
    ]);

    this.checkPageBreak(100);
    this.doc.autoTable({
      head: [['Projeto', 'Status', 'Orçamento', 'Gasto', 'Início', 'Fim']],
      body: tableData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 9 }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;

    // Detalhamento por Projeto
    for (const project of projects) {
      this.checkPageBreak(50);
      
      const budget = parseFloat(project.budget || '0');
      const spent = parseFloat(project.actualCost || '0');
      const variance = budget - spent;
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;
      
      this.addSection(`PROJETO: ${project.name.toUpperCase()}`,
        `Status: ${project.status}\n` +
        `Descrição: ${project.description || 'Não informado'}\n` +
        `Orçamento: R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `Gasto Atual: R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
        `Variação: R$ ${variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${variancePercent.toFixed(1)}%)\n` +
        `Data de Início: ${project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definido'}\n` +
        `Data de Fim: ${project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Não definido'}`
      );
    }

    // Observações IA
    const observations = await this.generateGeminiObservations({ projects }, 'projects');
    this.addSection('OBSERVAÇÕES E RECOMENDAÇÕES (IA)', observations);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  async generateUsersReport(users: User[]): Promise<Buffer> {
    this.addHeader('RELATÓRIO DE USUÁRIOS');
    
    // Resumo Executivo
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const superUsers = users.filter(u => u.isSuperUser).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const managerUsers = users.filter(u => u.role === 'manager').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    this.addSection('RESUMO EXECUTIVO',
      `Total de Usuários: ${totalUsers}\n` +
      `Usuários Ativos: ${activeUsers}\n` +
      `Usuários Inativos: ${totalUsers - activeUsers}\n` +
      `Super Usuários: ${superUsers}\n` +
      `Administradores: ${adminUsers}\n` +
      `Gerentes: ${managerUsers}\n` +
      `Usuários Regulares: ${regularUsers}`
    );

    // Tabela de Usuários
    const tableData = users.map(user => [
      user.name,
      user.email,
      user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Usuário',
      user.isActive ? 'Ativo' : 'Inativo',
      user.isSuperUser ? 'Sim' : 'Não',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'
    ]);

    this.checkPageBreak(100);
    this.doc.autoTable({
      head: [['Nome', 'Email', 'Função', 'Status', 'Super User', 'Criado em']],
      body: tableData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 9 }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;

    // Análise de Segurança
    this.addSection('ANÁLISE DE SEGURANÇA',
      `Distribuição de Permissões:\n` +
      `• ${superUsers} usuários com privilégios de super administrador\n` +
      `• ${adminUsers} usuários com privilégios administrativos\n` +
      `• ${managerUsers} usuários com privilégios de gerenciamento\n` +
      `• ${regularUsers} usuários regulares\n\n` +
      `Taxa de Ativação: ${((activeUsers / totalUsers) * 100).toFixed(1)}%\n` +
      `Usuários que precisam trocar senha: ${users.filter(u => u.mustChangePassword).length}`
    );

    // Observações IA
    const observations = await this.generateGeminiObservations({ users }, 'users');
    this.addSection('OBSERVAÇÕES E RECOMENDAÇÕES (IA)', observations);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  async generateFinancialReport(projects: Project[]): Promise<Buffer> {
    this.addHeader('RELATÓRIO FINANCEIRO');
    
    // Cálculos Financeiros
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    const totalVariance = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Projetos com maior variação
    const projectsWithVariance = projects.map(p => ({
      ...p,
      variance: parseFloat(p.budget || '0') - parseFloat(p.actualCost || '0'),
      variancePercent: parseFloat(p.budget || '0') > 0 ? 
        ((parseFloat(p.budget || '0') - parseFloat(p.actualCost || '0')) / parseFloat(p.budget || '0')) * 100 : 0
    })).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    this.addSection('RESUMO FINANCEIRO',
      `Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Variação Total: R$ ${totalVariance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Utilização do Orçamento: ${budgetUtilization.toFixed(1)}%\n` +
      `Número de Projetos: ${projects.length}`
    );

    // Tabela Financeira Detalhada
    const tableData = projects.map(project => {
      const budget = parseFloat(project.budget || '0');
      const spent = parseFloat(project.actualCost || '0');
      const variance = budget - spent;
      const utilizationPercent = budget > 0 ? (spent / budget) * 100 : 0;
      
      return [
        project.name,
        `R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${utilizationPercent.toFixed(1)}%`
      ];
    });

    this.checkPageBreak(100);
    this.doc.autoTable({
      head: [['Projeto', 'Orçamento', 'Gasto', 'Variação', 'Utilização']],
      body: tableData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 9 }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;

    // Análise de Performance
    const overBudgetProjects = projects.filter(p => parseFloat(p.actualCost || '0') > parseFloat(p.budget || '0'));
    const underBudgetProjects = projects.filter(p => parseFloat(p.actualCost || '0') < parseFloat(p.budget || '0'));
    
    this.addSection('ANÁLISE DE PERFORMANCE',
      `Projetos Acima do Orçamento: ${overBudgetProjects.length}\n` +
      `Projetos Abaixo do Orçamento: ${underBudgetProjects.length}\n` +
      `Projetos no Orçamento: ${projects.length - overBudgetProjects.length - underBudgetProjects.length}\n\n` +
      `Maior Economia: ${projectsWithVariance[0]?.name || 'N/A'} - R$ ${(projectsWithVariance[0]?.variance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Maior Excesso: ${projectsWithVariance[projectsWithVariance.length - 1]?.name || 'N/A'} - R$ ${(projectsWithVariance[projectsWithVariance.length - 1]?.variance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );

    // Observações IA
    const observations = await this.generateGeminiObservations({ 
      projects, 
      totalBudget, 
      totalSpent, 
      totalVariance, 
      budgetUtilization 
    }, 'financial');
    this.addSection('OBSERVAÇÕES E RECOMENDAÇÕES (IA)', observations);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  async generateGeneralReport(users: User[], projects: Project[]): Promise<Buffer> {
    this.addHeader('RELATÓRIO EXECUTIVO GERAL');
    
    // KPIs Gerais
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    
    this.addSection('INDICADORES PRINCIPAIS',
      `📊 USUÁRIOS\n` +
      `• Total: ${totalUsers}\n` +
      `• Ativos: ${activeUsers} (${((activeUsers / totalUsers) * 100).toFixed(1)}%)\n` +
      `• Super Usuários: ${users.filter(u => u.isSuperUser).length}\n\n` +
      `🎯 PROJETOS\n` +
      `• Total: ${totalProjects}\n` +
      `• Ativos: ${activeProjects}\n` +
      `• Concluídos: ${completedProjects}\n` +
      `• Taxa de Conclusão: ${totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0}%\n\n` +
      `💰 FINANCEIRO\n` +
      `• Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `• Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `• Economia/Excesso: R$ ${(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `• Eficiência Orçamentária: ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%`
    );

    // Status dos Projetos
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let statusText = '';
    Object.entries(statusCounts).forEach(([status, count]) => {
      statusText += `${status}: ${count} projetos\n`;
    });

    this.addSection('DISTRIBUIÇÃO DE STATUS DOS PROJETOS', statusText);

    // Funções dos Usuários
    const roleCounts = users.reduce((acc, user) => {
      const roleLabel = user.role === 'admin' ? 'Administrador' : 
                       user.role === 'manager' ? 'Gerente' : 'Usuário';
      acc[roleLabel] = (acc[roleLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let rolesText = '';
    Object.entries(roleCounts).forEach(([role, count]) => {
      rolesText += `${role}: ${count} usuários\n`;
    });

    this.addSection('DISTRIBUIÇÃO DE FUNÇÕES', rolesText);

    // Observações IA
    const observations = await this.generateGeminiObservations({ 
      users, 
      projects, 
      totalUsers, 
      activeUsers, 
      totalProjects, 
      activeProjects, 
      completedProjects, 
      totalBudget, 
      totalSpent 
    }, 'general');
    this.addSection('OBSERVAÇÕES E RECOMENDAÇÕES EXECUTIVAS (IA)', observations);

    return Buffer.from(this.doc.output('arraybuffer'));
  }
}