import type {
  Question,
  QuestionnaireConfig,
  QuestionnaireState,
  ShowIfCondition,
  ShowIfRule,
} from "./types";

export * from "./types";

// ─── Conditional visibility ───────────────────────────────────────────────────

function evaluateSimple(
  condition: ShowIfCondition,
  responses: Record<string, unknown>
): boolean {
  const response = responses[condition.questionId];
  if (response === undefined || response === null) return false;

  const op = condition.operator ?? "eq";
  const val = condition.value;

  switch (op) {
    case "eq":  return response === val;
    case "neq": return response !== val;
    case "gt":
      return typeof response === "number" && typeof val === "number" && response > val;
    case "lt":
      return typeof response === "number" && typeof val === "number" && response < val;
    case "gte":
      return typeof response === "number" && typeof val === "number" && response >= val;
    case "lte":
      return typeof response === "number" && typeof val === "number" && response <= val;
    case "includes":
      return Array.isArray(response)
        ? response.includes(val)
        : String(response).includes(String(val));
    default: return response === val;
  }
}

// Maximum nesting depth for showIf condition trees.
// Guards against stack overflows from accidentally deep or circular configs.
const MAX_CONDITION_DEPTH = 20;

function evaluateRule(
  rule: ShowIfRule,
  responses: Record<string, unknown>,
  depth = 0
): boolean {
  if (depth > MAX_CONDITION_DEPTH) {
    // Tree too deep — default to visible so questions don't silently disappear.
    console.warn("[questify] showIf condition tree exceeds maximum depth. Defaulting to visible.");
    return true;
  }
  if ("and" in rule && rule.and) {
    if (rule.and.length === 0) return true;
    return rule.and.every((r) => evaluateRule(r, responses, depth + 1));
  }
  if ("or" in rule && rule.or) {
    if (rule.or.length === 0) return false;
    return rule.or.some((r) => evaluateRule(r, responses, depth + 1));
  }
  return evaluateSimple(rule as ShowIfCondition, responses);
}

