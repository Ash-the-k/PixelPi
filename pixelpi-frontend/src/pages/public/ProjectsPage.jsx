import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGallery } from '../../hooks/useGallery';
import { AnimatedSection } from '../../components/public/ui/AnimatedSection';
import { SectionLabel } from '../../components/public/ui/SectionLabel';
import { Button } from '../../components/public/ui/Button';
import { ProjectCard } from '../../components/public/projects/ProjectCard';
import { ProjectCardSkeleton } from '../../components/public/projects/ProjectCardSkeleton';
import { ProjectModal } from '../../components/public/projects/ProjectModal';
import { Divider } from '../../components/public/ui/Divider';

// Domain filter — shown only when gallery items have a `category` field.
// Add categories via admin gallery metadata to activate filtering.
const DOMAINS = ['All', 'IoT', 'Space', 'PCB', 'Drones', 'Web', 'AI'];

export default function ProjectsPage() {
  const [activeDomain, setActiveDomain] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: items = [], isLoading, error } = useGallery();

  const hasCategories = items.some((item) => item.category);

  const filtered =
    activeDomain === 'All' || !hasCategories
      ? items
      : items.filter((item) => item.category === activeDomain);

  return (
    <>
      <Helmet>
        <title>Projects | Pixel Pi Technologies</title>
        <meta
          name="description"
          content="Engineering work across IoT, embedded systems, space technology, PCB design, and autonomous systems."
        />
      </Helmet>

      <ProjectModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <section className="section-padding" style={{ paddingTop: '136px' }}>
        <div className="content-container">

          {/* Heading */}
          <AnimatedSection>
            <SectionLabel>OUR WORK</SectionLabel>
            <h1
              className="font-display text-display-lg mt-3 mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Projects
            </h1>
            <p
              className="text-body-lg"
              style={{ color: 'var(--color-text-secondary)', maxWidth: 'var(--max-width-text)' }}
            >
              A selection of engineering projects across our core domains.
            </p>
          </AnimatedSection>

          {/* Domain filter — only rendered when items have category */}
          {hasCategories && (
            <div className="flex flex-wrap gap-2 mt-10">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDomain(d)}
                  className="px-4 py-1.5 rounded-full font-mono text-mono-sm transition-all duration-[175ms]"
                  style={
                    activeDomain === d
                      ? {
                          background: 'var(--color-accent-subtle)',
                          color: 'var(--color-accent-hover)',
                          border: '1px solid var(--color-accent)',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)',
                        }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <Divider />

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="text-center py-20 font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
              Could not load projects. Please try again.
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="font-display text-display-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
                No projects yet.
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                Check back soon.
              </p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && filtered.length > 0 && (
            <AnimatedSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {filtered.map((item) => (
                  <ProjectCard key={item.filename} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            </AnimatedSection>
          )}

          <Divider />

          {/* Bottom CTA */}
          {!isLoading && (
            <div
              className="text-center mt-20"
            >
              <p className="font-display text-display-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Have a project in mind?
              </p>
              <p className="text-body-md mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                We take projects from concept to production-ready hardware and software.
              </p>
              <Button variant="primary" as={Link} to="/contact">
                Start a Project
              </Button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}