// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode }  from "jwt-decode";

const initialState = {
  token: null,
  payload: null,
  profile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      const decodedToken = jwtDecode(action.payload.token);
      state.token = action.payload.token;
      state.payload = decodedToken;
    },
    setUser(state, action) {
      state.payload = action.payload;
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    logout(state) {
      state.token = null;
      state.payload = null;
      state.profile = null;
    },
  },
});

export const { setAuth, setUser, setProfile, logout } = authSlice.actions;

export default authSlice.reducer;




  

