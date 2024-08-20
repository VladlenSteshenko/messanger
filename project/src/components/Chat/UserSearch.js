// src/components/Chat/UserSearch.js
import React, { useState } from "react";
import { useFindUsersByNickQuery, useAddUserToChatMutation } from "../../api/api";
import { useSelector } from "react-redux";
import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, TextField, Typography } from "@mui/material";
import "./ChatPage.css";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { data, error, isLoading } = useFindUsersByNickQuery(searchTerm, { skip: !searchTriggered });
  const [addUserToChatMutation] = useAddUserToChatMutation();
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);
  const chatList = useSelector((state) => state.chat.chatList);
  const existingMembers = chatList[selectedChatId]?.members || [];

  const handleSearch = () => setSearchTriggered(true);

  const addUserToChat = async (userId) => {
    try {
      const updatedMembers = [...existingMembers, { _id: userId }];
      await addUserToChatMutation({ chatId: selectedChatId, members: updatedMembers }).unwrap();
      console.log("User added to chat successfully");
    } catch (err) {
      console.error("Failed to add user to chat:", err);
    }
  };

  return (
    <div className="user-search-container">
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for users by nickname"
        fullWidth
        margin="normal"
      />
      <Button onClick={handleSearch} disabled={isLoading} variant="contained">
        Search
      </Button>
      {error && <Typography color="error">Error occurred while searching for users</Typography>}
      {data && data.UserFind && (
        <List>
          {data.UserFind.map((user) => (
            <ListItem key={user._id} className="user-search-result">
              <ListItemAvatar>
                <Avatar src={user.avatar?.url || "default-avatar.png"} alt="avatar" />
              </ListItemAvatar>
              <ListItemText primary={user.nick} />
              <Button variant="contained" onClick={() => addUserToChat(user._id)}>
                Add to Chat
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default UserSearch;

