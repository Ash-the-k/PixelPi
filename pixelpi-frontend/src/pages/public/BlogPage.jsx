import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { AnimatedSection } from '../../components/public/ui/AnimatedSection';
import { Pagination } from '../../components/public/ui/Pagination';
import { SectionLabel } from '../../components/public/ui/SectionLabel';
import { BlogCard } from '../../components/public/blog/BlogCard';
import { BlogCardSkeleton } from '../../components/public/blog/BlogCardSkeleton';
import { CategoryFilter } from '../../components/public/blog/CategoryFilter';


export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const activeCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const val = searchInput.trim();
          val ? next.set('search', val) : next.delete('search');
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const setCategory = (cat) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        cat ? next.set('category', cat) : next.delete('category');
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  };

  const setPage = (p) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const queryParams = {
    ...(searchParams.get('search') && { search: searchParams.get('search') }),
    ...(activeCategory && { category: activeCategory }),
    ...(currentPage > 1 && { page: currentPage }),
  };

  const { data, isLoading, error } = useBlogPosts(queryParams);

  const posts = data?.posts || [];
  const categories = data?.categories || [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const hasFilters = !!(searchParams.get('search') || activeCategory);

  return (
    <>
      <Helmet>
        <title>Blog | Pixel Pi Technologies</title>
        <meta
          name="description"
          content="Insights from the engineering, research, and development behind our work."
        />
      </Helmet>

      <>
        {/*
          Single section — section-padding handles bottom (96px).
          paddingTop: 136px = 66px navbar + 70px breathing room.
          No separate hero section → no padding accumulation.
        */}
        <section
          className="section-padding"
          style={{ paddingTop: '136px' }}
        >
          <div className="content-container">

            {/* Page heading */}
            <AnimatedSection>
              <SectionLabel>BLOGS</SectionLabel>
              <h1
                className="font-display text-display-lg mt-3 mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Engineering &amp; Insights
              </h1>
              <p
                className="text-body-lg"
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 'var(--max-width-text)',
                }}
              >
                Insights from the engineering, research, and development behind our work.
              </p>
            </AnimatedSection>

            {/* Divider — provides visual separation without double padding */}
            <div
              style={{
                height: '1px',
                background: 'var(--color-border)',
                margin: '1rem 0',
              }}
            />

            {/* Search + category filter */}
            <AnimatedSection className="mb-6">
              <CategoryFilter
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setCategory}
              />
            </AnimatedSection>

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div
                className="text-center py-20 font-mono text-mono-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Could not load posts. Please try again.
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && posts.length === 0 && (
              <div className="text-center py-24">
                <p
                  className="font-display text-display-sm mb-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {hasFilters ? 'No posts match your search.' : 'No posts yet.'}
                </p>
                <p
                  className="text-body-sm mb-6"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {hasFilters
                    ? 'Try adjusting your search or clearing filters.'
                    : 'Engineering insights and technical articles are coming soon.'}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="font-mono text-mono-sm transition-colors duration-[175ms]"
                    style={{ color: 'var(--color-accent)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'var(--color-accent-hover)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--color-accent)')
                    }
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Grid */}
            {!isLoading && !error && posts.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, i) => (
                    <AnimatedSection key={post.id ?? post.slug} delay={i * 0.05}>
                      <BlogCard post={post} />
                    </AnimatedSection>
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}

          </div>
        </section>
      </>
    </>
  );
}