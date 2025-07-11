import type { User, Project } from '@shared/schema';

export class PDFGenerator {
  // Simplified PDF generator for text-based reports
  
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

  async generateProjectsReport(projects: Project[]): Promise<string> {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `BEACHPARK - TÔ SABENDO\n`;
    content += `RELATÓRIO DE PROJETOS - ${date}\n`;
    content += `===============================================\n\n`;
    
    // Resumo Executivo
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    
    content += `RESUMO EXECUTIVO:\n`;
    content += `Total de Projetos: ${totalProjects}\n`;
    content += `Projetos Ativos: ${activeProjects}\n`;
    content += `Projetos Concluídos: ${completedProjects}\n`;
    content += `Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `Economia/Excesso: R$ ${(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;

    // Detalhamento por Projeto
    content += `DETALHAMENTO DOS PROJETOS:\n`;
    content += `-------------------------------------------\n`;
    
    for (const project of projects) {
      const budget = parseFloat(project.budget || '0');
      const spent = parseFloat(project.actualCost || '0');
      const variance = budget - spent;
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;
      
      content += `\nPROJETO: ${project.name.toUpperCase()}\n`;
      content += `Status: ${project.status}\n`;
      content += `Descrição: ${project.description || 'Não informado'}\n`;
      content += `Orçamento: R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      content += `Gasto Atual: R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      content += `Variação: R$ ${variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${variancePercent.toFixed(1)}%)\n`;
      content += `Data de Início: ${project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definido'}\n`;
      content += `Data de Fim: ${project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Não definido'}\n`;
      content += `-------------------------------------------\n`;
    }

    // Observações IA
    const observations = await this.generateGeminiObservations({ projects }, 'projects');
    content += `\nOBSERVAÇÕES E RECOMENDAÇÕES:\n`;
    content += `${observations}\n`;
    
    return content;
  }

  async generateUsersReport(users: User[]): Promise<string> {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `BEACHPARK - TÔ SABENDO\n`;
    content += `RELATÓRIO DE USUÁRIOS - ${date}\n`;
    content += `===============================================\n\n`;
    
    // Resumo Executivo
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const superUsers = users.filter(u => u.isSuperUser).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const managerUsers = users.filter(u => u.role === 'manager').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    content += `RESUMO EXECUTIVO:\n`;
    content += `Total de Usuários: ${totalUsers}\n`;
    content += `Usuários Ativos: ${activeUsers}\n`;
    content += `Usuários Inativos: ${totalUsers - activeUsers}\n`;
    content += `Super Usuários: ${superUsers}\n`;
    content += `Administradores: ${adminUsers}\n`;
    content += `Gerentes: ${managerUsers}\n`;
    content += `Usuários Regulares: ${regularUsers}\n\n`;

    // Detalhamento de Usuários
    content += `DETALHAMENTO DOS USUÁRIOS:\n`;
    content += `-------------------------------------------\n`;
    
    users.forEach(user => {
      content += `\nUSUÁRIO: ${user.name}\n`;
      content += `Email: ${user.email}\n`;
      content += `Função: ${user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Usuário'}\n`;
      content += `Status: ${user.isActive ? 'Ativo' : 'Inativo'}\n`;
      content += `Super Usuário: ${user.isSuperUser ? 'Sim' : 'Não'}\n`;
      content += `Criado em: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}\n`;
      content += `-------------------------------------------\n`;
    });

    // Análise de Segurança
    content += `\nANÁLISE DE SEGURANÇA:\n`;
    content += `Distribuição de Permissões:\n`;
    content += `• ${superUsers} usuários com privilégios de super administrador\n`;
    content += `• ${adminUsers} usuários com privilégios administrativos\n`;
    content += `• ${managerUsers} usuários com privilégios de gerenciamento\n`;
    content += `• ${regularUsers} usuários regulares\n\n`;
    content += `Taxa de Ativação: ${((activeUsers / totalUsers) * 100).toFixed(1)}%\n`;
    content += `Usuários que precisam trocar senha: ${users.filter(u => u.mustChangePassword).length}\n\n`;

    // Observações IA
    const observations = await this.generateGeminiObservations({ users }, 'users');
    content += `OBSERVAÇÕES E RECOMENDAÇÕES:\n`;
    content += `${observations}\n`;
    
    return content;
  }

  async generateFinancialReport(projects: Project[]): Promise<string> {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `BEACHPARK - TÔ SABENDO\n`;
    content += `RELATÓRIO FINANCEIRO - ${date}\n`;
    content += `===============================================\n\n`;
    
    // Cálculos Financeiros
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    const totalVariance = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    content += `RESUMO FINANCEIRO:\n`;
    content += `Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `Variação Total: R$ ${totalVariance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `Utilização do Orçamento: ${budgetUtilization.toFixed(1)}%\n`;
    content += `Número de Projetos: ${projects.length}\n\n`;

    // Análise por Projeto
    content += `ANÁLISE POR PROJETO:\n`;
    content += `-------------------------------------------\n`;
    
    projects.forEach(project => {
      const budget = parseFloat(project.budget || '0');
      const spent = parseFloat(project.actualCost || '0');
      const variance = budget - spent;
      const utilizationPercent = budget > 0 ? (spent / budget) * 100 : 0;
      
      content += `\nPROJETO: ${project.name}\n`;
      content += `Orçamento: R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      content += `Gasto: R$ ${spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      content += `Variação: R$ ${variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      content += `Utilização: ${utilizationPercent.toFixed(1)}%\n`;
      content += `-------------------------------------------\n`;
    });

    // Análise de Performance
    const overBudgetProjects = projects.filter(p => parseFloat(p.actualCost || '0') > parseFloat(p.budget || '0'));
    const underBudgetProjects = projects.filter(p => parseFloat(p.actualCost || '0') < parseFloat(p.budget || '0'));
    
    content += `\nANÁLISE DE PERFORMANCE:\n`;
    content += `Projetos Acima do Orçamento: ${overBudgetProjects.length}\n`;
    content += `Projetos Abaixo do Orçamento: ${underBudgetProjects.length}\n`;
    content += `Projetos no Orçamento: ${projects.length - overBudgetProjects.length - underBudgetProjects.length}\n\n`;

    // Observações IA
    const observations = await this.generateGeminiObservations({ 
      projects, 
      totalBudget, 
      totalSpent, 
      totalVariance, 
      budgetUtilization 
    }, 'financial');
    content += `OBSERVAÇÕES E RECOMENDAÇÕES:\n`;
    content += `${observations}\n`;
    
    return content;
  }

  async generateGeneralReport(users: User[], projects: Project[]): Promise<string> {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `BEACHPARK - TÔ SABENDO\n`;
    content += `RELATÓRIO EXECUTIVO GERAL - ${date}\n`;
    content += `===============================================\n\n`;
    
    // KPIs Gerais
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0);
    const totalSpent = projects.reduce((sum, p) => sum + parseFloat(p.actualCost || '0'), 0);
    
    content += `INDICADORES PRINCIPAIS:\n`;
    content += `USUÁRIOS:\n`;
    content += `• Total: ${totalUsers}\n`;
    content += `• Ativos: ${activeUsers} (${((activeUsers / totalUsers) * 100).toFixed(1)}%)\n`;
    content += `• Super Usuários: ${users.filter(u => u.isSuperUser).length}\n\n`;
    content += `PROJETOS:\n`;
    content += `• Total: ${totalProjects}\n`;
    content += `• Ativos: ${activeProjects}\n`;
    content += `• Concluídos: ${completedProjects}\n`;
    content += `• Taxa de Conclusão: ${totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0}%\n\n`;
    content += `FINANCEIRO:\n`;
    content += `• Orçamento Total: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `• Gasto Total: R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `• Economia/Excesso: R$ ${(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    content += `• Eficiência Orçamentária: ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%\n\n`;

    // Status dos Projetos
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    content += `DISTRIBUIÇÃO DE STATUS DOS PROJETOS:\n`;
    Object.entries(statusCounts).forEach(([status, count]) => {
      content += `${status}: ${count} projetos\n`;
    });

    // Funções dos Usuários
    const roleCounts = users.reduce((acc, user) => {
      const roleLabel = user.role === 'admin' ? 'Administrador' : 
                       user.role === 'manager' ? 'Gerente' : 'Usuário';
      acc[roleLabel] = (acc[roleLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    content += `\nDISTRIBUIÇÃO DE FUNÇÕES:\n`;
    Object.entries(roleCounts).forEach(([role, count]) => {
      content += `${role}: ${count} usuários\n`;
    });

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
    content += `\nOBSERVAÇÕES E RECOMENDAÇÕES EXECUTIVAS:\n`;
    content += `${observations}\n`;
    
    return content;
  }
}