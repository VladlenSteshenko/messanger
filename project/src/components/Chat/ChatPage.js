// src/components/Chat/ChatPage.js
import React from "react";
import ChatList from "./ChatList";
import ChatView from "./ChatView";
import ChatInfo from "./ChatInfo";
import { Container, Grid } from "@mui/material";
import "./ChatPage.css";

const ChatPage = () => {
  return (
    <Container className="chat-page">
      <Grid container spacing={2}>
        <Grid item xs={4} className="chat-section chat-list-section">
          <ChatList />
        </Grid>
        <Grid item xs={5} className="chat-section chat-view-section">
          <ChatView />
        </Grid>
        <Grid item xs={3} className="chat-section chat-info-section">
          <ChatInfo />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;

