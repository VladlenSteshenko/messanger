// src/thunks/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { login, logout } from '../reducers/authSlice';
import { api } from '../api/api';
import { setChatList } from '../reducers/chatSlice';
import { jwtDecode } from 'jwt-decode';
import { setAuth } from '../reducers/authSlice';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ login, password }, { dispatch }) => {
    const response = await dispatch(api.endpoints.login.initiate({ login, password }));
    if (response.data && response.data.login) {
      const token = response.data.login;
      const payload = jwtDecode(token);
      const decodedToken = jwtDecode(response.data.login);
      dispatch(setAuth({ token, user: decodedToken }));
      dispatch(fetchAboutMeThunk());
      
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ login, password }, { dispatch }) => {
    const response = await api.endpoints.register.initiate({ login, password });
    if (response.data) {
      await dispatch(loginThunk({ login, password }));
    }
  }
);

export const fetchAboutMeThunk = createAsyncThunk(
  'auth/fetchAboutMe',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const userId = state.auth.payload.sub.id;
    const response = await dispatch(api.endpoints.actionAboutMe.initiate({ _id: userId }));
    if (response.data) {
      const { UserFindOne } = response.data;
      console.log("chats = ",UserFindOne.chats)
      dispatch(setChatList(UserFindOne.chats));
    }
  }
);
