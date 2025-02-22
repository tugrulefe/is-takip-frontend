import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tr from 'date-fns/locale/tr';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <CssBaseline />
                <App />
            </LocalizationProvider>
        </BrowserRouter>
    </Provider>
); 