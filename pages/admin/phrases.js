import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'steps', label: 'Steps' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'gratitude', label: 'Gratitude' },
  { value: 'service', label: 'Service' },
  { value: 'newcomer', label: 'Newcomer' },
  { value: 'oldtimer', label: 'Old-timer' }
];

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  flagged: 'error'
};

export default function PhrasesManagement() {
  const [phrases, setPhrases] = useState([]);
  const [themes, setThemes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    theme: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    themes: [],
    category: 'general'
  });
  const [user, setUser] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('json');

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchThemes();
    fetchPhrases();
  }, [page, rowsPerPage, search, filters]);

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/themes?isActive=true&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setThemes(data.themes);
      }
    } catch (err) {
      console.error('Error fetching themes:', err);
    }
  };

  const fetchPhrases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.theme && { theme: filters.theme })
      });

      const response = await fetch(`/api/admin/phrases?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch phrases');
      }

      const data = await response.json();
      setPhrases(data.phrases);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (phrase) => {
    setEditingPhrase(phrase);
    setFormData({
      text: phrase.text,
      themes: phrase.themes.map(t => t._id),
      category: phrase.category
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this phrase?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/phrases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete phrase');
      }

      fetchPhrases();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (phrase, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const body = { status: newStatus };
      
      if (newStatus === 'flagged') {
        const reason = prompt('Please provide a reason for flagging:');
        if (!reason) return;
        body.flagReason = reason;
      }

      const response = await fetch(`/api/admin/phrases/${phrase._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to update phrase status');
      }

      fetchPhrases();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const method = editingPhrase ? 'PUT' : 'POST';
      const url = editingPhrase 
        ? `/api/admin/phrases/${editingPhrase._id}`
        : '/api/admin/phrases';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save phrase');
      }

      setDialogOpen(false);
      setEditingPhrase(null);
      setFormData({ text: '', themes: [], category: 'general' });
      fetchPhrases();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        format: 'csv',
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.theme && { theme: filters.theme })
      });

      const response = await fetch(`/api/admin/phrases/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export phrases');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phrases-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleImport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      let phrases = [];

      if (importFormat === 'json') {
        const jsonData = JSON.parse(importData);
        phrases = jsonData.phrases || jsonData;
      } else {
        // CSV format
        const lines = importData.trim().split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const row = {};
          headers.forEach((header, index) => {
            row[header.toLowerCase().trim()] = values[index]?.replace(/^"|"$/g, '') || '';
          });
          
          if (row.text) {
            phrases.push({
              text: row.text,
              category: row.category || 'general',
              themes: row.themes ? row.themes.split(',').map(t => t.trim()) : []
            });
          }
        }
      }

      const response = await fetch('/api/admin/phrases/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phrases, autoCreateThemes: true })
      });

      if (!response.ok) {
        throw new Error('Failed to import phrases');
      }

      const result = await response.json();
      setImportDialogOpen(false);
      setImportData('');
      fetchPhrases();
      
      if (result.results.errors.length > 0) {
        setError(`Import completed with errors: ${result.results.success} succeeded, ${result.results.failed} failed`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const canApprove = user?.permissions?.phrases?.approve;
  const canEdit = user?.permissions?.phrases?.update;
  const canDelete = user?.permissions?.phrases?.delete;

  return (
    <AdminLayout title="Phrase Management">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <TextField
          placeholder="Search phrases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            {categoryOptions.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={fetchPhrases} size="small">
          <RefreshIcon />
        </IconButton>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>

        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={handleImportClick}
        >
          Import
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingPhrase(null);
            setFormData({ text: '', themes: [], category: 'general' });
            setDialogOpen(true);
          }}
        >
          Add Phrase
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Phrase</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Themes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {phrases.map((phrase) => (
              <TableRow key={phrase._id}>
                <TableCell>{phrase.text}</TableCell>
                <TableCell>
                  {categoryOptions.find(c => c.value === phrase.category)?.label || phrase.category}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {phrase.themes.map(theme => (
                      <Chip
                        key={theme._id}
                        label={theme.name}
                        size="small"
                        style={{ backgroundColor: theme.color, color: '#fff' }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={phrase.status}
                    size="small"
                    color={statusColors[phrase.status]}
                  />
                </TableCell>
                <TableCell>{phrase.createdBy?.fullName}</TableCell>
                <TableCell align="right">
                  {phrase.status === 'pending' && canApprove && (
                    <Tooltip title="Approve">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleStatusChange(phrase, 'approved')}
                      >
                        <ApproveIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {phrase.status !== 'flagged' && canApprove && (
                    <Tooltip title="Flag">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleStatusChange(phrase, 'flagged')}
                      >
                        <FlagIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canEdit && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(phrase)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(phrase._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPhrase ? 'Edit Phrase' : 'Add New Phrase'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Phrase Text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              fullWidth
              multiline
              rows={2}
              helperText="Enter the phrase that might be heard in meetings"
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categoryOptions.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={themes}
              getOptionLabel={(option) => option.name}
              value={themes.filter(t => formData.themes.includes(t._id))}
              onChange={(event, newValue) => {
                setFormData({ ...formData, themes: newValue.map(t => t._id) });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Themes" placeholder="Select themes" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    style={{ backgroundColor: option.color, color: '#fff' }}
                  />
                ))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.text.trim()}
          >
            {editingPhrase ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Phrases</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Import Format</InputLabel>
              <Select
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
                label="Import Format"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Paste your data here"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              fullWidth
              multiline
              rows={10}
              helperText={
                importFormat === 'json' 
                  ? 'Paste JSON array of phrases with text, category, and themes fields'
                  : 'Paste CSV with headers: Text,Category,Themes (comma-separated theme names)'
              }
            />

            <Alert severity="info">
              <Typography variant="body2">
                {importFormat === 'json' ? (
                  <>
                    Expected format: [{"{"}"text": "phrase text", "category": "general", "themes": ["Theme1", "Theme2"]{"}"}]
                  </>
                ) : (
                  <>
                    Expected format:<br />
                    Text,Category,Themes<br />
                    "One day at a time",oldtimer,"Old-timer Wisdom,Gratitude"
                  </>
                )}
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setImportDialogOpen(false);
            setImportData('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            variant="contained"
            disabled={!importData.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}