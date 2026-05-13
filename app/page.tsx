import QuestionnaireDemo from "@/components/QuestionnaireDemo";
import AccordionDemoSection from "@/components/AccordionDemoSection";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const FEATURES = [
  {
    icon: "⚡",
    title: "Zero dependencies",
    body: "The core ships as ~2 KB min+gzip. No runtime bloat, no peer pressure.",
  },
  {
    icon: "🔀",
    title: "Compound conditions",
    body: "showIf supports AND / OR trees that nest arbitrarily deep — exactly how real insurance and onboarding forms work.",
  },
  {
    icon: "🎯",
    title: "Headless by design",
    body: "No UI shipped. Bring your own design system — Shadcn, Radix, Chakra, raw CSS.",
  },
  {
    icon: "🔌",
    title: "Framework adapters",
    body: "First-class React hook and Vue composable. Core class works in Node, React Native, anywhere.",
  },
  {
    icon: "✅",
    title: "Per-type validation",
    body: "Required, min/max, minLength/maxLength, regex, email format — runs per question type automatically.",
  },
  {
    icon: "📦",
    title: "Tree-shakeable",
    body: "Three separate entry points: questify, questify/react, questify/vue. Import only what you need.",
  },
];

const SNIPPETS = {
  install: `npm install @questify/core`,

  react: `import { useQuestionnaire } from '@questify/core/react';

const questions = [
  {
    id: 'age',
    text: 'How old are you?',
    type: 'number',
    required: true,
    validation: { min: 18, max: 99 },
  },
  {
    id: 'smoker',
    text: 'Do you currently smoke?',
    type: 'boolean',
    required: true,
  },
  // Only shown when age >= 50 AND smoker = true
  {
    id: 'chest_scan',
    text: 'Have you had a chest CT scan in the last 2 years?',
    type: 'boolean',
    showIf: {
      and: [
        { questionId: 'age',    value: 50, operator: 'gte' },
        { questionId: 'smoker', value: true },
      ],
    },
  },
];

export function HealthForm() {
  const {
    question,      // current Question object
    questionIndex, // 0-based step index
    totalQuestions,// total visible questions (conditional ones resolved)
    progress,      // 0–1 float for progress bar
    responses,     // { [questionId]: value }
    isComplete,    // all required visible questions answered
    errors,        // { [questionId]: errorMessage }
    canGoBack,
    canGoNext,
    answer,        // answer(value) — call on every input change
    next,          // advance (validates required before moving)
    back,
    reset,
  } = useQuestionnaire({ questions });

  return (
    <div>
      <progress value={progress} max={1} />
      <p>Step {questionIndex + 1} of {totalQuestions}</p>

      <h2>{question?.text}</h2>
      {/* Render your own input based on question.type */}

      <button onClick={back}  disabled={!canGoBack}>Back</button>
      {canGoNext
        ? <button onClick={next}>Next</button>
        : <button disabled={!isComplete}>Submit</button>
      }
    </div>
  );
}`,

  vue: `import { useQuestionnaire } from '@questify/core/vue';

// In your <script setup>
const {
  question, progress, responses, isComplete,
  errors, canGoBack, canGoNext,
  answer, next, back, reset,
} = useQuestionnaire({ questions });`,

  vanilla: `import { Questionnaire } from '@questify/core';

const q = new Questionnaire({ questions });

const unsubscribe = q.subscribe((state) => {
  console.log('Step:', state.questionIndex + 1, '/', state.totalQuestions);
  console.log('Current question:', state.question?.text);
  console.log('Visible questions:', state.visibleQuestions.length);
  console.log('Progress:', Math.round(state.progress * 100) + '%');
});

// Answer the current question
q.answer('Alice');

// Move forward (validates required fields first)
q.next();

// Jump to a specific step
q.jumpTo(3);

// Tear down
unsubscribe();`,

  compound: `// ─ Simple condition ───────────────────────────────────────────
showIf: { questionId: 'smoker', value: true }

// ─ Operator variants ──────────────────────────────────────────
showIf: { questionId: 'bmi', value: 30, operator: 'gte' }
showIf: { questionId: 'conditions', value: 'diabetes', operator: 'includes' }

// ─ AND compound ───────────────────────────────────────────────
// Show only when patient is a smoker AND has heart disease
showIf: {
  and: [
    { questionId: 'smoker',     value: true },
    { questionId: 'conditions', value: 'heart', operator: 'includes' },
  ],
}

// ─ OR compound ────────────────────────────────────────────────
// Show when rating is low OR user said they wouldn't recommend
showIf: {
  or: [
    { questionId: 'rating',    value: 3,    operator: 'lte' },
    { questionId: 'recommend', value: false },
  ],
}

// ─ Nested AND inside OR ────────────────────────────────────────
showIf: {
  or: [
    { questionId: 'cancer', value: true },
    {
      and: [
        { questionId: 'smoker', value: true },
        { questionId: 'age',    value: 50, operator: 'gte' },
      ],
    },
  ],
}`,
};

