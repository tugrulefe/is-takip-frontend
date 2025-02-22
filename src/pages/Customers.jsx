import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Fab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    authorizedPerson: '',
    invoiceAddress: '',
    taxNumber: '',
    taxOffice: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Arama sorgusuna göre müşterileri filtrele
    const searchTerm = searchQuery.toLowerCase().trim();
    
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => {
      const searchFields = [
        customer.name,
        customer.phone,
        customer.email,
        customer.authorizedPerson,
        customer.taxNumber,
        customer.taxOffice,
        customer.address,
        customer.invoiceAddress
      ];
      
      return searchFields.some(field => 
        field?.toString().toLowerCase().includes(searchTerm)
      );
    });
    
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setEditMode(false);
    setEditingCustomer(null);
    setDeleteConfirmOpen(false);
  };

  const handleNewCustomerDialogOpen = () => {
    setOpenNewCustomerDialog(true);
  };

  const handleNewCustomerDialogClose = () => {
    setOpenNewCustomerDialog(false);
    setNewCustomer({
      name: '',
      address: '',
      phone: '',
      email: '',
      authorizedPerson: '',
      invoiceAddress: '',
      taxNumber: '',
      taxOffice: ''
    });
  };

  const handleCreateCustomer = async () => {
    try {
      await axios.post('/api/customers', newCustomer);
      handleNewCustomerDialogClose();
      fetchCustomers();
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditMode(true);
    setEditingCustomer({
      id: selectedCustomer.id,
      name: selectedCustomer.name,
      address: selectedCustomer.address,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email,
      authorizedPerson: selectedCustomer.authorizedPerson,
      invoiceAddress: selectedCustomer.invoiceAddress,
      taxNumber: selectedCustomer.taxNumber,
      taxOffice: selectedCustomer.taxOffice
    });
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`/api/customers/${editingCustomer.id}`, editingCustomer);
      setEditMode(false);
      setEditingCustomer(null);
      fetchCustomers();
      handleCloseDialog();
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/customers/${selectedCustomer.id}`);
      setDeleteConfirmOpen(false);
      handleCloseDialog();
      fetchCustomers();
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
    }
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

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Müşteriler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewCustomerDialogOpen}
          sx={{ 
            borderRadius: 28,
            px: 4,
            py: 1,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          Yeni Müşteri
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Müşteri ara... (İsim, telefon veya e-posta)"
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
        {filteredCustomers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} key={customer.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }
              }}
              onClick={() => handleCustomerClick(customer)}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' }, 
                  mb: 2 
                }}>
                  <Typography variant="h6" gutterBottom={false} sx={{ 
                    textTransform: 'uppercase',
                    mb: { xs: 1, sm: 0 }
                  }}>
                    {customer.name}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex',
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                  }}>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                        handleDeleteClick(e);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: { xs: 0.5, sm: 1 }
                  }}>
                    <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {customer.phone || 'Telefon yok'}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: { xs: 0.5, sm: 1 }
                  }}>
                    <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {customer.email || 'E-posta yok'}
                    </Typography>
                  </Box>

                  {customer.address && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: { xs: 0.5, sm: 1 }
                    }}>
                      <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                        {customer.address}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5,
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                        mt: { xs: 1, sm: 0 }
                      }}>
                        <Tooltip title="Adresi Kopyala">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleCopyAddress(e, customer.address)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.dark'
                              }
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Navigasyonda Aç">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleNavigationClick(e, customer.address)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.dark'
                              }
                            }}
                          >
                            <MapIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </Box>

                {customer.jobs && (
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      size="small" 
                      label={`${customer.jobs.length} İş Kaydı`}
                      sx={{ 
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredCustomers.length === 0 && (
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }}
            >
              <Typography color="text.secondary">
                {searchQuery ? 'Aranan kriterlere uygun müşteri bulunamadı' : 'Henüz müşteri eklenmemiş'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Müşteri Detay Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              Müşteri Detayları
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCustomer && !editMode && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ textTransform: 'uppercase' }}>
                  {selectedCustomer.name}
                </Typography>
                {selectedCustomer.authorizedPerson && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Yetkili: <Box component="span" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedCustomer.authorizedPerson}</Box>
                    </Typography>
                  </Box>
                )}

                {/* Fatura Bilgileri */}
                {selectedCustomer.invoiceAddress && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary', mt: 0.5 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      Fatura Adresi: {selectedCustomer.invoiceAddress}
                    </Typography>
                    <Tooltip title="Fatura Adresini Kopyala">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAddress(e, selectedCustomer.invoiceAddress);
                        }}
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {selectedCustomer.taxNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      Vergi No: {selectedCustomer.taxNumber}
                    </Typography>
                    <Tooltip title="Vergi Numarasını Kopyala">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(selectedCustomer.taxNumber);
                          setSnackbarOpen(true);
                        }}
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {selectedCustomer.taxOffice && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      Vergi Dairesi: {selectedCustomer.taxOffice}
                    </Typography>
                    <Tooltip title="Vergi Dairesini Kopyala">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(selectedCustomer.taxOffice);
                          setSnackbarOpen(true);
                        }}
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.dark'
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <LocationOnIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{selectedCustomer.address}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate('google');
                    }}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    <MapIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip 
                    icon={<PhoneIcon />} 
                    label={selectedCustomer.phone} 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    icon={<EmailIcon />} 
                    label={selectedCustomer.email} 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Geçmiş İşler
              </Typography>
              <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                {selectedCustomer.jobs?.map((job) => (
                  <React.Fragment key={job.id}>
                    <ListItem>
                      <ListItemText
                        primary={job.description}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={job.status} 
                              size="small"
                              color={job.status === 'tamamlandı' ? 'success' : 'default'}
                            />
                            <Chip 
                              label={job.priority} 
                              size="small"
                              color={
                                job.priority === 'çok önemli' ? 'error' :
                                job.priority === 'önemli' ? 'warning' : 'default'
                              }
                            />
                            <Chip 
                              label={
                                job.paymentStatus === 'ödeme alınmadı' ? 'Ödeme Bekliyor' : 
                                job.paymentStatus === 'nakit' ? 'Nakit ile Ödendi' : 
                                job.paymentStatus === 'havale' ? 'Havale ile Ödendi' : 
                                'Ödeme Durumu Belirsiz'
                              }
                              size="small"
                              color={job.paymentStatus === 'ödeme alınmadı' ? 'error' : 'success'}
                              icon={<PaymentIcon />}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {(!selectedCustomer.jobs || selectedCustomer.jobs.length === 0) && (
                  <ListItem>
                    <ListItemText 
                      primary="Henüz iş kaydı bulunmuyor" 
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </>
          )}
          {editMode && editingCustomer && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Müşteri Adı"
                value={editingCustomer.name}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Adres"
                value={editingCustomer.address}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Yetkili Kişi"
                value={editingCustomer.authorizedPerson}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, authorizedPerson: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Telefon"
                value={editingCustomer.phone}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Fatura Adresi"
                value={editingCustomer.invoiceAddress}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, invoiceAddress: e.target.value })}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Vergi No"
                value={editingCustomer.taxNumber}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, taxNumber: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Vergi Dairesi"
                value={editingCustomer.taxOffice}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, taxOffice: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="E-posta"
                value={editingCustomer.email}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {!editMode ? (
            <>
              <Button onClick={handleCloseDialog}>Kapat</Button>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={handleEditClick}
              >
                Düzenle
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditMode(false)}>İptal</Button>
              <Button 
                variant="contained"
                onClick={handleEditSave}
              >
                Kaydet
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" color="error">
            Müşteriyi Sil
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedCustomer?.name}</strong> isimli müşteriyi silmek istediğinizden emin misiniz?
          </Typography>
          <Typography color="error" sx={{ mt: 2, fontSize: '0.875rem' }}>
            Bu işlem geri alınamaz ve müşteriye ait tüm iş kayıtları da silinecektir.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Müşteri Dialog */}
      <Dialog 
        open={openNewCustomerDialog} 
        onClose={handleNewCustomerDialogClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              Yeni Müşteri Ekle
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Müşteri Adı"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Adres"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Yetkili Kişi"
              value={newCustomer.authorizedPerson}
              onChange={(e) => setNewCustomer({ ...newCustomer, authorizedPerson: e.target.value })}
              fullWidth
            />
            <TextField
              label="Telefon"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Fatura Adresi"
              value={newCustomer.invoiceAddress}
              onChange={(e) => setNewCustomer({ ...newCustomer, invoiceAddress: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Vergi No"
              value={newCustomer.taxNumber}
              onChange={(e) => setNewCustomer({ ...newCustomer, taxNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Vergi Dairesi"
              value={newCustomer.taxOffice}
              onChange={(e) => setNewCustomer({ ...newCustomer, taxOffice: e.target.value })}
              fullWidth
            />
            <TextField
              label="E-posta"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              fullWidth
              type="email"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleNewCustomerDialogClose}>
            İptal
          </Button>
          <Button 
            onClick={handleCreateCustomer} 
            variant="contained"
            startIcon={<AddIcon />}
          >
            Oluştur
          </Button>
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
        message="Adres kopyalandı"
      />
    </div>
  );
}

export default Customers; 