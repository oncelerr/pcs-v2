import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import './Article.css'

interface BlogDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[] | null;
  published_at: string;
  author?: { id: number; name: string } | null;
}

interface RelatedBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[] | null;
  published_at: string;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const coverImageUrl = (path: string | null) => {
  if (!path) return 'https://placehold.co/995x360?text=Premium+Corp+Solutions';
  return path.startsWith('http') ? path : `/storage/${path}`;
};

const ArticleCard: React.FC<{ post: RelatedBlog }> = ({ post }) => {
  return (
    <div className="article-card">
      <img className="article-card__image" src={coverImageUrl(post.cover_image)} alt={post.title} />
      <div className="article-card__content">
        <div className="article-card__tags">
          {(post.tags || []).slice(0, 3).map((tag) => (
            <div key={tag} className="tag">
              {tag}
            </div>
          ))}
        </div>
        <div className="article-card__info">
          <div className="article-card__date">{formatDate(post.published_at)}</div>
          <h3 className="article-card__title">{post.title}</h3>
          {post.excerpt && <p className="article-card__description">{post.excerpt}</p>}
          <Link to={`/article/${post.slug}`} className="article-card__link">
            Read Article →
          </Link>
        </div>
      </div>
    </div>
  );
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [related, setRelated] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchArticle = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const response = await axios.get(`/api/blogs/${slug}`);
        if (cancelled) return;
        setBlog(response.data.data);
        setRelated(response.data.related || []);
      } catch (err: any) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (slug) fetchArticle();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="article-loading">
          <LoadingSpinner size="medium" color="#106552" />
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="page-container">
        <div className="article-not-found">
          <h1>Article not found</h1>
          <p>This post may have been unpublished or the link is incorrect.</p>
          <Link to="/blogs" className="text-link">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const paragraphs = blog.content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb__item">Home</Link>
        <span className="breadcrumb__separator">›</span>
        <Link to="/blogs" className="breadcrumb__item">Blogs</Link>
        <span className="breadcrumb__separator">›</span>
        <span className="breadcrumb__item breadcrumb__item--active">
          {blog.title}
        </span>
      </div>

      <main className="main-content">
        <article className="article">
          <h1 className="article__title">{blog.title}</h1>

          <div className="article__meta">
            <div className="meta-item">
              <div className="meta-item__label">Published:</div>
              <div className="meta-item__value">{formatDate(blog.published_at)}</div>
            </div>
            <div className="meta-item">
              <div className="meta-item__label">Written By:</div>
              <div className="meta-item__value">{blog.author?.name || 'PCS Team'}</div>
            </div>
          </div>

          <img className="article__hero" src={coverImageUrl(blog.cover_image)} alt={blog.title} />

          <div className="article__body">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>

      {/* Recommended Articles */}
      {related.length > 0 && (
        <section className="recommended-section">
          <h2 className="recommended-section__title">Recommended Articles</h2>
          <div className="recommended-section__grid">
            {related.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
