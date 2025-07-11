import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  availableColumns: Array<{ key: string; label: string }>;
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeCharts: boolean;
  includeFilters: boolean;
  columns: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export default function ExportModal({ isOpen, onClose, onExport, availableColumns }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'pdf'>('xlsx');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(availableColumns.map(col => col.key));
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  const formatIcons = {
    csv: FileText,
    xlsx: FileSpreadsheet,
    pdf: FileDown
  };

  const formatLabels = {
    csv: 'CSV - Valores separados por vírgula',
    xlsx: 'Excel - Planilha Microsoft Excel',
    pdf: 'PDF - Documento com gráficos'
  };

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const handleSelectNone = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        includeCharts,
        includeFilters,
        columns: selectedColumns,
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined
      };
      await onExport(options);
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formato de Exportação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de Exportação</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'csv' | 'xlsx' | 'pdf')}>
              {Object.entries(formatLabels).map(([key, label]) => {
                const Icon = formatIcons[key as keyof typeof formatIcons];
                return (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="w-4 h-4" />
                      {label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Opções de Conteúdo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Conteúdo a Incluir</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                  disabled={format === 'csv'}
                />
                <Label htmlFor="include-charts" className="text-sm">
                  Incluir gráficos e visualizações
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-filters"
                  checked={includeFilters}
                  onCheckedChange={setIncludeFilters}
                />
                <Label htmlFor="include-filters" className="text-sm">
                  Incluir configurações de filtros aplicados
                </Label>
              </div>
            </div>
          </div>

          {/* Seleção de Colunas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Colunas a Exportar</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Selecionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  Limpar Seleção
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {availableColumns.map(column => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <Label htmlFor={column.key} className="text-sm">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtro de Data */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filtro de Data (Opcional)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                  Data Inicial
                </Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Selecionar data inicial"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                  Data Final
                </Label>
                <DatePicker
                  date={endDate}
                  onDateChange={setEndDate}
                  placeholder="Selecionar data final"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedColumns.length === 0 || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}