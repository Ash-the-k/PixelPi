import { Lightbulb, TrendingUp, Users, Briefcase, Award, Palette } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { SectionLabel } from '../ui/SectionLabel';
import { SectionHeading } from '../ui/SectionHeading';
import { AnimatedSection } from '../ui/AnimatedSection';

const REASONS = [
  {
    icon: Lightbulb,
    title: 'Innovative Projects',
    description: 'Work on real deep-tech problems across IoT, space, and autonomous systems.',
  },
  {
    icon: TrendingUp,
    title: 'Learning & Growth',
    description: 'Hands-on mentorship, code reviews, and exposure to production engineering.',
  },
  {
    icon: Users,
    title: 'Collaborative Culture',
    description: 'A small, focused team where every contribution has direct impact.',
  },
  {
    icon: Briefcase,
    title: 'Career Opportunities',
    description: 'Internships that convert — talent is identified and retained.',
  },
  {
    icon: Award,
    title: 'Recognition',
    description: 'Good work is visible, credited, and rewarded in a startup environment.',
  },
  {
    icon: Palette,
    title: 'Creative Freedom',
    description: 'Bring your own approach to solving engineering challenges.',
  },
];

export function WhyUs() {
  return (
    <section
      className="section-padding"
      style={{ background: 'var(--color-bg-subtle)' }}
    >
      <div className="content-container">

        <AnimatedSection>
          <div className="flex flex-col gap-4 mb-14 max-w-text">
            <SectionLabel>Why Us</SectionLabel>
            <SectionHeading>Built Different, on Purpose</SectionHeading>
            <p className="font-body text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
              A startup environment with production-grade engineering standards.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REASONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={i * 0.07}>
                <div
                  className="flex flex-col gap-3 p-6 rounded-lg h-full"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-accent-subtle)' }}
                  >
                    <Icon
                      size={18}
                      style={{ color: 'var(--color-accent-hover)' }}
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3
                    className="font-display font-semibold text-body-md"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="font-body text-body-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

      </div>
    </section>
  );
}