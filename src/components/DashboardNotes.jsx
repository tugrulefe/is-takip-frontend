import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, createNote } from '../store/noteSlice';
import DraggableNote from './DraggableNote';
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
    Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';

const DashboardNotes = () => {
    const dispatch = useDispatch();
    const notes = useSelector(state => state.notes.notes);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        color: '#fff9c4',
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
                color: '#fff9c4',
                isReminder: false,
                reminderDate: new Date(),
                isPinned: false
            });
        }
    };

    const sortedNotes = [...(notes || [])].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Grid container spacing={2}>
                {sortedNotes.map(note => (
                    <Grid item xs={12} sm={6} md={4} key={note.id}>
                        <DraggableNote note={note} />
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
                            autoFocus
                            margin="dense"
                            label="İçerik"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
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
                        )}
                        <TextField
                            label="Renk"
                            value={newNote.color}
                            onChange={(e) => setNewNote({ ...newNote, color: e.target.value })}
                            type="color"
                            fullWidth
                        />
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

export default DashboardNotes; 