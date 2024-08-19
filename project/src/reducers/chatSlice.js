// src/reducers/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatList: {},
    selectedChatId: null,
  },
  reducers: {
    setChatList: (state, action) => {
      const payload = action.payload;

      let chats = [];

      if (Array.isArray(payload)) {
        chats = payload;
      } else if (typeof payload === "object" && payload !== null) {
        const findChats = (obj) => {
          for (let key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
              const result = findChats(obj[key]);
              if (result) return result;
            }
          }
          return null;
        };

        chats = findChats(payload) || [];
      }

      const chatList = chats.reduce((acc, chat) => {
        acc[chat._id] = chat;
        return acc;
      }, {});

      state.chatList = chatList;
    },

    addChat: (state, action) => {
      const chatData = action.payload;
      const chat = chatData.ChatUpsert || chatData;

      if (chat._id) {
        const newChat = {
          ...chat,
          members: chat.members || [],
          messages: chat.messages || [],
        };

        state.chatList[chat._id] = newChat;
      } else {
        console.error("Invalid chat data, missing _id:", chat);
      }
    },

    updateLastMessage: (state, action) => {
      const { chatId, lastMessage } = action.payload;
      if (state.chatList[chatId]) {
        state.chatList[chatId].lastMessage = lastMessage;
      }
    },
    setSelectedChatId: (state, action) => {
      state.selectedChatId = action.payload;
    },
    setChatMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (state.chatList[chatId]) {
        state.chatList[chatId].messages = messages;
      }
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;

      if (state.chatList[chatId]) {
        const messages = state.chatList[chatId].messages;
        const index = messages.findIndex((msg) => msg._id === message._id);

        if (index !== -1) {
          messages[index] = message;
        } else {
          messages.push(message);
        }
        console.log("addmessage", message)
        state.chatList[chatId].lastMessage = message;
      }

    },

    updateUserNickname: (state, action) => {
      const { userId, newNick } = action.payload;

      for (let chatId in state.chatList) {
        const chat = state.chatList[chatId];

        if (chat.members) {
          chat.members = chat.members.map((member) =>
            member._id === userId ? { ...member, nick: newNick } : member
          );
        }

        if (chat.messages) {
          chat.messages = chat.messages.map((message) => {
            if (message.owner && message.owner._id === userId) {
              return {
                ...message,
                owner: {
                  ...message.owner,
                  nick: newNick,
                },
              };
            }
            return message;
          });
        }
      }
    },

    updateMessage: (state, action) => {
      const { chatId, message } = action.payload;
    
      // Проверяем, существуют ли chatId, message и message._id
      if (!chatId || !message || !message._id) {
        console.error('Invalid message update payload:', { chatId, message });
        return;
      }
    
      const messages = state.chatList[chatId]?.messages;
    
      // Проверяем, существуют ли сообщения в выбранном чате
      if (!messages) {
        console.error('No messages found for chatId:', chatId);
        return;
      }
    
      const index = messages.findIndex((msg) => msg._id === message._id);
    
      if (index !== -1) {
        messages[index] = message;
      } else {
        console.error('Message not found in chat:', message._id);
      }
    },
    
    removeMessage: (state, action) => {
      const { chatId, messageId } = action.payload;
      const chat = state.chatList[chatId];
      if (chat) {
        chat.messages = chat.messages.filter((msg) => msg._id !== messageId);
      }
    },
  },
});

export const {
  setChatList,
  addChat,
  updateLastMessage,
  setSelectedChatId,
  setChatMessages,
  addMessage,
  updateUserNickname,
  updateMessage,
  removeMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
