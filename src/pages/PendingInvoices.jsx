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
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Switch,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MapIcon from '@mui/icons-material/Map';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaymentIcon from '@mui/icons-material/Payment';
import BusinessIcon from '@mui/icons-material/Business';
import CallIcon from '@mui/icons-material/Call';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tr from 'date-fns/locale/tr';

function PendingInvoices() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('ödeme alınmadı');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [saveEmailToCustomer, setSaveEmailToCustomer] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [editedJob, setEditedJob] = useState({
    description: '',
    note: '',
    isScheduled: false,
    scheduledDate: null
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updateCustomerEmail, setUpdateCustomerEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
      const response = await axios.get('/api/jobs/pending-invoice');
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
    setSelectedFile(null);
    setCustomerEmail('');
    setSaveEmailToCustomer(false);
    setPaymentStatus('ödeme alınmadı');
    setSendEmail(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadInvoice = async () => {
    try {
      console.log('Fatura yükleme başladı', {
        selectedFile,
        selectedJob,
        price: selectedJob?.price,
        hasVat: selectedJob?.hasVat,
        paymentStatus: selectedJob?.paymentStatus,
        paymentType: selectedJob?.paymentType,
        customerEmail,
        updateCustomerEmail,
        sendEmail
      });

      const formData = new FormData();
      if (selectedFile) {
        formData.append('invoice', selectedFile);
      }
      if (customerEmail) {
        formData.append('customerEmail', customerEmail);
        formData.append('updateCustomerEmail', updateCustomerEmail);
      }
      formData.append('price', selectedJob.price || 0);
      formData.append('hasVat', selectedJob.hasVat || false);
      formData.append('paymentStatus', selectedJob.paymentStatus || 'ödeme alınmadı');
      formData.append('paymentType', selectedJob.paymentType || 'ödeme alınmadı');
      formData.append('sendEmail', sendEmail);

      console.log('FormData içeriği:', {
        invoice: selectedFile?.name,
        customerEmail,
        updateCustomerEmail,
        price: selectedJob.price,
        hasVat: selectedJob.hasVat,
        paymentStatus: selectedJob.paymentStatus,
        paymentType: selectedJob.paymentType,
        sendEmail
      });

      const response = await axios.post(`/api/jobs/${selectedJob.id}/upload-invoice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Fatura yükleme yanıtı:', response.data);

      if (response.data) {
        setSnackbar({ 
          open: true, 
          message: selectedFile ? 'Fatura başarıyla yüklendi' : 'Fatura bilgileri kaydedildi', 
          severity: 'success' 
        });
        setOpenDialog(false);
        setSelectedFile(null);
        setCustomerEmail('');
        setUpdateCustomerEmail(false);
        setSendEmail(false);
        fetchJobs();
      }
    } catch (error) {
      console.error('Fatura yüklenirken hata:', error);
      setSnackbar({ 
        open: true, 
        message: selectedFile ? 'Fatura yüklenirken bir hata oluştu' : 'Fatura bilgileri kaydedilirken bir hata oluştu', 
        severity: 'error' 
      });
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

  const getFileUrl = (filePath, type) => {
    if (!filePath) return null;
    const filename = filePath.split(/[\/\\]/).pop();
    return `/api/files/${type}/${filename}`;
  };

  const handleNavigationClick = (event, address) => {
    event.stopPropagation();
    setSelectedAddress(address);
    setAnchorEl(event.currentTarget);
  };

  const handleNavigationClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (type) => {
    if (!selectedAddress) return;
    
    const encodedAddress = encodeURIComponent(selectedAddress);
    let url = '';
    
    switch (type) {
      case 'google':
        url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        break;
      case 'yandex':
        url = `yandexnavi://map?text=${encodedAddress}`;
        // Yandex Navigasyon yüklü değilse mağaza linki
        const fallbackUrl = `https://play.google.com/store/apps/details?id=ru.yandex.yandexnavi`;
        window.location.href = url;
        // Kısa bir süre sonra yönlendirme olmadıysa mağazaya yönlendir
        setTimeout(() => {
          window.location.href = fallbackUrl;
        }, 500);
        break;
      default:
        url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
    
    if (type === 'google') {
      window.open(url, '_blank');
    }
    handleNavigationClose();
  };

  const handleCopyAddress = (event, address) => {
    event.stopPropagation();
    navigator.clipboard.writeText(address).then(() => {
      setSnackbarOpen(true);
    });
  };

  const handleEditClick = (e, job) => {
    e.stopPropagation();
    setEditedJob({
      id: job.id,
      description: job.description || '',
      note: job.note || '',
      isScheduled: job.scheduledDate !== null,
      scheduledDate: job.scheduledDate ? new Date(job.scheduledDate) : new Date()
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`/api/jobs/${editedJob.id}`, {
        price: editedJob.price,
        hasVat: editedJob.hasVat,
        paymentStatus: editedJob.paymentStatus,
        paymentType: editedJob.paymentType
      });

      if (response.data) {
        setSnackbar({ 
          open: true, 
          message: 'İş başarıyla güncellendi', 
          severity: 'success' 
        });
        setEditDialogOpen(false);
        fetchJobs();
      }
    } catch (error) {
      console.error('İş güncellenirken hata:', error);
      setSnackbar({ 
        open: true, 
        message: 'İş güncellenirken bir hata oluştu', 
        severity: 'error' 
      });
    }
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
          Fatura Bekleyen İşler
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

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    size="small" 
                    label="Fatura Bekliyor"
                    color="info"
                  />
                  <Chip
                    size="small"
                    icon={<PaymentIcon sx={{ fontSize: '16px !important' }} />}
                    label={`${formatCurrency(job.price)}${job.hasVat ? ' (+KDV)' : ''}`}
                    sx={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.12)' }}
                  />
                  <Chip
                    size="small"
                    label={job.paymentStatus}
                    color={job.paymentStatus === 'ödeme alınmadı' ? 'error' : 'success'}
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
                  {formatDate(job.createdAt)}
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
                {searchQuery ? 'Aranan kriterlere uygun iş bulunamadı' : 'Fatura bekleyen iş bulunmuyor'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* İş Detay Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            '& .MuiDialogTitle-root': {
              px: 3,
              py: 2,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider'
            },
            '& .MuiDialogContent-root': {
              px: 3,
              py: 2,
              bgcolor: 'background.default'
            },
            '& .MuiDialogActions-root': {
              px: 3,
              py: 2,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider'
            }
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              İş Detayları
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Müşteri Bilgileri */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Müşteri Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedJob.customer?.name}
                    </Typography>
                  </Box>

                  {selectedJob.customer?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {selectedJob.customer.phone}
                      </Typography>
                    </Box>
                  )}

                  {selectedJob.customer?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {selectedJob.customer.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Fatura Bilgileri */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon fontSize="small" />
                  Fatura Bilgileri
                </Typography>
                <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedJob.customer?.invoiceAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Fatura Adresi: {selectedJob.customer.invoiceAddress}
                      </Typography>
                      <Tooltip title="Fatura Adresini Kopyala">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(selectedJob.customer.invoiceAddress);
                            setSnackbarMessage('Fatura adresi kopyalandı');
                            setSnackbarOpen(true);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {selectedJob.customer?.taxNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Vergi No: {selectedJob.customer.taxNumber}
                      </Typography>
                      <Tooltip title="Vergi Numarasını Kopyala">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(selectedJob.customer.taxNumber);
                            setSnackbarMessage('Vergi numarası kopyalandı');
                            setSnackbarOpen(true);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {selectedJob.customer?.taxOffice && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Vergi Dairesi: {selectedJob.customer.taxOffice}
                      </Typography>
                      <Tooltip title="Vergi Dairesini Kopyala">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(selectedJob.customer.taxOffice);
                            setSnackbarMessage('Vergi dairesi kopyalandı');
                            setSnackbarOpen(true);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* İş Detayları */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon fontSize="small" />
                  İş Detayları
                </Typography>
                <Box sx={{ pl: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {selectedJob.description}
                    </Typography>
                  </Box>

                  {/* Fiyat Bilgisi */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      size="small"
                      label="Fatura Bekliyor"
                      color="info"
                    />
                    <Chip
                      size="small"
                      icon={<PaymentIcon sx={{ fontSize: '16px !important' }} />}
                      label={`${formatCurrency(selectedJob.price)}${selectedJob.hasVat ? ' (+KDV)' : ''}`}
                      sx={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.12)' }}
                    />
                    <Chip
                      size="small"
                      label={selectedJob.paymentStatus}
                      color={selectedJob.paymentStatus === 'ödeme alınmadı' ? 'error' : 'success'}
                    />
                  </Box>

                  {selectedJob.note && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        İş Notu:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedJob.note}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Fiyat Bilgisi
                      </Typography>
                      <TextField
                        label="Fiyat"
                        type="number"
                        value={selectedJob.price || ''}
                        onChange={(e) => setSelectedJob({
                          ...selectedJob,
                          price: parseFloat(e.target.value)
                        })}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedJob.hasVat || false}
                            onChange={(e) => setSelectedJob({
                              ...selectedJob,
                              hasVat: e.target.checked
                            })}
                          />
                        }
                        label="KDV Dahil"
                      />
                      {selectedJob.price > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            icon={<PaymentIcon sx={{ fontSize: '16px !important' }} />}
                            label={`${formatCurrency(selectedJob.price)}${selectedJob.hasVat ? ' (+KDV)' : ''}`}
                            color="success"
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Ödeme Durumu</InputLabel>
                      <Select
                        value={selectedJob.paymentStatus || 'ödeme alınmadı'}
                        label="Ödeme Durumu"
                        onChange={(e) => setSelectedJob({
                          ...selectedJob,
                          paymentStatus: e.target.value,
                          paymentType: e.target.value === 'ödeme alınmadı' ? 'ödeme alınmadı' : selectedJob.paymentType
                        })}
                      >
                        <MenuItem value="ödeme alınmadı">Ödeme Alınmadı</MenuItem>
                        <MenuItem value="nakit">Nakit</MenuItem>
                        <MenuItem value="havale">Havale</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              {/* Fotoğraflar */}
              {selectedJob.photos?.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon fontSize="small" />
                    Fotoğraflar
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Grid container spacing={1}>
                      {selectedJob.photos.map((photo, index) => {
                        const photoUrl = getFileUrl(photo, 'photos');
                        return (
                          <Grid item xs={4} key={index}>
                            <Box
                              sx={{
                                position: 'relative',
                                paddingTop: '100%',
                                borderRadius: 1,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&:hover': {
                                  '& img': {
                                    transform: 'scale(1.05)'
                                  }
                                }
                              }}
                              onClick={() => window.open(photoUrl, '_blank')}
                            >
                              <img 
                                src={photoUrl}
                                alt={`İş fotoğrafı ${index + 1}`}
                                style={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.2s'
                                }}
                              />
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Box>
              )}

              {/* Yüklü Fatura */}
              {selectedJob.invoiceFile && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon fontSize="small" />
                    Yüklü Fatura
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => {
                        const invoiceUrl = getFileUrl(selectedJob.invoiceFile, 'invoices');
                        window.open(invoiceUrl, '_blank');
                      }}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      Faturayı Görüntüle
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Fatura Yükleme */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon fontSize="small" />
                  Fatura Yükleme
                </Typography>
                <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {!selectedJob.customer?.email && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          label="Müşteri E-posta (Opsiyonel)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          fullWidth
                          type="email"
                          size="small"
                        />
                        {customerEmail && (
                          <Tooltip title="E-postayı Kopyala">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(customerEmail);
                                setSnackbarMessage('E-posta adresi kopyalandı');
                                setSnackbarOpen(true);
                              }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={updateCustomerEmail}
                            onChange={(e) => setUpdateCustomerEmail(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Bu mail adresini müşteri bilgilerine kaydet"
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<DescriptionIcon />}
                      sx={{ flexGrow: 1 }}
                    >
                      Fatura Seç
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        id="invoice-file"
                      />
                    </Button>
                    {selectedFile && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedFile.name}
                      </Typography>
                    )}
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                      />
                    }
                    label="Faturayı müşteriye mail olarak gönder"
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleUploadInvoice}
            variant="contained"
          >
            {selectedFile ? 'Faturayı Yükle' : 'Bilgileri Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>İşi Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Açıklama"
              value={editedJob.description}
              onChange={(e) => setEditedJob(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />
            
            <TextField
              label="Not"
              value={editedJob.note}
              onChange={(e) => setEditedJob(prev => ({ ...prev, note: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editedJob.isScheduled}
                  onChange={(e) => setEditedJob(prev => ({
                    ...prev,
                    isScheduled: e.target.checked,
                    scheduledDate: e.target.checked ? prev.scheduledDate || new Date() : null
                  }))}
                />
              }
              label="Zamanlayıcı"
            />

            {editedJob.isScheduled && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DateTimePicker
                  label="Zamanlanan Tarih/Saat"
                  value={editedJob.scheduledDate}
                  onChange={(newValue) => setEditedJob(prev => ({
                    ...prev,
                    scheduledDate: newValue
                  }))}
                  minDateTime={new Date()}
                  format="dd/MM/yyyy HH:mm"
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button onClick={handleEditSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Navigasyon Menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleNavigationClose}
        PaperProps={{
          sx: {
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => handleNavigate('yandex')}>
          Yandex Navigasyon
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('google')}>
          Google Maps
        </MenuItem>
      </Menu>

      {/* Kopyalama Bildirimi */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
}

export default PendingInvoices; 