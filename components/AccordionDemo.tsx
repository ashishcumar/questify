"use client";
import { useState, useEffect, useRef } from "react";
import { useQuestionnaire } from "@/lib/use-questionnaire";
import { ACCORDION_QUESTIONS } from "@/lib/accordion-questions";
import type { Question, ShowIfRule } from "@/lib/questify-core";
import QuestionStep from "./QuestionStep";
import styles from "./AccordionDemo.module.css";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Extract the "primary parent" question id from a showIf rule (best-effort). */
function primaryParentId(rule: ShowIfRule): string | null {
  if ("questionId" in rule) return rule.questionId;
  if ("and" in rule && rule.and?.length) return primaryParentId(rule.and[0]);
  if ("or"  in rule && rule.or?.length)  return primaryParentId(rule.or[0]);
  return null;
}

/** Direct children of `parentId` that are currently visible. */
function directChildren(
  parentId: string,
  allQuestions: Question[],
  visibleIds: Set<string>
): Question[] {
  return allQuestions.filter((q) => {
    if (!visibleIds.has(q.id)) return false;
    return q.showIf ? primaryParentId(q.showIf) === parentId : false;
  });
}

/** Root questions — visible, and whose primary parent is not in allQuestions. */
function rootQuestions(allQuestions: Question[], visibleIds: Set<string>): Question[] {
  const allIds = new Set(allQuestions.map((q) => q.id));
  return allQuestions.filter((q) => {
    if (!visibleIds.has(q.id)) return false;
    const pid = q.showIf ? primaryParentId(q.showIf) : null;
    return !pid || !allIds.has(pid);
  });
}

function displayValue(val: unknown): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return (val as string[]).join(", ");
  return String(val);
}

// ─── AccordionItem ────────────────────────────────────────────────────────────

interface ItemProps {
  question: Question;
  depth: number;
  allQuestions: Question[];
  visibleIds: Set<string>;
  responses: Record<string, unknown>;
  errors: Record<string, string>;
  openIds: Set<string>;
  onToggle: (id: string) => void;
  answer: (questionId: string, val: unknown) => void;
}

const headerId = (qId: string) => `acc-hdr-${qId}`;
const bodyId   = (qId: string) => `acc-body-${qId}`;
const labelId  = (qId: string) => `acc-label-${qId}`;

