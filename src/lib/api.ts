// Response shapes from the NestJS API (api/src/plan/plan.service.ts).

export type Sex = "female" | "male";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface PlanRequest {
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activity: Activity;
  targetDate: string;
  country: string;
  allergies: string;
  healthConditions: string[];
  confirmNoHealthConditions: boolean;
  week?: number;
}

export interface Assessment {
  feasible: boolean;
  refusals: { code: string; message: string }[];
  goal: "lose" | "gain" | "maintain";
  days: number;
  changeKg: number;
  weeklyChangeKg: number;
  maxSafeWeeklyChangeKg: number;
  currentBmi: number;
  targetBmi: number;
  bmr: number;
  maintenanceCalories: number;
  calorieFloor: number;
  weeks: { week: number; startWeightKg: number; dailyCalories: number }[];
  earliestSafeDate: string | null;
}

export interface Meal {
  slot: "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner" | "evening_snack";
  name: string;
  ingredients: { item: string; amount: string }[];
  preparation: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface PlannedDay {
  day: number;
  date: string;
  totalCalories: number;
  meals: Meal[];
}

export type PlanResponse =
  | { status: "refused"; assessment: Assessment; explanation: string | null }
  | {
      status: "ok";
      assessment: Assessment;
      allergies: string[];
      week: { number: number; startDate: string; dailyCalories: number; overview: string; days: PlannedDay[] };
    };

export interface Options {
  activities: Activity[];
  healthConditions: { id: string; label: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3021";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Cannot reach the meal-plan server. Is the API running?");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message.join(" ") : body.message;
    throw new Error(msg || `Request failed (${res.status}).`);
  }
  return body as T;
}

export const getOptions = () => call<Options>("/plan/options");

export const requestPlan = (req: PlanRequest) =>
  call<PlanResponse>("/plan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
