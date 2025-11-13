import React, { useState } from "react"
import { FaPlus, FaSearch } from "react-icons/fa"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "sonner"
import useGetChats from "../hooks/useGetChats"
import useGetUsers from "../hooks/useGetUsers"
import { setSelectedChat } from "../features/chats/chatSlice"
import RelativeLoader from "./RelativeLoader"
import axios from '../config/axios.js'
import { socket } from "../socket/socket"
import API_URI from "../config/backend"
import { FaExclamationCircle, FaClock } from "react-icons/fa"

function Chats({ showChats, setShowChats, setShowusers }) {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { user } = useSelector((state) => state.user)
  const { selectedChat } = useSelector((state) => state.chats)

  const { data: chats, isLoading } = useGetChats()
  const { error, isSuccess } = useGetUsers()
  const [search, setSearch] = useState("")

  const handleShowUsers = () => {
    queryClient.invalidateQueries(["getUsers"])

    if (error) {
      toast.error(error.response?.data?.message || "Failed to get users")
    }

    if (isSuccess) {
      setShowChats(false)
      setShowusers(true)
    }
  }

  const { data: unreadCounts } = useQuery({
    queryKey: ["unreadCounts"],
    queryFn: async () => {
      const res = await axios.get(`${API_URI}/chats/unread`, {
        withCredentials: true,
      })
      return res.data
    },
  })

  React.useEffect(() => {
    // Listen for "messagesRead" socket event
    socket.on("messagesRead", ({ chatId, userId }) => {
    if (userId === user._id) {
      queryClient.setQueryData(["unreadCounts"], (oldData) => {
        if (!oldData) return oldData
        return oldData.map((entry) =>
          entry.chatId === chatId && entry.user === user._id
            ? { ...entry, count: 0 }
            : entry
        )
      })
    }
  })

  return () => {
    socket.off("messagesRead")
  }
}, [queryClient])

  const getUnreadCount = (chatId) => {
    if (!unreadCounts) return 0
    const entry = unreadCounts.find((u) => u.chatId === chatId)
    return entry ? entry.count : 0
  }


  const filteredChats = (chats || []).filter((chat) => {
  const otherUsers = chat.users.filter((u) => u._id !== user._id)

  const names = otherUsers.map((u) => u.name).join(", ").toLowerCase()
  const emails = otherUsers.map((u) => u.email).join(", ").toLowerCase()

  const searchTerm = search.toLowerCase()

  return names.includes(searchTerm) || emails.includes(searchTerm)
})

  const sortedChats = [...filteredChats].sort((a, b) => {
    const aTime = new Date(a.latestMessageAt || 0)
    const bTime = new Date(b.latestMessageAt || 0)
    return bTime - aTime
  })


  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ""

    const messageDate = new Date(timestamp)
    const now = new Date()

    const isToday = messageDate.toDateString() === now.toDateString()

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = messageDate.toDateString() === yesterday.toDateString()

    if (isToday) {
      // show time in 24-hour format
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    } else if (isYesterday) {
      return "Yesterday"
    } else {
      // show short date format (e.g. Oct 9)
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric"
      })
    }
  }

  const handleSelectChat = (chat) => {
    dispatch(setSelectedChat(chat))

    // Optimistically clear unread badge
    queryClient.setQueryData(["unreadCounts"], (oldData) => {
      if (!oldData) return oldData
      return oldData.map((entry) =>
        entry.chatId === chat._id && entry.user === user._id ? { ...entry, count: 0 } : entry
      )
    })
  }

  return (
    <div className={`chatsection ${showChats && "active"}`}>
      <div className="chatsheader">
        <div className="chatsheader2">Chats</div>
        <div className="newchatbtn" onClick={handleShowUsers}>
          <FaPlus />
        </div>
      </div>

      <div className="searchchats">
        <label htmlFor="searchChats" className="search-icon">
          <FaSearch />
        </label>
        <input
          type="search"
          id="searchChats"
          placeholder="Search a chat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="userss">
        {isLoading && <RelativeLoader />}
        {sortedChats.length > 0 ? (
          sortedChats.map((chat) => {
            const recipientName = chat.users
              .filter((u) => u._id !== user._id)
              .map((u) => u.name)
              .join(", ")
            const recipientEmail = chat.users
            .filter((u) => u._id !== user._id)
            .map((u) => u.email)
            .join(", ")
            const recipientProfilePic = chat.users
            .filter((u) => u._id !== user._id)
            .map((u) => u.profilePic)
            return (
              <div
                key={chat._id}
                className={`usersdiv-userspage ${
                  selectedChat?._id === chat._id ? "active" : ""
                }`}
                onClick={() => handleSelectChat(chat)}
              >
                <img src={recipientProfilePic} alt="" className="profilepicture" />
                <div style={{width: '100%'}}>
                  <span className="user-name-userscomp">
                    <span style={{overflow: 'hidden', textWrap: 'nowrap'}}>{recipientName}</span>
                    {chat.latestMessage && (
                      <span className="chat-time">
                        {formatMessageTime(chat.latestMessage.timestamp)}
                      </span>
                    )}
                  </span>
                  <div style={{display: 'flex', justifyContent: 'space-between', paddingRight: '12px',}}>
                    {chat.latestMessage ? 
                    (
                        <span className="user-email-userscomp">
                          {chat.latestMessage.status === "sending" && chat.latestMessage.sender === user._id ? <FaClock className="clock-icon" /> : ''}
                          {chat.latestMessage.status === "sent" && chat.latestMessage.sender === user._id ? <img className='messagestatus2' src="/sent.png" alt="" /> : ''}
                          {chat.latestMessage.status === "delivered" && chat.latestMessage.sender === user._id ? <img className='messagestatus2' src="/delivered.png" alt="" /> : ''}
                          {chat.latestMessage.status === "read" && chat.latestMessage.sender === user._id ? <img className='messagestatus2' src="/read.png" alt="" /> : ''}
                          {chat.latestMessage.status === "failed" && chat.latestMessage.sender === user._id ? <FaExclamationCircle className="error-icon" /> : ''}
                          &nbsp;
                          {chat.latestMessage.content.length > 30
                            ? `${chat.latestMessage.content.slice(0, 22)}...`
                            : chat.latestMessage.content}
                        </span>
                    ) : (
                      <span className="user-email-userscomp">{recipientEmail}</span>
                    )}
                    {getUnreadCount(chat._id) > 0 && (
                      <span className="unread-badge">
                        {getUnreadCount(chat._id)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="no-chats">No chats found</div>
        )}
      </div>
    </div>
  )
}

export default Chats
