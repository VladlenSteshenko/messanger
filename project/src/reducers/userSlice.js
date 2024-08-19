// src/reducers/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userList: [],
    currentUser: null,
  },
  reducers: {
    setUserList(state, action) {
      state.userList = action.payload;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    }
  }
});

export const { setUserList, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
