# questify

**Headless, zero-dependency questionnaire engine for the web.**

[![npm version](https://img.shields.io/npm/v/%40questify%2Fcore?style=flat-square)](https://npmjs.com/package/@questify/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/%40questify%2Fcore?style=flat-square)](https://bundlephobia.com/package/@questify/core)
[![license](https://img.shields.io/npm/l/%40questify%2Fcore?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue?style=flat-square)](./src)

**Live demo → [questify.renderlog.in](https://questify.renderlog.in)**

---

questify is a pure TypeScript state machine for multi-step forms and surveys.
It ships **zero runtime dependencies** and **zero UI** — you control every pixel.
Framework adapters for React and Vue are included.

## Install

```bash
npm install @questify/core
```

## React

```tsx
import { useQuestionnaire } from '@questify/core/react';

const questions = [
  { id: 'name',   text: "What's your name?",  type: 'text',   required: true },
  { id: 'rating', text: 'Rate us 1–5',         type: 'rating', required: true },
  {
    id: 'feedback',
    text: 'What could be improved?',
    type: 'text',
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

      {/* render your own inputs — questify ships no UI */}
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

## Vue 3

```vue
<script setup lang="ts">
import { useQuestionnaire } from '@questify/core/vue';
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

## Vanilla JS

```ts
import { Questionnaire } from '@questify/core';

const q = new Questionnaire({ questions });

const unsubscribe = q.subscribe((state) => {
  console.log(state.question?.text, state.progress);
});

q.answer('Alice');
q.next();
unsubscribe();
```

## Question types

`text` · `email` · `number` · `boolean` · `single` · `multi` · `rating` · `date`

## Conditional logic — `showIf`

```ts
// Simple
showIf: { questionId: 'smoker', value: true }

// With operator
showIf: { questionId: 'rating', value: 3, operator: 'lte' }

// Compound AND
showIf: {
  and: [
    { questionId: 'age',    value: 18, operator: 'gte' },
    { questionId: 'smoker', value: true },
  ],
}

// Compound OR — nestable to any depth
showIf: {
  or: [
    { questionId: 'urgent', value: true },
    { and: [{ questionId: 'score', value: 5, operator: 'lte' }] },
  ],
}
```

Operators: `eq` · `neq` · `gt` · `lt` · `gte` · `lte` · `includes`

## API

### Hook / composable return value

| Property | Type | Description |
|---|---|---|
| `question` | `Question \| null` | Current question (step mode) |
| `visibleQuestions` | `Question[]` | All visible questions after resolving `showIf` |
| `progress` | `number` (0–1) | Fraction of visible questions answered |
| `responses` | `Record<string, unknown>` | All answers so far |
| `errors` | `Record<string, string>` | Validation errors for visible questions |
| `isComplete` | `boolean` | All required visible questions answered & valid |
| `answer(value)` | `fn` | Answer current question (step mode) |
| `answerById(id, value)` | `fn` | Answer any question by id (all mode) |
| `next()` | `fn` | Advance (validates required first) |
| `back()` | `fn` | Go back one step |
| `jumpTo(index)` | `fn` | Jump to a step by index |
| `validate()` | `fn` | Validate all visible fields, returns errors |
| `reset()` | `fn` | Clear all answers and restart |
| `getSubmittableResponses()` | `fn` | Responses for visible questions only — safe for submission |

### Modes

| Mode | Use case |
|---|---|
| `step` (default) | Wizard — one question at a time |
| `all` | Show all questions simultaneously (accordion, long-form) |

### Built-in validation

- `required` — whitespace-only treated as empty
- `min` / `max` — for `number` and `rating`
- `minLength` / `maxLength` — for `text` and `email`
- `regex` — for `text`
- `email` format — always validated automatically for `type: "email"`
- `date` format — `YYYY-MM-DD` enforced automatically for `type: "date"`
- `number` — rejects `NaN` and `±Infinity`

## License

MIT © [Ashish Kumar](https://github.com/ashishcumar)
