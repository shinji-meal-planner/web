"use client";

import { useState } from "react";
import type { Activity, Options, PlanRequest, Sex } from "@/lib/api";

const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Sedentary (desk job, little exercise)",
  light: "Light (exercise 1–3 days a week)",
  moderate: "Moderate (exercise 3–5 days a week)",
  active: "Active (exercise 6–7 days a week)",
  very_active: "Very active (hard training or a physical job)",
};

export type FormValues = Omit<PlanRequest, "week">;

const field =
  "mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-foreground focus:border-accent focus:outline-none";
const label = "block text-sm font-medium";

export function PlanForm({
  options,
  initial,
  busy,
  onSubmit,
}: {
  options: Options | null;
  initial: FormValues;
  busy: boolean;
  onSubmit: (values: FormValues) => void;
}) {
  const [v, setV] = useState<FormValues>(initial);
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setV((prev) => ({ ...prev, [key]: value }));
  const num = (key: "currentWeightKg" | "targetWeightKg" | "heightCm" | "age") => ({
    value: Number.isNaN(v[key]) ? "" : v[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.valueAsNumber),
  });

  const toggleCondition = (id: string, checked: boolean) => {
    const next = checked ? [...v.healthConditions, id] : v.healthConditions.filter((c) => c !== id);
    setV((prev) => ({ ...prev, healthConditions: next, confirmNoHealthConditions: next.length ? false : prev.confirmNoHealthConditions }));
  };

  const healthAnswered = v.healthConditions.length > 0 || v.confirmNoHealthConditions;

  return (
    <form
      className="space-y-6 rounded-xl border border-line bg-surface p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={busy}>
        <label className={label}>
          Current weight (kg)
          <input type="number" required min={25} max={400} step={0.1} className={field} {...num("currentWeightKg")} />
        </label>
        <label className={label}>
          Target weight (kg)
          <input type="number" required min={25} max={400} step={0.1} className={field} {...num("targetWeightKg")} />
        </label>
        <label className={label}>
          Height (cm)
          <input type="number" required min={100} max={250} step={0.5} className={field} {...num("heightCm")} />
        </label>
        <label className={label}>
          Target date
          <input type="date" required className={field} value={v.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
        </label>
        <label className={label}>
          Age
          <input type="number" required min={1} max={120} step={1} className={field} {...num("age")} />
        </label>
        <label className={label}>
          Sex <span className="font-normal text-muted">(used in the calorie formula)</span>
          <select className={field} value={v.sex} onChange={(e) => set("sex", e.target.value as Sex)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
        <label className={`${label} sm:col-span-2`}>
          Activity level
          <select className={field} value={v.activity} onChange={(e) => set("activity", e.target.value as Activity)}>
            {(options?.activities ?? (Object.keys(ACTIVITY_LABELS) as Activity[])).map((a) => (
              <option key={a} value={a}>
                {ACTIVITY_LABELS[a] ?? a}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Country <span className="font-normal text-muted">(meals use local dishes)</span>
          <input
            required
            minLength={2}
            maxLength={56}
            className={field}
            placeholder="Philippines"
            value={v.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </label>
        <label className={label}>
          Food allergies <span className="font-normal text-muted">(comma separated)</span>
          <input
            maxLength={300}
            className={field}
            placeholder="shrimp, peanuts, milk"
            value={v.allergies}
            onChange={(e) => set("allergies", e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset disabled={busy} className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Health check (required)</legend>
        <p className="text-sm text-muted">
          Tick any that apply. This app can&apos;t safely plan a diet around these; you&apos;ll need your doctor.
        </p>
        <div className="mt-3 space-y-2">
          {(options?.healthConditions ?? []).map((c) => (
            <label key={c.id} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-accent"
                checked={v.healthConditions.includes(c.id)}
                onChange={(e) => toggleCondition(c.id, e.target.checked)}
              />
              {c.label}
            </label>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-3 border-t border-line pt-4 text-sm font-medium">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-accent"
            checked={v.confirmNoHealthConditions}
            disabled={v.healthConditions.length > 0}
            onChange={(e) => set("confirmNoHealthConditions", e.target.checked)}
          />
          None of these apply to me, and I have no other health condition that a doctor manages my diet for.
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={busy || !healthAnswered || !options}
        className="w-full rounded-lg bg-accent px-5 py-3 font-medium text-on-accent disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Working…" : "Check my goal and make a plan"}
      </button>
    </form>
  );
}
