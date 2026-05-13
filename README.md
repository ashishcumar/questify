# questify

**Headless, zero-dependency questionnaire engine.** Works with React, Vue, or plain JavaScript — you own every pixel.

[![npm version](https://img.shields.io/npm/v/questify?style=flat-square)](https://npmjs.com/package/questify)
[![bundle size](https://img.shields.io/bundlephobia/minzip/questify?style=flat-square)](https://bundlephobia.com/package/questify)
[![license](https://img.shields.io/npm/l/questify?style=flat-square)](./package/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue?style=flat-square)](./package/src)

**Live playground → [questify.renderlog.in](https://questify.renderlog.in)**

---

## Why questify?

Every questionnaire library either ships its own UI (locked, hard to override) or is tightly coupled to one framework. **questify** is just the state machine — you bring the components.

- Zero runtime dependencies in the core
- Conditional visibility with `showIf` — nested `and`/`or` trees, arbitrary depth
- Per-type validation built-in (`email`, `number`, `date`, `text`, `regex`, …)
- Step mode (one question at a time) and all-mode (render everything at once)
- React hook + Vue composable — or use the raw class anywhere
- Fully typed with TypeScript
- SSR safe — no browser globals in the core

---

## Repository structure

```
questify/
├── package/          ← npm library source (published to npm as "questify")
│   ├── src/
│   │   ├── core/     ← state machine, validation, conditional logic
│   │   ├── react/    ← useQuestionnaire hook
│   │   └── vue/      ← useQuestionnaire composable
│   ├── package.json
│   ├── tsup.config.ts
│   └── tsconfig.json
│
└── demo/             ← Next.js playground (deployed at questify.renderlog.in)
    ├── app/
    ├── components/
    └── lib/          ← inlined library copy for zero-setup playground
```

---

## Install

```bash
npm install questify
# or
pnpm add questify
# or
yarn add questify
```

---

## Quick start

### React

```tsx
import { useQuestionnaire } from 'questify/react';

const questions = [
  { id: 'name',   text: "What's your name?",  type: 'text',   required: true },
  { id: 'rating', text: 'Rate us 1–5',         type: 'rating', required: true },
  {
    id: 'feedback',
    text: 'What could be better?',
    type: 'text',
    // Only shown if rating <= 3
    showIf: { questionId: 'rating', value: 3, operator: 'lte' },
  },
];

function Survey() {
  const { question, answer, next, back, progress, isComplete, canGoNext, canGoBack } =
    useQuestionnaire({ questions });

  if (!question) return null;

  return (
    <div>
      <progress value={progress} max={1} />
      <h2>{question.text}</h2>

      {/* render your own inputs — questify does not ship any */}
      {question.type === 'text' && (
        <input onChange={(e) => answer(e.target.value)} />
      )}

      <button onClick={back} disabled={!canGoBack}>Back</button>
      {canGoNext
        ? <button onClick={next}>Next</button>
        : <button disabled={!isComplete}>Submit</button>
      }
    </div>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { useQuestionnaire } from 'questify/vue';
const { question, answer, next, back, progress, isComplete } =
  useQuestionnaire({ questions });
</script>

<template>
  <div v-if="question">
    <progress :value="progress" :max="1" />
    <h2>{{ question.text }}</h2>
    <input v-if="question.type === 'text'" @input="e => answer(e.target.value)" />
    <button @click="back">Back</button>
    <button @click="next">Next</button>
  </div>
</template>
```

### Vanilla JS / Node

```ts
import { Questionnaire } from 'questify';

const q = new Questionnaire({ questions });

const unsubscribe = q.subscribe((state) => {
  console.log('current:', state.question?.text);
  console.log('progress:', state.progress);
});

q.answer('Alice');
q.next();

// When done
unsubscribe();
```

---

## Question types

| `type`    | Value format             | Notes |
|-----------|--------------------------|-------|
| `text`    | `string`                 | Free text |
| `email`   | `string`                 | Validates email format automatically |
| `number`  | `number`                 | Supports `min`, `max` |
| `boolean` | `boolean`                | Yes / No |
| `single`  | `string \| number`       | One of `options` |
| `multi`   | `(string \| number)[]`   | One or more of `options` |
| `rating`  | `number`                 | Default 1–5, configurable via `min`/`max` |
| `date`    | `string` (YYYY-MM-DD)    | Validates format + calendar correctness |

---

## Conditional logic — `showIf`

### Simple condition

```ts
showIf: { questionId: 'smoker', value: true }
// with an explicit operator
showIf: { questionId: 'rating', value: 3, operator: 'lte' }
```

Available operators: `eq` (default) · `neq` · `gt` · `lt` · `gte` · `lte` · `includes`

### Compound AND / OR — arbitrarily nested

```ts
// Show only if BOTH conditions are true
showIf: {
  and: [
    { questionId: 'smoker',     value: true },
    { questionId: 'bmi',        value: 30, operator: 'gt' },
  ],
}

// Show if EITHER condition is true
showIf: {
  or: [
    { questionId: 'cancer',     value: true },
    { questionId: 'cardiac',    value: true },
  ],
}

// Nesting — and inside or
showIf: {
  or: [
    { questionId: 'urgent', value: true },
    {
      and: [
        { questionId: 'age',   value: 65, operator: 'gte' },
        { questionId: 'risk',  value: 'high' },
      ],
    },
  ],
}
```

---

## Validation

Validation rules live on each question's `validation` field:

```ts
{
  id: 'age',
  type: 'number',
  required: true,
  validation: {
    min: 18,
    max: 120,
    message: 'Age must be between 18 and 120',
  },
}

{
  id: 'email',
  type: 'email',
  required: true,
  // email format is always validated automatically — no extra config needed
}

{
  id: 'notes',
  type: 'text',
  validation: {
    maxLength: 500,
    regex: '^[\\w\\s,.-]+$',
    message: 'Only letters, numbers, and basic punctuation',
  },
}
```

| Rule | Types | Description |
|------|-------|-------------|
| `required` | all | Field must have a non-empty, non-whitespace value |
| `min` / `max` | `number`, `rating` | Numeric bounds |
| `minLength` / `maxLength` | `text`, `email` | Character count bounds |
| `regex` | `text` | Must match regex string |
| `message` | all | Custom error message |

**Built-in automatic checks** (no `validation` config needed):
- `email` — validates `user@domain.tld` format
- `number` — rejects `NaN` and `±Infinity`
- `date` — validates `YYYY-MM-DD` format and calendar correctness
- `required` with whitespace-only string — treated as empty

---

## React hook — `useQuestionnaire`

```ts
const {
  // ── State ──────────────────────────────────────────────────────
  question,            // current question (step mode) | null
  visibleQuestions,    // all currently visible questions (resolved showIf)
  questionIndex,       // 0-based index into visibleQuestions
  totalQuestions,      // visibleQuestions.length
  progress,            // 0–1 float (answered / total)
  responses,           // { [questionId]: value } — shallow copy, safe to read
  errors,              // { [questionId]: errorMessage } — only for visible questions
  isComplete,          // true when all required visible questions are answered & valid

  // ── Navigation (step mode) ─────────────────────────────────────
  canGoBack,
  canGoNext,
  next,                // advance one step
  back,                // go back one step
  jumpTo,              // jumpTo(index) — jump to any visible question by index

  // ── Answering ──────────────────────────────────────────────────
  answer,              // answer(value) — answers the current question (step mode)
  answerById,          // answerById(questionId, value) — answers any question by id (all mode)

  // ── Utilities ──────────────────────────────────────────────────
  validate,            // validate() → Record<string, string> — runs validation on all visible questions
  reset,               // reset() — clears all responses and restarts
  getSubmittableResponses, // → Record<string, unknown> — only responses for currently VISIBLE questions
} = useQuestionnaire({ questions, mode: 'step' });
```

> **Note:** Pass a stable `questions` array (defined outside the component or memoised). The hook reads `config` only on first render.

---

## Vue composable — `useQuestionnaire`

Identical API to the React hook, but returns Vue `ref`/`computed` values:

```ts
import { useQuestionnaire } from 'questify/vue';

const {
  question,        // ComputedRef<Question | null>
  visibleQuestions,// ComputedRef<Question[]>
  progress,        // ComputedRef<number>
  responses,       // ComputedRef<Record<string, unknown>>
  errors,          // ComputedRef<Record<string, string>>
  isComplete,      // ComputedRef<boolean>
  answer,
  answerById,
  next,
  back,
  jumpTo,
  validate,
  reset,
  getSubmittableResponses,
} = useQuestionnaire({ questions });
```

Subscription is automatically cleaned up via `onUnmounted`.

---

## Vanilla JS class — `Questionnaire`

```ts
import { Questionnaire } from 'questify';

const q = new Questionnaire({ questions, mode: 'step' });

// Subscribe to state changes
const unsubscribe = q.subscribe((state) => { /* ... */ });

// Answer current question (step mode)
q.answer('Alice');

// Answer any question by id (all mode)
q.answerById('full_name', 'Alice');

// Navigate
q.next();
q.back();
q.jumpTo(2);

// Validate all visible fields
const errors = q.validate();

// Get responses for visible questions only (for safe form submission)
const payload = q.getSubmittableResponses();

// Reset
q.reset();

// Clean up
unsubscribe();
```

---

## Modes

| Mode | Use case |
|------|----------|
| `step` (default) | Wizard / multi-step form — one question at a time |
| `all` | Show all questions simultaneously — great for accordions and long forms |

```ts
useQuestionnaire({ questions, mode: 'all' });
```

In `all` mode, use `answerById(questionId, value)` instead of `answer(value)`.

---

## TypeScript types

```ts
import type {
  Question,
  QuestionType,
  QuestionOption,
  QuestionValidation,
  QuestionnaireConfig,
  QuestionnaireState,
  ShowIfCondition,
  ShowIfCompound,
  ShowIfRule,        // = ShowIfCondition | ShowIfCompound
  ConditionOperator,
  DisplayMode,
} from 'questify';
```

---

## `getSubmittableResponses()` — GDPR / HIPAA safe submission

When a user changes their answer and a previously-answered branch becomes hidden, you should **not** submit those hidden responses — they may contain sensitive data (health history, PII, etc.).

```ts
const payload = getSubmittableResponses();
// Only includes answers for currently VISIBLE questions.
// Hidden-branch answers are automatically pruned.
await fetch('/api/submit', { method: 'POST', body: JSON.stringify(payload) });
```

---

## Custom renderer pattern (Tailwind, shadcn/ui, MUI, etc.)

questify ships zero CSS. Your renderer is just a function of `(question, value, error, onChange)`:

```tsx
// Works with Tailwind + shadcn/ui
function MyRenderer({ question, value, error, onChange }: RendererProps) {
  if (question.type === 'text') {
    return (
      <div>
        <Input
          value={value as string ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={error ? 'border-red-500' : ''}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
  // handle other types…
}

function MyQuestionnaire() {
  const { question, responses, errors, answer, next } = useQuestionnaire({ questions });
  if (!question) return null;
  return (
    <div>
      <h2>{question.text}</h2>
      <MyRenderer
        question={question}
        value={responses[question.id]}
        error={errors[question.id]}
        onChange={answer}
      />
      <button onClick={next}>Next</button>
    </div>
  );
}
```

---

## Development

```bash
# Build the npm library
cd package
npm install
npm run build

# Run the demo playground
cd ..          # repo root
npm install
npm run dev
```

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes in `package/src/`
4. Mirror any API changes to `lib/questify-core.ts` in the demo
5. Open a PR

---

## License

MIT © [Ashish Kumar](https://github.com/ashishcumar)
