import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
    const response = await axios.get('/api/notes');
    return response.data;
});

export const createNote = createAsyncThunk('notes/createNote', async (noteData) => {
    const response = await axios.post('/api/notes', noteData);
    return response.data;
});

export const updateNote = createAsyncThunk('notes/updateNote', async ({ id, noteData }) => {
    const response = await axios.put(`/api/notes/${id}`, noteData);
    return response.data;
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id) => {
    await axios.delete(`/api/notes/${id}`);
    return id;
});

export const handleReminder = createAsyncThunk(
    'notes/handleReminder',
    async ({ id, action, newDate }) => {
        const response = await axios.put(`/api/notes/${id}/reminder`, {
            action,
            newDate
        });
        return response.data;
    }
);

const noteSlice = createSlice({
    name: 'notes',
    initialState: {
        notes: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchNotes
            .addCase(fetchNotes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notes = action.payload;
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // createNote
            .addCase(createNote.fulfilled, (state, action) => {
                state.notes.unshift(action.payload);
            })
            // updateNote
            .addCase(updateNote.fulfilled, (state, action) => {
                const index = state.notes.findIndex(note => note.id === action.payload.id);
                if (index !== -1) {
                    state.notes[index] = action.payload;
                }
            })
            // deleteNote
            .addCase(deleteNote.fulfilled, (state, action) => {
                state.notes = state.notes.filter(note => note.id !== action.payload);
            })
            // handleReminder
            .addCase(handleReminder.fulfilled, (state, action) => {
                const index = state.notes.findIndex(note => note.id === action.payload.id);
                if (index !== -1) {
                    state.notes[index] = action.payload;
                }
            });
    }
});

export default noteSlice.reducer; 