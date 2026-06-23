import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionLabel } from '../ui/SectionLabel';

const METRICS = [
  { value: '10+', label: 'Projects Completed',  description: 'Delivered across IoT, space, and embedded domains.' },
  { value: '10+', label: 'Happy Clients',        description: 'From startups to research institutions.' },
  { value: '2',   label: 'Collaborations',       description: 'Industry and academic partnerships active.' },
  { value: '2',   label: 'Research Papers',      description: 'Published across engineering disciplines.' },
];

export function ProjectMetrics() {
  return (
    <section className="section-padding" style={{ background: 'var(--color-bg-base)' }}>
      <div className="content-container">

        <AnimatedSection className="mb-14">
          <SectionLabel>By the Numbers</SectionLabel>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
        >
          {METRICS.map((metric, i) => (
            <AnimatedSection key={metric.label} delay={i * 0.08}>
              <div
                className="flex flex-col gap-2 p-8"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <span
                  className="font-mono text-display-md font-medium"
                  style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
                >
                  {metric.value}
                </span>
                <span
                  className="font-body font-medium text-body-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {metric.label}
                </span>
                <span
                  className="font-body text-body-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {metric.description}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}