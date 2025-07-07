// Types for SQL validation test case data
export interface SQLTestCase {
  id: string;
  user_prompt: string;
  expected_sql: string;
  generated_sql: string;
  syntax_score: number;
  semantic_score: number;
  codebert_match: boolean;
  flane5_match: boolean;
  true_label: string;
  // Additional metrics that might be present
  n_gram_score?: number;
  bleu_score?: number;
  rouge_score?: number;
  exact_match?: boolean;
  execution_accuracy?: number;
  token_count?: number;
  unknown_tokens?: string[];
}

export interface ValidationSummary {
  totalTests: number;
  passRate: number;
  averageSemanticScore: number;
  averageSyntaxScore: number;
  codebertPassRate: number;
  flane5PassRate: number;
  commonErrors: string[];
  topUnknownTokens: string[];
}

export interface ConfusionMatrixData {
  matrix: number[][];
  labels: string[];
  title: string;
}

export interface FilterState {
  searchTerm: string;
  passFailFilter: 'all' | 'pass' | 'fail';
  scoreRange: [number, number];
  selectedMetrics: string[];
}

export interface SortState {
  column: keyof SQLTestCase;
  direction: 'asc' | 'desc';
}