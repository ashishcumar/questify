export type QuestionType =
  | "text"
  | "number"
  | "boolean"
  | "single"
  | "multi"
  | "date"
  | "rating"
  | "email";

export type ConditionOperator = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "includes";

/** A single condition against one question's response. */
export interface ShowIfCondition {
  questionId: string;
  value: unknown;
  operator?: ConditionOperator;
}

/**
 * Compound condition — nest `and`/`or` arrays for full branching logic.
 *
 * @example
 * // Show only when user has diabetes AND is on insulin
 * showIf: {
 *   and: [
 *     { questionId: 'conditions', value: 'diabetes', operator: 'includes' },
 *     { questionId: 'on_insulin', value: true },
 *   ]
 * }
 */
export interface ShowIfCompound {
  and?: ShowIfRule[];
  or?: ShowIfRule[];
}

/** A single condition OR a compound AND/OR tree — fully nestable. */
export type ShowIfRule = ShowIfCondition | ShowIfCompound;

export interface QuestionValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  message?: string;
}

export interface QuestionOption {
  label: string;
  value: string | number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options?: QuestionOption[];
  showIf?: ShowIfRule;
  validation?: QuestionValidation;
}

export type DisplayMode = "step" | "all";

export interface QuestionnaireConfig {
  questions: Question[];
  mode?: DisplayMode;
  initialResponses?: Record<string, unknown>;
}

export interface QuestionnaireState {
  /** Current question (step mode). In 'all' mode, always the first visible question. */
  question: Question | null;
  /** All currently visible questions (after applying showIf conditions). */
  visibleQuestions: Question[];
  /** Zero-based index of the current question in the visible questions array. */
  questionIndex: number;
  /** Total number of currently visible questions. */
  totalQuestions: number;
  /** Progress from 0 to 1 based on how many questions have valid answers. */
  progress: number;
  /** All responses keyed by question id. */
  responses: Record<string, unknown>;
  /** True when all required visible questions have valid responses. */
  isComplete: boolean;
  /** Validation errors keyed by question id. */
  errors: Record<string, string>;
  /** Whether the user can navigate to the previous question. */
  canGoBack: boolean;
  /** Whether the user can navigate to the next question. */
  canGoNext: boolean;
}
