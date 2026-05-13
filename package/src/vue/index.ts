import { ref, computed, onUnmounted } from "vue";
import { Questionnaire } from "../core";
import type { QuestionnaireConfig, QuestionnaireState } from "../core/types";

/**
 * Vue 3 composable for questify.
 *
 * All state values are `computed` refs — fully reactive.
 * The Questionnaire instance is created once per composable call and cleaned
 * up via `onUnmounted`. Do not call this outside of `setup()`.
 *
 * If the parent component passes different config on re-render, the composable
 * does NOT reinitialise. Use a `key` attribute on the component to force remount.
 */
export function useQuestionnaire(config: QuestionnaireConfig) {
  const q = new Questionnaire(config);
  const state = ref<QuestionnaireState>(q.getState());

  const unsubscribe = q.subscribe((newState) => {
    state.value = newState;
  });

  onUnmounted(() => unsubscribe());

  return {
    question:         computed(() => state.value.question),
    visibleQuestions: computed(() => state.value.visibleQuestions),
    questionIndex:    computed(() => state.value.questionIndex),
    totalQuestions:   computed(() => state.value.totalQuestions),
    progress:         computed(() => state.value.progress),
    responses:        computed(() => state.value.responses),
    isComplete:       computed(() => state.value.isComplete),
    errors:           computed(() => state.value.errors),
    canGoBack:        computed(() => state.value.canGoBack),
    canGoNext:        computed(() => state.value.canGoNext),

    /** Answer the current step question (step mode). In all-mode, use `answerById`. */
    answer:     (value: unknown) => q.answer(value),
    /** Answer any visible question by id — correct API for mode:"all". */
    answerById: (questionId: string, value: unknown) => q.answerById(questionId, value),
    next:       () => q.next(),
    back:       () => q.back(),
    jumpTo:     (index: number) => q.jumpTo(index),
    /** Validate all visible required questions. Returns id→error map. */
    validate:   () => q.validate(),
    reset:      () => q.reset(),
    /** Returns only responses for currently visible questions. Use for submission. */
    getSubmittableResponses: () => q.getSubmittableResponses(),
  };
}
