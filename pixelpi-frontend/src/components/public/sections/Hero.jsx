import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { GradientText } from '../ui/GradientText';
import { AnimatedSection } from '../ui/AnimatedSection';

// Stagger delays for sequential entrance
const DELAYS = {
  eyebrow:  0,
  headline: 0.07,
  subtext:  0.14,
  ctas:     0.21,
};

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        // Dual radial gradient blooms (violet left, indigo right) over base bg.
        // background-size 200% 200% gives gradient-drift animation room to move.
        background: `
          radial-gradient(ellipse at 30% 50%, rgba(51, 32, 85, 0.35) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 50%, rgba(60, 77, 147, 0.25) 0%, transparent 60%),
          var(--color-bg-base)
        `,
        backgroundSize: '200% 200%',
        animation: 'gradient-drift 18s ease infinite',
      }}
    >
      {/*
        min-height fills the visible viewport below the navbar.
        paddingTop/Bottom adds vertical breathing room so content
        doesn't crowd the edges on short viewports.
      */}
      <div
        className="content-container flex items-center"
        style={{
          minHeight:     '100vh',
          paddingTop:    '64px',
          paddingBottom: '64px',
        }}
      >
        {/*
          max-w-text constrains copy width for readability.
          text-center on mobile → text-left on md+.
          mx-auto on mobile centers the block → md:mx-0 left-aligns it.
        */}
        <div
          className="w-full text-center md:text-left"
        >

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
            <h1 className="hero-headline mb-6">
              Precision Engineering. &
              <br />
              <GradientText>Intelligent Systems.</GradientText>
            </h1>
          </AnimatedSection>

          {/* ── Subtext ── */}
          <AnimatedSection delay={DELAYS.subtext}>
            <p
              className="font-body text-body-lg mb-10 mx-auto md:mx-0"
              style={{
                color:    'var(--color-text-secondary)',
                maxWidth: 'var(--max-width-narrow)',
              }}
            >
              Engineering innovation for startups, industry and education.
            </p>
          </AnimatedSection>

          {/* ── CTAs ── */}
          <AnimatedSection delay={DELAYS.ctas}>
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <Button as={Link} to="/contact" variant="primary" size="md">
                Get in Touch
              </Button>
              <Button as={Link} to="/projects" variant="ghost" size="md">
                View Our Projects
              </Button>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}