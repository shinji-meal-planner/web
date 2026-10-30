import type { PlanResponse } from "@/lib/api";
import { formatDate, slotLabel } from "@/lib/format";

type OkPlan = Extract<PlanResponse, { status: "ok" }>;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function PlanView({
  plan,
  busy,
  onWeek,
}: {
  plan: OkPlan;
  busy: boolean;
  onWeek: (week: number) => void;
}) {
  const { assessment: a, week } = plan;
  const totalWeeks = a.weeks.length;
  const change = a.goal === "maintain" ? "Maintain" : `${a.weeklyChangeKg > 0 ? "+" : ""}${a.weeklyChangeKg} kg/week`;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-good bg-good-soft p-5">
        <h2 className="text-lg font-semibold text-good">Your goal is safe</h2>
        <p className="mt-1 text-sm">
          {a.goal === "maintain"
            ? "You'll eat at maintenance to hold your weight."
            : `${a.changeKg > 0 ? "Gain" : "Lose"} ${Math.abs(a.changeKg)} kg over ${totalWeeks} weeks, within the safe limit of ${a.maxSafeWeeklyChangeKg} kg a week.`}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="This week's target" value={`${week.dailyCalories} kcal/day`} />
        <Stat label="Your maintenance" value={`${a.maintenanceCalories} kcal`} />
        <Stat label="Pace" value={change} />
        <Stat label="BMI now → target" value={`${a.currentBmi} → ${a.targetBmi}`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Week {week.number} of {totalWeeks}{" "}
          <span className="text-base font-normal text-muted">
            from {formatDate(week.startDate)}
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy || week.number <= 1}
            onClick={() => onWeek(week.number - 1)}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Previous week
          </button>
          <button
            type="button"
            disabled={busy || week.number >= totalWeeks}
            onClick={() => onWeek(week.number + 1)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent disabled:opacity-40"
          >
            Next week
          </button>
        </div>
      </div>

      <p className="leading-relaxed">{week.overview}</p>
      {plan.allergies.length > 0 && (
        <p className="text-sm text-muted">
          Checked against your allergies: <strong className="text-foreground">{plan.allergies.join(", ")}</strong>
        </p>
      )}

      <div className="space-y-3">
        {week.days.map((day, i) => (
          <details key={day.day} open={i === 0} className="group rounded-xl border border-line bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <span className="font-semibold">
                Day {day.day} · {formatDate(day.date, { weekday: "long", month: "short", day: "numeric" })}
              </span>
              <span className="text-sm text-muted tabular-nums">{day.totalCalories} kcal</span>
            </summary>
            <ul className="divide-y divide-line border-t border-line">
              {day.meals.map((meal) => (
                <li key={`${meal.slot}-${meal.name}`} className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p>
                      <span className="text-xs font-semibold tracking-wide text-muted uppercase">{slotLabel(meal.slot)}</span>
                      <span className="mt-0.5 block font-medium">{meal.name}</span>
                    </p>
                    <p className="text-sm text-muted tabular-nums">
                      {meal.calories} kcal · P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                    </p>
                  </div>
                  <p className="mt-2 text-sm">
                    {meal.ingredients.map((ing) => `${ing.item} (${ing.amount})`).join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{meal.preparation}</p>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
