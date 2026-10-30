// Response shapes from the NestJS budget module (api/src/budget/budget.service.ts).

export type PriceCategory = "staple" | "protein" | "vegetable" | "fruit" | "dairy" | "pantry";
export type PriceUnit = "kg" | "liter" | "piece" | "pack";

export interface PriceItem {
  id: string;
  name: string;
  category: PriceCategory;
  unit: PriceUnit;
  price: number;
  kcalPerUnit: number;
  proteinGPerUnit: number;
}

export interface PriceList {
  country: string;
  city: string;
  currency: string;
  estimatedAt: string;
  source: "ai-estimate";
  items: PriceItem[];
}

export interface BudgetRequest {
  country: string;
  city: string;
  currency: string;
  prices: PriceItem[];
  weeklyBudget: number;
  adults: number;
  children: number;
  mealsPerDay: number;
  allergies: string;
}

export interface CostedLine {
  itemId: string;
  name: string;
  category: PriceCategory;
  unit: PriceUnit;
  quantity: number;
  unitPrice: number;
  cost: number;
}

export interface BudgetMeal {
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  name: string;
  ingredients: { itemId: string; amount: string }[];
  ingredientNames: string[];
  preparation: string;
}

export type BudgetResponse =
  | { status: "refused"; currency: string; weeklyBudget: number; minimumBudget: number | null; reason: string }
  | {
      status: "ok";
      currency: string;
      weeklyBudget: number;
      minimumBudget: number;
      totalCost: number;
      perPersonPerDay: number;
      needs: { kcal: number; proteinG: number; vegetableKg: number };
      supplied: { kcal: number; proteinG: number };
      excludedForAllergies: string[];
      shoppingList: CostedLine[];
      overview: string;
      tips: string[];
      days: { day: number; meals: BudgetMeal[] }[];
    };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3021";

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the meal-plan server. Is the API running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message.join(" ") : data.message;
    throw new Error(msg || `Request failed (${res.status}).`);
  }
  return data as T;
}

export const getPrices = (country: string, city: string) => post<PriceList>("/budget/prices", { country, city });
export const requestBudgetPlan = (req: BudgetRequest) => post<BudgetResponse>("/budget/plan", req);

export function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export const UNIT_LABEL: Record<PriceUnit, string> = { kg: "kg", liter: "L", piece: "pc", pack: "pack" };

export const CATEGORY_LABEL: Record<PriceCategory, string> = {
  staple: "Staples",
  protein: "Protein",
  vegetable: "Vegetables",
  fruit: "Fruit",
  dairy: "Dairy",
  pantry: "Pantry",
};
