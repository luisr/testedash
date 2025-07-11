import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Upload, 
  Download, 
  Columns, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react";
import { CustomColumn } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TableConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
  customColumns: CustomColumn[];
  activities: any[];
  onCustomColumnsUpdate: () => void;
  onActivitiesImport: (activities: any[]) => void;
  onExport: (options: any) => void;
}

export default function TableConfigModal({ 
  isOpen, 
  onClose, 
  dashboardId, 
  customColumns, 
  activities, 
  onCustomColumnsUpdate,
  onActivitiesImport,
  onExport
}: TableConfigModalProps) {
  const [activeTab, setActiveTab] = useState("columns");
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' });
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    columns: [] as string[],
    includeCharts: false,
    includeFilters: false,
    dateRange: null as any
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Available column types
  const columnTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'select', label: 'Seleção' },
    { value: 'formula', label: 'Fórmula' }
  ];

  // Standard activity columns
  const standardColumns = [
    { key: 'name', label: 'Nome', required: true },
    { key: 'description', label: 'Descrição' },
    { key: 'discipline', label: 'Disciplina' },
    { key: 'responsible', label: 'Responsável' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Prioridade' },
    { key: 'plannedStartDate', label: 'Data Início Planejada' },
    { key: 'plannedEndDate', label: 'Data Fim Planejada' },
    { key: 'actualStartDate', label: 'Data Início Real' },
    { key: 'actualEndDate', label: 'Data Fim Real' },
    { key: 'plannedValue', label: 'Valor Planejado' },
    { key: 'actualCost', label: 'Custo Real' },
    { key: 'earnedValue', label: 'Valor Agregado' },
    { key: 'completionPercentage', label: 'Percentual Conclusão' },
    { key: 'associatedRisk', label: 'Risco Associado' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      parseCSVFile(file);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive"
      });
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) return;
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      setImportPreview(data.slice(0, 5)); // Preview first 5 rows
      
      // Auto-map columns with intelligent matching
      const mapping: Record<string, string> = {};
      const normalizeText = (text: string) => text.toLowerCase()
        .replace(/[áàâãä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôõö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]/g, '');

      headers.forEach(header => {
        const normalizedHeader = normalizeText(header);
        
        // Exact and partial matches with keywords
        const matchingColumn = standardColumns.find(col => {
          const normalizedLabel = normalizeText(col.label);
          const normalizedKey = normalizeText(col.key);
          
          // Exact matches
          if (normalizedHeader === normalizedLabel || normalizedHeader === normalizedKey) {
            return true;
          }
          
          // Keyword-based matching
          const keywordMatches = {
            'name': ['nome', 'atividade', 'tarefa', 'task'],
            'description': ['descricao', 'desc', 'detalhes', 'observacoes'],
            'discipline': ['disciplina', 'area', 'setor', 'departamento'],
            'responsible': ['responsavel', 'usuario', 'pessoa', 'encarregado'],
            'status': ['status', 'situacao', 'estado', 'fase'],
            'priority': ['prioridade', 'urgencia', 'importancia'],
            'plannedStartDate': ['inicioplaneado', 'planejadoinicio', 'startdate', 'datainicio'],
            'plannedEndDate': ['fimplanejado', 'planejadofim', 'enddate', 'datafim'],
            'actualStartDate': ['inicioreal', 'realinicio', 'actualstart'],
            'actualEndDate': ['fimreal', 'realfim', 'actualend'],
            'plannedValue': ['valorplanejado', 'planejado', 'orcamento', 'budget'],
            'actualCost': ['custoreal', 'gastoreal', 'real', 'custo'],
            'earnedValue': ['valoragregado', 'earned', 'agregado'],
            'completionPercentage': ['percentual', 'conclusao', 'progresso', 'percentage', 'percent'],
            'associatedRisk': ['risco', 'risk', 'riscos']
          };
          
          const keywords = keywordMatches[col.key as keyof typeof keywordMatches] || [];
          return keywords.some(keyword => 
            normalizedHeader.includes(keyword) || keyword.includes(normalizedHeader)
          );
        });
        
        if (matchingColumn) {
          mapping[header] = matchingColumn.key;
        }
      });
      
      setImportMapping(mapping);
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;
    
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Create custom columns for unmapped fields
        const unmappedHeaders = headers.filter(h => !importMapping[h]);
        for (const header of unmappedHeaders) {
          await createCustomColumn({
            name: header,
            type: 'text',
            dashboardId
          });
        }
        
        // Process data
        const activities = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const activity: any = {
            dashboardId,
            name: '',
            discipline: '',
            responsible: '',
            status: 'not_started',
            priority: 'medium'
          };
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            const mappedKey = importMapping[header];
            
            if (mappedKey) {
              // Map to standard column with intelligent type conversion
              if (mappedKey === 'completionPercentage') {
                const numValue = parseFloat(value.replace('%', ''));
                activity[mappedKey] = isNaN(numValue) ? 0 : numValue;
              } else if (mappedKey.includes('Date')) {
                if (value) {
                  const date = new Date(value);
                  activity[mappedKey] = isNaN(date.getTime()) ? null : date.toISOString();
                } else {
                  activity[mappedKey] = null;
                }
              } else if (mappedKey.includes('Value') || mappedKey.includes('Cost')) {
                const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                activity[mappedKey] = isNaN(numValue) ? 0 : numValue;
              } else if (mappedKey === 'status') {
                // Map status values
                const statusMap: Record<string, string> = {
                  'nao iniciado': 'not_started',
                  'não iniciado': 'not_started',
                  'em andamento': 'in_progress',
                  'concluido': 'completed',
                  'concluído': 'completed',
                  'atrasado': 'delayed',
                  'cancelado': 'cancelled'
                };
                activity[mappedKey] = statusMap[value.toLowerCase()] || value;
              } else if (mappedKey === 'priority') {
                // Map priority values
                const priorityMap: Record<string, string> = {
                  'baixa': 'low',
                  'media': 'medium',
                  'média': 'medium',
                  'alta': 'high',
                  'critica': 'critical',
                  'crítica': 'critical'
                };
                activity[mappedKey] = priorityMap[value.toLowerCase()] || value;
              } else {
                activity[mappedKey] = value;
              }
            } else {
              // Add to custom fields
              activity[header] = value;
            }
          });
          
          return activity;
        });
        
        // Import activities
        await onActivitiesImport(activities);
        await onCustomColumnsUpdate();
        
        toast({
          title: "Sucesso",
          description: `${activities.length} atividades importadas com sucesso!`,
        });
        
        // Reset import state
        setImportFile(null);
        setImportPreview([]);
        setImportMapping({});
        setActiveTab("columns");
      };
      reader.readAsText(importFile);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao importar atividades. Verifique o formato do arquivo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomColumn = async (column: { name: string; type: string; dashboardId: number }) => {
    try {
      await apiRequest("POST", "/api/custom-columns", column);
    } catch (error) {
      console.error('Error creating custom column:', error);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    try {
      await apiRequest("DELETE", `/api/custom-columns/${columnId}`);
      await onCustomColumnsUpdate();
      toast({
        title: "Sucesso",
        description: "Coluna removida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover coluna.",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    const selectedColumns = exportOptions.columns.length > 0 
      ? exportOptions.columns 
      : standardColumns.map(col => col.key);
    
    onExport({
      ...exportOptions,
      columns: selectedColumns
    });
    
    toast({
      title: "Sucesso",
      description: "Exportação iniciada! O arquivo será baixado em breve.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações da Tabela
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="columns" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Colunas
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar CSV
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="columns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Colunas Padrão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {standardColumns.map((col) => (
                      <div key={col.key} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <span className="text-sm font-medium">{col.label}</span>
                        <Badge variant={col.required ? "default" : "secondary"}>
                          {col.required ? "Obrigatória" : "Opcional"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Colunas Personalizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customColumns.map((col) => (
                      <div key={col.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <div>
                          <span className="text-sm font-medium">{col.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {columnTypes.find(t => t.value === col.type)?.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteColumn(col.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome da coluna"
                          value={newColumn.name}
                          onChange={(e) => setNewColumn({...newColumn, name: e.target.value})}
                        />
                        <Select value={newColumn.type} onValueChange={(value) => setNewColumn({...newColumn, type: value})}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {columnTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={() => createCustomColumn({...newColumn, dashboardId})}
                          disabled={!newColumn.name}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Importar Atividades via CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Arquivo CSV</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    Selecione um arquivo CSV com as atividades. Campos não mapeados serão criados como colunas personalizadas.
                  </p>
                </div>
                
                {importPreview.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Mapeamento Automático</h4>
                      <p className="text-sm text-blue-700">
                        {Object.keys(importMapping).filter(k => importMapping[k]).length} de {Object.keys(importPreview[0]).length} colunas mapeadas automaticamente
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Mapeamento de Colunas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(importPreview[0]).map(header => (
                          <div key={header} className="space-y-1">
                            <Label className="text-xs flex items-center gap-2">
                              {header}
                              {importMapping[header] && (
                                <span className="text-green-600 text-xs">✓ Mapeado</span>
                              )}
                            </Label>
                            <Select 
                              value={importMapping[header] || '__new__'}
                              onValueChange={(value) => setImportMapping({...importMapping, [header]: value === '__new__' ? '' : value})}
                            >
                              <SelectTrigger className={importMapping[header] ? 'border-green-500 bg-green-50' : ''}>
                                <SelectValue placeholder="Selecione uma coluna" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__new__">Criar nova coluna</SelectItem>
                                {standardColumns.map(col => (
                                  <SelectItem key={col.key} value={col.key}>
                                    {col.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Prévia dos Dados</h4>
                      <div className="border rounded overflow-auto max-h-40">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(importPreview[0]).map(header => (
                                <th key={header} className="p-2 text-left">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((row, index) => (
                              <tr key={index} className="border-b">
                                {Object.values(row).map((value: any, cellIndex) => (
                                  <td key={cellIndex} className="p-2">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <Button onClick={handleImportConfirm} disabled={loading}>
                      {loading ? "Importando..." : "Confirmar Importação"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exportar Atividades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Formato</Label>
                    <Select value={exportOptions.format} onValueChange={(value) => setExportOptions({...exportOptions, format: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Colunas a Exportar</Label>
                    <div className="border rounded p-3 max-h-32 overflow-y-auto">
                      {standardColumns.map(col => (
                        <div key={col.key} className="flex items-center space-x-2">
                          <Checkbox
                            checked={exportOptions.columns.includes(col.key)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setExportOptions({
                                  ...exportOptions,
                                  columns: [...exportOptions.columns, col.key]
                                });
                              } else {
                                setExportOptions({
                                  ...exportOptions,
                                  columns: exportOptions.columns.filter(c => c !== col.key)
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{col.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={exportOptions.includeCharts}
                      onCheckedChange={(checked) => setExportOptions({...exportOptions, includeCharts: checked as boolean})}
                    />
                    <Label className="text-sm">Incluir gráficos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={exportOptions.includeFilters}
                      onCheckedChange={(checked) => setExportOptions({...exportOptions, includeFilters: checked as boolean})}
                    />
                    <Label className="text-sm">Incluir filtros aplicados</Label>
                  </div>
                </div>
                
                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Atividades
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}