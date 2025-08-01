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
  Alert,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel,
  LinearProgress,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Palette as PaletteIcon,
  FormatQuote as PhraseIcon
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import AdminLayout from '../../components/admin/AdminLayout';

export default function ThemesManagement() {
  const [themes, setThemes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3f51b5',
    icon: 'category',
    priority: 0,
    minPhrases: 25
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchThemes();
  }, [page, rowsPerPage, search]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/themes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch themes');
      }

      const data = await response.json();
      setThemes(data.themes);
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

  const handleEdit = (theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      description: theme.description || '',
      color: theme.color,
      icon: theme.icon,
      priority: theme.priority,
      minPhrases: theme.minPhrases
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this theme? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/themes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete theme');
      }

      fetchThemes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (theme) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/themes/${theme._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !theme.isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update theme status');
      }

      fetchThemes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const method = editingTheme ? 'PUT' : 'POST';
      const url = editingTheme 
        ? `/api/admin/themes/${editingTheme._id}`
        : '/api/admin/themes';

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
        throw new Error(data.error || 'Failed to save theme');
      }

      setDialogOpen(false);
      setEditingTheme(null);
      setFormData({
        name: '',
        description: '',
        color: '#3f51b5',
        icon: 'category',
        priority: 0,
        minPhrases: 25
      });
      fetchThemes();
    } catch (err) {
      setError(err.message);
    }
  };

  const canEdit = user?.permissions?.themes?.update;
  const canDelete = user?.permissions?.themes?.delete;

  return (
    <AdminLayout title="Theme Management">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box mb={3} display="flex" gap={2} alignItems="center">
        <TextField
          placeholder="Search themes..."
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

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={fetchThemes} size="small">
          <RefreshIcon />
        </IconButton>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTheme(null);
            setFormData({
              name: '',
              description: '',
              color: '#3f51b5',
              icon: 'category',
              priority: 0,
              minPhrases: 25
            });
            setDialogOpen(true);
          }}
        >
          Add Theme
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Theme</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Color</TableCell>
              <TableCell align="center">Phrases</TableCell>
              <TableCell align="center">Priority</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {themes.map((theme) => (
              <TableRow key={theme._id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {theme.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {theme.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: theme.color,
                      border: '1px solid rgba(0,0,0,0.2)',
                      mx: 'auto'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <PhraseIcon fontSize="small" />
                    <Typography variant="body2">
                      {theme.phraseCount || 0}
                    </Typography>
                  </Box>
                  {theme.phraseCount < theme.minPhrases && (
                    <Typography variant="caption" color="error" display="block">
                      Min: {theme.minPhrases}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">{theme.priority}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={theme.isActive}
                    onChange={() => handleToggleActive(theme)}
                    disabled={!canEdit}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {canEdit && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(theme)}
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
                        onClick={() => handleDelete(theme._id)}
                        disabled={theme.phraseCount > 0}
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
          {editingTheme ? 'Edit Theme' : 'Add New Theme'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Theme Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              helperText="A short, descriptive name for the theme"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Optional description to explain what phrases belong in this theme"
            />

            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Theme Color
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: formData.color,
                    border: '1px solid rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColorPickerOpen(true)}
                />
                <TextField
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  size="small"
                  sx={{ width: 100 }}
                />
                <IconButton onClick={() => setColorPickerOpen(true)} size="small">
                  <PaletteIcon />
                </IconButton>
              </Box>
            </Box>

            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="Higher priority themes appear first (0-100)"
              inputProps={{ min: 0, max: 100 }}
            />

            <TextField
              label="Minimum Phrases"
              type="number"
              value={formData.minPhrases}
              onChange={(e) => setFormData({ ...formData, minPhrases: parseInt(e.target.value) || 1 })}
              fullWidth
              helperText="Minimum number of phrases required for this theme"
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingTheme ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)}>
        <DialogTitle>Choose Theme Color</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <HexColorPicker 
              color={formData.color} 
              onChange={(color) => setFormData({ ...formData, color })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}