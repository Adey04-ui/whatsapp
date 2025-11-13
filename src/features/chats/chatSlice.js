import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  chats: [],
  selectedChat: null,
};

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload)
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload
    },
    updateLatestMessage: (state, action) => {
      const { chatId, latestMessage } = action.payload;
      const chat = state.chats.find(c => c._id === chatId)
      if (chat) chat.latestMessage = latestMessage
    },
  },
})

export const { setChats, addChat, setSelectedChat, updateLatestMessage } = chatSlice.actions
export default chatSlice.reducer