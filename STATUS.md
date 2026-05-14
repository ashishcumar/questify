# Questify — Project Status

> Last updated: May 14, 2026

---

## Overview

Questify is a headless, zero-dependency questionnaire engine for React, Vue, and vanilla JS.

| Property | Value |
|---|---|
| GitHub | https://github.com/ashishcumar/questify |
| Demo site | https://questify.renderlog.in |
| npm (target) | `questify` or `@questify/core` |
| npm user | `iashish.99` |

---

## ✅ Done

### Library — Core (`package/src/core/`)
- [x] `Questionnaire` class — full state machine
- [x] `answer(value)` — answer current question (step mode)
- [x] `answerById(id, value)` — answer any question by id (all mode)
- [x] `next()` / `back()` / `jumpTo(index)` — navigation with bounds guard
- [x] `validate()` — validate all visible fields, returns error map
- [x] `reset()` — clears all responses, restarts from step 0
- [x] `getSubmittableResponses()` — returns only visible-question responses (GDPR/HIPAA safe)
- [x] `subscribe(callback)` — pub/sub with snapshot safety (no mutation mid-emit)
- [x] `mode: "step"` and `mode: "all"` support
- [x] `initialResponses` pre-population
- [x] Stale error pruning (hidden questions don't retain errors in state)
- [x] Defensive state copy (external mutation of `state.responses` is blocked)
- [x] Duplicate question ID warning

### Library — Conditional Logic
- [x] Simple `showIf: { questionId, value, operator? }`
- [x] Compound `showIf: { and: [...] }` — all must be true
- [x] Compound `showIf: { or: [...] }` — at least one must be true
- [x] Arbitrarily nested AND/OR trees
- [x] Empty `and: []` → always visible; empty `or: []` → always hidden
- [x] Operators: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `includes`
- [x] Recursion depth cap (max 20) — prevents stack overflow on deep/cyclic configs

### Library — Validation
- [x] `required` — whitespace-only treated as empty
- [x] `min` / `max` for `number` and `rating`
- [x] `minLength` / `maxLength` for `text` and `email`
- [x] `regex` with try/catch (malformed regex skipped silently)
- [x] `email` format always validated automatically
- [x] `date` format enforced as `YYYY-MM-DD` with calendar sanity check
- [x] `number` rejects `NaN` and `±Infinity`

### Library — Question Types
- [x] `text`, `email`, `number`, `boolean`, `single`, `multi`, `rating`, `date`

### Library — Security
- [x] Prototype pollution guard (`__proto__`, `constructor`, `prototype` blocked as IDs)
- [x] Pub/sub subscriber snapshot (safe against subscribe/unsubscribe during emit)
- [x] Immutable state emission (responses are shallow-copied before emitting)

### Library — Adapters
- [x] React adapter — `useQuestionnaire` hook (`package/src/react/`)
- [x] Vue 3 adapter — `useQuestionnaire` composable with `onUnmounted` cleanup (`package/src/vue/`)
- [x] Both adapters expose full API: `answerById`, `validate`, `getSubmittableResponses`

### Library — Build System
- [x] `tsup` config — CJS + ESM + `.d.ts` for core, react, vue
- [x] Correct `exports` map with `types` first (TypeScript resolution order)
- [x] `package.json` — keywords, peer deps (optional react/vue), `files: ["dist"]`
- [x] `tsconfig.json` — strict mode, ES2019 target
- [x] `package/README.md` — full npm page docs (shown on npmjs.com)
- [x] `package/LICENSE` — MIT

### Demo Site (`app/`, `components/`, `lib/`)
- [x] Next.js 16 app
- [x] Accordion demo (`mode: "all"`) — recursive inline conditional questions
- [x] Step wizard demo (`mode: "step"`) — 23 questions, deep branching
- [x] `lib/questify-core.ts` + `lib/use-questionnaire.ts` — inlined library for self-contained demo

### Demo — Accessibility
- [x] `aria-labelledby` on all inputs (linked to visible question heading)
- [x] `aria-invalid` + `aria-describedby` on error-linked inputs
- [x] `aria-required` on inputs
- [x] `role="radiogroup"` + `role="radio"` + `aria-checked` for single/boolean/rating
- [x] `role="group"` + `role="checkbox"` + `aria-checked` for multi
- [x] Roving `tabIndex` + arrow-key navigation in radio groups
- [x] `role="alert"` on error messages (announced immediately by screen readers)
- [x] `aria-expanded` + `aria-controls` on accordion headers
- [x] `aria-live="polite"` regions for step transitions and conditional question appearances
- [x] `aria-label` on progress bar
- [x] `autoFocus` is a prop (true in step mode, false in accordion — no focus chaos)

### Demo — Styling & CSS
- [x] Full dark mode via `@media (prefers-color-scheme: dark)` CSS variables
- [x] `@media (prefers-reduced-motion: reduce)` — all transitions/animations disabled
- [x] `:focus-visible` rings (keyboard only, not mouse clicks)
- [x] `min-height: 44px` on all interactive buttons (WCAG touch target)
- [x] `border-inline-start` instead of `border-left` (RTL layout safe)
- [x] `color-mix()` fallbacks for Chrome < 111

### Demo — SEO
- [x] `metadataBase`, `title`, `description`, `keywords`
- [x] `alternates.canonical`
- [x] `openGraph` with explicit image (1200×630), width, height, alt, siteName
- [x] `twitter` card with explicit image + `creator`
- [x] `authors`, `creator`, `publisher`, `applicationName`, `referrer`
- [x] `robots` with full `googleBot` directives (max-snippet, max-image-preview)
- [x] `colorScheme: "light dark"`, `themeColor` for light + dark
- [x] JSON-LD: `SoftwareApplication` schema
- [x] JSON-LD: `WebSite` schema (sitelinks search box eligibility)
- [x] `/sitemap.xml` — statically generated
- [x] `/robots.txt` — statically generated
- [x] `/manifest.webmanifest` — Web App Manifest (PWA installability)

### Demo — Favicons / Icons
- [x] `app/icon.tsx` — 32×32 branded favicon (indigo "Q" mark)
- [x] `app/apple-icon.tsx` — 180×180 Apple touch icon
- [x] `app/opengraph-image.tsx` — 1200×630 social card (shown on Twitter, LinkedIn, Slack)

### Demo — Security Headers
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: DENY`
- [x] `Strict-Transport-Security` (2 years + preload)
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` (camera, mic, geolocation blocked)
- [x] `Content-Security-Policy` (default-src self, frame-ancestors none)
- [x] Removed `output: "standalone"` (wrong for Vercel)

### Repo / Deployment
- [x] Monorepo structure: `package/` (npm lib) + root (Next.js demo)
- [x] `.gitignore` — excludes node_modules, dist, .next, .env
- [x] Root `README.md` — full monorepo docs
- [x] Git initialized and pushed to `github.com/ashishcumar/questify`
- [x] Vercel project created and connected to GitHub repo
- [x] `tsconfig.json` excludes `package/` from Next.js type checker

---

## ⏳ Pending

### 🔴 npm Publish (Blocked)
- [ ] **Name conflict**: `questify` blocked by npm typosquatting filter (too similar to `restify`, `vuetify`)
- [ ] **Option A** *(recommended — faster)*: Create free npm org at npmjs.com/org/create → name: `questify` → publish as `@questify/core@1.0.0`
  - Package code already updated for `@questify/core`
  - Run: `cd package && npm publish --access public`
- [ ] **Option B** *(slower, cleaner unscoped name)*: Wait for npm support appeal at npmjs.com/support → category: "There is a problem with the npm registry" → request `questify` name to be whitelisted

### 🟡 Domain
- [ ] Add `questify.renderlog.in` in Vercel → Settings → Domains
- [ ] Add CNAME record in your DNS provider (name: `questify`, value: Vercel's CNAME)
- [ ] Wait for SSL certificate provisioning (automatic, ~2 min after DNS propagates)

### 🟡 npm 2FA
- [ ] Either set up an authenticator app on your npm account
- [ ] Or use a Granular Access Token (bypass 2FA for CLI publishing) — recommended for future releases

### 🟢 Post-launch (nice to have)
- [ ] Add GitHub repo topics: `questionnaire`, `form`, `headless`, `react`, `vue`, `typescript`
- [ ] Tweet / post about the launch with the demo link
- [ ] If published as `@questify/core`, update demo page install snippet once `questify` name is approved
- [ ] Consider adding a `CHANGELOG.md` before future releases
- [ ] Add unit tests for core validation and conditional logic edge cases

---

## Quick commands

```bash
# Build npm package
cd package && npm run build

# Publish (once org/name is ready)
cd package && npm publish --access public

# Run demo locally
npm run dev

# Deploy (automatic on every git push to main via Vercel)
git push
```
