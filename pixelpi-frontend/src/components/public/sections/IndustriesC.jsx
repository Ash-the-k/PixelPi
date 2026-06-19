import { AnimatedSection } from '../ui/AnimatedSection';
import { SectionLabel } from '../ui/SectionLabel';

const INDUSTRIES = [
  { label: 'Education & Research',         descriptor: 'Academic partnerships and student programs'  },
  { label: 'IoT & Automation',             descriptor: 'Smart devices and industrial control systems' },
  { label: 'Aerospace & Space Technology', descriptor: 'Satellites, UAVs, and launch systems'         },
  { label: 'Defense',                      descriptor: 'Mission-critical embedded electronics'         },
  { label: 'Consumer Electronics',         descriptor: 'Product development and rapid prototyping'     },
];

export function IndustriesC() {
  return (
    <section
      className="section-padding"
      style={{ background: 'var(--color-bg-subtle)' }}
    >
      <div className="content-container">

        <AnimatedSection className="mb-14">
          <SectionLabel>Industries Served</SectionLabel>
        </AnimatedSection>

        {/* Table header */}
        <div
          className="hidden sm:grid mb-2 px-4"
          style={{
            gridTemplateColumns: '3rem 1fr 1fr',
            gap: '2rem',
          }}
        >
          {['#', 'Industry', 'Focus Areas'].map((col) => (
            <span
              key={col}
              className="font-mono text-mono-sm uppercase tracking-widest"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {INDUSTRIES.map((industry, i) => (
            <AnimatedSection key={industry.label} delay={i * 0.06}>
              <div
                className="industry-table-row grid px-4 py-5 rounded-md"
                style={{
                  gridTemplateColumns: '3rem 1fr',
                  gap: '2rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {/* Mobile layout: number + content stacked */}
                <span
                  className="font-mono text-mono-sm self-center"
                  style={{ color: 'var(--color-text-disabled)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: '2rem' }}
                >
                  <span
                    className="font-body font-medium text-body-md self-center"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {industry.label}
                  </span>
                  <span
                    className="font-mono text-mono-sm self-center hidden sm:block"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {industry.descriptor}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}