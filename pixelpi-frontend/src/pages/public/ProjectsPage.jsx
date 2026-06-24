import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGallery } from '../../hooks/useGallery';
import { AnimatedSection } from '../../components/public/ui/AnimatedSection';
import { StaggerGrid } from '../../components/public/ui/StaggerGrid';
import { SectionLabel } from '../../components/public/ui/SectionLabel';
import { Divider } from '../../components/public/ui/Divider';
import { Button } from '../../components/public/ui/Button';
import { ProjectCard } from '../../components/public/projects/ProjectCard';
import { ProjectCardSkeleton } from '../../components/public/projects/ProjectCardSkeleton';
import { ProjectModal } from '../../components/public/projects/ProjectModal';

export default function ProjectsPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const { data: items = [], isLoading, error } = useGallery();

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

          <Divider />

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          )}

          {error && !isLoading && (
            <p className="text-center py-20 font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
              Could not load projects. Please try again.
            </p>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="text-center py-24">
              <p className="font-display text-display-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
                No projects yet.
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                Check back soon.
              </p>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {items.map((item) => (
                <ProjectCard key={item.filename} item={item} onClick={setSelectedItem} />
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>

      {!isLoading && (
        <>
          <AnimatedSection>
            <div
              className="rounded-t-xl relative overflow-hidden"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0"
                style={{ height: '2px', background: 'var(--gradient-brand)' }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(79,107,204,0.02) 0%, transparent 65%)',
                }}
              />
              <div className="relative px-8 py-14 md:py-16 text-center">
                <p
                  className="font-mono text-mono-sm uppercase tracking-widest mb-5"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Start a Project
                </p>
                <h2
                  className="font-display text-display-md mb-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Have something in mind?
                </h2>
                <p
                  className="text-body-lg mb-8 mx-auto"
                  style={{ color: 'var(--color-text-secondary)', maxWidth: '460px' }}
                >
                  We take projects from concept to production-ready hardware and software.
                </p>
                <Button variant="primary" as={Link} to="/contact" size="md">
                  Get in Touch
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </>
      )}
    </>
  );
}