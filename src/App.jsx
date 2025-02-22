import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Container, 
  Typography,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TodoJobs from './pages/TodoJobs';
import PendingInvoices from './pages/PendingInvoices';
import Customers from './pages/Customers';
import CompletedJobs from './pages/CompletedJobs';
import PendingPayments from './pages/PendingPayments';
import Notes from './pages/Notes';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Login from './pages/Login';
import axios from 'axios';

// Modern bir tema oluşturuyorum
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Modern mavi
    },
    secondary: {
      main: '#f50057', // Canlı pembe
    },
    background: {
      default: '#f5f5f5', // Açık gri arka plan
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// Yetkilendirme kontrolü için özel route bileşeni
const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Token'ı axios'un default headers'ına ekle
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Kullanıcı giriş yapmamışsa sadece login sayfasını göster
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="default" elevation={0}>
          <Container>
            <Toolbar disableGutters>
              <Box 
                component={Link} 
                to="/" 
                sx={{ 
                  flexGrow: 1, 
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <img 
                  src="/logo.png" 
                  alt="Sesal Telekom Logo" 
                  style={{ 
                    height: '40px',
                    width: 'auto'
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Tüm butonlar yeni sıralama ile */}
                <Button 
                  component={Link} 
                  to="/" 
                  color="inherit"
                >
                  Yapılacak İşler
                </Button>

                {user.role === 'admin' && (
                  <>
                    <Button 
                      component={Link} 
                      to="/pending-invoices" 
                      color="inherit"
                    >
                      Fatura Bekleyenler
                    </Button>
                  </>
                )}

                <Button 
                  component={Link} 
                  to="/completed-jobs" 
                  color="inherit"
                >
                  Tamamlanan İşler
                </Button>

                {user.role === 'admin' && (
                  <>
                    <Button 
                      component={Link} 
                      to="/pending-payments" 
                      color="inherit"
                    >
                      Ödeme Bekleyenler
                    </Button>

                    <Button 
                      component={Link} 
                      to="/reports" 
                      color="inherit"
                    >
                      Raporlar
                    </Button>

                    <Button 
                      component={Link} 
                      to="/users" 
                      color="inherit"
                    >
                      Kullanıcılar
                    </Button>

                    <Button 
                      component={Link} 
                      to="/notes" 
                      color="inherit"
                    >
                      Notlar
                    </Button>
                  </>
                )}

                <Button 
                  component={Link} 
                  to="/customers" 
                  color="inherit"
                >
                  Müşteriler
                </Button>

                {/* Kullanıcı menüsü */}
                <IconButton
                  onClick={handleMenuClick}
                  size="large"
                  sx={{ ml: 2 }}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    {user.username} ({user.role === 'admin' ? 'Yönetici' : 'Çalışan'})
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            backgroundColor: 'background.default',
            py: 4
          }}
        >
          <Container>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                backgroundColor: 'white',
                minHeight: 'calc(100vh - 200px)'
              }}
            >
              <Routes>
                {/* Herkesin erişebildiği sayfalar */}
                <Route path="/" element={
                  <PrivateRoute>
                    <TodoJobs />
                  </PrivateRoute>
                } />
                <Route path="/completed-jobs" element={
                  <PrivateRoute>
                    <CompletedJobs />
                  </PrivateRoute>
                } />
                <Route path="/customers" element={
                  <PrivateRoute>
                    <Customers />
                  </PrivateRoute>
                } />

                {/* Sadece admin erişebilir */}
                <Route path="/pending-invoices" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <PendingInvoices />
                  </PrivateRoute>
                } />
                <Route path="/pending-payments" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <PendingPayments />
                  </PrivateRoute>
                } />
                <Route path="/notes" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <Notes />
                  </PrivateRoute>
                } />
                <Route path="/reports" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <Reports />
                  </PrivateRoute>
                } />
                <Route path="/users" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <Users />
                  </PrivateRoute>
                } />

                {/* 404 yönlendirmesi */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 