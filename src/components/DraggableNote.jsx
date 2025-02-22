import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateNote, deleteNote, handleReminder } from '../store/noteSlice';
import { 
    Card, 
    CardContent, 
    Typography, 
    IconButton, 
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Stack,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Radio
} from '@mui/material';
import { 
    Delete as DeleteIcon,
    Edit as EditIcon,
    PushPin as PushPinIcon,
    AccessTime as AccessTimeIcon,
    Check as CheckIcon,
    Update as UpdateIcon,
    AddCircleOutline as AddIcon,
    RemoveCircleOutline as RemoveIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';

const DraggableNote = ({ note, expanded = false }) => {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [editedNote, setEditedNote] = useState(note);
    const [isExpanded, setIsExpanded] = useState(expanded);
    const [isHovered, setIsHovered] = useState(false);
    const [isInlineEditing, setIsInlineEditing] = useState(false);
    const [inlineContent, setInlineContent] = useState(note.content);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        setIsExpanded(expanded);
    }, [expanded]);

    const handleEdit = () => {
        setEditedNote({
            ...note,
            reminderDate: note.reminderDate ? new Date(note.reminderDate) : new Date(),
            isReminder: Boolean(note.isReminder)
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        const updatedNote = {
            ...editedNote,
            reminderDate: editedNote.isReminder ? editedNote.reminderDate : null,
            updatedAt: new Date().toISOString()
        };
        dispatch(updateNote({ id: note.id, noteData: updatedNote }));
        setIsEditing(false);
    };

    const handleInlineEdit = (e) => {
        e.stopPropagation();
        setIsInlineEditing(true);
        setInlineContent(note.content);
    };

    const handleInlineSave = () => {
        if (inlineContent !== note.content) {
            dispatch(updateNote({ 
                id: note.id, 
                noteData: { ...note, content: inlineContent } 
            }));
        }
        setIsInlineEditing(false);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        dispatch(deleteNote(note.id));
        setOpenDeleteDialog(false);
    };

    const handlePin = (e) => {
        e.stopPropagation();
        dispatch(updateNote({ 
            id: note.id, 
            noteData: { 
                ...note, 
                isPinned: !note.isPinned,
                updatedAt: new Date().toISOString()
            }
        }));
    };

    const handleToggleJobListVisibility = (e) => {
        e.stopPropagation();
        dispatch(updateNote({ 
            id: note.id, 
            noteData: { 
                ...note, 
                showInJobList: !note.showInJobList,
                updatedAt: new Date().toISOString()
            }
        }));
    };

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <Card 
                sx={{ 
                    width: '100%',
                    backgroundColor: note.color,
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    },
                    border: note.isPinned ? '1px solid' : '1px solid rgba(0,0,0,0.08)',
                    borderColor: note.isPinned ? 'primary.main' : 'transparent'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={toggleExpand}
            >
                {note.isPinned && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 16,
                            width: 0,
                            height: 0,
                            borderLeft: '16px solid transparent',
                            borderRight: '16px solid transparent',
                            borderTop: '16px solid',
                            borderTopColor: 'primary.main',
                            transform: 'translateX(50%)',
                        }}
                    />
                )}
                <CardContent sx={{ p: 1.5 }}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            p: 0.5
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            component="div" 
                            sx={{ 
                                flexGrow: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 500,
                                color: 'rgba(0,0,0,0.75)'
                            }}
                        >
                            {note.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                                size="small" 
                                onClick={handlePin}
                                color={note.isPinned ? 'primary' : 'default'}
                                sx={{ 
                                    padding: 0.5,
                                    '&:hover': { 
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)' 
                                    } 
                                }}
                            >
                                <PushPinIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={handleToggleJobListVisibility}
                                color={note.showInJobList ? 'error' : 'success'}
                                sx={{ 
                                    padding: 0.5,
                                    '&:hover': { 
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)' 
                                    } 
                                }}
                            >
                                {note.showInJobList ? 
                                    <RemoveIcon sx={{ fontSize: '1.2rem' }} /> : 
                                    <AddIcon sx={{ fontSize: '1.2rem' }} />
                                }
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit();
                                }}
                                sx={{ 
                                    padding: 0.5,
                                    '&:hover': { 
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)' 
                                    } 
                                }}
                            >
                                <EditIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                sx={{ 
                                    padding: 0.5,
                                    '&:hover': { 
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)' 
                                    } 
                                }}
                            >
                                <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                        </Box>
                    </Box>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block',
                            color: 'text.secondary',
                            mb: 1,
                            pl: 0.5
                        }}
                    >
                        {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                    {note.isReminder && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 0.5, mb: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Hatırlatma: {new Date(note.reminderDate).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Box>
                    )}
                    {isExpanded && (
                        <Box 
                            sx={{ 
                                mt: 1,
                                opacity: 1,
                                transform: 'translateY(0)',
                                transition: 'all 0.2s ease',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isInlineEditing ? (
                                <TextField
                                    multiline
                                    fullWidth
                                    variant="standard"
                                    value={inlineContent}
                                    onChange={(e) => setInlineContent(e.target.value)}
                                    onBlur={handleInlineSave}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            handleInlineSave();
                                        }
                                        if (e.key === 'Escape') {
                                            setIsInlineEditing(false);
                                            setInlineContent(note.content);
                                        }
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    InputProps={{
                                        sx: {
                                            fontSize: '0.875rem',
                                            lineHeight: 1.5,
                                            p: 1,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: 1,
                                            '& .MuiInput-input': {
                                                p: 0,
                                            },
                                            '&:before, &:after': {
                                                display: 'none'
                                            }
                                        }
                                    }}
                                    sx={{
                                        mb: note.isReminder ? 2 : 0,
                                    }}
                                />
                            ) : (
                                <Typography 
                                    variant="body2" 
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        handleInlineEdit(e);
                                    }}
                                    sx={{ 
                                        color: 'rgba(0, 0, 0, 0.6)',
                                        lineHeight: 1.5,
                                        mb: note.isReminder ? 2 : 0,
                                        fontSize: '0.875rem',
                                        cursor: 'text',
                                        p: 1,
                                        borderRadius: 1,
                                        minHeight: '1.5rem',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        }
                                    }}
                                >
                                    {note.content || 'Not içeriği eklemek için çift tıklayın...'}
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editedNote.isReminder ? 'Hatırlatmayı Düzenle' : 'Notu Düzenle'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Başlık"
                            value={editedNote.title}
                            onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="İçerik"
                            value={editedNote.content}
                            onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">Not Rengi</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                                <Radio
                                    checked={editedNote.color === '#f5f5f5'}
                                    onChange={() => setEditedNote({ ...editedNote, color: '#f5f5f5' })}
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
                                    checked={editedNote.color === '#2e7d32'}
                                    onChange={() => setEditedNote({ ...editedNote, color: '#2e7d32' })}
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
                                    checked={editedNote.color === '#f9a825'}
                                    onChange={() => setEditedNote({ ...editedNote, color: '#f9a825' })}
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
                                    checked={editedNote.color === '#c62828'}
                                    onChange={() => setEditedNote({ ...editedNote, color: '#c62828' })}
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
                                    checked={editedNote.isReminder}
                                    onChange={(e) => setEditedNote({ 
                                        ...editedNote, 
                                        isReminder: e.target.checked,
                                        reminderDate: e.target.checked ? new Date() : null
                                    })}
                                />
                            }
                            label="Hatırlatma"
                        />
                        {editedNote.isReminder && (
                            <DateTimePicker
                                label="Hatırlatma Zamanı"
                                value={editedNote.reminderDate}
                                onChange={(newValue) => setEditedNote({ 
                                    ...editedNote, 
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
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditing(false)}>İptal</Button>
                    <Button onClick={handleSave} variant="contained">Kaydet</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Not Silme</DialogTitle>
                <DialogContent>
                    <Typography>
                        "{note.title}" başlıklı notu silmek istediğinize emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DraggableNote; 