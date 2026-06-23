import { Link } from 'react-router-dom';
import { SocialIconLinks, IconWhatsApp } from '../ui/SocialIcons';
import { LogoMark } from '../ui/LogoMark';

// ─── Data ────────────────────────────────────────────────────────────────────

const COMPANY_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact', to: '/contact' },
];

// Anchor links point to the homepage services section.
// When /services becomes a standalone page, update these hrefs to /services#iot etc.
const SERVICE_LINKS = [
  { label: 'IoT & Embedded Systems', href: '/#services-iot' },
  { label: 'Space & Satellite', href: '/#services-space' },
  { label: 'PCB Design', href: '/#services-pcb' },
  { label: 'Drones & Autonomous', href: '/#services-drones' },
  { label: 'Web & Cloud', href: '/#services-web' },
  { label: 'AI & Automation', href: '/#services-ai' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterColumnHeading({ children }) {
  return (
    <p
      className="font-mono text-mono-sm uppercase tracking-widest"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </p>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>

      {/* ── Main grid ── */}
      <div className="content-container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* ── Column 1 — Brand ── */}
          <div className="flex flex-col gap-6">

            {/* Logo mark + wordmark — links to homepage */}
            {/* Mobile */}
            <div className="block lg:hidden">
              <LogoMark size="ph" />
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <LogoMark size="nav" />
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-0.5">
              <p
                className="font-display font-semibold text-body-md leading-snug"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Precision Engineering.
              </p>
              <p className="font-display font-semibold text-body-md leading-snug gradient-text">
                Intelligent Systems.
              </p>
            </div>

            {/* Social icons */}
            <SocialIconLinks />

          </div>

          {/* ── Column 2 — Company ── */}
          <div className="flex flex-col gap-5">
            <FooterColumnHeading>Company</FooterColumnHeading>
            <nav aria-label="Company navigation">
              <ul className="flex flex-col gap-3 list-none m-0 p-0">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="footer-link font-body text-body-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Column 3 — Services ── */}
          <div className="flex flex-col gap-5">
            <FooterColumnHeading>Services</FooterColumnHeading>
            <nav aria-label="Services navigation">
              <ul className="flex flex-col gap-3 list-none m-0 p-0">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="footer-link font-body text-body-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Column 4 — Get In Touch ── */}
          <div className="flex flex-col gap-5">
            <FooterColumnHeading>Get In Touch</FooterColumnHeading>
            <div className="flex flex-col gap-3">

              {/* Location */}
              <address className="not-italic flex flex-col gap-0.5">
                <span
                  className="font-body text-body-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Bangalore, Karnataka, India
                </span>
              </address>

              {/* Phone */}
              <a
                href="tel:+918088959143"
                className="footer-link font-body text-body-sm"
              >
                +91 80889 59143
              </a>

              {/* Email */}
              <a
                href="mailto:info@pixelpitechnologies.in"
                className="footer-link font-body text-body-sm"
              >
                info@pixelpitechnologies.in
              </a>

              {/* WhatsApp — icon + text, opens in new tab */}
              <a
                href="https://wa.me/918088959143?text=Hello%20Pixel%20Pi%20Technologies!%20I%20would%20like%20to%20inquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-body-sm transition-colors duration-fast w-fit"
                style={{ color: 'var(--color-whatsapp)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-whatsapp-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-whatsapp)')}
              >
                <IconWhatsApp size={15} aria-hidden="true" className="flex-shrink-0" />
                <span>WhatsApp</span>
                <span aria-hidden="true">→</span>
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="content-container py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="font-body text-caption"
            style={{ color: 'var(--color-text-muted)' }}
          >
            © {year} Pixel Pi Technologies LLP. All rights reserved.
          </p>
          <a
            href="/privacy"
            className="footer-link font-body text-caption"
          >
            Privacy Policy
          </a>
        </div>
      </div>

    </footer>
  );
}