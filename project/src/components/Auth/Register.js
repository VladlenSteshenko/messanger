// src/components/Auth/Register.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation, useLoginMutation } from '../../api/api';
import { setAuth } from '../../reducers/authSlice';
import { jwtDecode } from 'jwt-decode';
import { TextField, Button, Box, Typography } from '@mui/material';

const Register = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [registerMutation] = useRegisterMutation();
  const [loginMutation] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await registerMutation({ login, password });
      if (data.UserUpsert) {
        const loginResponse = await loginMutation({ login, password });
        if (loginResponse.data.login) {
          const decodedToken = jwtDecode(loginResponse.data.login);
          dispatch(setAuth({ token: loginResponse.data.login, user: decodedToken }));
          navigate("/chat");
        }
      }
    } catch (error) {
      console.error("Registration error", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>Register</Typography>
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
        Register
      </Button>
    </Box>
  );
};

export default Register;