const API_TABLE_PROPS: Array<{ prop: string; type: string; note: string }> = [
  { prop: "question",       type: "Question | null",           note: "Current question being shown. Null only if questions array is empty." },
  { prop: "visibleQuestions", type: "Question[]",             note: "All currently visible questions after resolving showIf conditions." },
  { prop: "questionIndex",  type: "number",                   note: "0-based index into visibleQuestions." },
  { prop: "totalQuestions", type: "number",                   note: "Length of visibleQuestions — updates in real-time as conditions change." },
  { prop: "progress",       type: "number (0–1)",             note: "Fraction of visible questions that have a non-empty answer." },
  { prop: "responses",      type: "Record<string, unknown>",  note: "All answers collected so far, keyed by question id." },
  { prop: "isComplete",     type: "boolean",                  note: "True when all required visible questions have valid answers." },
  { prop: "errors",         type: "Record<string, string>",   note: "Validation error messages per question id." },
  { prop: "canGoBack",      type: "boolean",                  note: "False on the first question." },
  { prop: "canGoNext",      type: "boolean",                  note: "False on the last visible question." },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>npm install @questify/core</div>

          <h1 className={styles.heroTitle}>
            The headless questionnaire
            <br />
            engine for the web.
          </h1>

          <p className={styles.heroSub}>
            A zero-dependency state machine for multi-step forms, compound conditional
            logic, and per-type validation. Works with React, Vue, or plain JavaScript.
            Headless by design — you bring the components.
          </p>

          {/* Credibility stats */}
          <div className={styles.statsPills}>
            <span className={styles.statsPill}>v1.0.0</span>
            <span className={styles.statsDivider}>·</span>
            <span className={styles.statsPill}>~2 KB gzip</span>
            <span className={styles.statsDivider}>·</span>
            <span className={styles.statsPill}>TypeScript</span>
            <span className={styles.statsDivider}>·</span>
            <span className={styles.statsPill}>MIT</span>
          </div>

          {/* Primary CTA + secondary links */}
          <div className={styles.heroCtas}>
            <a href="#demos" className={styles.ctaPrimary}>
              See it in action →
            </a>
            <a
              href="https://github.com/ashishcumar/questify"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              GitHub
            </a>
            <a
              href="https://npmjs.com/package/questify"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              npm
            </a>
          </div>
        </div>
      </section>

      {/* Mode: all — Accordion demo */}
      <section id="demos" className={styles.demoSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>mode: &quot;all&quot; · Accordion layout</div>
          <h2 className={styles.sectionTitle}>Conditional form — accordion mode</h2>
          <p className={styles.sectionSub}>
            All questions rendered at once in a collapsible list. Expand any field to
            answer it — conditional follow-ups appear{" "}
            <strong>inline below immediately</strong>, no rerenders of sibling questions.
            Each <span className={styles.forkBadge}>⤷</span> marks a question that
            only appears when its condition is met.
          </p>
          <AccordionDemoSection />
        </div>
      </section>

      {/* Mode: step — Branching wizard demo */}
      <section className={`${styles.demoSection} ${styles.demoSectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>mode: &quot;step&quot; · One question at a time</div>
          <h2 className={styles.sectionTitle}>Branching wizard — step-by-step</h2>
          <p className={styles.sectionSub}>
            Dozens of questions — but the form adapts in real time.
            Most users see fewer than half, depending on their answers.{" "}
            <strong>Try different selections</strong> to watch branches appear and
            disappear, compound AND conditions trigger, and progress update live.
          </p>
          <QuestionnaireDemo />
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Why questify</div>
          <h2 className={styles.sectionTitle}>Built around real pain points</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className={styles.codeSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Getting started</div>
          <h2 className={styles.sectionTitle}>Install</h2>
          <pre className={`${styles.codeBlock} ${styles.codeBlockSmall}`}>
            <code>{SNIPPETS.install}</code>
          </pre>
        </div>
      </section>

      {/* React usage */}
      <section className={`${styles.codeSection} ${styles.codeSectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>React</div>
          <h2 className={styles.sectionTitle}>
            <code className={styles.inlineCode}>useQuestionnaire</code> hook
          </h2>
          <p className={styles.sectionSub}>
            Every value in the returned object is reactive. Pass <code className={styles.inlineCode}>answer(value)</code> directly
            to your input's <code className={styles.inlineCode}>onChange</code>. Call <code className={styles.inlineCode}>next()</code> to
            advance — it validates required fields first and populates <code className={styles.inlineCode}>errors</code> if invalid.
          </p>
          <pre className={styles.codeBlock}>
            <code>{SNIPPETS.react}</code>
          </pre>
        </div>
      </section>

      {/* Vue usage */}
      <section className={styles.codeSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Vue 3</div>
          <h2 className={styles.sectionTitle}>
            <code className={styles.inlineCode}>useQuestionnaire</code> composable
          </h2>
          <p className={styles.sectionSub}>
            Same API as React — all returned values are computed refs.
          </p>
          <pre className={`${styles.codeBlock} ${styles.codeBlockSmall}`}>
            <code>{SNIPPETS.vue}</code>
          </pre>
        </div>
      </section>

      {/* Vanilla JS */}
      <section className={`${styles.codeSection} ${styles.codeSectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Vanilla JS / Node</div>
          <h2 className={styles.sectionTitle}>
            <code className={styles.inlineCode}>Questionnaire</code> class
          </h2>
          <p className={styles.sectionSub}>
            The raw state machine. Framework adapters are thin wrappers around this.
            Subscribe to state changes with a callback — returns an unsubscribe function.
          </p>
          <pre className={styles.codeBlock}>
            <code>{SNIPPETS.vanilla}</code>
          </pre>
        </div>
      </section>

      {/* Conditional logic */}
      <section className={styles.codeSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Conditional logic</div>
          <h2 className={styles.sectionTitle}>
            <code className={styles.inlineCode}>showIf</code> — simple to arbitrarily nested
          </h2>
          <p className={styles.sectionSub}>
            A single <code className={styles.inlineCode}>showIf</code> field controls visibility.
            It accepts a simple condition, or a compound <code className={styles.inlineCode}>and</code>/<code className={styles.inlineCode}>or</code> tree.
            Trees can be nested infinitely.
          </p>
          <pre className={styles.codeBlock}>
            <code>{SNIPPETS.compound}</code>
          </pre>
        </div>
      </section>

      {/* State shape reference */}
      <section className={`${styles.codeSection} ${styles.codeSectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>API reference</div>
          <h2 className={styles.sectionTitle}>State shape</h2>
          <p className={styles.sectionSub}>
            Everything returned by <code className={styles.inlineCode}>useQuestionnaire</code> or emitted
            by <code className={styles.inlineCode}>subscribe()</code>.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {API_TABLE_PROPS.map((row) => (
                  <tr key={row.prop}>
                    <td>
                      <code className={styles.inlineCode}>{row.prop}</code>
                    </td>
                    <td>
                      <code className={styles.inlineCodeGray}>{row.type}</code>
                    </td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