function AccordionItem({
  question,
  depth,
  allQuestions,
  visibleIds,
  responses,
  errors,
  openIds,
  onToggle,
  answer,
}: ItemProps) {
  const isOpen     = openIds.has(question.id);
  const val        = responses[question.id];
  const answered   = val !== undefined && val !== null && val !== "" &&
    !(Array.isArray(val) && val.length === 0);
  const error      = errors[question.id];
  const children   = directChildren(question.id, allQuestions, visibleIds);
  const isConditional = !!question.showIf;

  return (
    <div
      className={`${styles.item} ${depth > 0 ? styles.itemChild : ""}`}
      style={{ "--depth": depth } as React.CSSProperties}
    >
      {depth > 0 && <div className={styles.connector} aria-hidden="true" />}

      {/* [H-2] aria-expanded + aria-controls for screen reader accordion semantics */}
      <button
        id={headerId(question.id)}
        className={`${styles.header} ${isOpen ? styles.headerOpen : ""}`}
        onClick={() => onToggle(question.id)}
        type="button"
        aria-expanded={isOpen}
        aria-controls={bodyId(question.id)}
      >
        <div className={styles.headerLeft}>
          {isConditional && (
            <span className={styles.forkIcon} aria-hidden="true" title="Conditional question">⤷</span>
          )}
          <span className={styles.questionText}>{question.text}</span>
          {!question.required && (
            <span className={styles.optionalPill} aria-label="Optional">optional</span>
          )}
        </div>

        <div className={styles.headerRight}>
          {answered && (
            <span className={styles.answerPreview} aria-hidden="true">{displayValue(val)}</span>
          )}
          {answered && !isOpen && (
            <span className={styles.checkmark} aria-label="Answered">✓</span>
          )}
          {error && (
            <span className={styles.errorDot} aria-label={`Error: ${error}`}>!</span>
          )}
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true">›</span>
        </div>
      </button>

      {/* Collapsible body — id linked by aria-controls above */}
      <div
        id={bodyId(question.id)}
        className={`${styles.body} ${isOpen ? styles.bodyOpen : ""}`}
        role="region"
        aria-labelledby={headerId(question.id)}
      >
        <div className={styles.bodyInner}>
          {question.description && (
            <p className={styles.desc}>{question.description}</p>
          )}
          {/* Visually-hidden span provides a stable labelId for QuestionStep inputs */}
          <span id={labelId(question.id)} className={styles.srOnly}>{question.text}</span>
          <QuestionStep
            question={question}
            value={val}
            error={error}
            onChange={(value) => answer(question.id, value)}
            labelId={labelId(question.id)}
          />
        </div>
      </div>

      {children.length > 0 && (
        <div className={styles.children}>
          {children.map((child) => (
            <AccordionItem
              key={child.id}
              question={child}
              depth={depth + 1}
              allQuestions={allQuestions}
              visibleIds={visibleIds}
              responses={responses}
              errors={errors}
              openIds={openIds}
              onToggle={onToggle}
              answer={answer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AccordionDemo ────────────────────────────────────────────────────────────

export default function AccordionDemo() {
  const { visibleQuestions, responses, errors, isComplete, answerById, validate, reset, getSubmittableResponses } =
    useQuestionnaire({ questions: ACCORDION_QUESTIONS, mode: "all" });

  const visibleIds = new Set(visibleQuestions.map((q) => q.id));
  const roots = rootQuestions(ACCORDION_QUESTIONS, visibleIds);

  // Track which items are open
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set(roots.map((q) => q.id));
    return initial;
  });

  // Auto-open newly visible questions
  const prevVisibleIds = useRef<Set<string>>(new Set(roots.map((q) => q.id)));
  useEffect(() => {
    const newlyVisible = [...visibleIds].filter(
      (id) => !prevVisibleIds.current.has(id)
    );
    if (newlyVisible.length > 0) {
      setOpenIds((prev) => new Set([...prev, ...newlyVisible]));
    }
    prevVisibleIds.current = new Set(visibleIds);
  }, [visibleQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length === 0) {
      setSubmitted(getSubmittableResponses());
    }
  };

  const answered = Object.values(responses).filter(
    (v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
  ).length;

  if (submitted) {
    return (
      <div className={styles.root}>
        <div className={styles.submittedBanner}>
          <strong>🎉 Submitted — only visible responses</strong>
          <p className={styles.submittedNote}>
            questify pruned hidden-branch answers automatically via{" "}
            <code>getSubmittableResponses()</code>
          </p>
          <div className={styles.responseList}>
            {Object.entries(submitted).map(([id, val]) => {
              const q = ACCORDION_QUESTIONS.find(q => q.id === id);
              return (
                <div key={id} className={styles.responseRow}>
                  <span className={styles.responseLabel}>{q?.text ?? id}</span>
                  <span className={styles.responseValue}>
                    {Array.isArray(val) ? (val as string[]).join(", ") : String(val)}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => { reset(); setSubmitted(null); setOpenIds(new Set(roots.map(q => q.id))); }}
            className={styles.resetBtn}
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  // [M-5] Announce newly appearing conditional questions to screen readers
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const newlyVisible = [...visibleIds].filter(
      (id) => !prevVisibleIds.current.has(id)
    );
    if (newlyVisible.length > 0 && liveRef.current) {
      const labels = newlyVisible
        .map((id) => ACCORDION_QUESTIONS.find((q) => q.id === id)?.text)
        .filter(Boolean)
        .join("; ");
      liveRef.current.textContent = `New follow-up question appeared: ${labels}`;
    }
  }, [visibleQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      {/* Screen reader live region for conditional question announcements */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className={styles.srOnly} />

      <div className={styles.stats}>
        <span>{visibleQuestions.length} questions visible</span>
        <span className={styles.dot}>·</span>
        <span>{answered} answered</span>
        {isComplete && (
          <>
            <span className={styles.dot}>·</span>
            <span className={styles.complete}>✓ Complete</span>
          </>
        )}
        <button onClick={() => { reset(); setOpenIds(new Set(roots.map((q) => q.id))); }} className={styles.resetBtn}>
          Reset
        </button>
      </div>

      <div className={styles.accordion}>
        {roots.map((q) => (
          <AccordionItem
            key={q.id}
            question={q}
            depth={0}
            allQuestions={ACCORDION_QUESTIONS}
            visibleIds={visibleIds}
            responses={responses}
            errors={errors}
            openIds={openIds}
            onToggle={toggle}
            answer={answerById}
          />
        ))}
      </div>

      {isComplete && (
        <div className={styles.completeBanner}>
          <span>🎉</span>
          <div>
            <span>All required questions answered.</span>
            <button onClick={handleSubmit} className={styles.submitBtn}>
              Submit quote →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
