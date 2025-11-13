import { configureStore } from '@reduxjs/toolkit'
import userSlice from '../features/user/userSlice.js'
import chatSlice from '../features/chats/chatSlice.js'
import messageSlice from '../features/messages/messageSlice.js'


export const store = configureStore({
  reducer: {
    user: userSlice,
    chats: chatSlice,
    messages: messageSlice
  },
})
