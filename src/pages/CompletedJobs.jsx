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
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  Switch,
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import CallIcon from '@mui/icons-material/Call';
import axios from 'axios';

function CompletedJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchCompletedJobs();
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

  const fetchCompletedJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      const completedJobs = response.data.filter(job => job.status === 'tamamlandı');
      setJobs(completedJobs);
      setFilteredJobs(completedJobs);
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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedJob({
      ...selectedJob,
      price: selectedJob.price || '',
      hasVat: selectedJob.hasVat || false,
      paymentStatus: selectedJob.paymentStatus || 'ödeme alınmadı'
    });
  };

  const handleEditSave = async () => {
    try {
      // Önce iş bilgilerini güncelle
      await axios.put(`/api/jobs/${selectedJob.id}/status`, {
        status: 'tamamlandı',
        price: editedJob.price,
        hasVat: editedJob.hasVat,
        paymentStatus: editedJob.paymentStatus
      });

      // Eğer yeni fatura seçildiyse, onu da yükle
      if (selectedFile) {
        const formData = new FormData();
        formData.append('invoice', selectedFile);
        formData.append('paymentStatus', editedJob.paymentStatus);
        
        await axios.post(`/api/jobs/${selectedJob.id}/invoice`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSnackbarMessage('İş başarıyla güncellendi');
      setSnackbarOpen(true);
      setIsEditing(false);
      setSelectedFile(null);
      fetchCompletedJobs();
    } catch (error) {
      console.error('İş güncellenirken hata:', error);
      setSnackbarMessage('İş güncellenirken bir hata oluştu');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteInvoice = async () => {
    try {
      await axios.delete(`/api/jobs/${selectedJob.id}/invoice`);
      setSnackbarMessage('Fatura başarıyla silindi');
      setSnackbarOpen(true);
      fetchCompletedJobs();
    } catch (error) {
      console.error('Fatura silinirken hata:', error);
      setSnackbarMessage('Fatura silinirken bir hata oluştu');
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Tamamlanmış İşler
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
                    label="Tamamlandı"
                    color="success"
                  />
                  <Chip 
                    size="small" 
                    label={
                      job.paymentStatus === 'ödeme alınmadı' ? 'Ödeme Bekliyor' : 
                      job.paymentStatus === 'nakit' ? 'Nakit ile Ödendi' : 
                      job.paymentStatus === 'havale' ? 'Havale ile Ödendi' : 
                      'Ödeme Durumu Belirsiz'
                    }
                    color={job.paymentStatus === 'ödeme alınmadı' ? 'error' : 'success'}
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
                {searchQuery ? 'Aranan kriterlere uygun iş bulunamadı' : 'Henüz tamamlanmış iş bulunmuyor'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* İş Detay Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setIsEditing(false);
          setSelectedFile(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ mr: 1 }} />
              <Typography variant="h6">İş Detayları</Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={handleEditClick}
              startIcon={<EditIcon />}
              disabled={isEditing}
            >
              Düzenle
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Müşteri Bilgileri */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  Müşteri Bilgileri
                </Typography>
                <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedJob.customer?.name}
                  </Typography>
                  {selectedJob.customer?.authorizedPerson && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedJob.customer.authorizedPerson}
                      </Typography>
                    </Box>
                  )}
                  {selectedJob.customer?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
                        {selectedJob.customer.phone}
                      </Typography>
                      <Tooltip title="Ara">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${selectedJob.customer.phone}`;
                          }}
                        >
                          <CallIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Telefonu Kopyala">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(selectedJob.customer.phone);
                            setSnackbarMessage('Telefon numarası kopyalandı');
                            setSnackbarOpen(true);
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {selectedJob.customer?.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
                        {selectedJob.customer.address}
                      </Typography>
                      <Tooltip title="Adresi Kopyala">
                        <IconButton
                          size="small"
                          onClick={(e) => handleCopyAddress(e, selectedJob.customer.address)}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Navigasyon">
                        <IconButton
                          size="small"
                          onClick={(e) => handleNavigationClick(e, selectedJob.customer.address)}
                        >
                          <MapIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {selectedJob.customer?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Fatura Adresi: {selectedJob.customer.invoiceAddress}
                      </Typography>
                    </Box>
                  )}
                  {selectedJob.customer?.taxNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Vergi No: {selectedJob.customer.taxNumber}
                      </Typography>
                    </Box>
                  )}
                  {selectedJob.customer?.taxOffice && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Vergi Dairesi: {selectedJob.customer.taxOffice}
                      </Typography>
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
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {selectedJob.description}
                  </Typography>

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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        Fiyat Bilgisi
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => setEditedJob({
                          ...editedJob,
                          price: selectedJob.price || 0,
                          hasVat: selectedJob.hasVat || false
                        })}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {editedJob ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Fiyat"
                          type="number"
                          value={editedJob.price || 0}
                          onChange={(e) => setEditedJob({ ...editedJob, price: parseFloat(e.target.value) })}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={editedJob.hasVat || false}
                              onChange={(e) => setEditedJob({ ...editedJob, hasVat: e.target.checked })}
                              size="small"
                            />
                          }
                          label="KDV Dahil"
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            onClick={() => setEditedJob(null)}
                          >
                            İptal
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={async () => {
                              try {
                                await axios.put(`/api/jobs/${selectedJob.id}/status`, {
                                  price: editedJob.price,
                                  hasVat: editedJob.hasVat
                                });
                                setSnackbarMessage('Fiyat başarıyla güncellendi');
                                setSnackbarOpen(true);
                                setEditedJob(null);
                                fetchCompletedJobs();
                              } catch (error) {
                                console.error('Fiyat güncellenirken hata:', error);
                                setSnackbarMessage('Fiyat güncellenirken bir hata oluştu');
                                setSnackbarOpen(true);
                              }
                            }}
                          >
                            Kaydet
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {selectedJob.price ? (
                            parseFloat(selectedJob.price).toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                          ) : '0.00'} TL
                        </Typography>
                        {selectedJob.hasVat && (
                          <Chip 
                            size="small" 
                            label="+ KDV" 
                            color="secondary"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                        <Chip 
                          size="small" 
                          label={selectedJob.paymentStatus === 'nakit' ? 'Nakit' : selectedJob.paymentStatus === 'havale' ? 'Havale' : 'Ödeme Alınmadı'}
                          color={selectedJob.paymentStatus === 'ödeme alınmadı' ? 'error' : 'success'}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Fotoğraflar */}
              {selectedJob.photos?.length > 0 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1">Fotoğraflar</Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1, ml: 4 }}>
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
                    }
                  />
                </ListItem>
              )}

              {/* Fatura */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon fontSize="small" />
                  Fatura
                </Typography>
                <Box sx={{ pl: 3 }}>
                  {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedJob.invoiceFile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            onClick={() => {
                              const invoiceUrl = getFileUrl(selectedJob.invoiceFile, 'invoices');
                              window.open(invoiceUrl, '_blank');
                            }}
                          >
                            Mevcut Faturayı Görüntüle
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteInvoice}
                          >
                            Faturayı Sil
                          </Button>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<DescriptionIcon />}
                          sx={{ flexGrow: 1 }}
                        >
                          {selectedJob.invoiceFile ? 'Faturayı Değiştir' : 'Fatura Yükle'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {selectedFile && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    selectedJob.invoiceFile && (
                      <Button
                        variant="outlined"
                        startIcon={<ReceiptIcon />}
                        onClick={() => {
                          const invoiceUrl = getFileUrl(selectedJob.invoiceFile, 'invoices');
                          window.open(invoiceUrl, '_blank');
                        }}
                      >
                        Faturayı Görüntüle
                      </Button>
                    )
                  )}
                </Box>
              </Box>

              {/* Tarih Bilgileri */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" />
                  Tarih Bilgileri
                </Typography>
                <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>İş Kaydı Açılış:</strong> {formatDate(selectedJob.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>Tamamlanma:</strong> {formatDate(selectedJob.completedAt)}
                  </Typography>
                </Box>
              </Box>

              {isEditing && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ödeme Durumu</InputLabel>
                    <Select
                      value={editedJob.paymentStatus}
                      label="Ödeme Durumu"
                      onChange={(e) => setEditedJob({ ...editedJob, paymentStatus: e.target.value })}
                    >
                      <MenuItem value="ödeme alınmadı">Ödeme Alınmadı</MenuItem>
                      <MenuItem value="nakit">Nakit</MenuItem>
                      <MenuItem value="havale">Havale</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {isEditing ? (
            <>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={handleEditSave}
                variant="contained"
              >
                Kaydet
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenDialog(false)}>Kapat</Button>
          )}
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

export default CompletedJobs; 