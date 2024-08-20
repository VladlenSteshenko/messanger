// src/components/Chat/ChatInfo.js
import React from "react";
import { useSelector } from "react-redux";
import { Avatar, Button, Container, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import UserSearch from "./UserSearch";
import "./ChatPage.css";

const ChatInfo = () => {
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);
  const chatList = useSelector((state) => state.chat.chatList);
  const selectedChat = chatList[selectedChatId];
  const thisUser = useSelector((state) => state.auth.payload);
  const thisUserId = thisUser?.sub?.id;

  if (!selectedChat) {
    return (
      <Typography variant="body1" color="textSecondary">
        Select a chat to see details
      </Typography>
    );
  }

  const handleRemoveUser = (userId) => {
    console.log(`Remove user with ID: ${userId}`);
  };

  return (
    <Container className="chat-info-container">
      <Typography variant="h5" gutterBottom>
        {selectedChat.title || "Untitled Chat"}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Last Modified:{" "}
        {selectedChat.lastModified
          ? new Date(parseInt(selectedChat.lastModified)).toLocaleString()
          : ""}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Members
      </Typography>
      <List>
        {selectedChat.members.map((user) => (
          <ListItem key={user._id} className="chat-info-member">
            <ListItemAvatar>
              <Avatar
                src={`http://localhost:5000${user.avatar?.url}` || "default-avatar.png"}
                alt={user.nick}
              />
            </ListItemAvatar>
            <ListItemText primary={user.nick} />
            {user._id !== thisUserId && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleRemoveUser(user._id)}
              >
                Remove
              </Button>
            )}
          </ListItem>
        ))}
      </List>
      <UserSearch chatId={selectedChatId} />
    </Container>
  );
};

export default ChatInfo;

