"use client";

import { CATEGORY_LABEL, UNIT_LABEL, type PriceCategory, type PriceItem } from "@/lib/budget-api";

const ORDER: PriceCategory[] = ["staple", "protein", "vegetable", "fruit", "dairy", "pantry"];

export function PriceTable({
  items,
  currency,
  disabled,
  onChange,
}: {
  items: PriceItem[];
  currency: string;
  disabled: boolean;
  onChange: (items: PriceItem[]) => void;
}) {
  const setPrice = (id: string, price: number) =>
    onChange(items.map((i) => (i.id === id ? { ...i, price } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-5">
      {ORDER.map((cat) => {
        const rows = items.filter((i) => i.category === cat);
        if (!rows.length) return null;
        return (
          <section key={cat}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{CATEGORY_LABEL[cat]}</h3>
            <ul className="divide-y divide-line rounded-lg border border-line">
              {rows.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="min-w-0 flex-1 text-sm">{item.name}</span>
                  <label className="flex shrink-0 items-center gap-1 text-sm text-muted">
                    <span className="sr-only">Price of {item.name} in {currency}</span>
                    <input
                      type="number"
                      min={0.01}
                      step="any"
                      disabled={disabled}
                      value={Number.isNaN(item.price) ? "" : item.price}
                      onChange={(e) => setPrice(item.id, e.target.valueAsNumber)}
                      className="w-24 rounded-md border border-line bg-surface px-2 py-1 text-right text-foreground tabular-nums focus:border-accent focus:outline-none"
                    />
                    /{UNIT_LABEL[item.unit]}
                  </label>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => remove(item.id)}
                    className="shrink-0 rounded-md px-2 py-1 text-sm text-muted hover:text-bad disabled:opacity-40"
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
