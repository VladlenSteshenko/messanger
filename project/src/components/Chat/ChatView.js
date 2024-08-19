// src/components/Chat/ChatView.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, updateChatMessage, fetchChatMessages, deleteMessage } from '../../thunks/chatThunks';
import { Avatar, Box, Button, Container, IconButton, List, ListItem, ListItemAvatar, ListItemText, TextField, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import PhotoIcon from '@mui/icons-material/Photo';
import './ChatPage.css';

const ChatView = () => {
  const dispatch = useDispatch();
  let selectedChatId = useSelector((state) => state.chat.selectedChatId);
  let selectedChat = useSelector((state) => state.chat.chatList[selectedChatId]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const user = useSelector((state) => state.auth.payload);
  const userId = user?.sub?.id;
  const [editingMessageId, setEditingMessageId] = useState(null);
  const chatList = useSelector((state) => state.chat.chatList) || {};
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (selectedChatId) {
      dispatch(fetchChatMessages({ chatId: selectedChatId, offset: 0 }));
      console.log(selectedChatMessages);
    }
  }, [selectedChatId, dispatch]);

  if (!selectedChat) {
    return <Typography>Select a chat to view messages</Typography>;
  }

  let selectedChatMessages = selectedChat.messages || [];

  const handleSendMessage = async () => {
    if (messageText.trim() || selectedImage) {
      try {
        // Send the message and retrieve the new message details
        const newMessageResponse = await dispatch(sendMessage({
          chatId: selectedChatId,
          text: messageText,
          media: [] // Initialize with empty media array
        })).unwrap();
  
        console.log(newMessageResponse);
  
        const newMessage = newMessageResponse.MessageUpsert;
        const messageId = newMessage?._id;
  
        // If an image is selected, upload it and associate it with the message
        if (selectedImage && messageId) {
          const formData = new FormData();
          formData.append('file', selectedImage);
          formData.append('type', 'message');
          formData.append('messageId', messageId);
  
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
          });
  
          if (response.ok) {
            const imageData = await response.json();
            // Update the message with the image data
            dispatch(updateChatMessage({
              chatId: selectedChatId,
              messageId: messageId,
              media: [{ _id: imageData._id, url: imageData.url }]
            }));
          }
        }
  
        // Clear the input fields
        setMessageText('');
        setSelectedImage(null);
      } catch (error) {
        console.error('Error sending message or uploading image:', error);
      }
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message._id);
    setEditText(message.text);
  };

  const handleEditSubmit = (e, chatId, messageId) => {
    e.preventDefault();
  
    if (!editText.trim()) {
      console.error('Text cannot be empty.');
      return;
    }
  
    if (!chatId || !messageId) {
      console.error('Invalid chatId or messageId:', { chatId, messageId });
      return;
    }
  
    dispatch(updateChatMessage({ chatId, messageId, newText: editText }));
    setEditingMessageId(null);
  };
  

  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage({ chatId: selectedChatId, messageId }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>{selectedChat.title || 'Untitled Chat'}</Typography>
      <List>
        {selectedChatMessages.length > 0 ? (
          selectedChatMessages.map((message) => (
            <ListItem key={message._id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  alt="avatar"
                  src={`http://localhost:5000${message.owner?.avatar?.url}` || 'default-avatar.png'}
                />
              </ListItemAvatar>
              <ListItemText
                primary={message.owner?.nick}
                secondary={
                  <>
                    {editingMessageId === message._id ? (
                      <form onSubmit={(e) => handleEditSubmit(e, selectedChatId, message._id)}>
                        <TextField
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          fullWidth
                        />
                        <Button type="submit">Save</Button>
                        <Button onClick={() => setEditingMessageId(null)}>Cancel</Button>
                      </form>
                    ) : (
                      <>
                        <Typography>{message.text}</Typography>
                        {message.image && (
                          <img src={message.image} alt="message-img" style={{ maxWidth: '200px', marginTop: '10px' }} />
                        )}
                        <Box display="flex" alignItems="center">
                          {message.owner._id === userId && (
                            <>
                              <IconButton onClick={() => handleEditMessage(message)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteMessage(message._id)}>
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </>
                    )}
                    <Typography variant="body2" color="textSecondary">{new Date(parseInt(message.createdAt)).toLocaleString()}</Typography>
                  </>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography>No messages yet</Typography>
        )}
      </List>
      <Box display="flex" mt={2} alignItems="center">
        <TextField
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message"
          fullWidth
        />
        <input
          accept="image/*"
          type="file"
          id="image-upload"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <label htmlFor="image-upload">
          <IconButton color="primary" component="span">
            <PhotoIcon />
          </IconButton>
        </label>
        <IconButton color="primary" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
      {selectedImage && (
        <Typography variant="body2" color="textSecondary">Selected image: {selectedImage.name}</Typography>
      )}
    </Container>
  );
};

export default ChatView;
