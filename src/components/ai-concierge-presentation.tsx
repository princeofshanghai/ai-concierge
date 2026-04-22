import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import styles from "@/components/ai-concierge-presentation.module.css";
import { PREFILLED_CONTACT_DETAILS } from "@/lib/ai-concierge-fixtures";

const TODAY_POINTS = [
  "55% of visitors abandon the form before submitting",
  "10× less likely to convert when response takes longer than 5 minutes",
  "Sales time wasted on low-intent while high-intent cools off",
  "AI-led guidance is now table stakes; a static form signals lag",
];

const PERSONA_POINTS = [
  `~1,500-person digital health company that just closed a funding round`,
  "hiring ~40 roles in two quarters; team is already behind",
  "not a LinkedIn Recruiter customer yet; uses Jobs, referrals, and an ATS",
  "senior enough to recommend a direction, not the sole approver",
  "not trying to avoid sales, but not ready to sit through a discovery call before knowing if the product fits",
];

const PRINCIPLES = [
  {
    title: "Heard, not qualified",
    copy:
      "Behind the scenes, the concierge qualifies. On the surface, it helps. Visitors answer because it sharpens the next answer, not because we asked them to submit.",
  },
  {
    title: "Help first, then commit",
    copy:
      "The concierge leads with help and asks one gentle question at a time. When the fit is clear, it commits to a specific next step instead of asking permission. Visitors see a recommendation, never a menu in place of one.",
  },
  {
    title: "Every route is a good route",
    copy:
      "Sales meeting, direct purchase, or helpful redirect. Every visitor leaves with a clear next step, not a dead end.",
  },
];

const OUTCOMES = [
  "Better MQL quality, not just more leads",
  "Faster path from interest to qualified handoff",
  "Context preserved across handoff, so reps do not start from scratch",
  "Respect for users who are not a fit, so they still get a useful next step",
];

const SECTION_LINKS = [
  { href: "#problem", label: "1" },
  { href: "#today", label: "2" },
  { href: "#solution", label: "3" },
  { href: "#persona", label: "4" },
  { href: "#jtbd", label: "5" },
  { href: "#principles", label: "6" },
  { href: "#outcomes", label: "7" },
];

export function AiConciergePresentation() {
  return (
    <>
      <InternalPrototypeNav />
      <div className={styles.page}>
        <main className={styles.main}>
          <section id="problem" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>1 / problem</p>
              <p className={styles.problemOpener}>
                $1.3B in annual bookings. LTS is 69% of web conversions from
                the Lobby.
              </p>
              <h2 className={styles.problemHeading}>
                Yet LinkedIn meets its highest-intent{" "}
                <span className={styles.mono}>/hire</span> visitors with a
                static form.
              </h2>
            </div>
          </section>

          <section id="today" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>
                2 / today on <span className={styles.mono}>/hire</span>
              </p>
              <div className={styles.todayLayout}>
                <ul className={styles.problemPoints}>
                  {TODAY_POINTS.map((point) => (
                    <li key={point} className={styles.problemPoint}>
                      {point}
                    </li>
                  ))}
                </ul>
                <div
                  className={styles.screenshotPlaceholder}
                  aria-label="Screenshot of the current /hire Contact Sales form"
                >
                  <span className={styles.screenshotLabel}>
                    Contact Sales form screenshot
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section id="solution" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>3 / solution</p>
              <h1 className={styles.title}>AI Concierge</h1>
              <p className={styles.lede}>
                Replace the Contact Sales form with a product consultant that
                earns the right to qualify and routes every visitor to the right
                outcome, from a booked AE meeting to a self-serve purchase.
              </p>
            </div>
          </section>

          <section id="persona" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>4 / persona</p>
              <h2 className={styles.sectionTitle}>
                {`${PREFILLED_CONTACT_DETAILS.firstName} ${PREFILLED_CONTACT_DETAILS.lastName}`}
              </h2>
              <p className={styles.personaRole}>
                {`Director of Talent Acquisition at ${PREFILLED_CONTACT_DETAILS.company}`}
              </p>
              <ul className={styles.persona}>
                {PERSONA_POINTS.map((point) => (
                  <li key={point} className={styles.personaBody}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="jtbd" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>5 / job to be done</p>
              <h2 className={styles.sectionTitle}>JTBD</h2>
              <div className={styles.jtbd}>
                <p className={styles.jtbdText}>
                  As a talent leader under pressure to hire faster, I want to
                  quickly understand which LinkedIn hiring solution fits my
                  team&apos;s situation, so I can take the right next step with
                  confidence, whether that means exploring on my own or talking
                  to a rep who already knows my context.
                </p>
              </div>
              <p className={styles.note}>then walk through flow 1 and flow 2</p>
            </div>
          </section>

          <section id="principles" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>6 / design principles</p>
              <h2 className={styles.sectionTitle}>Design principles</h2>
              <div className={styles.principles}>
                {PRINCIPLES.map((principle) => (
                  <div key={principle.title} className={styles.principle}>
                    <p className={styles.principleTitle}>{principle.title}</p>
                    <p className={styles.principleCopy}>{principle.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="outcomes" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>7 / what this should move</p>
              <h2 className={styles.sectionTitle}>What this should move</h2>
              <ul className={styles.outcomes}>
                {OUTCOMES.map((outcome) => (
                  <li key={outcome} className={styles.outcomeItem}>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        <div className={styles.sectionNav}>
          {SECTION_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.sectionNavLink}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
