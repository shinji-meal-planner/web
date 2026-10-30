"use client";

import { useState } from "react";
import { BudgetRefusal, BudgetResult } from "@/components/budget/BudgetResult";
import { PriceTable } from "@/components/budget/PriceTable";
import { getPrices, requestBudgetPlan, type BudgetResponse, type PriceList } from "@/lib/budget-api";
import { formatDate } from "@/lib/format";

const field =
  "mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-foreground focus:border-accent focus:outline-none";
const label = "block text-sm font-medium";
const card = "rounded-xl border border-line bg-surface p-5 sm:p-6";

export default function BudgetPage() {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [budget, setBudget] = useState(NaN);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [allergies, setAllergies] = useState("");
  const [result, setResult] = useState<BudgetResponse | null>(null);
  const [busy, setBusy] = useState<"prices" | "plan" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPrices(e: React.FormEvent) {
    e.preventDefault();
    setBusy("prices");
    setError(null);
    setResult(null);
    try {
      setPriceList(await getPrices(country, city));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function makePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!priceList) return;
    if (priceList.items.some((i) => !(i.price > 0))) {
      setError("Every price must be a number above zero, or remove that item.");
      return;
    }
    setBusy("plan");
    setError(null);
    try {
      setResult(
        await requestBudgetPlan({
          country: priceList.country,
          city: priceList.city,
          currency: priceList.currency,
          prices: priceList.items,
          weeklyBudget: budget,
          adults,
          children,
          mealsPerDay,
          allergies,
        }),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Budget Meal Planner</h1>
      <p className="mt-2 text-muted">
        A week of home meals that fits your food budget, based on prices where you live. You check the prices first;
        the app adds up every cost itself and won&apos;t plan a week that leaves anyone hungry.
      </p>

      <form onSubmit={loadPrices} className={`${card} mt-8`}>
        <h2 className="font-semibold">1. Where do you shop?</h2>
        <fieldset disabled={busy !== null} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className={label}>
            Country
            <input required minLength={2} maxLength={56} className={field} placeholder="Kenya" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
          <label className={label}>
            City or town
            <input required minLength={2} maxLength={80} className={field} placeholder="Nairobi" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 font-medium text-on-accent disabled:opacity-50">
            {busy === "prices" ? "Estimating…" : "Get local prices"}
          </button>
        </fieldset>
      </form>

      {priceList && (
        <form onSubmit={makePlan} className="mt-6 space-y-6">
          <section className={card}>
            <h2 className="font-semibold">
              2. Check the prices in {priceList.city}, {priceList.country} ({priceList.currency})
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              AI estimates from {formatDate(priceList.estimatedAt.slice(0, 10))}, not live prices. Change anything that
              looks wrong for your area, and remove what you can&apos;t buy. Costs are calculated from these numbers.
            </p>
            <PriceTable
              items={priceList.items}
              currency={priceList.currency}
              disabled={busy !== null}
              onChange={(items) => setPriceList({ ...priceList, items })}
            />
          </section>

          <section className={card}>
            <h2 className="font-semibold">3. Your budget and household</h2>
            <fieldset disabled={busy !== null} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Weekly food budget ({priceList.currency})
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  className={field}
                  value={Number.isNaN(budget) ? "" : budget}
                  onChange={(e) => setBudget(e.target.valueAsNumber)}
                />
              </label>
              <label className={label}>
                Meals a day
                <select className={field} value={mealsPerDay} onChange={(e) => setMealsPerDay(Number(e.target.value))}>
                  <option value={2}>2 (lunch, dinner)</option>
                  <option value={3}>3 (breakfast, lunch, dinner)</option>
                  <option value={4}>4 (with a snack)</option>
                </select>
              </label>
              <label className={label}>
                Adults (13+)
                <input type="number" required min={1} max={12} className={field} value={adults} onChange={(e) => setAdults(e.target.valueAsNumber)} />
              </label>
              <label className={label}>
                Children (under 13)
                <input type="number" required min={0} max={12} className={field} value={children} onChange={(e) => setChildren(e.target.valueAsNumber)} />
              </label>
              <label className={`${label} sm:col-span-2`}>
                Food allergies <span className="font-normal text-muted">(comma separated)</span>
                <input maxLength={300} className={field} placeholder="peanuts, shrimp" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
              </label>
            </fieldset>
            <button
              type="submit"
              disabled={busy !== null}
              className="mt-5 w-full rounded-lg bg-accent px-5 py-3 font-medium text-on-accent disabled:opacity-50 sm:w-auto"
            >
              {busy === "plan" ? "Planning…" : "Plan my week"}
            </button>
          </section>
        </form>
      )}

      <div className="mt-8 space-y-6" aria-live="polite">
        {busy && <p className="text-muted">Asking the AI. This can take up to a minute.</p>}
        {error && <p className="rounded-lg border border-bad bg-bad-soft p-4 text-bad">{error}</p>}
        {!busy && result?.status === "refused" && <BudgetRefusal result={result} />}
        {!busy && result?.status === "ok" && <BudgetResult result={result} />}
      </div>

      <footer className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        Prices and nutrition are AI estimates you can edit; actual prices vary by shop and season. Allergy checks look
        for common names and hidden sources, but always read food labels.
      </footer>
    </main>
  );
}
