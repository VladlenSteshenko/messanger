// src/components/Chat/UserSearch.js

import React, { useState } from 'react';
import { useFindUsersByNickQuery, useAddUserToChatMutation } from '../../api/api';
import { useSelector } from 'react-redux';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { data, error, isLoading } = useFindUsersByNickQuery(searchTerm, {
    skip: !searchTriggered,
  });
  const [addUserToChatMutation] = useAddUserToChatMutation();

  // Get selected chat and its members from the state
  const selectedChatId = useSelector((state) => state.chat.selectedChatId);
  const chatList = useSelector((state) => state.chat.chatList);
  const existingMembers = chatList[selectedChatId]?.members || [];

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const addUserToChat = async (userId) => {
    try {
      // Create a new array of members including the new user
      const updatedMembers = [...existingMembers, { _id: userId }];

      // Call the mutation to update the chat with the new members list
      await addUserToChatMutation({ chatId: selectedChatId, members: updatedMembers }).unwrap();

      console.log('User added to chat successfully');
    } catch (err) {
      console.error('Failed to add user to chat:', err);
    }
  };

  return (
    <div className="user-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for users by nickname"
      />
      <button onClick={handleSearch} disabled={isLoading}>
        Search
      </button>
      {error && <p>Error occurred while searching for users</p>}
      {data && data.UserFind && (
        <ul>
          {data.UserFind.map((user) => (
            <li key={user._id}>
              <div>
                <img src={user.avatar?.url || 'default-avatar.png'} alt="avatar" />
                <span>{user.nick}</span>
                <button onClick={() => addUserToChat(user._id)}>Add to Chat</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;
