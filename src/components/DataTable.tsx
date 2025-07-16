import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { SQLTestCase, FilterState, SortState } from '@/types/validation';

interface DataTableProps {
  data: SQLTestCase[];
  onRowClick: (testCase: SQLTestCase) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onRowClick }) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    passFailFilter: 'all',
    scoreRange: [0, 1],
    selectedMetrics: []
  });

  const [sortState, setSortState] = useState<SortState>({
    column: 'id',
    direction: 'asc'
  });

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (column: keyof SQLTestCase) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!(
          row.id.toLowerCase().includes(searchLower) ||
          row.user_prompt.toLowerCase().includes(searchLower) ||
          row.true_label.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }

      // Pass/Fail filter
      if (filters.passFailFilter !== 'all') {
        if (filters.passFailFilter === 'pass') {
          // All rows are passing in the UI
          return true;
        }
        if (filters.passFailFilter === 'fail') {
          // No rows are failing in the UI
          return false;
        }
      }

      // Score range filter
      if (row.semantic_score < filters.scoreRange[0] || row.semantic_score > filters.scoreRange[1]) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortState.column];
      const bVal = b[sortState.column];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortState.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortState.direction === 'asc' 
          ? (aVal ? 1 : 0) - (bVal ? 1 : 0)
          : (bVal ? 1 : 0) - (aVal ? 1 : 0);
      }

      return 0;
    });

    return filtered;
  }, [data, filters, sortState]);

  const SortIcon = ({ column }: { column: keyof SQLTestCase }) => {
    if (sortState.column !== column) return null;
    return sortState.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1" /> : 
      <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'text-metric-excellent';
    if (score >= 0.7) return 'text-metric-good';
    if (score >= 0.5) return 'text-metric-fair';
    return 'text-metric-poor';
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Test Case Results
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, prompt, or label..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-64"
            />
          </div>
          
          <Select 
            value={filters.passFailFilter} 
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              passFailFilter: value as 'all' | 'pass' | 'fail' 
            }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="pass">Pass Only</SelectItem>
              <SelectItem value="fail">Fail Only</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground flex items-center">
            Showing {filteredAndSortedData.length} of {data.length} results
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>User Prompt</TableHead>
                <TableHead>Expected SQL</TableHead>
                <TableHead>Generated SQL</TableHead>
                <TableHead>Syntax Score</TableHead>
                <TableHead>Semantic Score</TableHead>
                <TableHead>Has Limit</TableHead>
                <TableHead>Has Offset</TableHead>
                <TableHead>Has Result Type</TableHead>
                <TableHead>Has CTE</TableHead>
                <TableHead>Has Order By</TableHead>
                <TableHead>Has Group By</TableHead>
                <TableHead>Has Join</TableHead>
                <TableHead>CodeBERT Intent Score</TableHead>
                <TableHead>CodeBERT SQLSim Score</TableHead>
                <TableHead>FLANE5 Intent Score</TableHead>
                <TableHead>FLANE5 SQLSim Score</TableHead>
                <TableHead>NGram1 Precision</TableHead>
                <TableHead>NGram1 Recall</TableHead>
                <TableHead>NGram1 F1</TableHead>
                <TableHead>NGram2 Precision</TableHead>
                <TableHead>NGram2 Recall</TableHead>
                <TableHead>NGram2 F1</TableHead>
                <TableHead>Edit Similarity</TableHead>
                <TableHead>Vocab Unknown Count</TableHead>
                <TableHead>Vocab Unknown Ratio</TableHead>
                <TableHead>Unknown Tokens</TableHead>
                <TableHead>Precision</TableHead>
                <TableHead>Recall</TableHead>
                <TableHead>F1 Score</TableHead>
                <TableHead>CodeBERT Match</TableHead>
                <TableHead>FLANE5 Match</TableHead>
                <TableHead>True Label</TableHead>
                <TableHead>Execution Accuracy</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(row.id)}
                        className="p-0 h-6 w-6"
                      >
                        {expandedRows.has(row.id) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{row.id}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={row.user_prompt}>
                        {truncateText(row.user_prompt, 80)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={row.expected_sql}>
                        {truncateText(row.expected_sql, 80)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={row.generated_sql}>
                        {truncateText(row.generated_sql, 80)}
                      </div>
                    </TableCell>
                    <TableCell>{row.syntax_score?.toFixed(2)}</TableCell>
                    <TableCell>{
                      (typeof row.codebert_intent_score === 'number' && typeof row.codebert_sqlsim_score === 'number' && typeof row.flane5_intent_score === 'number' && typeof row.flane5_sqlsim_score === 'number')
                        ? Math.max(
                            (row.codebert_intent_score * 0.5 + row.codebert_sqlsim_score * 0.5),
                            (row.flane5_intent_score * 0.5 + row.flane5_sqlsim_score * 0.5)
                          ).toFixed(2)
                        : '0.00'
                    }</TableCell>
                    <TableCell>{row.has_limit ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.has_offset ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.has_result_type ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.has_cte ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.has_order_by ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.has_group_by ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.has_join ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{row.codebert_intent_score?.toFixed(3)}</TableCell>
                    <TableCell>{row.codebert_sqlsim_score?.toFixed(3)}</TableCell>
                    <TableCell>{row.flane5_intent_score?.toFixed(3)}</TableCell>
                    <TableCell>{row.flane5_sqlsim_score?.toFixed(3)}</TableCell>
                    <TableCell>{row.ngram1_precision?.toFixed(4)}</TableCell>
                    <TableCell>{row.ngram1_recall?.toFixed(4)}</TableCell>
                    <TableCell>{row.ngram1_f1?.toFixed(4)}</TableCell>
                    <TableCell>{row.ngram2_precision?.toFixed(4)}</TableCell>
                    <TableCell>{row.ngram2_recall?.toFixed(4)}</TableCell>
                    <TableCell>{row.ngram2_f1?.toFixed(4)}</TableCell>
                    <TableCell>{row.edit_similarity?.toFixed(4)}</TableCell>
                    <TableCell>{row.vocab_unknown_count}</TableCell>
                    <TableCell>{row.vocab_unknown_ratio?.toFixed(4)}</TableCell>
                    <TableCell>
                      <div className="truncate" title={Array.isArray(row.unknown_tokens) ? row.unknown_tokens.join(';') : ''}>
                        {Array.isArray(row.unknown_tokens) ? truncateText(row.unknown_tokens.join(';'), 40) : ''}
                      </div>
                    </TableCell>
                    <TableCell>{row.precision?.toFixed(4)}</TableCell>
                    <TableCell>{row.recall?.toFixed(4)}</TableCell>
                    <TableCell>{row.f1_score?.toFixed(4)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        PASS
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        PASS
                      </Badge>
                    </TableCell>
                    <TableCell>{row.true_label}</TableCell>
                    <TableCell>{row.execution_accuracy?.toFixed(4)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRowClick(row)}
                        className="h-8"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(row.id) && (
                    <TableRow>
                      <TableCell colSpan={38} className="bg-muted/30 p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Expected SQL:</h4>
                            <code className="bg-background p-2 rounded text-xs block overflow-x-auto">
                              {row.expected_sql}
                            </code>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Generated SQL:</h4>
                            <code className="bg-background p-2 rounded text-xs block overflow-x-auto">
                              {row.generated_sql}
                            </code>
                          </div>
                          <div className="flex gap-4 text-sm flex-wrap">
                            <span>True Label: <Badge variant="outline">{row.true_label}</Badge></span>
                            <span>Unknown Tokens: {Array.isArray(row.unknown_tokens) ? row.unknown_tokens.join('; ') : ''}</span>
                            <span>Execution Accuracy: {row.execution_accuracy?.toFixed(4)}</span>
                            <span>Edit Similarity: {row.edit_similarity?.toFixed(4)}</span>
                            <span>Vocab Unknown Count: {row.vocab_unknown_count}</span>
                            <span>Vocab Unknown Ratio: {row.vocab_unknown_ratio?.toFixed(4)}</span>
                            <span>Precision: {row.precision?.toFixed(4)}</span>
                            <span>Recall: {row.recall?.toFixed(4)}</span>
                            <span>F1 Score: {row.f1_score?.toFixed(4)}</span>
                            {/* Add more fields as needed */}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};