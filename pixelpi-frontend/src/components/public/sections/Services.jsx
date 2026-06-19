import { Cpu, Satellite, CircuitBoard, Drone, Cloud, BrainCircuit } from 'lucide-react';
import { SectionLabel } from '../ui/SectionLabel';
import { SectionHeading } from '../ui/SectionHeading';
import { AnimatedSection } from '../ui/AnimatedSection';

const HEADING = 'From System to Silicon';

const SERVICES = [
  {
    number: '01',
    icon: Cpu,
    id: 'services-iot',
    title: 'IoT & Embedded Systems',
    description:
      'ESP32, Arduino, STM32, Raspberry Pi, ARM, and PIC development for connected devices that operate reliably in the field.',
  },
  {
    number: '02',
    icon: Satellite,
    id: 'services-space',
    title: 'Space & Satellite',
    description:
      'Mini satellites, CubeSats, ground stations, and communication systems engineered for the demands of space.',
  },
  {
    number: '03',
    icon: CircuitBoard,
    id: 'services-pcb',
    title: 'PCB Design',
    description:
      'Multi-layer, high-speed, and RF PCB design with full DFM/DRC validation and manufacturing support from schematic to fabrication.',
  },
  {
    number: '04',
    icon: Drone,
    id: 'services-drones',
    title: 'Drones & Autonomous Systems',
    description:
      'Intelligent UAVs and robotics with autonomous navigation and AI capabilities built for real-world deployment.',
  },
  {
    number: '05',
    icon: Cloud,
    id: 'services-web',
    title: 'Web & Cloud',
    description:
      'IoT dashboards, cloud infrastructure, and secure system integrations that connect hardware to the internet.',
  },
  {
    number: '06',
    icon: BrainCircuit,
    id: 'services-ai',
    title: 'AI & Automation',
    description:
      'Intelligent automation for industry and startups — from edge inference to process optimisation at scale.',
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="section-padding"
      style={{ background: 'var(--color-bg-subtle)' }}
    >
      <div className="content-container">

        <AnimatedSection className="mb-14">
          <div className="flex flex-col gap-4" style={{ maxWidth: 'var(--max-width-text)' }}>
            <SectionLabel>What We Do</SectionLabel>
            <SectionHeading>{HEADING}</SectionHeading>
            <p
              className="font-body text-body-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Bridging innovation and execution with engineering built for real-world impact.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <AnimatedSection key={service.id} delay={i * 0.07}>
                <div
                  id={service.id}
                  className="flex flex-col gap-6 p-7 rounded-lg h-full"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border:     '1px solid var(--color-border)',
                  }}
                >
                  {/* Number + Icon row — number indexes the card, icon identifies it */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono"
                      style={{
                        fontSize:      '11px',
                        letterSpacing: '0.14em',
                        color:         'var(--color-text-disabled)',
                        lineHeight:    1,
                      }}
                    >
                      {service.number}
                    </span>
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      style={{ color: 'var(--color-accent)', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 flex-1">
                    <h3
                      className="font-display font-semibold text-display-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="font-body text-body-sm"
                      style={{ color: 'var(--color-text-secondary)', lineHeight: '1.65' }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

      </div>
    </section>
  );
}