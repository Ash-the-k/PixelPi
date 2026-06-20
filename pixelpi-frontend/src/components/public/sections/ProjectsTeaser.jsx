import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeaturedGallery } from '../../../hooks/useGallery';
import { getGalleryImageUrl } from '../../../utils/getImageUrl';
import { Button } from '../ui/Button';
import { SectionLabel } from '../ui/SectionLabel';
import { SectionHeading } from '../ui/SectionHeading';
import { AnimatedSection } from '../ui/AnimatedSection';

const ROTATION_MS = 6000;

// ─── Featured Panel ───────────────────────────────────────────────────────────

function FeaturedPanel({ item, showProgress = false }) {
    const src = getGalleryImageUrl(item.filename);

    return (
        <div
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
            }}
        >
            {/* Image — crossfades on item change */}
            <AnimatePresence>
                <motion.img
                    key={item.filename}
                    src={src}
                    alt={item.title || 'Featured project'}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </AnimatePresence>

            {/* Gradient overlay — always present for text legibility */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(to bottom, transparent 30%, rgba(8,12,20,0.72) 62%, rgba(8,12,20,0.97) 100%)',
                }}
            />

            {/* Content — fades + slides on item change */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={item.filename + '-content'}
                    className="absolute bottom-0 left-0 right-0 p-7 flex flex-col gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                    {item.title && (
                        <h3
                            className="font-display font-semibold text-display-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {item.title}
                        </h3>
                    )}
                    {item.desc && (
                        <p
                            className="font-body text-body-sm line-clamp-2"
                            style={{ color: 'var(--color-text-secondary)', maxWidth: '480px' }}
                        >
                            {item.desc}
                        </p>
                    )}
                </motion.div>
                {/* Progress bar — integrated bottom edge, mobile only */}
                {showProgress && (
                    <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: '2px', background: 'rgba(255,255,255,0.10)' }}
                    >
                        <div
                            key={`featured-progress-${item.filename}`}
                            style={{
                                height: '100%',
                                background: 'var(--gradient-brand-button)',
                                transformOrigin: 'left',
                                animation: `progress-advance ${ROTATION_MS}ms linear forwards`,
                            }}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Supporting Card ──────────────────────────────────────────────────────────

function SupportingCard({ item, index, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left rounded-lg overflow-hidden flex flex-col transition-colors duration-fast card-interactive"
            style={{
                minHeight: '115px',
                background: isActive ? 'rgba(13,18,32,0.90)' : 'var(--color-bg-elevated)',
                border: isActive
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                cursor: 'pointer',
                outline: 'none',
                padding: 0,
            }}
            aria-label={`View project: ${item.title || `Project ${index}`}`}
            aria-pressed={isActive}
        >
            <div className="flex items-start gap-3 p-4 flex-1">
                {/* Index */}
                <span
                    className="font-mono text-mono-sm flex-shrink-0 mt-0.5"
                    style={{
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-disabled)',
                    }}
                >
                    {String(index).padStart(2, '0')}
                </span>

                {/* Text */}
                <div className="flex flex-col gap-1 min-w-0">
                    {item.title && (
                        <span
                            className="font-display font-semibold text-body-sm truncate"
                            style={{
                                color: isActive
                                    ? 'var(--color-text-primary)'
                                    : 'var(--color-text-secondary)',
                            }}
                        >
                            {item.title}
                        </span>
                    )}
                    {item.desc && (
                        <span
                            className="font-body text-caption line-clamp-2"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {item.desc}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar — only on active card, keyed to restart on change */}
            <div
                className="h-0.5 w-full flex-shrink-0"
                style={{
                    background: 'var(--color-border)',
                    visibility: isActive ? 'visible' : 'hidden',
                }}
            >
                {isActive && (
                    <div
                        key={`progress-${item.filename}`}
                        style={{
                            height: '100%',
                            background: 'var(--color-accent)',
                            transformOrigin: 'left',
                            animation: `progress-advance ${ROTATION_MS}ms linear forwards`,
                        }}
                    />
                )}
            </div>
        </button>
    );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonFeatured() {
    return (
        <div
            className="w-full h-full rounded-lg animate-pulse"
            style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                minHeight: '280px',
            }}
        />
    );
}

