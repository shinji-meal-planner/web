"use client";

import { useEffect, useState } from "react";
import { PlanForm, type FormValues } from "@/components/PlanForm";
import { PlanView } from "@/components/PlanView";
import { RefusalCard } from "@/components/RefusalCard";
import { getOptions, requestPlan, type Options, type PlanResponse } from "@/lib/api";
import { addDays } from "@/lib/format";

const blank = (): FormValues => ({
  currentWeightKg: NaN,
  targetWeightKg: NaN,
  heightCm: NaN,
  age: NaN,
  sex: "female",
  activity: "light",
  targetDate: addDays(new Date().toISOString().slice(0, 10), 84),
  country: "",
  allergies: "",
  healthConditions: [],
  confirmNoHealthConditions: false,
});

export default function Home() {
  const [options, setOptions] = useState<Options | null>(null);
  const [values, setValues] = useState<FormValues>(blank);
  const [formKey, setFormKey] = useState(0);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOptions().then(setOptions, (e: Error) => setError(e.message));
  }, []);

  async function run(next: FormValues, week = 1) {
    setValues(next);
    setBusy(true);
    setError(null);
    try {
      setResult(await requestPlan({ ...next, week }));
      if (week > 1) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Safe Meal Planner</h1>
      <p className="mt-2 text-muted">
        Enter your goal. The app first checks it against safety rules. If it&apos;s safe, AI writes a day-by-day meal
        plan with local dishes from your country, one week at a time, avoiding your allergies.
      </p>

      <div className="mt-8">
        <PlanForm key={formKey} options={options} initial={values} busy={busy} onSubmit={(v) => run(v)} />
      </div>

      <div className="mt-8 space-y-6" aria-live="polite">
        {busy && <p className="text-muted">Checking your goal and writing your meals. This can take up to a minute.</p>}
        {error && <p className="rounded-lg border border-bad bg-bad-soft p-4 text-bad">{error}</p>}
        {!busy && result?.status === "refused" && (
          <RefusalCard
            assessment={result.assessment}
            explanation={result.explanation}
            onUseSafeDate={(date) => {
              setValues((prev) => ({ ...prev, targetDate: date }));
              setFormKey((k) => k + 1);
              setResult(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
        {result?.status === "ok" && <PlanView plan={result} busy={busy} onWeek={(w) => run(values, w)} />}
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        Not medical advice. Calories are estimates. Allergy checks look for common names and hidden sources, but
        always read food labels; if you have a severe allergy or any health condition, talk to your doctor or a
        registered dietitian before changing your diet.
      </footer>
    </main>
  );
}
