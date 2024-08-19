// src/components/Chat/ChatList.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserChatsQuery, useChatUpsertMutation } from "../../api/api";
import {
  setChatList,
  setSelectedChatId,
  addChat,
} from "../../reducers/chatSlice";
import { fetchChatMessages } from "../../thunks/chatThunks";
import {
  Avatar,
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import "./ChatPage.css";

const mockChats = [
  {
    _id: 1,
    title: "Chat 1",
    lastMessage: { text: "Hello" },
    lastModified: "1620196188000",
    avatar: { url: "https://via.placeholder.com/50" },
  },
  {
    _id: 2,
    title: "Chat 2",
    lastMessage: { text: "Hi" },
    lastModified: "1620196188000",
    avatar: { url: "https://via.placeholder.com/50" },
  },
];

const ChatList = () => {
  const user = useSelector((state) => state.auth.payload);
  const userId = user?.sub?.id;
  const chatList = useSelector((state) => state.chat.chatList) || {};
  const chats = Object.values(chatList) || mockChats;
  const [createChat] = useChatUpsertMutation();
  const [newChatTitle, setNewChatTitle] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, error, isLoading } = useUserChatsQuery({ _id: userId });
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);

  useEffect(() => {
    if (selectedChatId) {
      dispatch(fetchChatMessages({ chatId: selectedChatId, offset: 0 }));
    }
  }, [dispatch, selectedChatId]);

  const handleCreateChat = async () => {
    if (!newChatTitle) return;

    try {
      const newChat = await createChat({ title: newChatTitle }).unwrap();
      dispatch(addChat(newChat));
      setNewChatTitle("");
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleChatClick = (chat) => {
    dispatch(setSelectedChatId(chat._id));
    dispatch(fetchChatMessages({ chatId: chat._id, offset: 0 }));
  };

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading chats</Typography>;

  return (
    <Container>
      <Box display="flex" flexDirection="column" mb={2}>
        <TextField
          value={newChatTitle}
          onChange={(e) => setNewChatTitle(e.target.value)}
          placeholder="New chat title"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleCreateChat}>
          Create New Chat
        </Button>
        <Button variant="contained" color="primary" onClick={handleGoToProfile}>
          My Profile
        </Button>
      </Box>
      <List>
        {chats.map((chat) => (
          <ListItem key={chat._id} button onClick={() => handleChatClick(chat)}>
            <ListItemAvatar>
              <Avatar
                src={chat.avatar?.url || "default-avatar.png"}
                alt="avatar"
              />
            </ListItemAvatar>
            <ListItemText
              primary={chat.title || "Untitled Chat"}
              secondary={chat.lastMessage?.text}
            />
            <Typography variant="body2" color="textSecondary">
              {chat.lastModified
                ? new Date(parseInt(chat.lastModified)).toLocaleString()
                : ""}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
export default ChatList;
