import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tr from 'date-fns/locale/tr';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Reports() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    taxBase: 0, // Matrah
    cashPayments: 0,
    transferPayments: 0,
    totalVat: 0,
    monthlyRevenue: [],
    paymentTypeDistribution: [],
    pendingPayments: 0
  });
  const [dateRange, setDateRange] = useState('thisMonth'); // thisMonth, lastMonth, thisYear, custom

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, dateRange]);

  const handleDateRangeChange = (newValue) => {
    const now = new Date();
    switch (newValue) {
      case 'thisMonth':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date());
        break;
      case 'lastMonth':
        setStartDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        setEndDate(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case 'thisYear':
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(new Date());
        break;
      case 'custom':
        // Mevcut tarihleri koru
        break;
    }
    setDateRange(newValue);
  };

  const fetchReportData = async () => {
    try {
      const response = await axios.get('/api/jobs/reports', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Rapor verileri alınırken hata:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Finansal Raporlar
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Tarih Aralığı</InputLabel>
              <Select
                value={dateRange}
                label="Tarih Aralığı"
                onChange={(e) => handleDateRangeChange(e.target.value)}
              >
                <MenuItem value="thisMonth">Bu Ay</MenuItem>
                <MenuItem value="lastMonth">Geçen Ay</MenuItem>
                <MenuItem value="thisYear">Bu Yıl</MenuItem>
                <MenuItem value="custom">Özel Aralık</MenuItem>
              </Select>
            </FormControl>
            
            {dateRange === 'custom' && (
              <>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  format="dd/MM/yyyy"
                />
                <DatePicker
                  label="Bitiş Tarihi"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  format="dd/MM/yyyy"
                />
              </>
            )}
          </Stack>

          <Grid container spacing={3}>
            {/* Toplam Gelir Kartı */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Gelir (KDV Dahil)
                  </Typography>
                  <Typography variant="h5" component="div" color="success.main">
                    {formatCurrency(reportData.totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Matrah Kartı */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Matrah
                  </Typography>
                  <Typography variant="h5" component="div" color="primary">
                    {formatCurrency(reportData.taxBase)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Toplam KDV Kartı */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam KDV
                  </Typography>
                  <Typography variant="h5" component="div" color="warning.main">
                    {formatCurrency(reportData.totalVat)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Bekleyen Ödemeler Kartı */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Bekleyen Ödemeler
                  </Typography>
                  <Typography variant="h5" component="div" color="error.main">
                    {formatCurrency(reportData.pendingPayments)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Nakit Ödemeler Kartı */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Nakit Ödemeler
                  </Typography>
                  <Typography variant="h5" component="div" color="info.main">
                    {formatCurrency(reportData.cashPayments)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Havale Ödemeleri Kartı */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Havale Ödemeleri
                  </Typography>
                  <Typography variant="h5" component="div" color="info.main">
                    {formatCurrency(reportData.transferPayments)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Aylık Gelir Grafiği */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Aylık Gelir Dağılımı
          </Typography>
          <Box sx={{ height: 400, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.monthlyRevenue}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="taxBase" name="Matrah" fill="#8884d8" />
                <Bar dataKey="vat" name="KDV" fill="#82ca9d" />
                <Bar dataKey="revenue" name="Toplam" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Ödeme Türü Dağılımı */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Ödeme Türü Dağılımı
          </Typography>
          <Box sx={{ height: 400, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.paymentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.paymentTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}

export default Reports; 