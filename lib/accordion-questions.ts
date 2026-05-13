import type { Question } from "./questify-core";

/**
 * Insurance quote form — designed for the accordion (mode: 'all') demo.
 * 5 root questions; each answer unlocks inline follow-up questions recursively.
 *
 * Tree structure:
 *
 * coverage_type
 *   ├─ [health]  → pre_existing
 *   │               └─ [true]  → conditions_list
 *   │                             └─ [includes diabetes] → hba1c
 *   └─ [life]   → smoker
 *                   └─ [true]  → years_smoking
 *
 * for_whom
 *   ├─ [family]   → dependents
 *   └─ [business] → employee_count
 *                     └─ [> 50] → group_plan_note
 *
 * prior_claims
 *   └─ [true] → claim_count
 *                 └─ [> 2] → claim_reason
 *
 * vehicle_type  (only when coverage = vehicle)
 *   └─ [truck / commercial] → commercial_use
 *
 * budget
 */
export const ACCORDION_QUESTIONS: Question[] = [
  // ── Root 1 ───────────────────────────────────────────────────
  {
    id: "coverage_type",
    text: "What type of insurance are you looking for?",
    type: "single",
    required: true,
    options: [
      { label: "🏥  Health Insurance", value: "health" },
      { label: "🛡️  Life Insurance",   value: "life" },
      { label: "🚗  Vehicle Insurance", value: "vehicle" },
      { label: "✈️  Travel Insurance",  value: "travel" },
    ],
  },

  // Health branch ──────────────────────────────────────────────
  {
    id: "pre_existing",
    text: "Do you have any pre-existing medical conditions?",
    type: "boolean",
    required: true,
    showIf: { questionId: "coverage_type", value: "health" },
  },
  {
    id: "conditions_list",
    text: "Which conditions apply to you?",
    type: "multi",
    description: "Select all that apply.",
    required: true,
    showIf: { questionId: "pre_existing", value: true },
    options: [
      { label: "Diabetes", value: "diabetes" },
      { label: "Hypertension", value: "hypertension" },
      { label: "Asthma / COPD", value: "asthma" },
      { label: "Heart disease", value: "heart" },
      { label: "Kidney disease", value: "kidney" },
    ],
  },
  // Third-level: diabetes → HbA1c
  {
    id: "hba1c",
    text: "What was your most recent HbA1c reading (%)?",
    type: "number",
    description: "e.g. 7.2 — enter 0 if untested",
    required: true,
    showIf: {
      and: [
        { questionId: "conditions_list", value: "diabetes", operator: "includes" },
        { questionId: "pre_existing",    value: true },
      ],
    },
    validation: { min: 0, max: 20 },
  },

  // Life branch ────────────────────────────────────────────────
  {
    id: "smoker",
    text: "Are you a current smoker or tobacco user?",
    type: "boolean",
    required: true,
    showIf: { questionId: "coverage_type", value: "life" },
  },
  {
    id: "years_smoking",
    text: "For how many years have you been smoking?",
    type: "number",
    required: true,
    showIf: { questionId: "smoker", value: true },
    validation: { min: 1, max: 70 },
  },

  // Vehicle branch ─────────────────────────────────────────────
  {
    id: "vehicle_type",
    text: "What kind of vehicle are you insuring?",
    type: "single",
    required: true,
    showIf: { questionId: "coverage_type", value: "vehicle" },
    options: [
      { label: "Private car", value: "car" },
      { label: "Motorcycle / scooter", value: "bike" },
      { label: "Commercial truck / van", value: "commercial" },
      { label: "Electric vehicle", value: "ev" },
    ],
  },
  {
    id: "commercial_use",
    text: "Will this vehicle be used for transporting goods or passengers for hire?",
    type: "boolean",
    required: true,
    showIf: { questionId: "vehicle_type", value: "commercial" },
  },

  // ── Root 2 ───────────────────────────────────────────────────
  {
    id: "for_whom",
    text: "Who are you purchasing this insurance for?",
    type: "single",
    required: true,
    options: [
      { label: "Just myself",            value: "self" },
      { label: "Myself + family",        value: "family" },
      { label: "My business / employees", value: "business" },
    ],
  },
  {
    id: "dependents",
    text: "How many family members (excluding yourself) will be covered?",
    type: "number",
    required: true,
    showIf: { questionId: "for_whom", value: "family" },
    validation: { min: 1, max: 20 },
  },
  {
    id: "employee_count",
    text: "How many employees need coverage?",
    type: "number",
    required: true,
    showIf: { questionId: "for_whom", value: "business" },
    validation: { min: 1 },
  },
  // Large team → group plan note
  {
    id: "group_plan",
    text: "For teams over 50, a dedicated group plan is recommended. Would you like to explore a custom group quote?",
    type: "boolean",
    showIf: { questionId: "employee_count", value: 50, operator: "gte" },
  },

  // ── Root 3 ───────────────────────────────────────────────────
  {
    id: "prior_claims",
    text: "Have you made any insurance claims in the last 3 years?",
    type: "boolean",
    required: true,
  },
  {
    id: "claim_count",
    text: "How many claims did you make?",
    type: "number",
    required: true,
    showIf: { questionId: "prior_claims", value: true },
    validation: { min: 1 },
  },
  // High claim count → reason
  {
    id: "claim_reason",
    text: "What was the primary reason for multiple claims?",
    type: "single",
    required: true,
    showIf: { questionId: "claim_count", value: 2, operator: "gt" },
    options: [
      { label: "Accident / injury", value: "accident" },
      { label: "Chronic illness",   value: "chronic" },
      { label: "Theft / loss",      value: "theft" },
      { label: "Natural disaster",  value: "disaster" },
      { label: "Other",             value: "other" },
    ],
  },

  // ── Root 4 ───────────────────────────────────────────────────
  {
    id: "budget",
    text: "What is your preferred monthly premium range?",
    type: "single",
    required: true,
    options: [
      { label: "Under ₹500",       value: "low" },
      { label: "₹500 – ₹2,000",   value: "mid" },
      { label: "₹2,000 – ₹5,000", value: "high" },
      { label: "Above ₹5,000",     value: "premium" },
    ],
  },
];
