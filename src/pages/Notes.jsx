import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, createNote } from '../store/noteSlice';
import DraggableNote from '../components/DraggableNote';
import { 
    Box, 
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Stack,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Radio,
    InputAdornment
} from '@mui/material';
import { Add as AddIcon, PushPin as PushPinIcon, Search as SearchIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import tr from 'date-fns/locale/tr';

const Notes = () => {
    const dispatch = useDispatch();
    const notes = useSelector(state => state.notes.notes);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        color: '#f5f5f5',
        isReminder: false,
        reminderDate: new Date(),
        isPinned: false
    });

    useEffect(() => {
        dispatch(fetchNotes());
    }, [dispatch]);

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

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Notları sabitlenmiş ve sabitlenmemiş olarak grupla
    const pinnedNotes = sortedNotes.filter(note => note.isPinned);
    const unpinnedNotes = sortedNotes.filter(note => !note.isPinned);

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h4" component="h1">
                    Notlar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddingNote(true)}
                    sx={{ 
                        borderRadius: 28,
                        px: 3,
                        py: 1,
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6
                        }
                    }}
                >
                    Yeni Not
                </Button>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Not başlığına göre ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            {pinnedNotes.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PushPinIcon /> Sabitlenmiş Notlar
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {pinnedNotes.map(note => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={note.id}>
                                <DraggableNote note={note} expanded />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            <Grid container spacing={2}>
                {unpinnedNotes.map(note => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={note.id}>
                        <DraggableNote note={note} expanded />
                    </Grid>
                ))}
            </Grid>

            {sortedNotes.length === 0 && (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2
                }}>
                    <Typography color="text.secondary">
                        {searchQuery ? 'Aranan kriterlere uygun not bulunamadı' : 'Henüz not eklenmemiş'}
                    </Typography>
                </Box>
            )}

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
                            label="İçerik"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                        />
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
                                    minDateTime={new Date()}
                                    format="dd/MM/yyyy HH:mm"
                                    ampm={false}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined"
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        )}
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
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddingNote(false)}>İptal</Button>
                    <Button onClick={handleAddNote} variant="contained">Ekle</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Notes; 