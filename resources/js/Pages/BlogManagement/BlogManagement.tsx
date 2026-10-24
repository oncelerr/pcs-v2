import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner';
import ConfirmationModal from '../../Components/ConfirmationModal';
import BlogFormModal, { BlogFormValues, BlogRecord } from './Components/BlogFormModal';
import './BlogManagement.css';

interface AdminBlogRecord extends BlogRecord {
  author?: { id: number; name: string } | null;
  published_at: string | null;
}

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<AdminBlogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, per_page: 10, current_page: 1, last_page: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formModal, setFormModal] = useState<{ open: boolean; blog: AdminBlogRecord | null }>({ open: false, blog: null });
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogRecord | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/blogs', {
        params: {
          page: pagination.current_page,
          per_page: pagination.per_page,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
        },
      });
      setBlogs(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchBlogs();
  };

  const openCreateModal = () => {
    setActiveDropdown(null);
    setFormModal({ open: true, blog: null });
  };

  const openEditModal = (blog: AdminBlogRecord) => {
    setActiveDropdown(null);
    setFormModal({ open: true, blog });
  };

  const handleFormSubmit = async (values: BlogFormValues, coverImage: File | null, removeCoverImage: boolean) => {
    const data = new FormData();
    data.append('title', values.title);
    data.append('excerpt', values.excerpt);
    data.append('content', values.content);
    data.append('status', values.status);
    values.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(tag => data.append('tags[]', tag));
    if (coverImage) data.append('cover_image', coverImage);
    if (removeCoverImage) data.append('remove_cover_image', '1');

    if (formModal.blog) {
      await axios.post(`/api/admin/blogs/${formModal.blog.id}`, data);
    } else {
      await axios.post('/api/admin/blogs', data);
    }

    setFormModal({ open: false, blog: null });
    fetchBlogs();
  };

  const handleTogglePublish = async (blog: AdminBlogRecord) => {
    setActiveDropdown(null);
    const data = new FormData();
    data.append('title', blog.title);
    data.append('excerpt', blog.excerpt || '');
    data.append('content', blog.content);
    data.append('status', blog.status === 'published' ? 'draft' : 'published');
    (blog.tags || []).forEach(tag => data.append('tags[]', tag));

    try {
      await axios.post(`/api/admin/blogs/${blog.id}`, data);
      fetchBlogs();
    } catch {
      setError('Failed to update post status.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/admin/blogs/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchBlogs();
    } catch {
      setError('Failed to delete the post.');
      setDeleteTarget(null);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.last_page) return;
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  return (
    <div className="personal-deets-cont">
      <div className="personal-deets-header">
        <img className="personal-deets-header-img" src="/assets/paper-icon.png" alt="" />
        <h3 className="h3-title">Blog Posts</h3>
      </div>

      <form className="tool-bar" onSubmit={handleSearchSubmit}>
        <input
          className="search-bar"
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="dropdown-bar"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, current_page: 1 })); }}
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button" className="add-candidate" onClick={openCreateModal}>
          + New Post
        </button>
      </form>

      {error && <div className="blog-mgmt-error">{error}</div>}

      <div className="table-scroll">
        <table className="all-users-table blog-mgmt-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Published</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  <LoadingSpinner size="small" color="#126654" />
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No blog posts found.</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="row-title-cell" data-label="Title">{blog.title}</td>
                  <td data-label="Status">
                    <span className={`blog-status-badge ${blog.status}`}>
                      {blog.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td data-label="Author">{blog.author?.name || '—'}</td>
                  <td data-label="Published">{formatDate(blog.published_at)}</td>
                  <td className="action-dropdown-cell" data-label="Action">
                    <div className="action-dropdown" ref={activeDropdown === blog.id ? dropdownRef : null}>
                      <button
                        className="action-dropdown-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === blog.id ? null : blog.id);
                        }}
                      >
                        Actions ▼
                      </button>
                      {activeDropdown === blog.id && (
                        <div className="action-dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, marginTop: '5px' }}>
                          <button onClick={() => openEditModal(blog)}>Edit</button>
                          <button onClick={() => handleTogglePublish(blog)}>
                            {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            className="delete-action"
                            onClick={() => { setActiveDropdown(null); setDeleteTarget(blog); }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.last_page > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} posts)
          </div>
          <div className="pagination-controls">
            <button
              className={`pagination-button ${pagination.current_page === 1 ? 'disabled' : ''}`}
              onClick={() => goToPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              Previous
            </button>
            <button
              className={`pagination-button ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}
              onClick={() => goToPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {formModal.open && (
        <BlogFormModal
          blog={formModal.blog}
          onClose={() => setFormModal({ open: false, blog: null })}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default BlogManagement;
