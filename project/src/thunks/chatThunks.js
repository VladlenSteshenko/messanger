// src/reducers/chatThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setChatList,
  addChat,
  updateLastMessage,
  setChatMessages,
  addMessage,
  updateMessage,
  removeMessage,
} from '../reducers/chatSlice';
import io from 'socket.io-client';
import { api } from '../api/api';

const socket = io('http://localhost:5000'); //Socket

export const connectSocket = createAsyncThunk(
  'auth/connectSocket',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) {
      console.error("User not authenticated");
      return;
    }

    socket.emit('jwt', token);

    socket.on('chat', (chat) => {
      dispatch(addChat(chat));
    });

    socket.on('msg', (data) => {
      console.log('Received message data:', data);
    
      if (typeof data === 'object' && data !== null) {
        const { _id: messageId, text, chat: { _id: chatId }, owner, media = [] } = data;
    
        if (chatId && text && owner) {
          const message = {
            _id: messageId,
            text,
            owner: {
              _id: owner._id,
              nick: owner.nick,
              avatar: owner.avatar?.url || '', 
            },
            createdAt: data.createdAt,
            media: media.map((mediaItem) => ({
              _id: mediaItem._id,
              url: mediaItem?.url || '',
            })),
          };
    
          dispatch(addMessage({ chatId, message }));
    
        } else {
          console.error('Received message data does not contain expected properties:', data);
        }
      } else {
        console.error('Received message data is not an object:', data);
      }
    });
    

  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async ({ chatId, offset }, { dispatch }) => {
    try {
      const response = await dispatch(api.endpoints.getMessages.initiate({ chatID:chatId, offset })).unwrap();
      dispatch(setChatMessages({ chatId, messages: response.MessageFind }));
      console.log(response.MessageFind)
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, text, media }, { dispatch }) => {
    try {
      const response = await dispatch(api.endpoints.MessageUpsert.initiate({
        chatID: chatId,
        text,
        media
      })).unwrap();
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
);

export const updateChatMessage = createAsyncThunk(
  'chat/updateChatMessage',
  async ({ chatId, messageId, newText, media }, { dispatch }) => {
    try {
      const response = await dispatch(api.endpoints.MessageUpdate.initiate({
        text: newText,
        messageid: messageId,
        media
      })).unwrap();
      
      // Dispatch updateMessage action with the updated message data
      dispatch(updateMessage({
        chatId,
        message: {
          _id: messageId,
          text: response?.MessageUpsert?.text || newText,
          media: response?.MessageUpsert?.media || media,
        }
      }));
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }
);


export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ chatId, messageId }, { dispatch }) => {
    console.log(123123,messageId)
    console.log(123123,chatId)
    try {
      await dispatch(api.endpoints.MessageDelete.initiate({ messageId })).unwrap();
      dispatch(removeMessage({ chatId, messageId }));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }
);

