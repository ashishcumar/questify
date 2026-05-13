// Inlined from the questify npm package — swap with `import { ... } from 'questify'` once published.

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

export interface ShowIfCondition {
  questionId: string;
  value: unknown;
  operator?: ConditionOperator;
}

export interface ShowIfCompound {
  and?: ShowIfRule[];
  or?: ShowIfRule[];
}

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
  question: Question | null;
  visibleQuestions: Question[];
  questionIndex: number;
  totalQuestions: number;
  progress: number;
  responses: Record<string, unknown>;
  isComplete: boolean;
  errors: Record<string, string>;
  canGoBack: boolean;
  canGoNext: boolean;
}

// ─── Conditional visibility ───────────────────────────────────────────────────

function evaluateSimple(condition: ShowIfCondition, responses: Record<string, unknown>): boolean {
  const response = responses[condition.questionId];
  if (response === undefined || response === null) return false;
  const op = condition.operator ?? "eq";
  const val = condition.value;
  switch (op) {
    case "eq":  return response === val;
    case "neq": return response !== val;
    case "gt":  return typeof response === "number" && typeof val === "number" && response > val;
    case "lt":  return typeof response === "number" && typeof val === "number" && response < val;
    case "gte": return typeof response === "number" && typeof val === "number" && response >= val;
    case "lte": return typeof response === "number" && typeof val === "number" && response <= val;
    case "includes":
      return Array.isArray(response) ? response.includes(val) : String(response).includes(String(val));
    default: return response === val;
  }
}

function evaluateRule(rule: ShowIfRule, responses: Record<string, unknown>): boolean {
  if ("and" in rule && rule.and) {
    if (rule.and.length === 0) return true;
    return rule.and.every((r) => evaluateRule(r, responses));
  }
  if ("or" in rule && rule.or) {
    if (rule.or.length === 0) return false;
    return rule.or.some((r) => evaluateRule(r, responses));
  }
  return evaluateSimple(rule as ShowIfCondition, responses);
}

