// src/components/Chat/ChatInfo.js
import React from "react";
import { useSelector } from "react-redux";
import { Avatar,Button, Container, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import './ChatPage.css';
import UserSearch from './UserSearch';

const ChatInfo = () => {
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);
  const chatList = useSelector((state) => state.chat.chatList);
  const selectedChat = chatList[selectedChatId];
  const thisuser = useSelector((state) => state.auth.payload);
  const thisuserId = thisuser?.sub?.id;

  if (!selectedChat) {
    return <Typography>Select a chat to see details</Typography>;
  }

  const handleRemoveUser = (userId) => {
    console.log(`Remove user with ID: ${userId}`);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>{selectedChat.title || "Untitled Chat"}</Typography>
  
      <Typography>Last Modified: {selectedChat.lastModified ? new Date(parseInt(selectedChat.lastModified)).toLocaleString() : ""}</Typography>
      <Typography variant="h6" gutterBottom>Members</Typography>
      <List>
        {selectedChat.members.map((user) => (
          <ListItem key={user._id}>
            <ListItemAvatar>
              <Avatar src={`http://localhost:5000${user.avatar?.url}` || 'default-avatar.png'} alt={user.nick} />
            </ListItemAvatar>
            <ListItemText primary={user.nick} />
            {user._id !== thisuserId && (
              <Button onClick={() => handleRemoveUser(user._id)}>Remove User</Button>
            )}
          </ListItem>
        ))}
      </List>
      <UserSearch chatId={selectedChatId} />
    </Container>
  );
};

export default ChatInfo;
