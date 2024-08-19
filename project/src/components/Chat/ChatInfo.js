// src/components/Chat/ChatInfo.js
import React from "react";
import { useSelector } from "react-redux";
import { Avatar, Box, Button, Container, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
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

  const handleDeleteChat = () => {
    console.log("Delete chat function");
  };

  const handleAddUser = () => {
    console.log("Add user function");
  };

  const handleRemoveUser = (userId) => {
    console.log(`Remove user with ID: ${userId}`);
  };

  const handleDeleteMedia = () => {
    console.log("Delete media function");
  };

  const handleUploadMedia = () => {
    console.log("Upload media function");
  };

  return (
    <Container>
      <Avatar src={selectedChat.avatar?.url || "default-avatar.png"} alt="avatar" sx={{ width: 56, height: 56, mb: 2 }} />
      <Typography variant="h5" gutterBottom>{selectedChat.title || "Untitled Chat"}</Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="secondary" onClick={handleDeleteChat}>Delete Chat</Button>
        <Button variant="contained" onClick={handleAddUser}>Add User</Button>
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="error" onClick={handleDeleteMedia}>Delete Media</Button>
        <Button variant="contained" color="primary" onClick={handleUploadMedia}>Upload Media</Button>
      </Box>
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
