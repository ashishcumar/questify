"use client";
import { useRef } from "react";
import type { Question, QuestionOption } from "@/lib/questify-core";
import styles from "./QuestionStep.module.css";

// ─── Public props ─────────────────────────────────────────────────────────────

interface Props {
  question: Question;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  /**
   * ID of the visible heading / label element that describes this field.
   * Used for `aria-labelledby` on inputs and group containers so screen readers
   * read the question text when the user focuses the control.
   *
   * Pass the `id` of your surrounding `<h2>` or `<label>` element.
   */
  labelId?: string;
  /**
   * Auto-focus the first interactive element on mount.
   *
   * Set `true` in step mode (keyboard users expect focus to advance with each step).
   * Leave `false` (default) in all-mode / accordion to avoid scroll-fighting.
   */
  autoFocus?: boolean;
}

// ─── Stable id helpers ────────────────────────────────────────────────────────

const inputId  = (id: string) => `input-${id}`;
const errorId  = (id: string) => `err-${id}`;

// ─── Roving tabIndex radio group ──────────────────────────────────────────────
// Implements the ARIA radio group keyboard pattern:
// - Arrow keys move between options (and auto-select)
// - Tab exits the group entirely
// - Each option has tabIndex 0 only when selected (or first item if nothing selected)

interface RadioGroupProps {
  options: QuestionOption[];
  value: unknown;
  labelId?: string;
  questionId: string;
  required?: boolean;
  error?: string;
  onSelect: (val: string | number) => void;
  /** CSS class for each option button (can vary for star/bool/single) */
  renderOption: (opt: QuestionOption, selected: boolean, idx: number, ref: (el: HTMLButtonElement | null) => void, tabIndex: number, onKeyDown: React.KeyboardEventHandler) => React.ReactNode;
}

function RadioGroup({ options, value, labelId, questionId, required, error, onSelect, renderOption }: RadioGroupProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIdx = options.findIndex((o) => o.value === value);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      next = (idx + 1) % options.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      next = (idx - 1 + options.length) % options.length;
    } else {
      return;
    }
    onSelect(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-required={required}
      aria-describedby={error ? errorId(questionId) : undefined}
    >
      {options.map((opt, idx) => {
        const isTabStop = selectedIdx === -1 ? idx === 0 : selectedIdx === idx;
        return renderOption(
          opt,
          value === opt.value,
          idx,
          (el) => { refs.current[idx] = el; },
          isTabStop ? 0 : -1,
          (e: React.KeyboardEvent) => handleKeyDown(e, idx)
        );
      })}
    </div>
  );
}

// ─── QuestionStep ─────────────────────────────────────────────────────────────

export default function QuestionStep({ question, value, error, onChange, labelId, autoFocus = false }: Props) {
  const { id, type, options, placeholder, required } = question;

  // [C-3] Fix: number inputs emit NaN when cleared — convert to undefined instead
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.valueAsNumber;
    onChange(isNaN(v) ? undefined : v);
  };

  const commonInputProps = {
    id: inputId(id),
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? errorId(id) : undefined,
    "aria-required": required,
    "aria-labelledby": labelId,
    autoFocus,
  };

  return (
    <div className={styles.root}>
      {/* Text */}
      {type === "text" && (
        <input
          {...commonInputProps}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          type="text"
          value={typeof value === "string" ? value : ""}
          placeholder={placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Email */}
      {type === "email" && (
        <input
          {...commonInputProps}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={typeof value === "string" ? value : ""}
          placeholder={placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Number */}
      {type === "number" && (
        <input
          {...commonInputProps}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          type="number"
          inputMode="decimal"
          value={typeof value === "number" ? value : ""}
          placeholder={placeholder ?? ""}
          onChange={handleNumberChange}
        />
      )}

      {/* Date */}
      {type === "date" && (
        <input
          {...commonInputProps}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* Rating — roving tabIndex radio group */}
      {type === "rating" && (
        <RadioGroup
          options={[1,2,3,4,5].map((n) => ({ label: `${n} out of 5`, value: n }))}
          value={value}
          labelId={labelId}
          questionId={id}
          required={required}
          error={error}
          onSelect={onChange}
          renderOption={(opt, selected, _idx, ref, tabIndex, onKeyDown) => (
            <button
              key={opt.value}
              ref={ref}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabIndex}
              onKeyDown={onKeyDown}
              onClick={() => onChange(opt.value)}
              className={`${styles.star} ${selected || (typeof value === "number" && (opt.value as number) <= (value as number)) ? styles.starFilled : ""}`}
              aria-label={`Rate ${opt.value} out of 5`}
            >
              {selected || (typeof value === "number" && (opt.value as number) <= (value as number)) ? "★" : "☆"}
            </button>
          )}
        />
      )}
      {type === "rating" && typeof value === "number" && value > 0 && (
        <span className={styles.ratingLabel} aria-hidden="true">{value} / 5</span>
      )}

      {/* Boolean — roving tabIndex radio group */}
      {type === "boolean" && (
        <RadioGroup
          options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]}
          value={value === true ? "yes" : value === false ? "no" : undefined}
          labelId={labelId}
          questionId={id}
          required={required}
          error={error}
          onSelect={(v) => onChange(v === "yes")}
          renderOption={(opt, selected, _idx, ref, tabIndex, onKeyDown) => (
            <button
              key={opt.value}
              ref={ref}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabIndex}
              onKeyDown={onKeyDown}
              onClick={() => onChange(opt.value === "yes")}
              className={`${styles.boolBtn} ${selected ? styles.boolBtnSelected : ""}`}
            >
              {opt.label}
            </button>
          )}
        />
      )}

      {/* Single — roving tabIndex radio group */}
      {type === "single" && options && (
        <RadioGroup
          options={options}
          value={value}
          labelId={labelId}
          questionId={id}
          required={required}
          error={error}
          onSelect={onChange}
          renderOption={(opt, selected, _idx, ref, tabIndex, onKeyDown) => (
            <button
              key={String(opt.value)}
              ref={ref}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabIndex}
              onKeyDown={onKeyDown}
              onClick={() => onChange(opt.value)}
              className={`${styles.option} ${selected ? styles.optionSelected : ""}`}
            >
              <span className={styles.optionDot} aria-hidden="true" />
              {opt.label}
            </button>
          )}
        />
      )}

      {/* Multi — each option is an independent checkbox */}
      {type === "multi" && options && (
        <div
          role="group"
          aria-labelledby={labelId}
          aria-required={required}
          aria-describedby={error ? errorId(id) : undefined}
          className={styles.optionList}
        >
          {options.map((opt) => {
            const arr = Array.isArray(value) ? (value as (string | number)[]) : [];
            const checked = arr.includes(opt.value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => {
                  onChange(checked ? arr.filter((v) => v !== opt.value) : [...arr, opt.value]);
                }}
                className={`${styles.option} ${styles.optionMulti} ${checked ? styles.optionSelected : ""}`}
              >
                <span
                  className={`${styles.optionCheck} ${checked ? styles.optionCheckFilled : ""}`}
                  aria-hidden="true"
                >
                  {checked ? "✓" : ""}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Error — role="alert" triggers immediate screen reader announcement */}
      {error && (
        <p id={errorId(id)} className={styles.error} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
}