function getVisibleQuestions(questions: Question[], responses: Record<string, unknown>): Question[] {
  return questions.filter((q) => (q.showIf ? evaluateRule(q.showIf, responses) : true));
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export function validateAnswer(question: Question, value: unknown): string | null {
  if (question.required && isEmpty(value)) {
    return question.validation?.message ?? "This field is required.";
  }
  if (isEmpty(value)) return null;

  const v = question.validation;

  if (question.type === "number" || question.type === "rating") {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return "Must be a valid number.";
    if (v?.min !== undefined && num < v.min) return v.message ?? `Minimum value is ${v.min}.`;
    if (v?.max !== undefined && num > v.max) return v.message ?? `Maximum value is ${v.max}.`;
  }

  if (question.type === "text") {
    const str = String(value).trim();
    if (v?.minLength !== undefined && str.length < v.minLength)
      return v.message ?? `Minimum ${v.minLength} characters required.`;
    if (v?.maxLength !== undefined && str.length > v.maxLength)
      return v.message ?? `Maximum ${v.maxLength} characters allowed.`;
    if (v?.regex) {
      try { if (!new RegExp(v.regex).test(str)) return v.message ?? "Invalid format."; } catch { /* skip */ }
    }
  }

  // Email — format check always runs regardless of validation object presence
  if (question.type === "email") {
    const str = String(value).trim();
    if (v?.minLength !== undefined && str.length < v.minLength)
      return v.message ?? `Minimum ${v.minLength} characters required.`;
    if (v?.maxLength !== undefined && str.length > v.maxLength)
      return v.message ?? `Maximum ${v.maxLength} characters allowed.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))
      return "Please enter a valid email address.";
  }

  // Date — YYYY-MM-DD only, avoids timezone bugs
  if (question.type === "date") {
    const str = String(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return "Please enter a valid date (YYYY-MM-DD).";
    if (isNaN(new Date(str + "T00:00:00").getTime())) return "Please enter a valid date.";
  }

  return null;
}

// ─── Progress + completion ────────────────────────────────────────────────────

function computeProgress(visibleQuestions: Question[], responses: Record<string, unknown>): number {
  if (visibleQuestions.length === 0) return 0;
  return visibleQuestions.filter((q) => !isEmpty(responses[q.id])).length / visibleQuestions.length;
}

function checkComplete(visibleQuestions: Question[], responses: Record<string, unknown>): boolean {
  return visibleQuestions
    .filter((q) => q.required)
    .every((q) => !isEmpty(responses[q.id]) && validateAnswer(q, responses[q.id]) === null);
}

// ─── State builder ────────────────────────────────────────────────────────────

function buildState(
  config: QuestionnaireConfig,
  responses: Record<string, unknown>,
  questionIndex: number,
  errors: Record<string, string>
): QuestionnaireState {
  const visibleQuestions = getVisibleQuestions(config.questions, responses);
  const safeIndex = Math.min(questionIndex, Math.max(0, visibleQuestions.length - 1));
  const visibleIds = new Set(visibleQuestions.map((q) => q.id));

  return {
    question: visibleQuestions[safeIndex] ?? null,
    visibleQuestions,
    questionIndex: safeIndex,
    totalQuestions: visibleQuestions.length,
    progress: computeProgress(visibleQuestions, responses),
    responses: { ...responses },                              // defensive copy
    isComplete: checkComplete(visibleQuestions, responses),
    errors: Object.fromEntries(                               // prune stale hidden errors
      Object.entries(errors).filter(([id]) => visibleIds.has(id))
    ),
    canGoBack: safeIndex > 0,
    canGoNext: safeIndex < visibleQuestions.length - 1,
  };
}

// ─── Questionnaire class ──────────────────────────────────────────────────────

type Subscriber = (state: QuestionnaireState) => void;

export class Questionnaire {
  private config: QuestionnaireConfig;
  private responses: Record<string, unknown>;
  private questionIndex: number;
  private errors: Record<string, string>;
  private subscribers: Subscriber[] = [];
  private cachedState: QuestionnaireState;

  constructor(config: QuestionnaireConfig) {
    const ids = config.questions.map((q) => q.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      console.warn(`[questify] Duplicate question IDs: ${[...new Set(dupes)].join(", ")}`);
    }
    this.config = { mode: "step", ...config };
    this.responses = { ...(config.initialResponses ?? {}) };
    this.questionIndex = 0;
    this.errors = {};
    this.cachedState = buildState(this.config, this.responses, 0, {});
  }

  private recompute() {
    this.cachedState = buildState(this.config, this.responses, this.questionIndex, this.errors);
  }

  private notify() {
    const snapshot = this.subscribers.slice();
    snapshot.forEach((s) => s(this.cachedState));
  }

  getState() { return this.cachedState; }

  getSubmittableResponses(): Record<string, unknown> {
    const visibleIds = new Set(this.cachedState.visibleQuestions.map((q) => q.id));
    return Object.fromEntries(Object.entries(this.responses).filter(([id]) => visibleIds.has(id)));
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    callback(this.cachedState);
    return () => { this.subscribers = this.subscribers.filter((s) => s !== callback); };
  }

  answer(value: unknown): void {
    const q = this.cachedState.visibleQuestions[this.cachedState.questionIndex];
    if (!q) return;
    this._setAnswer(q, value);
  }

  answerById(questionId: string, value: unknown): void {
    const q = this.cachedState.visibleQuestions.find((q) => q.id === questionId);
    if (!q) return;
    this._setAnswer(q, value);
  }

  private _setAnswer(question: Question, value: unknown): void {
    this.responses = { ...this.responses, [question.id]: value };
    const error = validateAnswer(question, value);
    if (error) {
      this.errors = { ...this.errors, [question.id]: error };
    } else {
      const { [question.id]: _dropped, ...rest } = this.errors;
      this.errors = rest;
    }
    this.recompute();
    this.notify();
  }

  next(): void {
    const { visibleQuestions, questionIndex } = this.cachedState;
    const q = visibleQuestions[questionIndex];
    if (q) {
      const error = validateAnswer(q, this.responses[q.id]);
      if (error) {
        this.errors = { ...this.errors, [q.id]: error };
        this.recompute();
        this.notify();
        return;
      }
    }
    if (questionIndex < visibleQuestions.length - 1) {
      this.questionIndex = questionIndex + 1;
      this.recompute();
      this.notify();
    }
  }

  back(): void {
    if (this.questionIndex > 0) {
      this.questionIndex -= 1;
      this.recompute();
      this.notify();
    }
  }

  jumpTo(index: number): void {
    const { visibleQuestions } = this.cachedState;
    if (index >= 0 && index < visibleQuestions.length) {
      this.questionIndex = index;
      this.recompute();
      this.notify();
    }
  }

  validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};
    for (const q of this.cachedState.visibleQuestions) {
      const error = validateAnswer(q, this.responses[q.id]);
      if (error) newErrors[q.id] = error;
    }
    if (Object.keys(newErrors).length > 0) {
      this.errors = { ...this.errors, ...newErrors };
      this.recompute();
      this.notify();
    }
    return newErrors;
  }

  reset(): void {
    this.responses = { ...(this.config.initialResponses ?? {}) };
    this.questionIndex = 0;
    this.errors = {};
    this.recompute();
    this.notify();
  }
}
