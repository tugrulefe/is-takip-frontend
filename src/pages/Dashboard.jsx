import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import DashboardNotes from '../components/DashboardNotes';

const Dashboard = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                        <Typography variant="h5" gutterBottom>
                            Notlar ve Hatırlatmalar
                        </Typography>
                        <DashboardNotes />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 