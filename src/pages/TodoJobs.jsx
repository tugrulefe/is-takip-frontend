import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  Fab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  DialogContentText,
  Autocomplete,
  Stack,
  Chip,
  Menu,
  Tooltip,
  Snackbar,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Switch,
  Radio,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import WorkIcon from '@mui/icons-material/Work';
import MapIcon from '@mui/icons-material/Map';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, createNote } from '../store/noteSlice';
import DraggableNote from '../components/DraggableNote';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import tr from 'date-fns/locale/tr';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CallIcon from '@mui/icons-material/Call';
import AlarmIcon from '@mui/icons-material/Alarm';

function TodoJobs() {
  const [jobs, setJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNewJobDialog, setOpenNewJobDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [newJob, setNewJob] = useState({
    customerId: null,
    description: '',
    isScheduled: false,
    scheduledDate: new Date()
  });
  const [editJob, setEditJob] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const notes = useSelector(state => state.notes.notes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: '#f5f5f5',
    isReminder: false,
    reminderDate: new Date(),
    isPinned: false
  });
  const [noteColor, setNoteColor] = useState('#f5f5f5');
  const [noteContent, setNoteContent] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    fetchJobs();
    fetchPendingJobs();
    fetchCustomers();
    if (JSON.parse(localStorage.getItem('user'))?.role === 'admin') {
      dispatch(fetchNotes());
    }
  }, [dispatch]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs/todo');
      setJobs(response.data);
    } catch (error) {
      console.error('İşler yüklenirken hata:', error);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const response = await axios.get('/api/jobs/pending');
      setPendingJobs(response.data);
    } catch (error) {
      console.error('Bekleyen işler yüklenirken hata:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setOpenDialog(true);
  };

  const handleEditClick = (e, job) => {
    e.stopPropagation();
    const updatedJob = {
      ...job,
      customerId: job.customerId,
      description: job.description,
      status: job.status || 'yapılacak',
      price: job.price || 0,
      hasVat: job.hasVat || false,
      paymentStatus: job.paymentStatus || 'ödeme alınmadı',
      paymentType: job.paymentType || 'ödeme alınmadı',
      note: job.note || '',
      isScheduled: job.scheduledDate !== null,
      scheduledDate: job.scheduledDate ? new Date(job.scheduledDate) : new Date()
    };
    setEditJob(updatedJob);
    setEditingJob(updatedJob);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (e, job) => {
    e.stopPropagation();
    setSelectedJob(job);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
    setSelectedFiles([]);
  };

  const handleNewJobDialogOpen = () => {
    setOpenNewJobDialog(true);
  };

  const handleNewJobDialogClose = () => {
    setOpenNewJobDialog(false);
    setNewJob({
      customerId: null,
      description: '',
      isScheduled: false,
      scheduledDate: new Date()
    });
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const totalFiles = selectedFiles.length + newFiles.length;
    
    if (totalFiles <= 5) {
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    } else {
      alert('En fazla 5 fotoğraf yükleyebilirsiniz');
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;

    try {
        // Fotoğraf varsa yükle
        if (selectedFiles.length > 0) {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('photos', file);
            });
            await axios.post(`/api/jobs/${selectedJob.id}/photos`, formData);
        }

        // İş durumunu güncelle
        await axios.put(`/api/jobs/${selectedJob.id}/status`, {
            status: 'fatura bekliyor',
            price: selectedJob.price || 0,
            hasVat: selectedJob.hasVat || false,
            customerEmail: selectedJob.customer?.email || '',
            updateCustomerEmail: false,
            paymentStatus: selectedJob.paymentStatus || 'ödeme alınmadı',
            paymentType: selectedJob.paymentType || 'ödeme alınmadı',
            note: selectedJob.note || ''
        });

        handleCloseDialog();
        fetchJobs();
    } catch (error) {
        console.error('İş tamamlanırken hata:', error);
        setSnackbarMessage('İş tamamlanırken bir hata oluştu');
        setSnackbarOpen(true);
    }
  };

  const handleCreateJob = async () => {
    try {
      await axios.post('/api/jobs', {
        ...newJob,
        scheduledDate: newJob.isScheduled ? newJob.scheduledDate : null
      });
      handleNewJobDialogClose();
      fetchPendingJobs();
    } catch (error) {
      console.error('İş oluşturulurken hata:', error);
    }
  };

  const handleEditSave = async () => {
    try {
      if (!editJob) {
        console.error('Düzenlenecek iş bulunamadı');
        return;
      }

      const response = await axios.put(`/api/jobs/${editJob.id}/status`, {
        customerId: editJob.customerId,
        description: editJob.description,
        status: editJob.status || 'yapılacak',
        price: editJob.price || 0,
        hasVat: editJob.hasVat || false,
        paymentStatus: editJob.paymentStatus || 'ödeme alınmadı',
        paymentType: editJob.paymentType || 'ödeme alınmadı',
        note: editJob.note || '',
        scheduledDate: editJob.isScheduled ? editJob.scheduledDate : null
      });

      if (response.data) {
        await fetchJobs();
        await fetchPendingJobs();
        setOpenEditDialog(false);
        setEditJob(null);
      }
    } catch (error) {
      console.error('İş güncellenirken hata:', error);
      alert('İş güncellenirken bir hata oluştu: ' + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/jobs/${selectedJob.id}`);
      setOpenDeleteDialog(false);
      fetchJobs();
      fetchPendingJobs();
    } catch (error) {
      console.error('İş silinirken hata:', error);
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
      setSnackbarMessage('Adres kopyalandı');
      setSnackbarOpen(true);
    });
  };

  const priorityColors = {
    'çok önemli': '#ffebee',
    'önemli': '#fff3e0',
    'az önemli': '#f1f8e9'
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(jobs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Yeni sıralamayı state'e uygula
    setJobs(items);

    // Yeni sıralamayı veritabanına kaydet
    try {
      const jobOrders = items.reduce((acc, job, index) => {
        acc[job.id] = index;
        return acc;
      }, {});

      await axios.put('/api/jobs/reorder', { jobOrders });
    } catch (error) {
      console.error('Sıralama güncellenirken hata:', error);
    }
  };

  const handleMoveToTodo = async (jobId, newStatus = 'yapılacak') => {
    try {
      await axios.put(`/api/jobs/${jobId}/status`, {
        status: newStatus
      });
      fetchJobs();
      fetchPendingJobs();
    } catch (error) {
      console.error('İş durumu güncellenirken hata:', error);
    }
  };

  const handleAddNote = () => {
    if (newNote.title.trim()) {
      dispatch(createNote(newNote));
      setIsAddingNote(false);
      setNewNote({
        title: '',
        content: '',
        color: '#f5f5f5',
        isReminder: false,
        reminderDate: new Date(),
        isPinned: false
      });
    }
  };

  // Notları sabitlenmiş ve sabitlenmemiş olarak sırala
  const sortedNotes = [...notes]
    .filter(note => note.showInJobList)  // Sadece iş listesinde gösterilecek notları filtrele
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ 
        flex: 1,
        p: 2
      }}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
              Yapılacak İşler
            </Typography>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="jobs">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {jobs.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleJobClick(job)}
                            sx={{ 
                              mb: 0.5,
                              cursor: isDragMode ? 'grab' : 'pointer',
                              '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <CardContent sx={{ p: '8px', '&:last-child': { pb: '8px' } }}>
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' }, 
                                alignItems: { xs: 'flex-start', sm: 'center' }, 
                                gap: { xs: 1, sm: 1 }
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 'bold', 
                                  minWidth: { sm: '150px' },
                                  width: { xs: '100%', sm: 'auto' }
                                }}>
                                  {job.customer?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                  minWidth: { sm: '150px' },
                                  width: { xs: '100%', sm: 'auto' }
                                }}>
                                  {job.customer?.address}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ 
                                  flex: 1,
                                  width: { xs: '100%', sm: 'auto' }
                                }}>
                                  {job.description}
                                </Typography>
                                {job.customer?.phone && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
                                      {job.customer.phone}
                                    </Typography>
                                    <Tooltip title="Ara">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.location.href = `tel:${job.customer.phone}`;
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
                                          navigator.clipboard.writeText(job.customer.phone);
                                          setSnackbarMessage('Telefon numarası kopyalandı');
                                          setSnackbarOpen(true);
                                        }}
                                      >
                                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  minWidth: { sm: '150px' },
                                  width: { xs: '100%', sm: 'auto' }
                                }}>
                                  <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                  {formatDate(job.createdAt)}
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: 0.5,
                                  width: { xs: '100%', sm: 'auto' },
                                  justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                                }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(e, job);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(e, job);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveToTodo(job.id, 'beklemede');
                                    }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              backgroundColor: '#f5f5f5', 
              pt: 0.5,
              px: 2,
              pb: 2,
              borderRadius: 2,
              minHeight: 'auto',
              mt: 12,
              mb: 2
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 0.5, pt: 1 }}>
                Bekleyen İşler
              </Typography>
              
              {pendingJobs.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {pendingJobs.map((job) => (
                    <Card key={job.id} sx={{ 
                      mb: 0.5,
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease'
                    }}>
                      <CardContent sx={{ p: '8px', '&:last-child': { pb: '8px' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '150px' }}>
                            {job.customer?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                            {job.customer?.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                            {job.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '120px' }}>
                            {job.customer?.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', minWidth: '150px' }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {formatDate(job.createdAt)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(e, job);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(e, job);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToTodo(job.id);
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Bekleyen iş bulunmuyor
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleNewJobDialogOpen}
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
                  Yeni İş Ekle
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Notlar bölümü */}
      {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
        <Box sx={{ 
          position: 'fixed',
          right: 0,
          top: 64,
          bottom: 0,
          width: '400px',
          overflowY: 'auto',
          backgroundColor: 'background.default',
          p: 2,
          zIndex: 1
        }}>
          <Grid container spacing={2}>
            {sortedNotes?.map(note => (
              <Grid item xs={12} key={note.id}>
                <DraggableNote note={note} expanded={false} />
              </Grid>
            ))}
          </Grid>

          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setIsAddingNote(true)}
          >
            <AddIcon />
          </Fab>
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1 }} />
            <Typography variant="h6">İş Detayları</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <Stack spacing={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}
              >
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
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  İş Detayları
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                    <Typography>{selectedJob.description}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(selectedJob.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Fotoğraf ve Fiyat Bilgileri
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Fiyat Bilgisi
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={selectedJob?.price || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              setSelectedJob({
                                ...selectedJob,
                                price: parseFloat(value.toFixed(2))
                              });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                            inputProps: { min: 0, step: 0.01 }
                          }}
                          sx={{ width: '200px' }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedJob?.hasVat}
                              onChange={(e) => setSelectedJob({ ...selectedJob, hasVat: e.target.checked })}
                            />
                          }
                          label="KDV Dahil"
                        />
                      </Box>
                      <FormControl component="fieldset">
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Ödeme Durumu
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={selectedJob?.paymentStatus === 'nakit'}
                                onChange={(e) => setSelectedJob({ 
                                  ...selectedJob, 
                                  paymentStatus: 'nakit',
                                  paymentType: 'nakit'
                                })}
                              />
                            }
                            label="Nakit"
                          />
                          <FormControlLabel
                            control={
                              <Radio
                                checked={selectedJob?.paymentStatus === 'havale'}
                                onChange={(e) => setSelectedJob({ 
                                  ...selectedJob, 
                                  paymentStatus: 'havale',
                                  paymentType: 'havale'
                                })}
                              />
                            }
                            label="Havale"
                          />
                          <FormControlLabel
                            control={
                              <Radio
                                checked={selectedJob?.paymentStatus === 'ödeme alınmadı'}
                                onChange={(e) => setSelectedJob({ 
                                  ...selectedJob, 
                                  paymentStatus: 'ödeme alınmadı',
                                  paymentType: 'ödeme alınmadı'
                                })}
                              />
                            }
                            label="Ödeme Alınmadı"
                          />
                        </Box>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 3,
                      bgcolor: 'background.paper',
                      mt: 2
                    }}
                  >
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                    {selectedFiles.length === 0 ? (
                      <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                        <PhotoCameraIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">
                          Fotoğraf yüklemek için tıklayın
                        </Typography>
                      </label>
                    ) : (
                      <Box>
                        <Grid container spacing={1}>
                          {Array.from(selectedFiles).map((file, index) => (
                            <Grid item xs={4} key={index}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  paddingTop: '100%',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  bgcolor: 'background.default'
                                }}
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Seçilen fotoğraf ${index + 1}`}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newFiles = Array.from(selectedFiles);
                                    newFiles.splice(index, 1);
                                    setSelectedFiles(newFiles);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                          {selectedFiles.length < 5 && (
                            <Grid item xs={4}>
                              <label htmlFor="photo-upload">
                                <Box
                                  sx={{
                                    position: 'relative',
                                    paddingTop: '100%',
                                    borderRadius: 1,
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      bgcolor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <AddIcon sx={{ color: 'text.secondary', fontSize: 32 }} />
                                  </Box>
                                </Box>
                              </label>
                            </Grid>
                          )}
                        </Grid>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                          {selectedFiles.length}/5 fotoğraf seçildi
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Not"
                      value={selectedJob?.note || ''}
                      onChange={(e) => setSelectedJob({ ...selectedJob, note: e.target.value })}
                      placeholder="İş ile ilgili not ekleyin..."
                    />
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleCompleteJob}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Tamamla
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            <Typography variant="h6">İşi Düzenle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Açıklama"
              value={editJob?.description || ''}
              onChange={(e) => setEditJob(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />
            
            <TextField
              label="Not"
              value={editJob?.note || ''}
              onChange={(e) => setEditJob(prev => ({ ...prev, note: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editJob?.isScheduled || false}
                  onChange={(e) => setEditJob(prev => ({
                    ...prev,
                    isScheduled: e.target.checked,
                    scheduledDate: e.target.checked ? prev.scheduledDate || new Date() : null
                  }))}
                />
              }
              label="Zamanlayıcı"
            />

            {editJob?.isScheduled && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DateTimePicker
                  label="Zamanlanan Tarih/Saat"
                  value={editJob.scheduledDate}
                  onChange={(newValue) => setEditJob(prev => ({
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
          <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
          <Button onClick={handleEditSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>İşi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu işi silmek istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
          <Button onClick={handleDelete} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openNewJobDialog} 
        onClose={handleNewJobDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Yeni İş Ekle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.name}
              value={customers.find(c => c.id === newJob.customerId) || null}
              onChange={(event, newValue) => {
                setNewJob({ 
                  ...newJob, 
                  customerId: newValue ? newValue.id : null 
                });
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Müşteri Ara"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <PersonIcon color="action" sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" sx={{ display: 'flex', flexDirection: 'column', p: 1 }} {...props}>
                  <Typography variant="body1">{option.name}</Typography>
                  {(option.phone || option.email) && (
                    <Typography variant="caption" color="text.secondary">
                      {[option.phone, option.email].filter(Boolean).join(' • ')}
                    </Typography>
                  )}
                </Box>
              )}
              filterOptions={(options, { inputValue }) => {
                const searchTerms = inputValue.toLowerCase().split(' ');
                return options.filter(option => 
                  searchTerms.every(term =>
                    option.name?.toLowerCase().includes(term) ||
                    option.phone?.toLowerCase().includes(term) ||
                    option.email?.toLowerCase().includes(term)
                  )
                );
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="İş Açıklaması"
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              InputProps={{
                startAdornment: (
                  <DescriptionIcon color="action" sx={{ mr: 1, mt: 1 }} />
                ),
              }}
              placeholder="İşin detaylarını buraya yazın..."
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newJob.isScheduled}
                    onChange={(e) => setNewJob({ ...newJob, isScheduled: e.target.checked })}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlarmIcon color="action" />
                    <Typography>Zamanlayıcı Ekle</Typography>
                  </Box>
                }
              />
              {newJob.isScheduled && (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                  <DateTimePicker
                    label="İşin Başlangıç Zamanı"
                    value={newJob.scheduledDate}
                    onChange={(newValue) => setNewJob({ ...newJob, scheduledDate: newValue })}
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleNewJobDialogClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleCreateJob}
            variant="contained"
            disabled={!newJob.customerId}
            sx={{ borderRadius: 2 }}
          >
            İş Oluştur
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Not ekleme dialog'u */}
      <Dialog open={isAddingNote} onClose={() => setIsAddingNote(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Not</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Başlık"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Not İçeriği"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Not Rengi</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                <Radio
                  checked={newNote.color === '#f5f5f5'}
                  onChange={() => setNewNote({ ...newNote, color: '#f5f5f5' })}
                  sx={{ 
                    width: 40,
                    height: 40,
                    padding: 0,
                    bgcolor: '#f5f5f5',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    '&.Mui-checked': {
                      border: '2px solid #000',
                    },
                    '& .MuiSvgIcon-root': {
                      display: 'none'
                    }
                  }}
                />
                <Radio
                  checked={newNote.color === '#2e7d32'}
                  onChange={() => setNewNote({ ...newNote, color: '#2e7d32' })}
                  sx={{ 
                    width: 40,
                    height: 40,
                    padding: 0,
                    bgcolor: '#2e7d32',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    '&.Mui-checked': {
                      border: '2px solid #000',
                    },
                    '& .MuiSvgIcon-root': {
                      display: 'none'
                    }
                  }}
                />
                <Radio
                  checked={newNote.color === '#f9a825'}
                  onChange={() => setNewNote({ ...newNote, color: '#f9a825' })}
                  sx={{ 
                    width: 40,
                    height: 40,
                    padding: 0,
                    bgcolor: '#f9a825',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    '&.Mui-checked': {
                      border: '2px solid #000',
                    },
                    '& .MuiSvgIcon-root': {
                      display: 'none'
                    }
                  }}
                />
                <Radio
                  checked={newNote.color === '#c62828'}
                  onChange={() => setNewNote({ ...newNote, color: '#c62828' })}
                  sx={{ 
                    width: 40,
                    height: 40,
                    padding: 0,
                    bgcolor: '#c62828',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    '&.Mui-checked': {
                      border: '2px solid #000',
                    },
                    '& .MuiSvgIcon-root': {
                      display: 'none'
                    }
                  }}
                />
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={newNote.isReminder}
                  onChange={(e) => setNewNote({ 
                    ...newNote, 
                    isReminder: e.target.checked 
                  })}
                />
              }
              label="Hatırlatma"
            />
            {newNote.isReminder && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DateTimePicker
                  label="Hatırlatma Zamanı"
                  value={newNote.reminderDate}
                  onChange={(newValue) => setNewNote({ 
                    ...newNote, 
                    reminderDate: newValue 
                  })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingNote(false)}>İptal</Button>
          <Button onClick={handleAddNote} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TodoJobs; 