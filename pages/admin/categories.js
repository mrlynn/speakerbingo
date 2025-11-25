import { useState, useEffect, useCallback } from 'react'
import SimpleAdminLayout from '../../components/admin/SimpleAdminLayout'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState({ open: false, category: null })
  const [message, setMessage] = useState({ text: '', type: '' })

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      showMessage('Failed to fetch categories', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleSaveCategory = async () => {
    const { category } = editModal
    const isNew = !category._id

    try {
      const url = isNew ? '/api/admin/categories' : `/api/admin/categories/${category._id}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showMessage(isNew ? 'Category created!' : 'Category updated!')
      setEditModal({ open: false, category: null })
      fetchCategories()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const handleDeleteCategory = async (category) => {
    if (category.phraseCount > 0) {
      showMessage(`Can't delete - has ${category.phraseCount} phrases`, 'error')
      return
    }
    if (!confirm(`Delete "${category.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      showMessage('Category deleted!')
      fetchCategories()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const handleSeedCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories/seed', { method: 'POST' })
      const data = await res.json()
      showMessage(data.message)
      fetchCategories()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  return (
    <SimpleAdminLayout title="Category Management">
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="actions-bar">
        <button className="btn primary" onClick={() => setEditModal({
          open: true,
          category: { key: '', name: '', description: '', emoji: '', order: 0, isActive: true }
        })}>
          + Add Category
        </button>
        <button className="btn" onClick={handleSeedCategories}>
          Seed Defaults
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="empty">No categories found. Click "Seed Defaults" to create them.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Category</th>
                <th>Key</th>
                <th>Phrases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td>{cat.order}</td>
                  <td>
                    <span className="category-name">
                      {cat.emoji && <span className="emoji">{cat.emoji}</span>}
                      {cat.name}
                    </span>
                    {cat.description && (
                      <div className="description">{cat.description}</div>
                    )}
                  </td>
                  <td><code>{cat.key}</code></td>
                  <td><strong>{cat.phraseCount || 0}</strong></td>
                  <td>
                    <button className="btn-sm" onClick={() => setEditModal({ open: true, category: { ...cat } })}>
                      Edit
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={cat.phraseCount > 0}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="modal-overlay" onClick={() => setEditModal({ open: false, category: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editModal.category?._id ? 'Edit Category' : 'Add Category'}</h2>

            {!editModal.category?._id && (
              <div className="form-group">
                <label>Key</label>
                <input
                  type="text"
                  value={editModal.category?.key || ''}
                  onChange={(e) => setEditModal(p => ({
                    ...p,
                    category: { ...p.category, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }
                  }))}
                  placeholder="e.g., my-category"
                />
                <small>Lowercase, hyphens only</small>
              </div>
            )}

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={editModal.category?.name || ''}
                onChange={(e) => setEditModal(p => ({ ...p, category: { ...p.category, name: e.target.value } }))}
              />
            </div>

            <div className="form-group">
              <label>Emoji</label>
              <input
                type="text"
                value={editModal.category?.emoji || ''}
                onChange={(e) => setEditModal(p => ({ ...p, category: { ...p.category, emoji: e.target.value } }))}
                placeholder="e.g., 🎯"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={2}
                value={editModal.category?.description || ''}
                onChange={(e) => setEditModal(p => ({ ...p, category: { ...p.category, description: e.target.value } }))}
              />
            </div>

            <div className="form-group">
              <label>Order</label>
              <input
                type="number"
                value={editModal.category?.order || 0}
                onChange={(e) => setEditModal(p => ({ ...p, category: { ...p.category, order: parseInt(e.target.value) } }))}
              />
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={() => setEditModal({ open: false, category: null })}>Cancel</button>
              <button className="btn primary" onClick={handleSaveCategory}>Save</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .message {
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message.success { background: #d4edda; color: #155724; }
        .message.error { background: #f8d7da; color: #721c24; }

        .actions-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn {
          padding: 10px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn:hover { background: #f5f5f5; }
        .btn.primary { background: #667eea; color: white; border-color: #667eea; }
        .btn.primary:hover { background: #5a6fd6; }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 5px;
        }
        .btn-sm:hover { background: #f5f5f5; }
        .btn-sm.danger { color: #c00; }
        .btn-sm.danger:hover { background: #fee; }
        .btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .loading, .empty {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; }
        tr:hover td { background: #fafafa; }

        .category-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .emoji { font-size: 20px; }
        .description { font-size: 12px; color: #666; margin-top: 4px; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
        }
        .modal h2 { margin: 0 0 20px; }

        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .form-group small { color: #666; font-size: 12px; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
      `}</style>
    </SimpleAdminLayout>
  )
}
