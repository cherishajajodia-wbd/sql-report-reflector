import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { FileUpload } from './FileUpload';
import { SummaryCards } from './SummaryCards';
import { DataTable } from './DataTable';
import { TestCaseModal } from './TestCaseModal';
import { ConfusionMatrix } from './ConfusionMatrix';
import { ExportOptions } from './ExportOptions';
import { SQLTestCase, ConfusionMatrixData } from '@/types/validation';
import { useToast } from '@/hooks/use-toast';

export const SQLValidationDashboard: React.FC = () => {
  const [data, setData] = useState<SQLTestCase[]>([]);
  const [selectedTestCase, setSelectedTestCase] = useState<SQLTestCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confusionMatrixData, setConfusionMatrixData] = useState<ConfusionMatrixData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleDataLoad = (newData: SQLTestCase[]) => {
    setLoading(true);
    try {
      // Validate and clean the data
      const cleanedData = newData.map(item => {
        const isGeneratedSqlBlank = !item.generated_sql || String(item.generated_sql).trim() === '';
        return {
          ...item,
          syntax_score: isGeneratedSqlBlank ? 0 : (Number(item.syntax_score) || 0),
          semantic_score: Number(item.semantic_score) || 0,
          n_gram_score: item.n_gram_score ? Number(item.n_gram_score) : undefined,
          bleu_score: item.bleu_score ? Number(item.bleu_score) : undefined,
          rouge_score: item.rouge_score ? Number(item.rouge_score) : undefined,
          codebert_match: Boolean(item.codebert_match),
          flane5_match: Boolean(item.flane5_match),
          exact_match: item.exact_match ? Boolean(item.exact_match) : undefined,
          unknown_tokens: Array.isArray(item.unknown_tokens)
            ? item.unknown_tokens
            : (typeof item.unknown_tokens === 'string' && item.unknown_tokens
                ? (item.unknown_tokens as string).split(';').map(t => t.trim()).filter(Boolean)
                : []),
          has_limit: item.has_limit !== undefined ? Boolean(Number(item.has_limit)) : undefined,
          has_offset: item.has_offset !== undefined ? Boolean(Number(item.has_offset)) : undefined,
          has_result_type: item.has_result_type !== undefined ? Boolean(Number(item.has_result_type)) : undefined,
          has_cte: item.has_cte !== undefined ? Boolean(Number(item.has_cte)) : undefined,
          has_order_by: item.has_order_by !== undefined ? Boolean(Number(item.has_order_by)) : undefined,
          has_group_by: item.has_group_by !== undefined ? Boolean(Number(item.has_group_by)) : undefined,
          has_join: item.has_join !== undefined ? Boolean(Number(item.has_join)) : undefined,
          codebert_intent_score: isGeneratedSqlBlank ? 0 : (item.codebert_intent_score ? Number(item.codebert_intent_score) : undefined),
          codebert_sqlsim_score: isGeneratedSqlBlank ? 0 : (item.codebert_sqlsim_score ? Number(item.codebert_sqlsim_score) : undefined),
          flane5_intent_score: isGeneratedSqlBlank ? 0 : (item.flane5_intent_score ? Number(item.flane5_intent_score) : undefined),
          flane5_sqlsim_score: isGeneratedSqlBlank ? 0 : (item.flane5_sqlsim_score ? Number(item.flane5_sqlsim_score) : undefined),
          ngram1_precision: item.ngram1_precision ? Number(item.ngram1_precision) : undefined,
          ngram1_recall: item.ngram1_recall ? Number(item.ngram1_recall) : undefined,
          ngram1_f1: item.ngram1_f1 ? Number(item.ngram1_f1) : undefined,
          ngram2_precision: item.ngram2_precision ? Number(item.ngram2_precision) : undefined,
          ngram2_recall: item.ngram2_recall ? Number(item.ngram2_recall) : undefined,
          ngram2_f1: item.ngram2_f1 ? Number(item.ngram2_f1) : undefined,
          edit_similarity: item.edit_similarity ? Number(item.edit_similarity) : undefined,
          vocab_unknown_count: item.vocab_unknown_count ? Number(item.vocab_unknown_count) : undefined,
          vocab_unknown_ratio: item.vocab_unknown_ratio ? Number(item.vocab_unknown_ratio) : undefined,
          precision: item.precision ? Number(item.precision) : undefined,
          recall: item.recall ? Number(item.recall) : undefined,
          f1_score: item.f1_score ? Number(item.f1_score) : undefined,
          execution_accuracy: item.execution_accuracy ? Number(item.execution_accuracy) : undefined,
        };
      });

      setData(cleanedData);
      
      toast({
        title: "Data loaded successfully!",
        description: `Loaded ${cleanedData.length} test cases for analysis.`,
      });

      // Generate sample confusion matrix data if not provided
      generateSampleConfusionMatrix(cleanedData);
      
    } catch (error) {
      toast({
        title: "Error processing data",
        description: "There was an issue processing your data. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleConfusionMatrix = (testData: SQLTestCase[]) => {
    // Create a confusion matrix based on new pass/fail criteria
    const labels = ['Pass', 'Fail'];
    const matrix = [
      [0, 0], // Actual Pass vs Predicted Pass/Fail
      [0, 0]  // Actual Fail vs Predicted Pass/Fail
    ];

    testData.forEach(test => {
      // New pass criteria
      const notAllZero = !(test.precision === 0 && test.recall === 0 && test.f1_score === 0);
      let semanticScore = 0;
      if (
        typeof test.codebert_intent_score === 'number' &&
        typeof test.codebert_sqlsim_score === 'number' &&
        typeof test.flane5_intent_score === 'number' &&
        typeof test.flane5_sqlsim_score === 'number'
      ) {
        const codebertScore = test.codebert_intent_score * 0.5 + test.codebert_sqlsim_score * 0.5;
        const flane5Score = test.flane5_intent_score * 0.5 + test.flane5_sqlsim_score * 0.5;
        semanticScore = Math.max(codebertScore, flane5Score);
      }
      const actualPass = notAllZero && semanticScore > 0.7;
      const predictedPass = semanticScore > 0.7; // Use same threshold for prediction
      if (actualPass && predictedPass) matrix[0][0]++; // True Positive
      else if (actualPass && !predictedPass) matrix[0][1]++; // False Negative
      else if (!actualPass && predictedPass) matrix[1][0]++; // False Positive
      else matrix[1][1]++; // True Negative
    });

    setConfusionMatrixData({
      matrix,
      labels,
      title: 'Pass/Fail Classification'
    });
  };

  const handleError = (error: string) => {
    toast({
      title: "Upload Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleTestCaseClick = (testCase: SQLTestCase) => {
    setSelectedTestCase(testCase);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    setData([]);
    setSelectedTestCase(null);
    setConfusionMatrixData(null);
    toast({
      title: "Dashboard cleared",
      description: "Ready for new data upload.",
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SQL Validation Dashboard</h1>
              <p className="text-muted-foreground">
                Analyze and visualize SQL validation pipeline results
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={data.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {data.length > 0 && (
          <Alert className="border-success/50 bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription>
              <strong>Dashboard Active:</strong> Displaying {data.length} test cases. 
              Overall pass rate: {((data.filter(d => {
                // Check precision, recall, f1_score are not all 0
                const notAllZero = !(d.precision === 0 && d.recall === 0 && d.f1_score === 0);
                // Calculate semantic score as in DataTable
                let semanticScore = 0;
                if (
                  typeof d.codebert_intent_score === 'number' &&
                  typeof d.codebert_sqlsim_score === 'number' &&
                  typeof d.flane5_intent_score === 'number' &&
                  typeof d.flane5_sqlsim_score === 'number'
                ) {
                  const codebertScore = d.codebert_intent_score * 0.5 + d.codebert_sqlsim_score * 0.5;
                  const flane5Score = d.flane5_intent_score * 0.5 + d.flane5_sqlsim_score * 0.5;
                  semanticScore = Math.max(codebertScore, flane5Score);
                }
                return notAllZero && semanticScore > 0.7;
              }).length / data.length) * 100).toFixed(1)}%
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload */}
        {data.length === 0 && (
          <FileUpload onDataLoad={handleDataLoad} onError={handleError} />
        )}

        {/* Main Dashboard Content */}
        {data.length > 0 && (
          <>
            {/* Summary Cards */}
            <SummaryCards data={data} />

            <Separator />

            {/* Data Table */}
            <DataTable data={data} onRowClick={handleTestCaseClick} />

            <Separator />

            {/* Confusion Matrix */}
            <ConfusionMatrix data={confusionMatrixData || undefined} />

            <Separator />

            {/* Export Options */}
            <ExportOptions data={data} filteredData={data} />

            {/* Upload New Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Additional Data</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onDataLoad={handleDataLoad} onError={handleError} />
              </CardContent>
            </Card>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Processing your data...</p>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-info/5 to-primary/5 border-info/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-info" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Expected File Format:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• CSV or JSON format</li>
                  <li>• Required fields: id, user_prompt, expected_sql, generated_sql</li>
                  <li>• Scores: syntax_score, semantic_score (0-1 range)</li>
                  <li>• Matches: codebert_match, flane5_match (boolean)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Dashboard Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Interactive data table with sorting & filtering</li>
                  <li>• Detailed test case analysis with SQL syntax highlighting</li>
                  <li>• Summary statistics and score distributions</li>
                  <li>• Export capabilities for further analysis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Case Detail Modal */}
        <TestCaseModal
          testCase={selectedTestCase}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTestCase(null);
          }}
        />
      </div>
    </div>
  );
};