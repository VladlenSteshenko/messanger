// src/components/Auth/Entry.js
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { Container, Button, Box } from '@mui/material';
import './Entry.css';

const Entry = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <Container className="entry" maxWidth="sm">
      <Box display="flex" justifyContent="center" mb={2}>
        <Button variant="contained" color="primary" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Switch to Login" : "Switch to Register"}
        </Button>
      </Box>
      {isRegister ? <Register /> : <Login />}
    </Container>
  );
};

export default Entry;