function SkeletonCard() {
    return (
        <div
            className="rounded-lg p-4 animate-pulse flex-shrink-0"
            style={{
                minHeight: '115px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
            }}
        >
            <div className="flex gap-3">
                <div className="w-6 h-3 rounded" style={{ background: 'var(--color-bg-subtle)' }} />
                <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 rounded w-3/4" style={{ background: 'var(--color-bg-subtle)' }} />
                    <div className="h-2 rounded" style={{ background: 'var(--color-bg-subtle)' }} />
                    <div className="h-2 rounded w-2/3" style={{ background: 'var(--color-bg-subtle)' }} />
                </div>
            </div>
        </div>
    );
}

// ─── DotIndicators  ───────────────────────────────────────────────────────────

function DotIndicators({ count, activeIndex, onSelect }) {
    return (
        <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: count }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(i)}
                    aria-label={`View project ${i + 1}`}
                    aria-pressed={i === activeIndex}
                    style={{
                        width: i === activeIndex ? '20px' : '6px',
                        height: '6px',
                        borderRadius: '9999px',
                        background: i === activeIndex
                            ? 'var(--color-accent)'
                            : 'var(--color-border-strong)',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: `width var(--duration-moderate) var(--easing-enter),
                         background var(--duration-fast) var(--easing-standard)`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── useSwipe ─────────────────────────────────────────────────────────────────

function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
    const startX = useRef(null);

    return {
        onTouchStart: (e) => { startX.current = e.touches[0].clientX; },
        onTouchEnd: (e) => {
            if (startX.current === null) return;
            const delta = startX.current - e.changedTouches[0].clientX;
            if (delta > threshold) onSwipeLeft();
            if (delta < -threshold) onSwipeRight();
            startX.current = null;
        },
    };
}

// ─── ProjectsTeaser ───────────────────────────────────────────────────────────

export function ProjectsTeaser() {
    const { data: items = [], isLoading, error } = useFeaturedGallery({ limit: 4 });
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (items.length <= 1) return;
        timerRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, ROTATION_MS);
    }, [items.length]);

    // Start rotation
    useEffect(() => {
        resetTimer();
        return () => clearInterval(timerRef.current);
    }, [resetTimer]);

    // Reset index when items change
    useEffect(() => {
        setActiveIndex(0);
    }, [items.length]);

    const handleCardClick = (index) => {
        setActiveIndex(index);
        resetTimer();
    };

    if (!isLoading && !error && items.length === 0) return null;

    const activeItem = items[activeIndex];

    const swipeHandlers = useSwipe(
        () => handleCardClick((activeIndex + 1) % items.length),
        () => handleCardClick((activeIndex - 1 + items.length) % items.length),
    );

    return (
        <section className="section-padding" style={{ background: 'var(--color-bg-base)' }}>
            <div className="content-container">

                {/* Header */}
                <AnimatedSection className="mb-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-4">
                            <SectionLabel>Our Work</SectionLabel>
                            <SectionHeading>A Glimpse of Our Work</SectionHeading>
                        </div>
                        <Button as={Link} to="/projects" variant="ghost" size="md" className="flex-shrink-0">
                            View All Projects
                        </Button>
                    </div>
                </AnimatedSection>

                {/* Showcase */}
                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
                        <SkeletonFeatured />
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <p className="font-body text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Projects could not be loaded.
                    </p>
                ) : (
                    <AnimatedSection>
                        {/* ── Mobile: featured card + dot indicators ── */}
                        <div className="lg:hidden">
                            <div
                                style={{ minHeight: '380px', height: '52vw', maxHeight: '480px' }}
                                {...swipeHandlers}
                            >
                                {activeItem && <FeaturedPanel item={activeItem} showProgress={true} />}
                            </div>
                            <DotIndicators
                                count={items.length}
                                activeIndex={activeIndex}
                                onSelect={handleCardClick}
                            />
                        </div>

                        {/* ── Desktop: featured image left, supporting cards right ── */}
                        <div className="hidden lg:grid lg:grid-cols-[3fr_2fr] gap-4">
                            <div style={{ minHeight: '280px' }}>
                                {activeItem && <FeaturedPanel item={activeItem} />}
                            </div>
                            <div className="flex flex-col gap-3">
                                {items.map((item, i) => (
                                    <SupportingCard
                                        key={item.filename}
                                        item={item}
                                        index={i + 1}
                                        isActive={i === activeIndex}
                                        onClick={() => handleCardClick(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                )}

            </div>
        </section>
    );
}