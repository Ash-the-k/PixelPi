import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { LogoMark } from '../ui/LogoMark';
import { cn } from '../../../utils/cn';

const NAV_LINKS = [
    { label: 'About', to: '/about' },
    { label: 'Projects', to: '/projects' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
];

function NavLink({ to, children, isActive, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={cn(
                'px-3 py-1.5 rounded-md',
                'font-body text-label',
                'transition-colors duration-fast',
                'no-underline',
            )}
            style={{
                color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
        >
            {children}
        </Link>
    );
}

function Separator() {
    return (
        <div
            className="h-5 w-px flex-shrink-0 mx-1"
            style={{ background: 'var(--color-border-strong)' }}
            aria-hidden="true"
        />
    );
}

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();

    // ── Close drawer on navigation ───────────────────────────────────────────
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    // ── Active route detection ────────────────────────────────────────────────
    const isActive = (to) =>
        to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

    // ── Shared glass styles ───────────────────────────────────────────────────
    const glassStyle = {
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        background: 'rgba(13, 18, 32, 0.70)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
        transition: 'background 175ms ease, box-shadow 175ms ease',
    };

    return (
        <>
            {/* ══════════════════════════════════════════════════════════════════
          Header — fixed, full-width, z-50
          Contains: desktop pill (hidden on mobile) + mobile bar (hidden on desktop)
      ══════════════════════════════════════════════════════════════════ */}
            <header
                className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pt-5 px-4 lg:pt-[4vh]"
            >

                {/* ── Desktop Pill ── */}
                <nav
                    className="hidden md:flex items-center gap-1 px-3 lg:scale-110 lg:origin-top"
                    style={{ ...glassStyle, height: '66px', padding: '20px', borderRadius: '9999px' }}
                    aria-label="Primary navigation"
                >
                    {/* Logo */}

                    <LogoMark size="nav" />


                    <Separator />

                    {/* Nav links */}
                    <div className="flex items-center gap-0.5">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                isActive={isActive(link.to)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    <Separator />

                    {/* CTA */}
                    <Button
                        as={Link}
                        to="/contact"
                        variant="primary"
                        size="pill"
                        className="ml-1"
                    >
                        Get in Touch
                    </Button>
                </nav>

                {/* ── Mobile Bar ── */}
                {/* Mobile — single expanding glass component */}
                <div
                    className="flex md:hidden flex-col w-full"
                    style={{
                        ...glassStyle,
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        maxHeight: drawerOpen ? '400px' : '56px',
                        transition: 'max-height var(--duration-moderate) var(--easing-enter)',
                    }}
                    role="banner"
                >
                    {/* Top row — always visible */}
                    <div
                        className="flex items-center justify-between flex-shrink-0"
                        style={{ height: '56px', paddingLeft: '16px', paddingRight: '12px' }}
                    >
                        <Link to="/" className='flex items-center' style={{ textDecoration: 'none' }} aria-label="Pixel Pi Technologies — home">
                            <LogoMark size="ph" />
                        </Link>
                        <button
                            className="flex items-center justify-center w-9 h-9 rounded-md"
                            style={{
                                color: 'var(--color-text-secondary)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color var(--duration-hover) var(--easing-standard), transform var(--duration-hover) var(--easing-standard)',
                            }}
                            onClick={() => setDrawerOpen((v) => !v)}
                            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={drawerOpen}
                        >
                            {/* Icon crossfades */}
                            <span style={{ opacity: drawerOpen ? 0 : 1, position: 'absolute', transition: 'opacity 200ms ease' }}>
                                <Menu size={20} />
                            </span>
                            <span style={{ opacity: drawerOpen ? 1 : 0, position: 'absolute', transition: 'opacity 200ms ease' }}>
                                <X size={20} />
                            </span>
                        </button>
                    </div>

                    {/* Expandable content — fades in after container starts opening */}
                    <div
                        style={{
                            opacity: drawerOpen ? 1 : 0,
                            transition: 'opacity var(--duration-fast) ease 50ms',
                            borderTop: '1px solid var(--color-border)',
                        }}
                    >
                        <nav className="flex flex-col p-3 gap-0.5" aria-label="Mobile navigation">
                            {NAV_LINKS.map((link) => {
                                const active = isActive(link.to);
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="px-3 py-3 rounded-lg font-body text-body-md no-underline"
                                        style={{
                                            color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                            background: active ? 'var(--color-bg-subtle)' : 'transparent',
                                            fontWeight: active ? '500' : '400',
                                            transition: 'color var(--duration-hover) var(--easing-standard), background var(--duration-hover) var(--easing-standard)',
                                        }}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <div className="pt-3">
                                <Button as={Link} to="/contact" variant="primary" size="md" className="w-full">
                                    Get in Touch
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </header>
        </>
    );
}