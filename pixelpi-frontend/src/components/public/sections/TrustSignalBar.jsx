import { AnimatedSection } from '../ui/AnimatedSection';
import { StatCard } from '../ui/StatCard';

const METRICS = [
  { value: '10+', label: 'Projects Completed' },
  { value: '30+', label: 'Happy Clients'       },
  { value: '2',   label: 'Collaborations'       },
  { value: '2',   label: 'Research Papers'      },
];

export function TrustSignalBar() {
  return (
    <div
      style={{
        borderTop:    '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background:   'var(--color-bg-base)',
      }}
    >
      <div className="content-container py-10">

        {/*
          Mobile: 2×2 grid, no dividers.
          Desktop: single row, vertical dividers between items via border-left.
          Two separate layouts avoids divider-on-row-wrap ambiguity.
        */}

        {/* Mobile layout */}
        <div className="grid grid-cols-2 gap-8 md:hidden px-4">
          {METRICS.map((metric, i) => (
            <AnimatedSection key={metric.label}>
              <div className="flex">
                <StatCard value={metric.value} label={metric.label} />
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-stretch">
          {METRICS.map((metric, i) => (
            <AnimatedSection
              key={metric.label}
              delay={i * 0.07}
              className="flex-1"
            >
              <div
                className="flex justify-start h-full"
                style={{
                  paddingLeft: i > 0 ? '3rem' : '0',
                  borderLeft:  i > 0 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <StatCard value={metric.value} label={metric.label} />
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </div>
  );
}