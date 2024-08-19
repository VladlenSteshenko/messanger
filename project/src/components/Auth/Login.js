// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../api/api';
import { loginThunk } from '../../thunks/authThunks';
import { connectSocket } from '../../thunks/chatThunks';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginMutation] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginThunk({ login, password })).unwrap();
      await dispatch(connectSocket());
      navigate("/chat");
    } catch (err) {
      console.error('Failed to login:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <TextField
        label="Login"
        fullWidth
        margin="normal"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
