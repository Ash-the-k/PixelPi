import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { GradientText } from '../ui/GradientText';
import { AnimatedSection } from '../ui/AnimatedSection';
import { COMPANY_METRICS } from '../../../data/metrics.js';


const DELAYS = {
  eyebrow: 0,
  headline: 0.07,
  subtext: 0.14,
  ctas: 0.21,
  metrics: 0.28,
};

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center hero-bg overflow-hidden"
      style={{ paddingTop: '120px', paddingBottom: '80px', maxHeight: "100vh" }}
    >
      <div className="content-container flex flex-col items-center text-center  justify-center pt-[84px] lg:pt-[92px] pb-16">

        {/* ── Eyebrow ── */}
        <AnimatedSection delay={DELAYS.eyebrow}>
          <p
            className="font-mono text-mono-sm uppercase tracking-widest mb-6"
            style={{ color: 'var(--color-text-muted)', opacity: 0.75 }}
          >
            From Prototype to Production · Hardware Through Software
          </p>
        </AnimatedSection>

        {/* ── Headline ── */}
        <AnimatedSection delay={DELAYS.headline}>
          <h1
            className="hero-headline mb-6"
            style={{ maxWidth: '900px', lineHeight: 1.05 }}
          >
            Precision Engineering.{' '}
            <br />
            <GradientText>Intelligent Systems.</GradientText>
          </h1>
        </AnimatedSection>

        {/* ── Subtext ── */}
        <AnimatedSection delay={DELAYS.subtext}>
          <p
            className="font-body text-body-lg mb-10"
            style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '520px',
            }}
          >
            Engineering for startups, industry, research, and education.
          </p>
        </AnimatedSection>

        {/* ── CTAs ── */}
        <AnimatedSection delay={DELAYS.ctas}>
          <div
            className="flex flex-wrap items-center gap-4 justify-center"
            style={{ marginBottom: 'clamp(2rem, 5vh, 5rem)' }}
          >
            <Button as={Link} to="/contact" variant="primary" size="md">
              Get in Touch
            </Button>
            <Button as={Link} to="/projects" variant="ghost" size="md">
              View Our Projects
            </Button>
          </div>
        </AnimatedSection>

        {/* ── Metrics strip ── */}
        <AnimatedSection delay={DELAYS.metrics}>
          <div
            className="w-full hidden md:grid grid-cols-4 gap-px"
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '32px',
              maxWidth: '760px',
            }}
          >
            {COMPANY_METRICS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 px-4">
                <span
                  className="font-mono text-display-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {value}
                </span>
                <span
                  className="font-body text-label"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}