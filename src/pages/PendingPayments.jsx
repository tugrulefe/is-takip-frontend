import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';

function PendingPayments() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter(job => {
      const searchLower = searchQuery.toLowerCase();
      return (
        job.customer?.name?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs/pending-payment');
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('İşler yüklenirken hata:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setPaymentStatus(job.paymentStatus || '');
    setPaidAmount('');
    setOpenDialog(true);
  };

  const handlePaymentStatusChange = async () => {
    try {
      if (!paidAmount || isNaN(parseFloat(paidAmount))) {
        setSnackbarMessage('Lütfen geçerli bir ödeme miktarı girin');
        setSnackbarOpen(true);
        return;
      }

      await axios.put(`/api/jobs/${selectedJob.id}/payment-status`, {
        paymentStatus,
        paidAmount: parseFloat(paidAmount)
      });
      setSnackbarMessage('Ödeme durumu güncellendi');
      setSnackbarOpen(true);
      setOpenDialog(false);
      fetchJobs();
    } catch (error) {
      console.error('Ödeme durumu güncellenirken hata:', error);
      setSnackbarMessage(error.response?.data?.message || 'Hata: Ödeme durumu güncellenemedi');
      setSnackbarOpen(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const calculatePriceWithVat = (price, hasVat) => {
    if (!price) return 0;
    return hasVat ? price * 1.20 : price; // KDV %20
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Ödeme Bekleyen İşler
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="İş veya müşteri ara..."
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ 
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'white',
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredJobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }
              }}
              onClick={() => handleJobClick(job)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    {job.customer?.name}
                  </Typography>
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {job.description}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Tutar: {formatCurrency(calculatePriceWithVat(job.price, job.hasVat))}
                    {job.hasVat && <span style={{ marginLeft: '4px' }}>(KDV Dahil)</span>}
                  </Typography>
                  {job.paidAmount > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Ödenen: {formatCurrency(job.paidAmount)}
                    </Typography>
                  )}
                  {calculatePriceWithVat(job.price, job.hasVat) - (job.paidAmount || 0) > 0 && (
                    <Typography variant="body2" color="error">
                      Kalan: {formatCurrency(calculatePriceWithVat(job.price, job.hasVat) - (job.paidAmount || 0))}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip 
                    size="small" 
                    label={job.paidAmount > 0 && job.paidAmount < job.price ? "Kısmi Ödeme Yapıldı" : job.paymentStatus === 'ödeme alınmadı' ? "Ödeme Bekliyor" : job.paymentStatus === 'nakit' ? "Nakit Ödeme" : "Havale"}
                    color={job.paidAmount > 0 && job.paidAmount < job.price ? "warning" : job.paymentStatus === 'ödeme alınmadı' ? "error" : "success"}
                    icon={<PaymentIcon />}
                  />
                </Box>

                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mt: 2 
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {formatDate(job.completedAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredJobs.length === 0 && (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}
            >
              <Typography color="text.secondary">
                {searchQuery ? 'Aranan kriterlere uygun iş bulunamadı' : 'Ödeme bekleyen iş bulunmuyor'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Ödeme Durumu Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Ödeme Durumunu Güncelle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedJob && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Toplam Tutar: {selectedJob.price && formatCurrency(calculatePriceWithVat(selectedJob.price, selectedJob.hasVat))}
                  {selectedJob.hasVat && <span style={{ marginLeft: '4px' }}>(KDV Dahil)</span>}
                </Typography>
                {selectedJob.paidAmount > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Önceki Ödeme: {formatCurrency(selectedJob.paidAmount)}
                  </Typography>
                )}
                <Typography variant="body2" color="error">
                  Kalan Tutar: {selectedJob.price && formatCurrency(calculatePriceWithVat(selectedJob.price, selectedJob.hasVat) - (selectedJob.paidAmount || 0))}
                </Typography>
              </>
            )}
            <TextField
              label="Ödeme Miktarı"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Ödeme Türü</InputLabel>
              <Select
                value={paymentStatus}
                label="Ödeme Türü"
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <MenuItem value="nakit">Nakit</MenuItem>
                <MenuItem value="havale">Havale</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            İptal
          </Button>
          <Button 
            onClick={handlePaymentStatusChange}
            variant="contained"
            disabled={!paymentStatus || !paidAmount}
          >
            Ödemeyi Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
}

export default PendingPayments; 