import React, { useEffect, useState, FormEvent } from 'react';
import './BlogFormModal.css';

export interface BlogFormValues {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
}

export interface BlogRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[] | null;
  status: 'draft' | 'published';
}

interface BlogFormModalProps {
  blog: BlogRecord | null; // null = creating a new post
  onClose: () => void;
  onSubmit: (values: BlogFormValues, coverImage: File | null, removeCoverImage: boolean) => Promise<void>;
}

const coverImageUrl = (path: string | null) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `/storage/${path}`;
};

const BlogFormModal: React.FC<BlogFormModalProps> = ({ blog, onClose, onSubmit }) => {
  const [values, setValues] = useState<BlogFormValues>({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    status: 'draft',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blog) {
      setValues({
        title: blog.title,
        excerpt: blog.excerpt || '',
        content: blog.content,
        tags: (blog.tags || []).join(', '),
        status: blog.status,
      });
      setCoverPreview(coverImageUrl(blog.cover_image));
    }
  }, [blog]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);
    setRemoveCoverImage(false);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
    setRemoveCoverImage(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values, coverImage, removeCoverImage);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save the blog post.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="blog-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="blog-form-modal__header">
          <h2>{blog ? 'Edit Post' : 'New Post'}</h2>
          <button type="button" className="blog-form-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="blog-form-modal__body">
            {error && <div className="blog-form-error">{error}</div>}

            <div className="blog-form-field">
              <label htmlFor="blog-title">Title*</label>
              <input
                id="blog-title"
                type="text"
                value={values.title}
                onChange={(e) => setValues(prev => ({ ...prev, title: e.target.value }))}
                disabled={isSubmitting}
                placeholder="e.g. 5 Steps to Register Your LLC"
              />
            </div>

            <div className="blog-form-field">
              <label htmlFor="blog-excerpt">Excerpt</label>
              <textarea
                id="blog-excerpt"
                rows={2}
                value={values.excerpt}
                onChange={(e) => setValues(prev => ({ ...prev, excerpt: e.target.value }))}
                disabled={isSubmitting}
                placeholder="A short summary shown on the blog list"
              />
            </div>

            <div className="blog-form-field">
              <label htmlFor="blog-content">Content*</label>
              <textarea
                id="blog-content"
                rows={10}
                value={values.content}
                onChange={(e) => setValues(prev => ({ ...prev, content: e.target.value }))}
                disabled={isSubmitting}
                placeholder="Write the article. Leave a blank line between paragraphs."
              />
            </div>

            <div className="blog-form-field">
              <label htmlFor="blog-tags">Tags</label>
              <input
                id="blog-tags"
                type="text"
                value={values.tags}
                onChange={(e) => setValues(prev => ({ ...prev, tags: e.target.value }))}
                disabled={isSubmitting}
                placeholder="Comma-separated, e.g. Compliance, Tax Tips"
              />
            </div>

            <div className="blog-form-row">
              <div className="blog-form-field">
                <label htmlFor="blog-status">Status</label>
                <select
                  id="blog-status"
                  value={values.status}
                  onChange={(e) => setValues(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                  disabled={isSubmitting}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="blog-form-field">
                <label htmlFor="blog-cover">Cover Image</label>
                <input
                  id="blog-cover"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {coverPreview && (
              <div className="blog-cover-preview">
                <img src={coverPreview} alt="Cover preview" />
                <button type="button" onClick={handleRemoveCover} disabled={isSubmitting}>Remove image</button>
              </div>
            )}
          </div>

          <div className="blog-form-modal__footer">
            <button type="button" className="blog-form-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="blog-form-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : blog ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogFormModal;
