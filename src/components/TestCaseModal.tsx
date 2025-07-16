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
            {/* Confidence Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Confidence Score</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Best intent match
                  const codebertIntent = typeof testCase.codebert_intent_score === 'number' ? testCase.codebert_intent_score : undefined;
                  const flane5Intent = typeof testCase.flane5_intent_score === 'number' ? testCase.flane5_intent_score : undefined;
                  const bestIntent =
                    codebertIntent !== undefined && flane5Intent !== undefined
                      ? Math.max(codebertIntent, flane5Intent)
                      : codebertIntent !== undefined
                        ? codebertIntent
                        : flane5Intent !== undefined
                          ? flane5Intent
                          : 0;
                  // Best similarity match
                  const codebertSim = typeof testCase.codebert_sqlsim_score === 'number' ? testCase.codebert_sqlsim_score : undefined;
                  const flane5Sim = typeof testCase.flane5_sqlsim_score === 'number' ? testCase.flane5_sqlsim_score : undefined;
                  const bestSim =
                    codebertSim !== undefined && flane5Sim !== undefined
                      ? Math.max(codebertSim, flane5Sim)
                      : codebertSim !== undefined
                        ? codebertSim
                        : flane5Sim !== undefined
                          ? flane5Sim
                          : 0;
                  // Vocab score
                  let vocabScore = 0;
                  if (typeof testCase.vocab_unknown_count === 'number' && typeof testCase.vocab_unknown_ratio === 'number') {
                    vocabScore = 1 - testCase.vocab_unknown_ratio;
                    if (vocabScore < 0) vocabScore = 0;
                  }
                  // Syntax score
                  const syntaxScore = typeof testCase.syntax_score === 'number' ? testCase.syntax_score : 0;
                  // F1 score
                  const f1Score = typeof testCase.f1_score === 'number' ? testCase.f1_score : 0;
                  // Final confidence score
                  const confidence = 0.25 * bestIntent + 0.25 * bestSim + 0.20 * vocabScore + 0.15 * syntaxScore + 0.15 * f1Score;
                  return (
                    <>
                      <div className="text-2xl font-bold">{confidence.toFixed(2)}</div>
                      <Badge className={getScoreBadgeVariant(confidence)}>
                        {confidence >= 0.9 ? 'Excellent' :
                         confidence >= 0.7 ? 'Good' :
                         confidence >= 0.5 ? 'Fair' : 'Poor'}
                      </Badge>
                      {confidence < 0.6 && (
                        <button
                          className="mt-3 px-3 py-1 bg-warning text-warning-foreground rounded hover:bg-warning/80 transition text-xs font-semibold border border-warning/50"
                          onClick={() => window.alert('This test case has been flagged for manual review due to low confidence. Our team will review it promptly.')}
                        >
                          Flag for Review
                        </button>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
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
                {(() => {
                  const codebertScore = typeof testCase.codebert_intent_score === 'number' && typeof testCase.codebert_sqlsim_score === 'number'
                    ? (testCase.codebert_intent_score * 0.5 + testCase.codebert_sqlsim_score * 0.5)
                    : undefined;
                  const flane5Score = typeof testCase.flane5_intent_score === 'number' && typeof testCase.flane5_sqlsim_score === 'number'
                    ? (testCase.flane5_intent_score * 0.5 + testCase.flane5_sqlsim_score * 0.5)
                    : undefined;
                  let semanticScore: number | undefined = undefined;
                  if (codebertScore !== undefined && flane5Score !== undefined) {
                    semanticScore = Math.max(codebertScore, flane5Score);
                  } else if (codebertScore !== undefined) {
                    semanticScore = codebertScore;
                  } else if (flane5Score !== undefined) {
                    semanticScore = flane5Score;
                  }
                  return semanticScore !== undefined ? (
                    <>
                      <div className="text-2xl font-bold">{semanticScore.toFixed(2)}</div>
                      <Badge className={getScoreBadgeVariant(semanticScore)}>
                        {semanticScore >= 0.9 ? 'Excellent' :
                         semanticScore >= 0.7 ? 'Good' :
                         semanticScore >= 0.5 ? 'Fair' : 'Poor'}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">N/A</div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* CodeBERT Match */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CodeBERT Match</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const codebertScore = typeof testCase.codebert_intent_score === 'number' && typeof testCase.codebert_sqlsim_score === 'number'
                    ? (testCase.codebert_intent_score * 0.5 + testCase.codebert_sqlsim_score * 0.5)
                    : undefined;
                  const codebertPass = codebertScore !== undefined && codebertScore > 0.6;
                  return (
                    <div className="flex items-center gap-2">
                      {codebertPass ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : (
                        <XCircle className="h-6 w-6 text-error" />
                      )}
                      <Badge variant={codebertPass ? 'default' : 'destructive'}>
                        {codebertPass ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* FLANE5 Match */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">FLANE5 Match</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const flane5Score = typeof testCase.flane5_intent_score === 'number' && typeof testCase.flane5_sqlsim_score === 'number'
                    ? (testCase.flane5_intent_score * 0.5 + testCase.flane5_sqlsim_score * 0.5)
                    : undefined;
                  const flane5Pass = flane5Score !== undefined && flane5Score > 0.6;
                  return (
                    <div className="flex items-center gap-2">
                      {flane5Pass ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : (
                        <XCircle className="h-6 w-6 text-error" />
                      )}
                      <Badge variant={flane5Pass ? 'default' : 'destructive'}>
                        {flane5Pass ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          {(testCase.n_gram_score || testCase.bleu_score || testCase.rouge_score || testCase.edit_similarity || testCase.execution_accuracy || testCase.codebert_intent_score || testCase.codebert_sqlsim_score || testCase.flane5_intent_score || testCase.flane5_sqlsim_score || testCase.ngram1_precision || testCase.ngram1_recall || testCase.ngram1_f1 || testCase.ngram2_precision || testCase.ngram2_recall || testCase.ngram2_f1) && (
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
                {testCase.edit_similarity && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Edit Similarity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.edit_similarity.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.execution_accuracy && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Execution Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.execution_accuracy.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.codebert_intent_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">CodeBERT Intent Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.codebert_intent_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.codebert_sqlsim_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">CodeBERT SQLSim Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.codebert_sqlsim_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.flane5_intent_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">FLANE5 Intent Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.flane5_intent_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.flane5_sqlsim_score && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">FLANE5 SQLSim Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.flane5_sqlsim_score.toFixed(3)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.ngram1_precision && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">NGram1 Precision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.ngram1_precision.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.ngram1_recall && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">NGram1 Recall</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.ngram1_recall.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.ngram1_f1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">NGram1 F1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.ngram1_f1.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.ngram2_precision && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">NGram2 Precision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.ngram2_precision.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.ngram2_recall && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">NGram2 Recall</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.ngram2_recall.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.ngram2_f1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">NGram2 F1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.ngram2_f1.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.vocab_unknown_count !== undefined && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Vocab Unknown Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.vocab_unknown_count}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.vocab_unknown_ratio !== undefined && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Vocab Unknown Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.vocab_unknown_ratio.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.precision !== undefined && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Precision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.precision.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.recall !== undefined && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recall</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.recall.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
                {testCase.f1_score !== undefined && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">F1 Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">{testCase.f1_score.toFixed(4)}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
          {/* Boolean Features */}
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has Limit</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_limit ? 'default' : 'outline'}>{testCase.has_limit ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has Offset</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_offset ? 'default' : 'outline'}>{testCase.has_offset ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has Result Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_result_type ? 'default' : 'outline'}>{testCase.has_result_type ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has CTE</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_cte ? 'default' : 'outline'}>{testCase.has_cte ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has Order By</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_order_by ? 'default' : 'outline'}>{testCase.has_order_by ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has Group By</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_group_by ? 'default' : 'outline'}>{testCase.has_group_by ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Has Join</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={testCase.has_join ? 'default' : 'outline'}>{testCase.has_join ? 'Yes' : 'No'}</Badge>
              </CardContent>
            </Card>
          </div>
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