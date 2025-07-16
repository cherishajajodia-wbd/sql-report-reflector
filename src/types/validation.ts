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
  token_count?: number;
  unknown_tokens?: string[];
  // Additional fields from CSV
  has_limit?: boolean;
  has_offset?: boolean;
  has_result_type?: boolean;
  has_cte?: boolean;
  has_order_by?: boolean;
  has_group_by?: boolean;
  has_join?: boolean;
  codebert_intent_score?: number;
  codebert_sqlsim_score?: number;
  flane5_intent_score?: number;
  flane5_sqlsim_score?: number;
  ngram1_precision?: number;
  ngram1_recall?: number;
  ngram1_f1?: number;
  ngram2_precision?: number;
  ngram2_recall?: number;
  ngram2_f1?: number;
  edit_similarity?: number;
  vocab_unknown_count?: number;
  vocab_unknown_ratio?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  execution_accuracy?: number;
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