function getVisibleQuestions(
  questions: Question[],
  responses: Record<string, unknown>
): Question[] {
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
  // Required check — uses isEmpty which trims whitespace
  if (question.required && isEmpty(value)) {
    return question.validation?.message ?? "This field is required.";
  }

  // No further validation on empty optional fields
  if (isEmpty(value)) return null;

  const v = question.validation;

  // Number / rating
  if (question.type === "number" || question.type === "rating") {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return "Must be a valid number.";
    if (v?.min !== undefined && num < v.min) return v.message ?? `Minimum value is ${v.min}.`;
    if (v?.max !== undefined && num > v.max) return v.message ?? `Maximum value is ${v.max}.`;
  }

  // Text (length + regex)
  if (question.type === "text") {
    const str = String(value).trim();
    if (v?.minLength !== undefined && str.length < v.minLength)
      return v.message ?? `Minimum ${v.minLength} characters required.`;
    if (v?.maxLength !== undefined && str.length > v.maxLength)
      return v.message ?? `Maximum ${v.maxLength} characters allowed.`;
    if (v?.regex) {
      try {
        if (!new RegExp(v.regex).test(str)) return v.message ?? "Invalid format.";
      } catch {
        // Malformed regex in config — skip silently in production
      }
    }
  }

  // Email — format check always runs, regardless of whether a validation object exists
  if (question.type === "email") {
    const str = String(value).trim();
    if (v?.minLength !== undefined && str.length < v.minLength)
      return v.message ?? `Minimum ${v.minLength} characters required.`;
    if (v?.maxLength !== undefined && str.length > v.maxLength)
      return v.message ?? `Maximum ${v.maxLength} characters allowed.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str))
      return "Please enter a valid email address.";
  }

  // Date — always validate YYYY-MM-DD format to avoid timezone surprises
  if (question.type === "date") {
    const str = String(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return "Please enter a valid date (YYYY-MM-DD).";
    const d = new Date(str + "T00:00:00");
    if (isNaN(d.getTime())) return "Please enter a valid date.";
  }

  return null;
}

// ─── Progress + completion ────────────────────────────────────────────────────

function computeProgress(
  visibleQuestions: Question[],
  responses: Record<string, unknown>
): number {
  if (visibleQuestions.length === 0) return 0;
  const answered = visibleQuestions.filter((q) => !isEmpty(responses[q.id])).length;
  return answered / visibleQuestions.length;
}

function checkComplete(
  visibleQuestions: Question[],
  responses: Record<string, unknown>
): boolean {
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
  const question = visibleQuestions[safeIndex] ?? null;

  // [H-1] Filter stale errors for hidden questions
  const visibleIds = new Set(visibleQuestions.map((q) => q.id));
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([id]) => visibleIds.has(id))
  );

  return {
    question,
    visibleQuestions,
    questionIndex: safeIndex,
    totalQuestions: visibleQuestions.length,
    progress: computeProgress(visibleQuestions, responses),
    // [H-2] Defensive copy — prevents external mutation of internal state
    responses: { ...responses },
    isComplete: checkComplete(visibleQuestions, responses),
    errors: visibleErrors,
    canGoBack: safeIndex > 0,
    canGoNext: safeIndex < visibleQuestions.length - 1,
  };
}

// ─── Questionnaire class ──────────────────────────────────────────────────────

// Keys that must never become property names on a plain object.
// Guards against prototype pollution via developer-supplied question IDs.
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

type Subscriber = (state: QuestionnaireState) => void;

export class Questionnaire {
  private config: QuestionnaireConfig;
  private responses: Record<string, unknown>;
  private questionIndex: number;
  private errors: Record<string, string>;
  private subscribers: Subscriber[] = [];
  private cachedState: QuestionnaireState;

  constructor(config: QuestionnaireConfig) {
    // [M-1] Warn on duplicate IDs — always a config bug, regardless of environment
    const ids = config.questions.map((q) => q.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length > 0) {
      console.warn(
        `[questify] Duplicate question IDs detected: ${[...new Set(dupes)].join(", ")}. ` +
        `Each question must have a unique id.`
      );
    }

    this.config = { mode: "step", ...config };
    this.responses = { ...(config.initialResponses ?? {}) };
    this.questionIndex = 0;
    this.errors = {};
    this.cachedState = buildState(this.config, this.responses, 0, {});
  }

  private recompute(): void {
    this.cachedState = buildState(
      this.config,
      this.responses,
      this.questionIndex,
      this.errors
    );
  }

  private notify(): void {
    // [M-5] Snapshot before iterating — safe against subscribe/unsubscribe during emit
    const snapshot = this.subscribers.slice();
    snapshot.forEach((s) => s(this.cachedState));
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  getState(): QuestionnaireState {
    return this.cachedState;
  }

  /**
   * Returns only responses for currently visible questions.
   * Use this for form submission — avoids sending hidden-branch data to the server.
   *
   * `state.responses` retains all answers for back-navigation; this method prunes them.
   */
  getSubmittableResponses(): Record<string, unknown> {
    const { visibleQuestions } = this.cachedState;
    const visibleIds = new Set(visibleQuestions.map((q) => q.id));
    return Object.fromEntries(
      Object.entries(this.responses).filter(([id]) => visibleIds.has(id))
    );
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    callback(this.cachedState);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Answer the current question (step mode).
   * In `mode: "all"` prefer `answerById()`.
   */
  answer(value: unknown): void {
    const { visibleQuestions, questionIndex } = this.cachedState;
    const q = visibleQuestions[questionIndex];
    if (!q) return;
    this._setAnswer(q, value);
  }

  /**
   * Answer any visible question by its id — the right API for `mode: "all"`.
   * Safe to call in step mode too (allows answering any step by id).
   */
  answerById(questionId: string, value: unknown): void {
    const q = this.cachedState.visibleQuestions.find((q) => q.id === questionId);
    if (!q) return;
    this._setAnswer(q, value);
  }

  private _setAnswer(question: Question, value: unknown): void {
    // Guard against prototype pollution — unsafe IDs are silently ignored.
    if (UNSAFE_KEYS.has(question.id)) return;
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

  /**
   * Advance to the next step (step mode).
   * Validates the current required question first; populates `errors` if invalid.
   */
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

  /** Go to the previous step. No-op on step 0. */
  back(): void {
    if (this.questionIndex > 0) {
      this.questionIndex -= 1;
      this.recompute();
      this.notify();
    }
  }

  /**
   * Jump to a specific step index (0-based, within visible questions).
   * Out-of-range indices are silently ignored.
   */
  jumpTo(index: number): void {
    const { visibleQuestions } = this.cachedState;
    if (index >= 0 && index < visibleQuestions.length) {
      this.questionIndex = index;
      this.recompute();
      this.notify();
    }
  }

  /**
   * Validate all visible required questions and return a map of errors.
   * Useful for "submit" gates in `mode: "all"`.
   */
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

  /** Reset all responses and errors, restart from step 0. */
  reset(): void {
    this.responses = { ...(this.config.initialResponses ?? {}) };
    this.questionIndex = 0;
    this.errors = {};
    this.recompute();
    this.notify();
  }
}
