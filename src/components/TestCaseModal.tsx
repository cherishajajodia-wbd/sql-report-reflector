import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Code2, MessageSquare } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SQLTestCase } from '@/types/validation';
import { useTheme } from 'next-themes';

interface TestCaseModalProps {
  testCase: SQLTestCase | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TestCaseModal: React.FC<TestCaseModalProps> = ({ testCase, isOpen, onClose }) => {
  const { theme } = useTheme();
  
  if (!testCase) return null;

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.9) return 'bg-metric-excellent text-white';
    if (score >= 0.7) return 'bg-metric-good text-white';
    if (score >= 0.5) return 'bg-metric-fair text-white';
    return 'bg-metric-poor text-white';
  };

  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Test Case Details: {testCase.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-4 w-4" />
                User Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-muted p-3 rounded-md">{testCase.user_prompt}</p>
            </CardContent>
          </Card>

          {/* SQL Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expected SQL */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-success">Expected SQL</CardTitle>
              </CardHeader>
              <CardContent>
                <SyntaxHighlighter
                  language="sql"
                  style={syntaxTheme}
                  className="text-xs rounded-md"
                  showLineNumbers
                >
                  {testCase.expected_sql}
                </SyntaxHighlighter>
              </CardContent>
            </Card>

            {/* Generated SQL */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-primary">Generated SQL</CardTitle>
              </CardHeader>
              <CardContent>
                <SyntaxHighlighter
                  language="sql"
                  style={syntaxTheme}
                  className="text-xs rounded-md"
                  showLineNumbers
                >
                  {testCase.generated_sql}
                </SyntaxHighlighter>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Syntax Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Syntax Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testCase.syntax_score.toFixed(2)}</div>
                <Badge className={getScoreBadgeVariant(testCase.syntax_score)}>
                  {testCase.syntax_score >= 0.9 ? 'Excellent' :
                   testCase.syntax_score >= 0.7 ? 'Good' :
                   testCase.syntax_score >= 0.5 ? 'Fair' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>

            {/* Semantic Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Semantic Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testCase.semantic_score.toFixed(2)}</div>
                <Badge className={getScoreBadgeVariant(testCase.semantic_score)}>
                  {testCase.semantic_score >= 0.9 ? 'Excellent' :
                   testCase.semantic_score >= 0.7 ? 'Good' :
                   testCase.semantic_score >= 0.5 ? 'Fair' : 'Poor'}
                </Badge>
              </CardContent>
            </Card>

            {/* CodeBERT Match */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CodeBERT Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {testCase.codebert_match ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : (
                    <XCircle className="h-6 w-6 text-error" />
                  )}
                  <Badge variant={testCase.codebert_match ? 'default' : 'destructive'}>
                    {testCase.codebert_match ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* FLANE5 Match */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">FLANE5 Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {testCase.flane5_match ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : (
                    <XCircle className="h-6 w-6 text-error" />
                  )}
                  <Badge variant={testCase.flane5_match ? 'default' : 'destructive'}>
                    {testCase.flane5_match ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          {(testCase.n_gram_score || testCase.bleu_score || testCase.rouge_score) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testCase.n_gram_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">N-Gram Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.n_gram_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
                
                {testCase.bleu_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">BLEU Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.bleu_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
                
                {testCase.rouge_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">ROUGE Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.rouge_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Unknown Tokens */}
          {testCase.unknown_tokens && testCase.unknown_tokens.length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Unknown Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {testCase.unknown_tokens.map((token, index) => (
                      <Badge key={index} variant="outline" className="bg-warning-muted text-warning">
                        {token}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* True Label */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">True Label</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-sm">
                {testCase.true_label}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};