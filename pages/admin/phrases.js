import { useState, useEffect, useCallback } from 'react'
import SimpleAdminLayout from '../../components/admin/SimpleAdminLayout'

export default function PhrasesAdmin() {
  const [phrases, setPhrases] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0 })

  const [filterCategory, setFilterCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [editModal, setEditModal] = useState({ open: false, phrase: null })
  const [importModal, setImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importCategory, setImportCategory] = useState('')

  const [message, setMessage] = useState({ text: '', type: '' })

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const fetchPhrases = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pagination.page, limit: pagination.limit })
      if (filterCategory) params.append('category', filterCategory)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/phrases?${params}`)
      const data = await res.json()

      setPhrases(data.phrases || [])
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }))
    } catch (error) {
      showMessage('Failed to fetch phrases', 'error')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filterCategory, searchQuery])

  useEffect(() => { fetchCategories() }, [fetchCategories])
  useEffect(() => { fetchPhrases() }, [fetchPhrases])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleSavePhrase = async () => {
    const { phrase } = editModal
    const isNew = !phrase._id

    try {
      const url = isNew ? '/api/admin/phrases' : `/api/admin/phrases/${phrase._id}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phrase)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showMessage(isNew ? 'Phrase created!' : 'Phrase updated!')
      setEditModal({ open: false, phrase: null })
      fetchPhrases()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const handleDeletePhrase = async (phrase) => {
    if (!confirm(`Delete "${phrase.text}"?`)) return

    try {
      const res = await fetch(`/api/admin/phrases/${phrase._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      showMessage('Phrase deleted!')
      fetchPhrases()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const handleBulkImport = async () => {
    if (!importText.trim() || !importCategory) {
      showMessage('Enter phrases and select category', 'error')
      return
    }

    const phraseList = importText.split('\n').map(p => p.trim()).filter(p => p)

    try {
      const res = await fetch('/api/admin/phrases/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrases: phraseList, category: importCategory, skipDuplicates: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showMessage(`Imported ${data.inserted} phrases, skipped ${data.skipped}`)
      setImportModal(false)
      setImportText('')
      fetchPhrases()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const handleSeedFromFile = async () => {
    try {
      await fetch('/api/admin/categories/seed', { method: 'POST' })
      const res = await fetch('/api/admin/phrases/seed', { method: 'POST' })
      const data = await res.json()
      showMessage(data.message)
      fetchCategories()
      fetchPhrases()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  const getCategoryName = (key) => {
    const cat = categories.find(c => c.key === key)
    return cat ? `${cat.emoji || ''} ${cat.name}`.trim() : key
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <SimpleAdminLayout title="Phrase Management">
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="actions-bar">
        <button className="btn primary" onClick={() => setEditModal({
          open: true,
          phrase: { text: '', category: categories[0]?.key || '', points: 100, status: 'approved' }
        })}>
          + Add Phrase
        </button>
        <button className="btn" onClick={() => setImportModal(true)}>
          Import Bulk
        </button>
        <button className="btn" onClick={handleSeedFromFile}>
          Seed from File
        </button>

        <div className="spacer" />

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.emoji} {cat.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : phrases.length === 0 ? (
          <div className="empty">No phrases found. Click "Seed from File" to import defaults.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Phrase</th>
                <th>Category</th>
                <th>Points</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {phrases.map(phrase => (
                <tr key={phrase._id}>
                  <td>{phrase.text}</td>
                  <td><span className="badge">{getCategoryName(phrase.category)}</span></td>
                  <td>{phrase.points}</td>
                  <td><span className={`status ${phrase.status}`}>{phrase.status}</span></td>
                  <td>
                    <button className="btn-sm" onClick={() => setEditModal({ open: true, phrase: { ...phrase } })}>
                      Edit
                    </button>
                    <button className="btn-sm danger" onClick={() => handleDeletePhrase(phrase)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
            Prev
          </button>
          <span>Page {pagination.page} of {totalPages}</span>
          <button disabled={pagination.page >= totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="modal-overlay" onClick={() => setEditModal({ open: false, phrase: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editModal.phrase?._id ? 'Edit Phrase' : 'Add Phrase'}</h2>
            <div className="form-group">
              <label>Text</label>
              <input
                type="text"
                value={editModal.phrase?.text || ''}
                onChange={(e) => setEditModal(p => ({ ...p, phrase: { ...p.phrase, text: e.target.value } }))}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={editModal.phrase?.category || ''}
                onChange={(e) => setEditModal(p => ({ ...p, phrase: { ...p.phrase, category: e.target.value } }))}
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                value={editModal.phrase?.points || 100}
                onChange={(e) => setEditModal(p => ({ ...p, phrase: { ...p.phrase, points: parseInt(e.target.value) } }))}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEditModal({ open: false, phrase: null })}>Cancel</button>
              <button className="btn primary" onClick={handleSavePhrase}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModal && (
        <div className="modal-overlay" onClick={() => setImportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Bulk Import</h2>
            <div className="form-group">
              <label>Category</label>
              <select value={importCategory} onChange={(e) => setImportCategory(e.target.value)}>
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Phrases (one per line)</label>
              <textarea
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Enter phrases, one per line..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setImportModal(false)}>Cancel</button>
              <button className="btn primary" onClick={handleBulkImport}>Import</button>
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
          flex-wrap: wrap;
          margin-bottom: 20px;
          align-items: center;
        }
        .spacer { flex: 1; }

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

        .search-input, .filter-select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .search-input { width: 200px; }

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

        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        tr:hover td { background: #fafafa; }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          background: #e9ecef;
          border-radius: 20px;
          font-size: 12px;
        }

        .status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status.approved { background: #d4edda; color: #155724; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.rejected { background: #f8d7da; color: #721c24; }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
        }
        .pagination button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

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
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal h2 { margin: 0 0 20px; }

        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .form-group textarea { resize: vertical; }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>
    </SimpleAdminLayout>
  )
}
