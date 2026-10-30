# Meal Planner Web

Next.js front end for the Safe Meal Planner. It has two pages:

- **`/`, weight-goal planner:** enter your weight, goal, date, body details, country and allergies. You get either a week-by-week meal plan of local dishes or a clear refusal explaining why the goal isn't safe.
- **`/budget`, budget planner:** enter your country, city and household. You review the AI's estimated grocery prices in an editable table, then get a week of meals and a shopping list that fits your food budget.

All planning, safety checks and AI calls happen in the [API](https://github.com/shinji-meal-planner/api). This app is only the interface, so **the API must be running for it to work**.

## What to install

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20.9 or newer (22 LTS recommended) | npm comes with it |
| Git | any recent version | to clone the repo |
| The [meal planner API](https://github.com/shinji-meal-planner/api) | — | running locally or deployed; see its README |

Built with Next.js 16, React 19, Tailwind CSS 4 and TypeScript.

## Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

| Variable | Required | Default | What it does |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:3021` | Base URL of the meal planner API. |

`NEXT_PUBLIC_` variables are built into the browser code. If you change the value, restart `npm run dev`, or rebuild for production. The value is public, so never put a secret in it.

The API only accepts requests from the origins in its `WEB_ORIGIN` setting (default `http://localhost:3020`). If you run this app on another address, add that address to `WEB_ORIGIN` on the API, or the browser will block the requests (CORS).

## Run it locally

1. Start the API first, on port 3021 (see the [API README](https://github.com/shinji-meal-planner/api#run-it-locally)).
2. Then, in another terminal:

```bash
git clone git@github.com:shinji-meal-planner/web.git
cd web
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3020>. The budget planner is at <http://localhost:3020/budget>.

### Production build

```bash
npm run build
npm start            # serves the build on port 3020
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3020 with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3020 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check without emitting files |

## Project layout

```
src/
├── app/            pages: / (weight goal) and /budget
├── components/     forms and results; budget/ holds the budget planner's parts
└── lib/            API clients and response types (api.ts, budget-api.ts), formatting
```

The response types in `src/lib/api.ts` and `src/lib/budget-api.ts` are hand-copied from the API's services. Change them together with the API.

## Disclaimer

Not medical advice. Calories, macros and prices are estimates.
