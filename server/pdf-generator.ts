import type { User, Project } from '@shared/schema';

// Dynamic import for jsPDF
const createPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  return { jsPDF, autoTable };
};

export class PDFGenerator {
  private async generateGeminiObservations(data: any, reportType: string): Promise<string> {
    try {
      // For now, return static observations until we fix the AI integration
      switch (reportType) {
        case 'projects':
          return `OBSERVAÇÕES SOBRE PROJETOS:
- Total de ${data.projects.length} projetos identificados
- Diversidade de status indica boa distribuição de fases
- Orçamentos variam significativamente, requerendo atenção à alocação
- Alguns projetos sem datas definidas merecem planejamento mais detalhado
- Recomenda-se revisar projetos com alto custo real vs orçamento`;
          
        case 'users':
          return `OBSERVAÇÕES SOBRE USUÁRIOS:
- Base de usuários de ${data.users.length} pessoas
- Distribuição de papéis parece equilibrada
- Usuários ativos demonstram bom engajamento
- Super usuários garantem governança adequada
- Recomenda-se revisão periódica de permissões`;
          
        case 'financial':
          return `OBSERVAÇÕES FINANCEIRAS:
- Controle orçamentário em andamento
- Variações significativas entre projetos
- Alguns projetos excedem orçamento previsto
- Oportunidades de otimização identificadas
- Recomenda-se monitoramento mais frequente`;
          
        default:
          return `OBSERVAÇÕES GERAIS:
- Sistema em operação com boa base de dados
- Processos de gestão estabelecidos
- Oportunidades de melhoria identificadas
- Recomenda-se acompanhamento contínuo dos indicadores`;
      }
    } catch (error) {
      return "Observações automáticas não disponíveis no momento.";
    }
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
    const { jsPDF } = await createPDF();
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
    
    // Tabela de Projetos
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }
    
    const tableData = projects.map(project => [
      project.name,
      project.status,
      `R$ ${parseFloat(project.budget || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${parseFloat(project.actualCost || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/A',
      project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/A'
    ]);

    (doc as any).autoTable({
      head: [['Projeto', 'Status', 'Orçamento', 'Gasto', 'Início', 'Fim']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
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
    const { jsPDF } = await createPDF();
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
    
    // Tabela de Usuários
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }
    
    const tableData = users.map(user => [
      user.name,
      user.email,
      user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Gerente' : 'Usuário',
      user.isActive ? 'Ativo' : 'Inativo',
      user.isSuperUser ? 'Sim' : 'Não',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'
    ]);

    (doc as any).autoTable({
      head: [['Nome', 'Email', 'Função', 'Status', 'Super User', 'Criado em']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
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
    const { jsPDF } = await createPDF();
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
    
    // Tabela Financeira
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }
    
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

    (doc as any).autoTable({
      head: [['Projeto', 'Orçamento', 'Gasto', 'Variação', 'Utilização']],
      body: tableData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
    
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
    const { jsPDF } = await createPDF();
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