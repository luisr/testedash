-- Inserir atividades de teste com estrutura hierárquica
INSERT INTO activities (name, description, dashboard_id, discipline, responsible, priority, status, level, parent_activity_id, completion_percentage, planned_start_date, planned_end_date) VALUES
-- Atividade principal 1
('Desenvolvimento da Plataforma', 'Desenvolvimento completo da plataforma web', 1, 'Tecnologia', 'João Silva', 'high', 'in_progress', 0, NULL, '25', '2024-01-01', '2024-06-30'),

-- Subtarefas da atividade 1
('Backend API', 'Desenvolvimento das APIs do backend', 1, 'Backend', 'Maria Santos', 'high', 'in_progress', 1, 1, '40', '2024-01-01', '2024-03-31'),
('Frontend Web', 'Desenvolvimento da interface web', 1, 'Frontend', 'Carlos Oliveira', 'high', 'not_started', 1, 1, '0', '2024-02-01', '2024-05-31'),
('Testes Automatizados', 'Implementação de testes unitários e integração', 1, 'QA', 'Ana Costa', 'medium', 'not_started', 1, 1, '0', '2024-04-01', '2024-06-15'),

-- Atividade principal 2
('Infraestrutura e Deploy', 'Configuração da infraestrutura de produção', 1, 'DevOps', 'Roberto Lima', 'critical', 'delayed', 0, NULL, '15', '2024-01-15', '2024-05-15'),

-- Subtarefas da atividade 2
('Configuração AWS', 'Setup dos serviços AWS', 1, 'Cloud', 'Roberto Lima', 'critical', 'in_progress', 1, 5, '30', '2024-01-15', '2024-03-01'),
('CI/CD Pipeline', 'Configuração do pipeline de deploy', 1, 'DevOps', 'Roberto Lima', 'high', 'not_started', 1, 5, '0', '2024-02-15', '2024-04-01'),
('Monitoramento', 'Implementação de monitoramento e alertas', 1, 'Observability', 'Fernanda Dias', 'medium', 'not_started', 1, 5, '0', '2024-03-01', '2024-05-15'),

-- Atividade principal 3
('Documentação e Treinamento', 'Criação de documentação e materiais de treinamento', 1, 'Documentação', 'Lucas Pereira', 'medium', 'not_started', 0, NULL, '0', '2024-05-01', '2024-07-31'),

-- Subtarefas da atividade 3
('Manual do Usuário', 'Criação do manual do usuário final', 1, 'Documentação', 'Lucas Pereira', 'medium', 'not_started', 1, 9, '0', '2024-05-01', '2024-06-15'),
('Documentação Técnica', 'Documentação técnica para desenvolvedores', 1, 'Documentação', 'Lucas Pereira', 'low', 'not_started', 1, 9, '0', '2024-05-15', '2024-07-01'),
('Treinamento da Equipe', 'Sessões de treinamento para equipe interna', 1, 'Treinamento', 'Patricia Silva', 'medium', 'not_started', 1, 9, '0', '2024-06-01', '2024-07-31');