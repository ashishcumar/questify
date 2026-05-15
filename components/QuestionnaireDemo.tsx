"use client";
import { useState, useEffect, useRef } from "react";
import { useQuestionnaire } from "@/lib/use-questionnaire";
import { DEMO_QUESTIONS } from "@/lib/demo-questions";
import QuestionStep from "./QuestionStep";
import styles from "./QuestionnaireDemo.module.css";

const LABEL_ID = (qId: string) => `qlabel-${qId}`;

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-label="Form completion progress"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.progressFill} style={{ width: `${value * 100}%` }} />
    </div>
  );
}

const SECTION_MAP: Record<string, string> = {
  full_name: "Personal",
  dob_age: "Personal",
  sex: "Personal",
  smoker: "Lifestyle",
  cigarettes_per_day: "Lifestyle",
  years_smoking: "Lifestyle",
  alcohol: "Lifestyle",
  alcohol_units: "Lifestyle",
  bmi: "Lifestyle",
  conditions: "Medical History",
  diabetes_type: "Diabetes",
  diabetes_years: "Diabetes",
  hba1c: "Diabetes",
  on_insulin: "Diabetes",
  metabolic_syndrome: "Diabetes",
  bp_medication: "Hypertension",
  last_bp: "Hypertension",
  cardiac_event: "Heart Disease",
  cardiac_procedure: "Heart Disease",
  cancer_type: "Cancer",
  cancer_remission: "Cancer",
  pregnant: "Pregnancy",
  family_history: "Family History",
  specialist_referral: "Risk Assessment",
};

function CompletionScreen({
  responses,
  totalAnswered,
  onReset,
}: {
  responses: Record<string, unknown>;
  totalAnswered: number;
  onReset: () => void;
}) {
  return (
    <div
      className={styles.completion}
      role="region"
      aria-label="Application complete"
      aria-live="polite"
    >
      <div className={styles.completionIcon} aria-hidden="true">✓</div>
      <h2 className={styles.completionTitle}>Application complete</h2>
      <p className={styles.completionSub}>
        Questify collected <strong>{totalAnswered} answers</strong> across{" "}
        <strong>multiple branches</strong> — only showing questions relevant to your profile.
      </p>

      <div className={styles.responseList} role="list" aria-label="Your responses">
        {DEMO_QUESTIONS.filter((q) => responses[q.id] !== undefined).map((q) => {
          const val = responses[q.id];
          const display = Array.isArray(val) ? (val as string[]).join(", ") : String(val);
          return (
            <div key={q.id} className={styles.responseRow} role="listitem">
              <span className={styles.responseLabel}>{q.text}</span>
              <span className={styles.responseValue}>{display}</span>
            </div>
          );
        })}
      </div>

      <button onClick={onReset} className={styles.resetBtn}>
        Reset and try another path →
      </button>
    </div>
  );
}

export default function QuestionnaireDemo() {
  const {
    question,
    questionIndex,
    totalQuestions,
    progress,
    responses,
    isComplete,
    errors,
    canGoBack,
    canGoNext,
    answer,
    next,
    back,
    reset,
  } = useQuestionnaire({ questions: DEMO_QUESTIONS, mode: "step" });

  const [submitted, setSubmitted] = useState(false);

  // Announce step transitions to screen readers
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (question && liveRef.current) {
      liveRef.current.textContent = `Question ${questionIndex + 1} of ${totalQuestions}: ${question.text}`;
    }
  }, [question?.id, questionIndex, totalQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (isComplete) setSubmitted(true);
  };

  if (submitted) {
    const totalAnswered = Object.keys(responses).length;
    return (
      <CompletionScreen
        responses={responses}
        totalAnswered={totalAnswered}
        onReset={() => { reset(); setSubmitted(false); }}
      />
    );
  }

  if (!question) return null;

  const labelId    = LABEL_ID(question.id);
  const section    = SECTION_MAP[question.id];
  const isConditional = !!question.showIf;

  return (
    <div className={styles.card}>
      {/* Screen reader live region — announces step transitions */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      />

      {/* Top bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {section && <span className={styles.sectionTag} aria-hidden="true">{section}</span>}
          <span className={styles.stepBadge} aria-hidden="true">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        <span className={styles.progressPct} aria-hidden="true">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <ProgressBar value={progress} />

      {/* Question */}
      <div className={styles.body}>
        {/* id here is referenced as labelId by QuestionStep inputs */}
        <h2 id={labelId} className={styles.questionText}>{question.text}</h2>

        {question.description && (
          <p className={styles.questionDesc}>{question.description}</p>
        )}

        {isConditional && (
          <div className={styles.condBadge} aria-label="Conditional question — shown based on your previous answers">
            <span aria-hidden="true">◈</span>{" "}
            <span>Conditional — shown based on your previous answers</span>
          </div>
        )}

        {!question.required && (
          <div className={styles.optionalBadge}>
            <span className={styles.srOnly}>This field is </span>Optional
          </div>
        )}

        <div className={styles.inputArea}>
          <QuestionStep
            question={question}
            value={responses[question.id]}
            error={errors[question.id]}
            onChange={answer}
            labelId={labelId}
            autoFocus
          />
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.nav}>
        <button
          onClick={back}
          disabled={!canGoBack}
          className={styles.navSecondary}
          aria-label="Go to previous question"
        >
          ← Back
        </button>

        {canGoNext ? (
          <button
            onClick={next}
            className={styles.navPrimary}
            aria-label="Continue to next question"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            className={styles.navPrimary}
            aria-label={isComplete ? "Submit application" : "Please answer all required questions before submitting"}
          >
            Submit application →
          </button>
        )}
      </div>
    </div>
  );
}
