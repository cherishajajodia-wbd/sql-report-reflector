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
        const passes = row.codebert_match && row.flane5_match;
        if (filters.passFailFilter === 'pass' && !passes) return false;
        if (filters.passFailFilter === 'fail' && passes) return false;
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
                <TableHead className="w-[50px]"></TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID <SortIcon column="id" />
                  </div>
                </TableHead>
                <TableHead>User Prompt</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('syntax_score')}
                >
                  <div className="flex items-center">
                    Syntax <SortIcon column="syntax_score" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('semantic_score')}
                >
                  <div className="flex items-center">
                    Semantic <SortIcon column="semantic_score" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('codebert_match')}
                >
                  <div className="flex items-center">
                    CodeBERT <SortIcon column="codebert_match" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('flane5_match')}
                >
                  <div className="flex items-center">
                    FLANE5 <SortIcon column="flane5_match" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <span className={`font-semibold ${getScoreColor(row.syntax_score)}`}>
                        {row.syntax_score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getScoreColor(row.semantic_score)}`}>
                        {row.semantic_score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {row.codebert_match ? (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          PASS
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          FAIL
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.flane5_match ? (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          PASS
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          FAIL
                        </Badge>
                      )}
                    </TableCell>
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
                      <TableCell colSpan={8} className="bg-muted/30 p-4">
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
                          <div className="flex gap-4 text-sm">
                            <span>True Label: <Badge variant="outline">{row.true_label}</Badge></span>
                            {row.n_gram_score && (
                              <span>N-Gram: <strong>{row.n_gram_score.toFixed(3)}</strong></span>
                            )}
                            {row.bleu_score && (
                              <span>BLEU: <strong>{row.bleu_score.toFixed(3)}</strong></span>
                            )}
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