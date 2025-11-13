// src/components/JoinAllChatsOnLoad.jsx
import { useEffect } from "react"
import { socket } from "../socket/socket"
import useGetChats from "../hooks/useGetChats"

export default function JoinAllChatsOnLoad() {
  const { data: chats = [] } = useGetChats()

  useEffect(() => {
    if (!chats || !chats.length) return
    chats.forEach((chat) => {
      if (chat?._id) {
        socket.emit("joinChat", chat._id)
        // debug
        console.debug(`socket.emit joinChat ${chat._id}`)
      }
    })
  }, [chats])

  return null
}
