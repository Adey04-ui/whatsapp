import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Topbar from "./components/Topbar"
import Register from "./components/Register"
import { Toaster } from "sonner"
import Main from "./pages/Main"
import Login from "./components/Login"
import Loader from "./components/Loader"
import DotLoader from "react-spinners/DotLoader"
import { useSelector } from "react-redux"
import { socket } from "./socket/socket"
import { useQueryClient } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import { setSelectedChat } from "./features/chats/chatSlice"

function App() {
  const { user } = useSelector((state) => state.user)
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  //  Connect socket only if user exists
  useEffect(() => {
  if (!user?._id) return


  socket.auth = { token: user._id }
  socket.connect()

  socket.on("connect", () => {
    socket.emit("setup", user._id)
  })

  socket.on("connect_error", (err) => {
    console.error(" Socket connection error:", err.message)
  })

  return () => {
    socket.off("connect")
    socket.off("connect_error")
    socket.disconnect()
  }
}, [user?._id])

  useEffect(() => {
  const handleUserStatusChange = ({ userId, isOnline, lastSeen }) => {
    // Update React Query cache for chat list
    queryClient.setQueryData(["getChats"], (oldData) => {
      if (!oldData) return oldData;
      return oldData.map((chat) => ({
        ...chat,
        users: chat.users.map((u) =>
          u._id === userId ? { ...u, isOnline, lastSeen } : u
        ),
      }));
    });

    // Update Redux selectedChat (if open)
    dispatch((state, getState) => {
      const { selectedChat } = getState().chats;
      if (!selectedChat) return;

      const updatedUsers = selectedChat.users.map((u) =>
        u._id === userId ? { ...u, isOnline, lastSeen } : u
      );

      dispatch(setSelectedChat({ ...selectedChat, users: updatedUsers }))
    });
  };

  socket.on("userStatusChanged", handleUserStatusChange);
  return () => socket.off("userStatusChanged", handleUserStatusChange);
}, [queryClient, dispatch]);


  return (
    <Router>
      <Topbar />
      <Routes>
        <Route path="/join-whatsapp" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loader1" element={<Loader />} />
        <Route path="/loader" element={<DotLoader loading={true} size={10} />} />
        <Route path="/" element={<Main />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  )
}

export default App
