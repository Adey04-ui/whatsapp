import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  messages: [],
  loading: false,
}

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    clearMessages: (state) => {
      state.messages = []
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setMessages, addMessage, clearMessages, setLoading } = messageSlice.actions
export default messageSlice.reducer
