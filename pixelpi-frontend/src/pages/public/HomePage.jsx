import { GradientText } from '../../components/public/ui/GradientText';
import { SectionLabel } from '../../components/public/ui/SectionLabel';
import { SectionHeading } from '../../components/public/ui/SectionHeading';
import { Button } from '../../components/public/ui/Button';
import { GlassCard } from '../../components/public/ui/GlassCard';
import { Badge } from '../../components/public/ui/Badge';
import { StatCard } from '../../components/public/ui/StatCard';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '../../components/public/ui/AnimatedSection';

export default function HomePage() {
  return (
    <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <SectionLabel>What We Do</SectionLabel>
      <SectionHeading>
        Precision Engineering. <GradientText>Intelligent Systems.</GradientText>
      </SectionHeading>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button variant="primary">Get in Touch</Button>
        <Button variant="secondary">View Projects</Button>
        <Button variant="ghost" as={Link} to="/projects">View Our Projects</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="accent">Reviewing</Badge>
      </div>
      <GlassCard style={{ maxWidth: '400px' }}>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          This is a glass card surface. Content goes here.
        </p>
      </GlassCard>
      <div style={{ display: 'flex', gap: '3rem' }}>
        <StatCard value="10+" label="Projects Completed" />
        <StatCard value="30+" label="Happy Clients" />
        <StatCard value="2" label="Collaborations" />
      </div>
    </div>
  );
}