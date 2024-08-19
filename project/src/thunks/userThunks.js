// src/thunks/userThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUserList, setCurrentUser } from '../reducers/userSlice';
import { api } from '../api/api';

export const fetchUserListThunk = createAsyncThunk(
  'user/fetchUserList',
  async (_, { dispatch }) => {
    const response = await api.endpoints.userFind.initiate();
    dispatch(setUserList(response.data));
  }
);

export const fetchCurrentUserThunk = createAsyncThunk(
  'user/fetchCurrentUser',
  async (userId, { dispatch }) => {
    const response = await api.endpoints.userFindOne.initiate({ query: `{ _id: "${userId}" }` });
    dispatch(setCurrentUser(response.data));
  }
);
