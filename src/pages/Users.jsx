import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Alert,
    Snackbar,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'employee',
        isActive: true
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            showSnackbar('Kullanıcılar yüklenirken hata oluştu', 'error');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                username: user.username,
                password: '',
                role: user.role,
                isActive: user.isActive
            });
        } else {
            setSelectedUser(null);
            setFormData({
                username: '',
                password: '',
                role: 'employee',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
        setFormData({
            username: '',
            password: '',
            role: 'employee',
            isActive: true
        });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (selectedUser) {
                // Güncelleme
                await axios.put(`/api/auth/users/${selectedUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Kullanıcı başarıyla güncellendi');
            } else {
                // Yeni kullanıcı
                await axios.post('/api/auth/users', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Kullanıcı başarıyla oluşturuldu');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Bir hata oluştu', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/auth/users/${selectedUser.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('Kullanıcı başarıyla silindi');
            setOpenDeleteDialog(false);
            fetchUsers();
        } catch (error) {
            showSnackbar('Kullanıcı silinirken hata oluştu', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
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

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Kullanıcı Yönetimi</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Yeni Kullanıcı
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kullanıcı Adı</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Oluşturulma Tarihi</TableCell>
                            <TableCell>İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                    {user.role === 'admin' ? 'Yönetici' : 'Çalışan'}
                                </TableCell>
                                <TableCell>
                                    {user.isActive ? 'Aktif' : 'Pasif'}
                                </TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(user)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setOpenDeleteDialog(true);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Kullanıcı Ekleme/Düzenleme Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Kullanıcı Adı"
                            fullWidth
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        <TextField
                            label="Şifre"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            helperText={selectedUser ? "Boş bırakılırsa şifre değişmez" : ""}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={formData.role}
                                label="Rol"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <MenuItem value="admin">Yönetici</MenuItem>
                                <MenuItem value="employee">Çalışan</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Aktif"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUser ? 'Güncelle' : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Silme Onay Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Kullanıcı Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        {selectedUser?.username} kullanıcısını silmek istediğinize emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>İptal</Button>
                    <Button onClick={handleDelete} color="error">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Users; 