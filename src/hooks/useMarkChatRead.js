// useMarkChatRead.js
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { socket } from "../socket/socket"
import axios from '../config/axios.js'
import API_URI from "../config/backend"

export default function useMarkChatRead(selectedChat) {
  const { user } = useSelector((state) => state.user)


  useEffect(() => {
    if (!selectedChat || !user) return

    const markReadApiAndNotify = async () => {
      try {
        await axios.put(
          `${API_URI}/messages/read/${selectedChat._id}`,
          {},
          { withCredentials: true }
        )

        socket.emit("messageRead", {
          chatId: selectedChat._id,
          userId: user._id,
        })
      } catch (err) {
        console.error("markRead error", err)
      }
    }

    markReadApiAndNotify()

    const handleIncoming = (message) => {
      const incomingChatId =
        message?.chatId?._id || message?.chat?._id || message?.chatId

      if (!incomingChatId) return

      if (incomingChatId.toString() === selectedChat._id.toString()) {
        markReadApiAndNotify()
      }
    }

    socket.on("messageReceived", handleIncoming)

    return () => {
      socket.off("messageReceived", handleIncoming)
    }
  }, [selectedChat, user])
}
