import type { Question } from "./questify-core";

/**
 * Health insurance intake form — modelled on real insurer questionnaires.
 *
 * Branching paths:
 *  - Smoker → cigarettes/day + years smoking
 *  - Pre-existing diabetes → type + duration + HbA1c + insulin
 *  - Pre-existing hypertension → medication + last BP reading
 *  - Pre-existing heart disease → cardiac event + stents/surgery
 *  - Cancer history → type + remission status
 *  - Alcohol → units/week
 *  - Exercise → frequency (only if recommends AND high rating from prev step)
 *  - BMI > 30 + diabetes → metabolic syndrome warning question
 *  - Pregnancy (female only) → current pregnancy status
 */
export const DEMO_QUESTIONS: Question[] = [
  // ─── Personal ────────────────────────────────────────────────────────────
  {
    id: "full_name",
    text: "What is your full legal name?",
    type: "text",
    required: true,
    placeholder: "As it appears on your ID",
    validation: { minLength: 2, maxLength: 80 },
  },
  {
    id: "dob_age",
    text: "What is your current age?",
    type: "number",
    required: true,
    description: "In completed years",
    validation: { min: 18, max: 99, message: "Age must be between 18 and 99." },
  },
  {
    id: "sex",
    text: "What is your biological sex?",
    type: "single",
    required: true,
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Prefer not to say", value: "other" },
    ],
  },

  // ─── Lifestyle ───────────────────────────────────────────────────────────
  {
    id: "smoker",
    text: "Do you currently smoke or use tobacco products?",
    type: "boolean",
    required: true,
  },
  {
    id: "cigarettes_per_day",
    text: "How many cigarettes (or equivalent) do you smoke per day?",
    type: "number",
    required: true,
    showIf: { questionId: "smoker", value: true },
    validation: { min: 1, max: 100 },
  },
  {
    id: "years_smoking",
    text: "For how many years have you been smoking?",
    type: "number",
    required: true,
    showIf: { questionId: "smoker", value: true },
    validation: { min: 1, max: 80 },
  },

  {
    id: "alcohol",
    text: "Do you consume alcohol?",
    type: "boolean",
    required: true,
  },
  {
    id: "alcohol_units",
    text: "Approximately how many units of alcohol do you consume per week?",
    type: "number",
    required: true,
    description: "1 unit ≈ 1 small beer, 1 glass of wine, or 1 shot of spirits",
    showIf: { questionId: "alcohol", value: true },
    validation: { min: 1 },
  },

  {
    id: "bmi",
    text: "What is your approximate BMI (Body Mass Index)?",
    type: "number",
    required: true,
    description: "BMI = weight(kg) ÷ height(m)². Use 0 if unsure — your doctor will measure.",
    validation: { min: 10, max: 70, message: "BMI must be between 10 and 70." },
  },

  // ─── Pre-existing conditions ─────────────────────────────────────────────
  {
    id: "conditions",
    text: "Do you have any of the following diagnosed conditions?",
    type: "multi",
    required: true,
    description: "Select all that apply.",
    options: [
      { label: "Diabetes (Type 1 or 2)", value: "diabetes" },
      { label: "Hypertension (high blood pressure)", value: "hypertension" },
      { label: "Heart disease / CAD", value: "heart" },
      { label: "Cancer (current or past)", value: "cancer" },
      { label: "Asthma / COPD", value: "respiratory" },
      { label: "Kidney disease", value: "kidney" },
      { label: "None of the above", value: "none" },
    ],
  },

  // ─── Diabetes branch ─────────────────────────────────────────────────────
  {
    id: "diabetes_type",
    text: "Which type of diabetes have you been diagnosed with?",
    type: "single",
    required: true,
    showIf: { questionId: "conditions", value: "diabetes", operator: "includes" },
    options: [
      { label: "Type 1 (insulin-dependent)", value: "type1" },
      { label: "Type 2", value: "type2" },
      { label: "Gestational (during pregnancy)", value: "gestational" },
      { label: "MODY / other", value: "other" },
    ],
  },
  {
    id: "diabetes_years",
    text: "How many years ago were you diagnosed with diabetes?",
    type: "number",
    required: true,
    showIf: { questionId: "conditions", value: "diabetes", operator: "includes" },
    validation: { min: 0, max: 80 },
  },
  {
    id: "hba1c",
    text: "What was your most recent HbA1c reading?",
    type: "number",
    required: true,
    description: "In % (e.g. 7.2). Enter 0 if you haven't had it tested.",
    showIf: { questionId: "conditions", value: "diabetes", operator: "includes" },
    validation: { min: 0, max: 20 },
  },
  {
    id: "on_insulin",
    text: "Are you currently on insulin therapy?",
    type: "boolean",
    required: true,
    showIf: { questionId: "conditions", value: "diabetes", operator: "includes" },
  },

  // ─── Metabolic syndrome — diabetes + BMI > 30 ────────────────────────────
  {
    id: "metabolic_syndrome",
    text: "Have you been diagnosed with metabolic syndrome?",
    type: "boolean",
    description:
      "A cluster of conditions — central obesity, high blood sugar, high triglycerides, low HDL, high blood pressure.",
    showIf: {
      and: [
        { questionId: "conditions", value: "diabetes", operator: "includes" },
        { questionId: "bmi", value: 30, operator: "gte" },
      ],
    },
  },

  // ─── Hypertension branch ─────────────────────────────────────────────────
  {
    id: "bp_medication",
    text: "Are you currently on blood pressure medication?",
    type: "boolean",
    required: true,
    showIf: { questionId: "conditions", value: "hypertension", operator: "includes" },
  },
  {
    id: "last_bp",
    text: "What was your most recent systolic blood pressure reading (the top number)?",
    type: "number",
    required: true,
    description: "e.g. 135 for 135/85 mmHg",
    showIf: { questionId: "conditions", value: "hypertension", operator: "includes" },
    validation: { min: 70, max: 250 },
  },

  // ─── Heart disease branch ─────────────────────────────────────────────────
  {
    id: "cardiac_event",
    text: "Have you experienced a cardiac event (heart attack, stroke, angina) in the last 5 years?",
    type: "boolean",
    required: true,
    showIf: { questionId: "conditions", value: "heart", operator: "includes" },
  },
  {
    id: "cardiac_procedure",
    text: "Have you undergone any cardiac procedures?",
    type: "multi",
    showIf: { questionId: "conditions", value: "heart", operator: "includes" },
    options: [
      { label: "Angioplasty / stent", value: "stent" },
      { label: "Bypass surgery (CABG)", value: "cabg" },
      { label: "Pacemaker / ICD implant", value: "pacemaker" },
      { label: "Valve replacement / repair", value: "valve" },
      { label: "None", value: "none" },
    ],
  },

  // ─── Cancer branch ───────────────────────────────────────────────────────
  {
    id: "cancer_type",
    text: "What type of cancer have you been diagnosed with?",
    type: "single",
    required: true,
    showIf: { questionId: "conditions", value: "cancer", operator: "includes" },
    options: [
      { label: "Breast cancer", value: "breast" },
      { label: "Colorectal cancer", value: "colorectal" },
      { label: "Lung cancer", value: "lung" },
      { label: "Prostate cancer", value: "prostate" },
      { label: "Skin cancer (melanoma)", value: "melanoma" },
      { label: "Blood cancer (leukemia/lymphoma)", value: "blood" },
      { label: "Other", value: "other" },
    ],
  },
  {
    id: "cancer_remission",
    text: "Are you currently in remission?",
    type: "boolean",
    required: true,
    showIf: { questionId: "conditions", value: "cancer", operator: "includes" },
  },

  // ─── Pregnancy (female only) ──────────────────────────────────────────────
  {
    id: "pregnant",
    text: "Are you currently pregnant or planning a pregnancy in the next 12 months?",
    type: "boolean",
    showIf: { questionId: "sex", value: "female" },
  },

  // ─── Family history ───────────────────────────────────────────────────────
  {
    id: "family_history",
    text: "Do any first-degree relatives (parents, siblings) have a history of the following?",
    type: "multi",
    description: "Select all that apply.",
    options: [
      { label: "Heart disease before age 60", value: "heart" },
      { label: "Type 2 diabetes", value: "diabetes" },
      { label: "Stroke", value: "stroke" },
      { label: "Cancer", value: "cancer" },
      { label: "None / Not known", value: "none" },
    ],
  },

  // ─── High-risk compound condition example ─────────────────────────────────
  {
    id: "specialist_referral",
    text: "A specialist assessment is typically required for your profile. Have you had a comprehensive health check-up in the last 12 months?",
    type: "boolean",
    description:
      "This applies when a applicant is a smoker with a cardiac history — a common insurer gate.",
    showIf: {
      and: [
        { questionId: "smoker", value: true },
        { questionId: "conditions", value: "heart", operator: "includes" },
      ],
    },
  },
];
