import { CATEGORY_LABEL, money, UNIT_LABEL, type BudgetResponse } from "@/lib/budget-api";
import { slotLabel } from "@/lib/format";

type OkResult = Extract<BudgetResponse, { status: "ok" }>;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function BudgetRefusal({ result }: { result: Extract<BudgetResponse, { status: "refused" }> }) {
  return (
    <section className="rounded-xl border border-bad bg-bad-soft p-5 sm:p-6" role="alert">
      <h2 className="text-xl font-semibold text-bad">This budget can&apos;t feed the household safely</h2>
      <p className="mt-3 leading-relaxed">{result.reason}</p>
      {result.minimumBudget !== null && (
        <p className="mt-4 text-sm">
          Minimum for a basic healthy week: <strong>{money(result.minimumBudget, result.currency)}</strong>
        </p>
      )}
    </section>
  );
}

export function BudgetResult({ result }: { result: OkResult }) {
  const c = result.currency;
  const left = result.weeklyBudget - result.totalCost;
  const groups = Object.entries(CATEGORY_LABEL)
    .map(([cat, label]) => ({ label, lines: result.shoppingList.filter((l) => l.category === cat) }))
    .filter((g) => g.lines.length);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-good bg-good-soft p-5">
        <h2 className="text-lg font-semibold text-good">
          Week planned for {money(result.totalCost, c)} of your {money(result.weeklyBudget, c)} budget
        </h2>
        <p className="mt-1 text-sm">
          {money(left, c)} left over. The shopping supplies {Math.round((result.supplied.kcal / result.needs.kcal) * 100)}% of
          the household&apos;s calories and {Math.round((result.supplied.proteinG / result.needs.proteinG) * 100)}% of its protein.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Week total (calculated)" value={money(result.totalCost, c)} />
        <Stat label="Per person per day" value={money(result.perPersonPerDay, c)} />
        <Stat label="Minimum basic week" value={money(result.minimumBudget, c)} />
      </div>

      <p className="leading-relaxed">{result.overview}</p>
      {result.excludedForAllergies.length > 0 && (
        <p className="text-sm text-muted">
          Left off the list for your allergies:{" "}
          <strong className="text-foreground">{result.excludedForAllergies.join(", ")}</strong>
        </p>
      )}

      <section className="rounded-xl border border-line bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">Shopping list</h3>
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-1 text-xs font-semibold text-muted">{g.label}</p>
              <ul className="divide-y divide-line">
                {g.lines.map((l) => (
                  <li key={l.itemId} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
                    <span className="min-w-0">
                      {l.name}{" "}
                      <span className="text-muted tabular-nums">
                        × {l.quantity} {UNIT_LABEL[l.unit]} @ {money(l.unitPrice, c)}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">{money(l.cost, c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="flex justify-between border-t border-line pt-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{money(result.totalCost, c)}</span>
          </p>
        </div>
      </section>

      {result.tips.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Money-saving tips</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {result.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-3">
        {result.days.map((day, i) => (
          <details key={day.day} open={i === 0} className="rounded-xl border border-line bg-surface">
            <summary className="cursor-pointer list-none p-4 font-semibold">Day {day.day}</summary>
            <ul className="divide-y divide-line border-t border-line">
              {day.meals.map((m) => (
                <li key={`${m.slot}-${m.name}`} className="p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">{slotLabel(m.slot)}</p>
                  <p className="mt-0.5 font-medium">{m.name}</p>
                  <p className="mt-2 text-sm">
                    {m.ingredients.map((ing, j) => `${m.ingredientNames[j]} (${ing.amount})`).join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{m.preparation}</p>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
