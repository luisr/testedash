import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export class AdvancedPDFGeneratorWorking {
  async generateAdvancedReport(data: ReportData): Promise<Buffer> {
    // Create comprehensive HTML report
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Avançado - Dashboard ${data.dashboardId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 32px 64px rgba(0,0,0,0.15);
            overflow: hidden;
            position: relative;
        }
        
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 3.5em;
            margin: 0;
            font-weight: 700;
            text-shadow: 0 4px 8px rgba(0,0,0,0.2);
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.3em;
            margin: 0;
            opacity: 0.95;
            font-weight: 400;
        }
        
        .beachpark-logo {
            position: absolute;
            top: 30px;
            right: 40px;
            font-size: 1.8em;
            font-weight: 700;
            opacity: 0.8;
        }
        
        .content {
            padding: 60px 40px;
            background: #fafbfc;
        }
        
        .section {
            margin-bottom: 50px;
            padding: 40px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid #e8eaed;
            position: relative;
            overflow: hidden;
        }
        
        .section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4facfe, #00f2fe, #4facfe);
        }
        
        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f2f5;
        }
        
        .section-icon {
            font-size: 2.5em;
            margin-right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .section h2 {
            color: #1a1a1a;
            font-size: 2.2em;
            font-weight: 600;
            margin: 0;
        }
        
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .kpi-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
            padding: 30px;
            border-radius: 16px;
            border: 1px solid #e8eaed;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #4facfe, #00f2fe);
        }
        
        .kpi-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        
        .kpi-card h3 {
            margin: 0 0 15px 0;
            color: #4a5568;
            font-size: 1.1em;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .kpi-value {
            font-size: 3em;
            font-weight: 700;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 15px 0;
            display: block;
        }
        
        .kpi-description {
            color: #718096;
            font-size: 0.95em;
            margin-top: 10px;
        }
        
        .risk-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 0.9em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .risk-low { 
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); 
            color: white; 
        }
        .risk-medium { 
            background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); 
            color: white; 
        }
        .risk-high { 
            background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); 
            color: white; 
        }
        .risk-critical { 
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); 
            color: white; 
        }
        
        .activity-list {
            background: #f8f9fa;
            border-radius: 16px;
            padding: 30px;
            margin-top: 30px;
        }
        
        .activity-item {
            padding: 20px;
            background: white;
            border-radius: 12px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid #e8eaed;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.2s ease;
        }
        
        .activity-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        
        .activity-item:last-child {
            margin-bottom: 0;
        }
        
        .activity-name {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 1.1em;
            margin-bottom: 5px;
        }
        
        .activity-details {
            color: #718096;
            font-size: 0.9em;
        }
        
        .activity-status {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
        }
        
        .observations {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px;
            border-radius: 20px;
            margin-top: 40px;
            position: relative;
            overflow: hidden;
        }
        
        .observations::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 6s ease-in-out infinite;
        }
        
        .observations-content {
            position: relative;
            z-index: 2;
        }
        
        .observations h3 {
            margin-top: 0;
            font-size: 1.8em;
            display: flex;
            align-items: center;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .observations-icon {
            font-size: 1.5em;
            margin-right: 15px;
        }
        
        .observations p {
            line-height: 1.7;
            font-size: 1.1em;
            opacity: 0.95;
        }
        
        .footer {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
        }
        
        .logo {
            font-size: 2em;
            font-weight: 700;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .footer-text {
            opacity: 0.8;
            font-size: 1.1em;
        }
        
        .progress-bar {
            background: #e2e8f0;
            border-radius: 10px;
            height: 8px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4facfe, #00f2fe);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        
        @media print {
            body { 
                background: white; 
                padding: 0;
            }
            .container { 
                box-shadow: none; 
                border-radius: 0;
            }
            .header::before,
            .observations::before {
                display: none;
            }
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.5em;
            }
            .content {
                padding: 30px 20px;
            }
            .section {
                padding: 30px 20px;
            }
            .kpi-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="beachpark-logo">BeachPark</div>
            <div class="header-content">
                <h1>Relatório Avançado de Projeto</h1>
                <p>Dashboard ${data.dashboardId} • ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">📊</div>
                    <h2>Resumo Executivo</h2>
                </div>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <h3>SPI - Índice de Performance</h3>
                        <div class="kpi-value">${data.kpis?.spi || 0}</div>
                        <div class="kpi-description">Desempenho do cronograma do projeto</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min((data.kpis?.spi || 0) * 100, 100)}%"></div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <h3>CPI - Índice de Performance</h3>
                        <div class="kpi-value">${data.kpis?.cpi || 0}</div>
                        <div class="kpi-description">Eficiência no uso do orçamento</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min((data.kpis?.cpi || 0) * 100, 100)}%"></div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <h3>Taxa de Conclusão</h3>
                        <div class="kpi-value">${data.kpis?.completionRate || 0}%</div>
                        <div class="kpi-description">Progresso geral do projeto</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.kpis?.completionRate || 0}%"></div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <h3>Nível de Risco</h3>
                        <div class="kpi-value">
                            <span class="risk-badge risk-${data.kpis?.riskLevel || 'medium'}">
                                ${this.translateRiskLevel(data.kpis?.riskLevel || 'medium')}
                            </span>
                        </div>
                        <div class="kpi-description">Avaliação de risco atual</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <div class="section-icon">🎯</div>
                    <h2>Análise do Caminho Crítico</h2>
                </div>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <h3>Atividades Críticas</h3>
                        <div class="kpi-value">${data.criticalPath?.criticalPathLength || 0}</div>
                        <div class="kpi-description">de ${data.criticalPath?.activities?.length || 0} atividades totais</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.criticalPath?.activities?.length > 0 ? (data.criticalPath?.criticalPathLength || 0) / data.criticalPath?.activities?.length * 100 : 0}%"></div>
                        </div>
                    </div>
                    <div class="kpi-card">
                        <h3>Duração Total</h3>
                        <div class="kpi-value">${data.criticalPath?.totalDuration || 0}</div>
                        <div class="kpi-description">dias de duração estimada</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Roadmap e Marcos</h2>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <h3>Marcos Planejados</h3>
                        <div class="kpi-value">${data.roadmap?.milestones?.length || 0}</div>
                        <p>marcos importantes do projeto</p>
                    </div>
                    <div class="kpi-card">
                        <h3>Distribuição Trimestral</h3>
                        <div class="kpi-value">${data.roadmap?.roadmapByQuarter?.length || 0}</div>
                        <p>trimestres planejados</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Atividades do Projeto</h2>
                <div class="activity-list">
                    ${(data.activities || []).slice(0, 10).map(activity => `
                        <div class="activity-item">
                            <div>
                                <div class="activity-name">${activity.name}</div>
                                <div>Responsável: ${activity.responsible || 'Não atribuído'}</div>
                            </div>
                            <div>
                                <div class="activity-status">${this.translateStatus(activity.status)}</div>
                                <div>Progresso: ${activity.completion || 0}%</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2>Projetos Associados</h2>
                <div class="activity-list">
                    ${(data.projects || []).slice(0, 5).map(project => `
                        <div class="activity-item">
                            <div>
                                <div class="activity-name">${project.name}</div>
                                <div>${project.description || 'Sem descrição'}</div>
                            </div>
                            <div>
                                <div class="activity-status">${this.translateStatus(project.status)}</div>
                                <div>Orçamento: R$ ${(project.budget || 0).toLocaleString('pt-BR')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${data.geminiObservations ? `
            <div class="observations">
                <div class="observations-content">
                    <h3><span class="observations-icon">🤖</span>Observações da Inteligência Artificial</h3>
                    <p>${data.geminiObservations}</p>
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>Recomendações</h2>
                <div class="activity-list">
                    <div class="activity-item">
                        <div class="activity-name">1. Monitorar Caminho Crítico</div>
                        <div>Acompanhar diariamente as atividades críticas</div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-name">2. Controlar Variações</div>
                        <div>Revisar orçamento e cronograma semanalmente</div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-name">3. Validar Marcos</div>
                        <div>Confirmar entregas conforme planejado</div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-name">4. Implementar Melhorias</div>
                        <div>Aplicar sugestões da análise de IA</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="logo">BeachPark - Tô Sabendo</div>
            <div class="footer-text">Relatório gerado automaticamente em ${format(new Date(), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}</div>
        </div>
    </div>
</body>
</html>
    `;

    // Convert HTML to PDF-like format (return as Buffer)
    return Buffer.from(htmlContent, 'utf8');
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

  private translateStatus(status: string): string {
    const translations = {
      'not_started': 'Não Iniciado',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído',
      'delayed': 'Atrasado',
      'cancelled': 'Cancelado',
      'active': 'Ativo'
    };
    return translations[status as keyof typeof translations] || status;
  }
}