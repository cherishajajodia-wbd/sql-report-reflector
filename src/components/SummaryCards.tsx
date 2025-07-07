import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, CheckCircle2, XCircle, BarChart3, AlertTriangle } from 'lucide-react';
import { SQLTestCase, ValidationSummary } from '@/types/validation';

interface SummaryCardsProps {
  data: SQLTestCase[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  const calculateSummary = (): ValidationSummary => {
    if (data.length === 0) {
      return {
        totalTests: 0,
        passRate: 0,
        averageSemanticScore: 0,
        averageSyntaxScore: 0,
        codebertPassRate: 0,
        flane5PassRate: 0,
        commonErrors: [],
        topUnknownTokens: []
      };
    }

    const totalTests = data.length;
    const codebertPasses = data.filter(d => d.codebert_match).length;
    const flane5Passes = data.filter(d => d.flane5_match).length;
    const overallPasses = data.filter(d => d.codebert_match && d.flane5_match).length;

    const avgSemantic = data.reduce((sum, d) => sum + (d.semantic_score || 0), 0) / totalTests;
    const avgSyntax = data.reduce((sum, d) => sum + (d.syntax_score || 0), 0) / totalTests;

    // Collect unknown tokens
    const allUnknownTokens = data
      .flatMap(d => d.unknown_tokens || [])
      .reduce((acc, token) => {
        acc[token] = (acc[token] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topUnknownTokens = Object.entries(allUnknownTokens)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([token]) => token);

    return {
      totalTests,
      passRate: (overallPasses / totalTests) * 100,
      averageSemanticScore: avgSemantic,
      averageSyntaxScore: avgSyntax,
      codebertPassRate: (codebertPasses / totalTests) * 100,
      flane5PassRate: (flane5Passes / totalTests) * 100,
      commonErrors: [],
      topUnknownTokens
    };
  };

  const summary = calculateSummary();

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'bg-metric-excellent text-white';
    if (score >= 0.7) return 'bg-metric-good text-white';
    if (score >= 0.5) return 'bg-metric-fair text-white';
    return 'bg-metric-poor text-white';
  };

  const getPassRateColor = (rate: number): string => {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Tests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalTests}</div>
          <p className="text-xs text-muted-foreground">
            Test cases analyzed
          </p>
        </CardContent>
      </Card>

      {/* Overall Pass Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getPassRateColor(summary.passRate)}`}>
            {summary.passRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Both CodeBERT & FLANE5 match
          </p>
        </CardContent>
      </Card>

      {/* Average Semantic Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Semantic Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.averageSemanticScore.toFixed(2)}</div>
          <Badge variant="outline" className={getScoreColor(summary.averageSemanticScore)}>
            {summary.averageSemanticScore >= 0.9 ? 'Excellent' :
             summary.averageSemanticScore >= 0.7 ? 'Good' :
             summary.averageSemanticScore >= 0.5 ? 'Fair' : 'Poor'}
          </Badge>
        </CardContent>
      </Card>

      {/* Average Syntax Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Syntax Score</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.averageSyntaxScore.toFixed(2)}</div>
          <Badge variant="outline" className={getScoreColor(summary.averageSyntaxScore)}>
            {summary.averageSyntaxScore >= 0.9 ? 'Excellent' :
             summary.averageSyntaxScore >= 0.7 ? 'Good' :
             summary.averageSyntaxScore >= 0.5 ? 'Fair' : 'Poor'}
          </Badge>
        </CardContent>
      </Card>

      {/* CodeBERT Pass Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CodeBERT Match</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getPassRateColor(summary.codebertPassRate)}`}>
            {summary.codebertPassRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {data.filter(d => d.codebert_match).length} of {summary.totalTests} tests
          </p>
        </CardContent>
      </Card>

      {/* FLANE5 Pass Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FLANE5 Match</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getPassRateColor(summary.flane5PassRate)}`}>
            {summary.flane5PassRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {data.filter(d => d.flane5_match).length} of {summary.totalTests} tests
          </p>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Excellent (≥0.9)</span>
              <span>{data.filter(d => d.semantic_score >= 0.9).length} tests</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Good (0.7-0.9)</span>
              <span>{data.filter(d => d.semantic_score >= 0.7 && d.semantic_score < 0.9).length} tests</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fair (0.5-0.7)</span>
              <span>{data.filter(d => d.semantic_score >= 0.5 && d.semantic_score < 0.7).length} tests</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Poor (&lt;0.5)</span>
              <span>{data.filter(d => d.semantic_score < 0.5).length} tests</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};