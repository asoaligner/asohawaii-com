/**
 * Footer-adjacent disclaimer summarising lead-time policy.
 *
 * Rendered on every product detail page (and other product surfaces) so a
 * doctor reading a Hero "Approx. X weeks" badge can find the holiday /
 * rush-case context without leaving the page. The Submit Case form's
 * calendar is the source of truth for an exact earliest delivery date —
 * this notice points there.
 */
export default function LeadTimeDisclaimer() {
  return (
    <section className="py-10 md:py-12 bg-stone-50/60 border-t border-gray-200/60">
      <div className="container-narrow">
        <ul className="max-w-3xl mx-auto space-y-2 text-[12.5px] text-gray-600 leading-relaxed">
          <li className="flex gap-2">
            <span aria-hidden className="shrink-0 text-gray-400">
              ※
            </span>
            <span>
              &ldquo;Approx.&rdquo; indicates an approximate timeframe.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="shrink-0 text-gray-400">
              ※
            </span>
            <span>
              Lead times may vary based on US Federal holidays and ASO Hawaii
              holidays (Dec 30&nbsp;–&nbsp;Jan&nbsp;3).
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="shrink-0 text-gray-400">
              ※
            </span>
            <span>
              For exact delivery dates, please refer to the Submit Case
              Form&apos;s calendar.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="shrink-0 text-gray-400">
              ※
            </span>
            <span>
              Need it sooner? Contact us for Rush Case handling: 📞{" "}
              <a
                href="tel:8089570111"
                className="text-navy underline underline-offset-2 hover:no-underline"
              >
                808-957-0111
              </a>{" "}
              / 📧{" "}
              <a
                href="mailto:aso-digital@outlook.com"
                className="text-navy underline underline-offset-2 hover:no-underline"
              >
                aso-digital@outlook.com
              </a>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
