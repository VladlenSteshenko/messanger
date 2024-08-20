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
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);
  const selectedChat = useSelector((state) => state.chat.chatList[selectedChatId]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const user = useSelector((state) => state.auth.payload);
  const userId = user?.sub?.id;
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (selectedChatId) {
      dispatch(fetchChatMessages({ chatId: selectedChatId, offset: 0 }));
    }
  }, [selectedChatId, dispatch]);

  if (!selectedChat) {
    return <Typography variant="h6" color="textSecondary">Select a chat to view messages</Typography>;
  }

  const handleSendMessage = async () => {
    if (messageText.trim() || selectedImage) {
      try {
        const newMessageResponse = await dispatch(sendMessage({
          chatId: selectedChatId,
          text: messageText,
          media: [] 
        })).unwrap();

        const newMessage = newMessageResponse.MessageUpsert;
        const messageId = newMessage?._id;

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
            dispatch(updateChatMessage({
              chatId: selectedChatId,
              messageId: messageId,
              media: [{ _id: imageData._id, url: imageData.url }]
            }));
          }
        }

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
    if (editText.trim()) {
      dispatch(updateChatMessage({ chatId, messageId, newText: editText }));
      setEditingMessageId(null);
    }
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
    <Container className="chat-view-container">
      <Typography variant="h5" className="chat-title" gutterBottom>{selectedChat.title || 'Untitled Chat'}</Typography>
      <List className="chat-messages-list">
        {selectedChat.messages && selectedChat.messages.length > 0 ? (
          selectedChat.messages.map((message) => (
            <ListItem key={message._id} alignItems="flex-start" className="chat-message-item">
              <ListItemAvatar>
                <Avatar
                  alt={message.owner?.nick}
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
                          autoFocus
                          variant="outlined"
                          margin="normal"
                        />
                        <Box display="flex" gap={1}>
                          <Button type="submit" variant="contained" color="primary">Save</Button>
                          <Button variant="outlined" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                        </Box>
                      </form>
                    ) : (
                      <>
                        <Typography variant="body1" className="message-text">{message.text}</Typography>
                        {/* Render media images */}
                        {message.media && message.media.map((mediaItem, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5000${mediaItem.url}`} 
                            alt={`media-${index}`} 
                            className="message-media-image"
                          />
                        ))}
                        <Box display="flex" alignItems="center" mt={1}>
                          {message.owner._id === userId && (
                            <>
                              <IconButton onClick={() => handleEditMessage(message)} color="primary">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteMessage(message._id)} color="secondary">
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </>
                    )}
                    <Typography variant="caption" color="textSecondary" className="message-timestamp">
                      {new Date(parseInt(message.createdAt)).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No messages yet</Typography>
        )}
      </List>
      <Box display="flex" mt={2} alignItems="center" className="message-input-container">
        <TextField
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message"
          fullWidth
          variant="outlined"
          className="message-input"
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

