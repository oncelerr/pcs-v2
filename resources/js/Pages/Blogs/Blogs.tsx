import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import './Blogs.css';

interface BlogSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[] | null;
  published_at: string;
  author?: { id: number; name: string } | null;
}

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const coverImageUrl = (path: string | null) => {
  if (!path) return 'https://placehold.co/416x240?text=Premium+Corp+Solutions';
  return path.startsWith('http') ? path : `/storage/${path}`;
};

export default function Blogs() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, per_page: 7, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/blogs', {
          params: { page: pagination.current_page, per_page: 7 },
        });
        if (cancelled) return;
        setBlogs(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        if (cancelled) return;
        setError('Unable to load blog posts right now. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBlogs();
    return () => { cancelled = true; };
  }, [pagination.current_page]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.last_page || page === pagination.current_page) return;
    setPagination(prev => ({ ...prev, current_page: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [featured, ...rest] = blogs;

  return (
    <div className="blogs-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Blog</h1>
          <p className="hero-subtitle">
            Insights, guides, and updates from the Premium Corp Solutions team on business
            registration, compliance, and growing your company.
          </p>
        </div>
      </section>

      {loading && blogs.length === 0 && (
        <section className="blog-grid">
          <div className="container">
            <p className="blog-status-message">Loading posts...</p>
          </div>
        </section>
      )}

      {error && (
        <section className="blog-grid">
          <div className="container">
            <p className="blog-status-message blog-status-error">{error}</p>
          </div>
        </section>
      )}

      {!loading && !error && blogs.length === 0 && (
        <section className="blog-grid">
          <div className="container">
            <p className="blog-status-message">No blog posts have been published yet. Check back soon.</p>
          </div>
        </section>
      )}

      {/* Featured Blog Post */}
      {featured && (
        <section className="featured-blog">
          <div className="container">
            <div className="featured-content">
              <img className="featured-image" src={coverImageUrl(featured.cover_image)} alt={featured.title} />
              <div className="featured-details">
                <div className="badges">
                  {(featured.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
                <h2>{featured.title}</h2>
                <div className="date">{formatDate(featured.published_at)}</div>
                {featured.excerpt && <p className="blog-excerpt">{featured.excerpt}</p>}
                <Link to={`/article/${featured.slug}`} className="read-more">Read Article →</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      {rest.length > 0 && (
        <section className="blog-grid">
          <div className="container">
            <div className="grid">
              {rest.map((post) => (
                <article key={post.id} className="blog-card">
                  <img src={coverImageUrl(post.cover_image)} alt={post.title} className="blog-image" loading="lazy" />
                  <div className="card-content">
                    <div className="card-badges">
                      {(post.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="badge">{tag}</span>
                      ))}
                    </div>
                    <div className="card-date">{formatDate(post.published_at)}</div>
                    <h3 className="card-title">{post.title}</h3>
                    {post.excerpt && <p className="card-excerpt">{post.excerpt}</p>}
                    <Link to={`/article/${post.slug}`} className="read-more">Read Article →</Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <nav className="pagination" aria-label="Blog pages">
                <button
                  className="pagination-button"
                  onClick={() => goToPage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-number ${page === pagination.current_page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={page === pagination.current_page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="pagination-button"
                  onClick={() => goToPage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  aria-label="Next page"
                >
                  ›
                </button>
              </nav>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
