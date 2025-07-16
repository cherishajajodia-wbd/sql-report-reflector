import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Table } from 'lucide-react';
import { SQLTestCase } from '@/types/validation';
import Papa from 'papaparse';

interface ExportOptionsProps {
  data: SQLTestCase[];
  filteredData: SQLTestCase[];
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ data, filteredData }) => {
  // Helper to get the calculated semantic score for a row
  const getCalculatedSemanticScore = (row: SQLTestCase) => {
    if (
      typeof row.codebert_intent_score === 'number' &&
      typeof row.codebert_sqlsim_score === 'number' &&
      typeof row.flane5_intent_score === 'number' &&
      typeof row.flane5_sqlsim_score === 'number'
    ) {
      const codebertScore = row.codebert_intent_score * 0.5 + row.codebert_sqlsim_score * 0.5;
      const flane5Score = row.flane5_intent_score * 0.5 + row.flane5_sqlsim_score * 0.5;
      return Math.max(codebertScore, flane5Score);
    }
    return 0;
  };

  // When exporting, replace semantic_score with the calculated value
  const prepareExportData = (data: SQLTestCase[]) =>
    data.map(row => ({
      ...row,
      semantic_score: getCalculatedSemanticScore(row)
    }));

  const downloadCSV = (rows: SQLTestCase[], filename: string) => {
    const exportRows = prepareExportData(rows);
    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (exportData: SQLTestCase[], filename: string) => {
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateSummaryReport = () => {
    const totalTests = data.length;
    const passedTests = data.filter(d => (d.codebert_match || d.flane5_match) && d.semantic_score > 0.75).length;
    const avgSemantic = data.reduce((sum, d) => sum + d.semantic_score, 0) / totalTests;
    const avgSyntax = data.reduce((sum, d) => sum + d.syntax_score, 0) / totalTests;
    
    const report = `SQL Validation Pipeline Report
Generated: ${new Date().toISOString()}

SUMMARY STATISTICS:
- Total Test Cases: ${totalTests}
- Overall Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%
- Average Semantic Score: ${avgSemantic.toFixed(3)}
- Average Syntax Score: ${avgSyntax.toFixed(3)}

DETAILED BREAKDOWN:
- CodeBERT Matches: ${data.filter(d => d.codebert_match).length} (${((data.filter(d => d.codebert_match).length / totalTests) * 100).toFixed(1)}%)
- FLANE5 Matches: ${data.filter(d => d.flane5_match).length} (${((data.filter(d => d.flane5_match).length / totalTests) * 100).toFixed(1)}%)
- Both Matches: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)

SCORE DISTRIBUTION:
- Excellent (≥0.9): ${data.filter(d => d.semantic_score >= 0.9).length} tests
- Good (0.7-0.9): ${data.filter(d => d.semantic_score >= 0.7 && d.semantic_score < 0.9).length} tests
- Fair (0.5-0.7): ${data.filter(d => d.semantic_score >= 0.5 && d.semantic_score < 0.7).length} tests
- Poor (<0.5): ${data.filter(d => d.semantic_score < 0.5).length} tests

FAILED TESTS:
${data.filter(d => !((d.codebert_match || d.flane5_match) && d.semantic_score > 0.75)).map(test => 
  `- ${test.id}: ${test.user_prompt.substring(0, 60)}...`
).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sql_validation_report_${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Export All Data */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">All Data ({data.length} records)</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(data, `sql_validation_all_${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full"
              >
                <Table className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJSON(data, `sql_validation_all_${new Date().toISOString().split('T')[0]}.json`)}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>

          {/* Export Filtered Data */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Filtered Data ({filteredData.length} records)</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(filteredData, `sql_validation_filtered_${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full"
                disabled={filteredData.length === 0}
              >
                <Table className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJSON(filteredData, `sql_validation_filtered_${new Date().toISOString().split('T')[0]}.json`)}
                className="w-full"
                disabled={filteredData.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>

          {/* Export Failed Tests Only */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Failed Tests Only</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const failedTests = data.filter(d => !d.codebert_match || !d.flane5_match);
                  downloadCSV(failedTests, `sql_validation_failures_${new Date().toISOString().split('T')[0]}.csv`);
                }}
                className="w-full"
              >
                <Table className="w-4 h-4 mr-2" />
                Export Failures
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSummaryReport}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Summary Report
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Export Options:</strong> Download your data in CSV or JSON format. 
            The summary report includes key statistics and failed test cases for quick analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};