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

    // ── Scroll tracking ──────────────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        // Set initial state in case page loads mid-scroll
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Close drawer on navigation ───────────────────────────────────────────
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    // ── Lock body scroll when drawer is open ─────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    // ── Active route detection ────────────────────────────────────────────────
    const isActive = (to) =>
        to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

    // ── Shared glass styles ───────────────────────────────────────────────────
    const glassStyle = {
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        background: scrolled
            ? 'rgba(13, 18, 32, 0.85)'
            : 'rgba(13, 18, 32, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: scrolled
            ? '0 8px 32px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.10)'
            : '0 2px 16px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        transition: 'background 175ms ease, box-shadow 175ms ease',
    };

    return (
        <>
            {/* ══════════════════════════════════════════════════════════════════
          Header — fixed, full-width, z-50
          Contains: desktop pill (hidden on mobile) + mobile bar (hidden on desktop)
      ══════════════════════════════════════════════════════════════════ */}
            <header
                className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start"
                style={{ paddingTop: '20px', paddingLeft: '16px', paddingRight: '16px' }}
            >

                {/* ── Desktop Pill ── */}
                <nav
                    className="hidden md:flex items-center gap-1 px-3"
                    style={{ ...glassStyle, height: '60px', borderRadius: '9999px' }}
                    aria-label="Primary navigation"
                >
                    {/* Logo */}
                    <Link
                        to="/"
                        className="mr-1 flex-shrink-0"
                        style={{ textDecoration: 'none' }}
                        aria-label="Pixel Pi Technologies — home"
                    >
                        <LogoMark size="md" />
                    </Link>

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
                <div
                    className="flex md:hidden items-center justify-between w-full"
                    style={{
                        ...glassStyle, height: '60px', borderRadius: 'var(--radius-lg)',
                        paddingLeft: '16px',
                        paddingRight: '12px',
                    }}

                    role="banner"
                >
                    {/* Logo */}
                    <Link
                        to="/"
                        className="mr-1 flex-shrink-0 flex items-center"
                        style={{ textDecoration: 'none' }}
                        aria-label="Pixel Pi Technologies — home"
                    >
                        <LogoMark size="md" />
                    </Link>

                    {/* Hamburger */}
                    <button
                        className="flex items-center justify-center w-9 h-9 rounded-md transition-colors duration-fast"
                        style={{
                            color: 'var(--color-text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open navigation menu"
                        aria-expanded={drawerOpen}
                        aria-controls="mobile-drawer"
                    >
                        <Menu size={20} />
                    </button>
                </div>

            </header>

            {/* ══════════════════════════════════════════════════════════════════
          Mobile Drawer — backdrop + panel
          Always rendered; opacity/transform handle show/hide so transitions
          are smooth in both directions.
      ══════════════════════════════════════════════════════════════════ */}

            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 md:hidden"
                style={{
                    background: 'rgba(0, 0, 0, 0.60)',
                    backdropFilter: 'blur(4px)',
                    opacity: drawerOpen ? 1 : 0,
                    pointerEvents: drawerOpen ? 'auto' : 'none',
                    transition: `opacity ${275}ms ease`,
                }}
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
                id="mobile-drawer"
                className={cn(
                    'fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden',
                    'flex flex-col',
                )}
                style={{
                    background: 'var(--color-bg-elevated)',
                    borderLeft: '1px solid var(--color-border)',
                    transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: `transform ${275}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >

                {/* Drawer — Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                    <Link
                        to="/"
                        style={{ textDecoration: 'none' }}
                        aria-label="Pixel Pi Technologies — home"
                    >
                        <LogoMark size="md" />
                    </Link>

                    <button
                        className="flex items-center justify-center w-9 h-9 rounded-md transition-colors duration-fast"
                        style={{
                            color: 'var(--color-text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Drawer — Nav Links */}
                <nav
                    className="flex flex-col px-3 py-3 flex-1 overflow-y-auto"
                    aria-label="Mobile navigation"
                >
                    {NAV_LINKS.map((link) => {
                        const active = isActive(link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-3 py-3 rounded-lg font-body text-body-md transition-colors duration-fast"
                                style={{
                                    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    background: active ? 'var(--color-bg-subtle)' : 'transparent',
                                    fontWeight: active ? '500' : '400',
                                    textDecoration: 'none',
                                }}
                                aria-current={active ? 'page' : undefined}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Drawer — CTA pinned to bottom */}
                <div
                    className="px-5 py-5 flex-shrink-0"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                >
                    <Button
                        as={Link}
                        to="/contact"
                        variant="primary"
                        size="md"
                        className="w-full"
                    >
                        Get in Touch
                    </Button>
                </div>

            </div>
        </>
    );
}