import { InternalPrototypeNav } from "@/components/internal-prototype-nav";
import styles from "@/components/ai-concierge-presentation.module.css";
import { PREFILLED_CONTACT_DETAILS } from "@/lib/ai-concierge-fixtures";

const PRINCIPLES = [
  {
    title: "Qualify without feeling like a form",
    copy:
      "Gather BANT-like signals in the background without making the conversation feel like intake.",
  },
];

const PERSONA_POINTS = [
  `Director of Talent Acquisition at ${PREFILLED_CONTACT_DETAILS.company}`,
  "leading hiring across a 1,200-person healthcare software company",
  "needs help figuring out which hiring solution fits a team hiring across multiple functions, including harder-to-fill roles",
  "high intent, but not fully decided",
  "skeptical of anything that feels like a disguised lead form",
];

const SECTION_LINKS = [
  { href: "#overview", label: "1" },
  { href: "#principles", label: "2" },
  { href: "#persona", label: "3" },
  { href: "#jtbd", label: "4" },
];

export function AiConciergePresentation() {
  return (
    <>
      <InternalPrototypeNav />
      <div className={styles.page}>
        <main className={styles.main}>
          <section id="overview" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>1 / overview</p>
              <h1 className={styles.title}>AI Concierge</h1>
              <p className={styles.lede}>
                a guided experience that feels consultative to the user while we
                qualify behind the scenes and route them to the appropriate next
                step (AE, SDR, direct purchase)
              </p>
            </div>
          </section>

          <section id="principles" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>2 / design principle</p>
              <h2 className={styles.sectionTitle}>Design principle</h2>
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

          <section id="persona" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>3 / persona</p>
              <h2 className={styles.sectionTitle}>
                {`${PREFILLED_CONTACT_DETAILS.firstName} ${PREFILLED_CONTACT_DETAILS.lastName}`}
              </h2>
              <div className={styles.persona}>
                {PERSONA_POINTS.map((point) => (
                  <p key={point} className={styles.personaBody}>
                    {point}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <section id="jtbd" className={styles.section}>
            <div className={styles.slide}>
              <p className={styles.eyebrow}>4 / job to be done</p>
              <h2 className={styles.sectionTitle}>JTBD</h2>
              <div className={styles.jtbd}>
                <p className={styles.jtbdText}>
                  As a hiring leader, I&apos;m struggling with hard to fill
                  roles and want to understand what LinkedIn solutions are
                  right for my team.
                </p>
              </div>
              <p className={styles.note}>then walk through the happy path</p>
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
