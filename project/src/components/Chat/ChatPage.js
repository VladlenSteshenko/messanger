// src/components/Chat/ChatPage.js
import React from 'react';
import ChatList from './ChatList';
import ChatView from './ChatView';
import ChatInfo from './ChatInfo';
import { Container, Grid } from '@mui/material';
import './ChatPage.css';

const ChatPage = () => {
  return (
    <Container className="chat-page">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ChatList />
        </Grid>
        <Grid item xs={4}>
          <ChatView />
        </Grid>
        <Grid item xs={2}>
          <ChatInfo />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;

