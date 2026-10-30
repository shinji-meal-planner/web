export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  return new Intl.DateTimeFormat("en", { ...opts, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  morning_snack: "Morning snack",
  lunch: "Lunch",
  afternoon_snack: "Afternoon snack",
  dinner: "Dinner",
  evening_snack: "Evening snack",
};

export const slotLabel = (slot: string) => SLOT_LABELS[slot] ?? slot;
