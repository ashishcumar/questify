"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Questionnaire } from "./questify-core";
import type { QuestionnaireConfig, QuestionnaireState } from "./questify-core";

export type UseQuestionnaireReturn = QuestionnaireState & {
  answer: (value: unknown) => void;
  answerById: (questionId: string, value: unknown) => void;
  next: () => void;
  back: () => void;
  jumpTo: (index: number) => void;
  validate: () => Record<string, string>;
  reset: () => void;
  getSubmittableResponses: () => Record<string, unknown>;
};

export function useQuestionnaire(config: QuestionnaireConfig): UseQuestionnaireReturn {
  const qRef = useRef<Questionnaire | null>(null);
  if (!qRef.current) qRef.current = new Questionnaire(config);

  const [state, setState] = useState<QuestionnaireState>(() => qRef.current!.getState());

  useEffect(() => {
    return qRef.current!.subscribe(setState);
  }, []);

  const answer     = useCallback((value: unknown) => qRef.current!.answer(value), []);
  const answerById = useCallback((id: string, value: unknown) => qRef.current!.answerById(id, value), []);
  const next       = useCallback(() => qRef.current!.next(), []);
  const back       = useCallback(() => qRef.current!.back(), []);
  const jumpTo     = useCallback((i: number) => qRef.current!.jumpTo(i), []);
  const validate   = useCallback(() => qRef.current!.validate(), []);
  const reset      = useCallback(() => qRef.current!.reset(), []);
  const getSubmittableResponses = useCallback(() => qRef.current!.getSubmittableResponses(), []);

  return { ...state, answer, answerById, next, back, jumpTo, validate, reset, getSubmittableResponses };
}
