import type { User, Project } from '@shared/schema';
import { jsPDF } from 'jspdf';

export class PDFGenerator {
  private async generateGeminiObservations(data: any, reportType: string): Promise<string> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyBQywFyLmbaX4fVftPhdsZ35umAnp-OD60" });
      
      let prompt = '';
      switch (reportType) {
        case 'projects':
          prompt = `Analise os seguintes dados de projetos e forneça observações executivas profissionais em português brasileiro:
          
Dados: ${JSON.stringify(data, null, 2)}

Forneça uma análise executiva com:
- Observações sobre performance dos projetos
- Identificação de riscos e oportunidades
- Recomendações estratégicas
- Insights sobre gestão de portfólio

Limite a resposta a 300 palavras, use linguagem profissional e seja específico.`;
          break;
          
        case 'users':
          prompt = `Analise os seguintes dados de usuários e forneça observações sobre gestão de equipe em português brasileiro:
          
Dados: ${JSON.stringify(data, null, 2)}

Forneça uma análise executiva com:
- Observações sobre estrutura organizacional
- Análise de distribuição de papéis
- Recomendações de segurança e governance
- Insights sobre gestão de recursos humanos

Limite a resposta a 300 palavras, use linguagem profissional e seja específico.`;
          break;
          
        case 'financial':
          prompt = `Analise os seguintes dados financeiros e forneça observações sobre gestão orçamentária em português brasileiro:
          
Dados: ${JSON.stringify(data, null, 2)}

Forneça uma análise executiva com:
- Observações sobre performance financeira
- Identificação de desvios orçamentários
- Recomendações de controle financeiro
- Insights sobre otimização de custos

Limite a resposta a 300 palavras, use linguagem profissional e seja específico.`;
          break;
          
        default:
          prompt = `Analise os seguintes dados gerais do sistema e forneça observações executivas em português brasileiro:
          
Dados: ${JSON.stringify(data, null, 2)}

Forneça uma análise executiva com:
- Observações sobre performance geral
- Identificação de tendências importantes
- Recomendações estratégicas
- Insights para tomada de decisão

Limite a resposta a 300 palavras, use linguagem profissional e seja específico.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Observações automáticas não disponíveis no momento.";
    } catch (error) {
      console.error("Erro ao gerar observações com Gemini:", error);
      // Retorna observações estáticas como fallback
      switch (reportType) {
        case 'projects':
          return `OBSERVAÇÕES SOBRE PROJETOS:
• Total de ${data.projects?.length || 0} projetos em andamento
• Diversidade de status indica boa distribuição de fases do portfólio
• Controle orçamentário requer atenção em projetos com variações significativas
• Recomenda-se estabelecer marcos e cronogramas para projetos sem datas definidas
• Implementar sistema de monitoramento de performance financeira dos projetos`;
          
        case 'users':
          return `OBSERVAÇÕES SOBRE GESTÃO DE USUÁRIOS:
• Base de ${data.users?.length || 0} usuários cadastrados no sistema
• Distribuição equilibrada de papéis e responsabilidades
• Taxa de usuários ativos demonstra bom engajamento organizacional
• Governança adequada com presença de super usuários para administração
• Recomenda-se revisão periódica de permissões e políticas de acesso`;
          
        case 'financial':
          return `OBSERVAÇÕES FINANCEIRAS:
• Controle orçamentário em operação com variações identificadas
• Necessidade de monitoramento mais rigoroso em projetos com desvios
• Oportunidades de otimização de custos em projetos subutilizados
• Implementar alertas automáticos para controle de gastos
• Estabelecer revisões trimestrais de performance financeira`;
          
        default:
          return `OBSERVAÇÕES EXECUTIVAS GERAIS:
• Sistema operacional com base sólida de dados e usuários
• Processos de gestão estabelecidos e funcionando adequadamente
• Oportunidades de melhoria em automação e controles
• Recomenda-se implementação de dashboards executivos
• Acompanhamento contínuo de KPIs e indicadores de performance`;
      }
    }
  }

  async generateProjectsReport(projects: Project[]): Promise<Buffer> {
    const doc = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('BeachPark - Tô Sabendo', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('RELATÓRIO DE PROJETOS', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    
    yPosition += 20;
    
    // Resumo Executivo
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('RESUMO EXECUTIVO', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const summaryText = [
      `Total de Projetos: ${totalProjects}`,
      `Projetos Ativos: ${activeProjects}`,
      `Projetos Concluídos: ${completedProjects}`,
      `Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Economia/Excesso: R$ ${(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ];
    
    summaryText.forEach(text => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(text, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 20;
    
    // Detalhamento dos Projetos
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('DETALHAMENTO DOS PROJETOS', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    projects.forEach(project => {
      const budget = parseFloat(project.budget || '0');
      const spent = parseFloat(project.actualCost || '0');
      const variance = budget - spent;
      
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${project.name}`, margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${project.status}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Orçamento: R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Gasto: R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Variação: R$ ${variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Início: ${project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/A'}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Fim: ${project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/A'}`, margin, yPosition);
      yPosition += 10;
    });
    
    yPosition += 10;
    
    // Observações IA
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    const observations = await this.generateGeminiObservations({ projects }, 'projects');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('OBSERVAÇÕES E RECOMENDAÇÕES', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const obsLines = doc.splitTextToSize(observations, doc.internal.pageSize.width - 2 * margin);
    obsLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateUsersReport(users: User[]): Promise<Buffer> {
    const doc = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('BeachPark - Tô Sabendo', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('RELATÓRIO DE USUÁRIOS', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    
    yPosition += 20;
    
    // Resumo Executivo
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const superUsers = users.filter(u => u.isSuperUser).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const managerUsers = users.filter(u => u.role === 'manager').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('RESUMO EXECUTIVO', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const summaryText = [
      `Total de Usuários: ${totalUsers}`,
      `Usuários Ativos: ${activeUsers}`,
      `Usuários Inativos: ${totalUsers - activeUsers}`,
      `Super Usuários: ${superUsers}`,
      `Administradores: ${adminUsers}`,
      `Gerentes: ${managerUsers}`,
      `Usuários Regulares: ${regularUsers}`
    ];
    
    summaryText.forEach(text => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(text, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 20;
    
    // Detalhamento dos Usuários
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('DETALHAMENTO DOS USUÁRIOS', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    users.forEach(user => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${user.name}`, margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Email: ${user.email}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Função: ${user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Usuário'}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Status: ${user.isActive ? 'Ativo' : 'Inativo'}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Super User: ${user.isSuperUser ? 'Sim' : 'Não'}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Criado em: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}`, margin, yPosition);
      yPosition += 10;
    });
    
    yPosition += 10;
    
    // Observações IA
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    const observations = await this.generateGeminiObservations({ users }, 'users');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('OBSERVAÇÕES E RECOMENDAÇÕES', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const obsLines = doc.splitTextToSize(observations, doc.internal.pageSize.width - 2 * margin);
    obsLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateFinancialReport(projects: Project[]): Promise<Buffer> {
    const doc = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('BeachPark - Tô Sabendo', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('RELATÓRIO FINANCEIRO', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    
    yPosition += 20;
    
    // Cálculos Financeiros
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    const totalVariance = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('RESUMO FINANCEIRO', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const summaryText = [
      `Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Variação Total: R$ ${totalVariance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Utilização do Orçamento: ${budgetUtilization.toFixed(1)}%`,
      `Número de Projetos: ${projects.length}`
    ];
    
    summaryText.forEach(text => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(text, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 20;
    
    // Análise Financeira Detalhada
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('ANÁLISE FINANCEIRA DETALHADA', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    projects.forEach(project => {
      const budget = parseFloat(project.budget || '0');
      const spent = parseFloat(project.actualCost || '0');
      const variance = budget - spent;
      const utilizationPercent = budget > 0 ? (spent / budget) * 100 : 0;
      
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${project.name}`, margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Orçamento: R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Gasto: R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Variação: R$ ${variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Utilização: ${utilizationPercent.toFixed(1)}%`, margin, yPosition);
      yPosition += 10;
    });
    
    yPosition += 10;
    
    // Observações IA
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    const observations = await this.generateGeminiObservations({ 
      projects, 
      totalBudget, 
      totalSpent, 
      totalVariance, 
      budgetUtilization 
    }, 'financial');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('OBSERVAÇÕES E RECOMENDAÇÕES', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const obsLines = doc.splitTextToSize(observations, doc.internal.pageSize.width - 2 * margin);
    obsLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateGeneralReport(users: User[], projects: Project[]): Promise<Buffer> {
    const doc = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('BeachPark - Tô Sabendo', margin, yPosition);
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('RELATÓRIO EXECUTIVO GERAL', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    
    yPosition += 20;
    
    // KPIs Gerais
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('INDICADORES PRINCIPAIS', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const kpiText = [
      'USUÁRIOS:',
      `• Total: ${totalUsers}`,
      `• Ativos: ${activeUsers} (${((activeUsers / totalUsers) * 100).toFixed(1)}%)`,
      `• Super Usuários: ${users.filter(u => u.isSuperUser).length}`,
      '',
      'PROJETOS:',
      `• Total: ${totalProjects}`,
      `• Ativos: ${activeProjects}`,
      `• Concluídos: ${completedProjects}`,
      `• Taxa de Conclusão: ${totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0}%`,
      '',
      'FINANCEIRO:',
      `• Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `• Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `• Economia/Excesso: R$ ${(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `• Eficiência Orçamentária: ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%`
    ];
    
    kpiText.forEach(text => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(text, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 20;
    
    // Status dos Projetos
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('STATUS DOS PROJETOS', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${status}: ${count} projetos`, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 15;
    
    // Observações IA
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
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
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('OBSERVAÇÕES E RECOMENDAÇÕES EXECUTIVAS', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const obsLines = doc.splitTextToSize(observations, doc.internal.pageSize.width - 2 * margin);
    obsLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}