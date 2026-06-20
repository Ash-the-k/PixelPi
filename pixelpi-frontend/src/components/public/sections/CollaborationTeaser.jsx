import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import { SectionHeading } from '../ui/SectionHeading';
import { AnimatedSection } from '../ui/AnimatedSection';

const TRACKS = [
  {
    id:          'industry',
    icon:        Factory,
    label:       'Industry Partnership',
    teaser:      'Co-develop products from prototype to production.',
    heading:     'Build Something Together',
    description:
      'We partner with companies building hardware products — from early prototyping to production-ready systems. Direct engineering engagement, no agency overhead.',
    process: [
      {
        step:  '01',
        title: 'Discovery Call',
        desc:  'Scope technical requirements, timeline, and partnership model.',
      },
      {
        step:  '02',
        title: 'Proposal & Terms',
        desc:  'Deliverables, milestones, and IP ownership defined before work begins.',
      },
      {
        step:  '03',
        title: 'Engineering Kickoff',
        desc:  'Team assigned, environment set up, first milestone within two weeks.',
      },
    ],
    cta:  'Propose a Partnership',
    href: '/contact?type=collaboration',
  },
  {
    id:          'academic',
    icon:        GraduationCap,
    label:       'Academic Collaboration',
    teaser:      'Research partnerships, internships, curriculum work.',
    heading:     'Research Without Bureaucracy',
    description:
      'We work with universities and research institutions on applied engineering challenges. Students work on real systems. Papers get published. Problems get solved.',
    process: [
      {
        step:  '01',
        title: 'Research Alignment',
        desc:  'Identify overlapping interests and define practical deliverables.',
      },
      {
        step:  '02',
        title: 'Collaboration Structure',
        desc:  'Format agreed: internships, joint research, or workshop series.',
      },
      {
        step:  '03',
        title: 'Active Engagement',
        desc:  'Regular working sessions — not advisory check-ins.',
      },
    ],
    cta:  'Propose a Collaboration',
    href: '/contact?type=collaboration',
  },
];

// ─── Track Selector Button ────────────────────────────────────────────────────

function TrackButton({ track, isActive, onClick }) {
  const Icon = track.icon;
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg p-5 transition-colors duration-fast card-interactive"
      style={{
        background: isActive ? 'var(--color-bg-base)' : 'transparent',
        border:     isActive
                      ? '1px solid var(--color-accent)'
                      : '1px solid var(--color-border)',
        cursor:  'pointer',
        outline: 'none',
      }}
      aria-pressed={isActive}
    >
      <div className="flex items-start gap-3">
        {/* Icon container */}
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-fast"
          style={{
            background: isActive
              ? 'var(--color-accent-subtle)'
              : 'rgba(240, 242, 248, 0.05)',
          }}
        >
          <Icon
            size={16}
            strokeWidth={1.75}
            style={{
              color: isActive
                ? 'var(--color-accent-hover)'
                : 'var(--color-text-muted)',
            }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-0.5">
          <span
            className="font-body font-medium text-body-sm transition-colors duration-fast"
            style={{
              color: isActive
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
            }}
          >
            {track.label}
          </span>
          <span
            className="font-body text-caption"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {track.teaser}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Track Content ────────────────────────────────────────────────────────────

function TrackContent({ track }) {
  return (
    <div className="flex flex-col gap-8 h-full">

      {/* Heading + description */}
      <div className="flex flex-col gap-3">
        <h3
          className="font-display font-semibold text-display-sm"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {track.heading}
        </h3>
        <p
          className="font-body text-body-md"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {track.description}
        </p>
      </div>

      {/* Process steps */}
      <div className="flex flex-col gap-4">
        <span
          className="font-mono text-mono-sm uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          How it works
        </span>

        <div className="flex flex-col gap-5">
          {track.process.map((step) => (
            <div key={step.step} className="flex gap-4">
              <span
                className="font-mono text-mono-sm flex-shrink-0 mt-0.5 w-6"
                style={{ color: 'var(--color-accent)' }}
              >
                {step.step}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className="font-body font-medium text-body-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {step.title}
                </span>
                <span
                  className="font-body text-body-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {step.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-2">
        <Button as={Link} to={track.href} variant="secondary" size="md">
          {track.cta}
        </Button>
      </div>

    </div>
  );
}

// ─── CollaborationTeaser ──────────────────────────────────────────────────────

export function CollaborationTeaser() {
  const [activeId, setActiveId] = useState(TRACKS[0].id);
  const activeTrack = TRACKS.find((t) => t.id === activeId);

  return (
    <section
      className="section-padding"
      style={{ background: 'var(--color-bg-subtle)' }}
    >
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">

          {/* Left — intro + track selector */}
          <AnimatedSection className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <SectionLabel>Collaborate</SectionLabel>
              <SectionHeading>Open to the Right Partnerships</SectionHeading>
              <p
                className="font-body text-body-md"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                We work with people who take engineering seriously.
                What kind of partnership are you looking for?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {TRACKS.map((track) => (
                <TrackButton
                  key={track.id}
                  track={track}
                  isActive={track.id === activeId}
                  onClick={() => setActiveId(track.id)}
                />
              ))}
            </div>
          </AnimatedSection>

          {/* Right — animated content panel */}
          <AnimatedSection delay={0.1}>
            <div
              className="rounded-lg p-8"
              style={{
                background: 'var(--color-bg-elevated)',
                border:     '1px solid var(--color-border)',
                minHeight:  '400px',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  style={{ height: '100%' }}
                >
                  <TrackContent track={activeTrack} />
                </motion.div>
              </AnimatePresence>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}