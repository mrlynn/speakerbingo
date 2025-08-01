import { useState, useEffect } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  TextField,
  Grid,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Flag as FlagIcon,
  Visibility as ViewIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`moderation-tabpanel-${index}`}
      aria-labelledby={`moderation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ModerationPage() {
  const [tabValue, setTabValue] = useState(0);
  const [pendingPhrases, setPendingPhrases] = useState([]);
  const [flaggedPhrases, setFlaggedPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processingPhrase, setProcessingPhrase] = useState(null);

  useEffect(() => {
    fetchModerationItems();
  }, []);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [pendingRes, flaggedRes] = await Promise.all([
        fetch('/api/admin/phrases?status=pending&limit=50', { headers }),
        fetch('/api/admin/phrases?status=flagged&limit=50', { headers })
      ]);

      if (!pendingRes.ok || !flaggedRes.ok) {
        throw new Error('Failed to fetch moderation items');
      }

      const pendingData = await pendingRes.json();
      const flaggedData = await flaggedRes.json();

      setPendingPhrases(pendingData.phrases);
      setFlaggedPhrases(flaggedData.phrases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (phrase) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/phrases/${phrase._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve phrase');
      }

      fetchModerationItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    if (!processingPhrase || !rejectReason.trim()) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/phrases/${processingPhrase._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'rejected',
          flagReason: rejectReason 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject phrase');
      }

      setRejectDialogOpen(false);
      setRejectReason('');
      setProcessingPhrase(null);
      fetchModerationItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnflag = async (phrase) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/phrases/${phrase._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'approved',
          flagReason: null 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to unflag phrase');
      }

      fetchModerationItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const PhraseCard = ({ phrase, showFlagReason = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {phrase.text}
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip 
            label={phrase.category} 
            size="small" 
            variant="outlined"
          />
          {phrase.themes.map(theme => (
            <Chip
              key={theme._id}
              label={theme.name}
              size="small"
              style={{ backgroundColor: theme.color, color: '#fff' }}
            />
          ))}
        </Box>

        <Typography variant="body2" color="textSecondary">
          Created by: {phrase.createdBy?.fullName || 'Unknown'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {new Date(phrase.createdAt).toLocaleDateString()}
        </Typography>

        {showFlagReason && phrase.flagReason && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Flag reason:</strong> {phrase.flagReason}
            </Typography>
          </Alert>
        )}
      </CardContent>
      
      <CardActions>
        {phrase.status === 'pending' && (
          <>
            <Button
              startIcon={<ApproveIcon />}
              color="success"
              onClick={() => handleApprove(phrase)}
            >
              Approve
            </Button>
            <Button
              startIcon={<RejectIcon />}
              color="error"
              onClick={() => {
                setProcessingPhrase(phrase);
                setRejectDialogOpen(true);
              }}
            >
              Reject
            </Button>
          </>
        )}
        
        {phrase.status === 'flagged' && (
          <>
            <Button
              startIcon={<CheckCircle />}
              color="success"
              onClick={() => handleUnflag(phrase)}
            >
              Unflag & Approve
            </Button>
            <Button
              startIcon={<RejectIcon />}
              color="error"
              onClick={() => {
                setProcessingPhrase(phrase);
                setRejectDialogOpen(true);
              }}
            >
              Reject
            </Button>
          </>
        )}
        
        {phrase.history?.length > 0 && (
          <Button
            startIcon={<HistoryIcon />}
            onClick={() => {
              setSelectedPhrase(phrase);
              setHistoryDialogOpen(true);
            }}
          >
            History
          </Button>
        )}
      </CardActions>
    </Card>
  );

  return (
    <AdminLayout title="Content Moderation">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          aria-label="moderation tabs"
        >
          <Tab 
            label={
              <Badge badgeContent={pendingPhrases.length} color="warning">
                <Typography>Pending Review</Typography>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={flaggedPhrases.length} color="error">
                <Typography>Flagged Content</Typography>
              </Badge>
            } 
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {pendingPhrases.length === 0 ? (
            <Alert severity="info">
              No phrases pending review. All caught up!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {pendingPhrases.map(phrase => (
                <Grid item xs={12} md={6} lg={4} key={phrase._id}>
                  <PhraseCard phrase={phrase} />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {flaggedPhrases.length === 0 ? (
            <Alert severity="info">
              No flagged content to review.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {flaggedPhrases.map(phrase => (
                <Grid item xs={12} md={6} lg={4} key={phrase._id}>
                  <PhraseCard phrase={phrase} showFlagReason />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Phrase</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Please provide a reason for rejecting this phrase:
          </Typography>
          <Typography variant="h6" sx={{ my: 2 }}>
            "{processingPhrase?.text}"
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            helperText="This will be recorded for future reference"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectDialogOpen(false);
            setRejectReason('');
            setProcessingPhrase(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject Phrase
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Phrase History</DialogTitle>
        <DialogContent>
          {selectedPhrase && (
            <>
              <Typography variant="h6" gutterBottom>
                Current: {selectedPhrase.text}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {selectedPhrase.history?.map((entry, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Version ${entry.version}: ${entry.text}`}
                      secondary={
                        <>
                          Modified by {entry.modifiedBy?.fullName || 'Unknown'} on{' '}
                          {new Date(entry.modifiedAt).toLocaleString()}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}