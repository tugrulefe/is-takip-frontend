import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Switch,
    FormControlLabel
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tr from 'date-fns/locale/tr';

function PendingJobs() {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedJob, setEditedJob] = useState({
        description: '',
        note: '',
        isScheduled: false,
        scheduledDate: null
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleEditDialogOpen = (job) => {
        setEditedJob({
            id: job.id,
            description: job.description || '',
            note: job.note || '',
            isScheduled: job.scheduledDate !== null,
            scheduledDate: job.scheduledDate ? new Date(job.scheduledDate) : new Date()
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await axios.put(`/api/jobs/${editedJob.id}`, {
                description: editedJob.description,
                note: editedJob.note,
                scheduledDate: editedJob.isScheduled ? editedJob.scheduledDate : null
            });
            
            if (response.data) {
                setEditDialogOpen(false);
                setSnackbar({ 
                    open: true, 
                    message: 'İş başarıyla güncellendi', 
                    severity: 'success' 
                });
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

    return (
        <>
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
                                            fullWidth: true,
                                            variant: "outlined"
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleEditSubmit} variant="contained">Kaydet</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default PendingJobs; 