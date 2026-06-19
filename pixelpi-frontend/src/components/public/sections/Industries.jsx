import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionLabel } from '../ui/SectionLabel';

const INDUSTRIES = [
  { label: 'Education & Research',         descriptor: 'Academic partnerships, student programs' },
  { label: 'IoT & Automation',             descriptor: 'Smart devices, industrial systems'        },
  { label: 'Aerospace & Space Technology', descriptor: 'Satellites, UAVs, launch systems'         },
  { label: 'Defense',                      descriptor: 'Mission-critical embedded systems'         },
  { label: 'Consumer Electronics',         descriptor: 'Product development, prototyping'          },
];

export function Industries() {
  return (
    <section
      className="section-padding"
      style={{ background: 'var(--color-bg-subtle)' }}
    >
      <div className="content-container">

        <AnimatedSection className="mb-14">
          <SectionLabel>Industries Served</SectionLabel>
        </AnimatedSection>

        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {INDUSTRIES.map((industry, i) => (
            <AnimatedSection key={industry.label} delay={i * 0.06}>
              <div
                className="industry-row flex items-baseline justify-between py-7"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <h3
                  className="industry-name font-display font-semibold text-display-sm"
                >
                  {industry.label}
                </h3>
                <span
                  className="font-mono text-mono-sm hidden sm:block flex-shrink-0 ml-8"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {industry.descriptor}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}