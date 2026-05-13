import { useState, useEffect, useCallback, useRef } from "react";
import { Questionnaire } from "../core";
import type { QuestionnaireConfig, QuestionnaireState } from "../core/types";

export type UseQuestionnaireReturn = QuestionnaireState & {
  /**
   * Answer the current step question (step mode).
   * In `mode: "all"` use `answerById` instead.
   */
  answer: (value: unknown) => void;
  /**
   * Answer any visible question by its id — use this in `mode: "all"`.
   * Safe to call in step mode too.
   */
  answerById: (questionId: string, value: unknown) => void;
  /** Advance to the next step. Validates the current required question first. */
  next: () => void;
  /** Go back one step. No-op on step 0. */
  back: () => void;
  /** Jump directly to a step by index (0-based within visible questions). */
  jumpTo: (index: number) => void;
  /**
   * Validate all visible required questions.
   * Useful for a "Submit" gate in `mode: "all"`.
   * Returns a map of questionId → error message for any invalid fields.
   */
  validate: () => Record<string, string>;
  /** Reset all responses and restart from step 0. */
  reset: () => void;
  /**
   * Returns only responses for currently visible questions.
   * Use for form submission — avoids submitting hidden-branch data.
   *
   * NOTE: if you pass `config` with different `questions` after the initial
   * render, the hook will NOT reinitialize. Use a `key` prop on the parent
   * component to force remount when the question set changes.
   */
  getSubmittableResponses: () => Record<string, unknown>;
};

export function useQuestionnaire(config: QuestionnaireConfig): UseQuestionnaireReturn {
  // Create the Questionnaire instance exactly once per hook lifecycle.
  // The ref persists across React StrictMode double-invocations safely.
  const qRef = useRef<Questionnaire | null>(null);
  if (!qRef.current) {
    qRef.current = new Questionnaire(config);
  }

  // Initialise state synchronously — no render without state.
  const [state, setState] = useState<QuestionnaireState>(() =>
    qRef.current!.getState()
  );

  useEffect(() => {
    // Subscribe and immediately sync any state that changed between render and effect.
    // In React 18 Strict Mode this effect runs twice (mount→cleanup→mount);
    // both cycles are safe because subscribe() emits the current state immediately.
    const unsubscribe = qRef.current!.subscribe(setState);
    return unsubscribe;
  }, []);

  // Stable action callbacks — safe to pass as props without triggering child rerenders.
  const answer     = useCallback((value: unknown) => qRef.current!.answer(value), []);
  const answerById = useCallback((id: string, value: unknown) => qRef.current!.answerById(id, value), []);
  const next       = useCallback(() => qRef.current!.next(), []);
  const back       = useCallback(() => qRef.current!.back(), []);
  const jumpTo     = useCallback((index: number) => qRef.current!.jumpTo(index), []);
  const validate   = useCallback(() => qRef.current!.validate(), []);
  const reset      = useCallback(() => qRef.current!.reset(), []);
  const getSubmittableResponses = useCallback(
    () => qRef.current!.getSubmittableResponses(),
    []
  );

  return {
    ...state,
    answer,
    answerById,
    next,
    back,
    jumpTo,
    validate,
    reset,
    getSubmittableResponses,
  };
}
