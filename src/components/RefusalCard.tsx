import type { Assessment } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function RefusalCard({
  assessment,
  explanation,
  onUseSafeDate,
}: {
  assessment: Assessment;
  explanation: string | null;
  onUseSafeDate: (date: string) => void;
}) {
  return (
    <section className="rounded-xl border border-bad bg-bad-soft p-5 sm:p-6" role="alert">
      <h2 className="text-xl font-semibold text-bad">This target isn&apos;t safe, so no plan was made</h2>
      {explanation && <p className="mt-3 leading-relaxed">{explanation}</p>}
      <ul className="mt-4 space-y-2 text-sm">
        {assessment.refusals.map((r) => (
          <li key={r.code} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bad" />
            {r.message}
          </li>
        ))}
      </ul>
      {assessment.earliestSafeDate && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-bad/30 pt-4">
          <p className="text-sm">
            Earliest safe date for the same weight: <strong>{formatDate(assessment.earliestSafeDate)}</strong>
          </p>
          <button
            type="button"
            onClick={() => onUseSafeDate(assessment.earliestSafeDate!)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent"
          >
            Use this date
          </button>
        </div>
      )}
    </section>
  );
}
