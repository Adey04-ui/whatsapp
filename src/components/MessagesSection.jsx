import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import ChatPreview from './ChatPreview'
import { FaCheck, FaCheckDouble, FaChevronDown, FaClock, FaEllipsisH, FaEllipsisV, FaExclamationCircle } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { setSelectedChat } from '../features/chats/chatSlice'
import message from '../assets/message.png'
import { useSendMessage } from '../hooks/useSendMessage'
import { toast } from 'sonner'
import useGetMessages from '../hooks/useGetMessages'
import RelativeLoader from './RelativeLoader'
import { socket } from '../socket/socket'
import { useQueryClient } from '@tanstack/react-query'
import useMarkChatRead from '../hooks/useMarkChatRead'
import API_URI from '../config/backend'

function formatDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (
    date.toDateString() === today.toDateString()
  ) return "Today"
  if (
    date.toDateString() === yesterday.toDateString()
  ) return "Yesterday"
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: today.getFullYear() === date.getFullYear() ? undefined : "numeric",
  })
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false, })
}

function groupMessagesByDate(messages) {
  return messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})
}

function MessagesSection() {

  const {selectedChat} = useSelector((state) => state.chats)
  const {user} = useSelector((state) => state.user)
  const loggedInUser = user._id
  const dispatch = useDispatch()
  
  const [options, setOptions] = useState(false)

  const chatContainerRef = useRef(null)
  const bottomRef = useRef(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  useMarkChatRead(selectedChat)


  // request notification permission on load 
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "denied") toast.error("Notifications disabled")
      })
    }
  }, [])



  const queryClient = useQueryClient()


  const [drafts, setDrafts] = useState({})

  const recipient = selectedChat?.users.find((u) => u._id !== loggedInUser)?._id

  const prevAllMessagesRef = useRef([])

  const [content, setContent] = useState('')

  const chatId = selectedChat?._id

  const {
  data,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useGetMessages(chatId)
  const {mutate: sendMessage} = useSendMessage()


  
  // scroll messages to the bottom
  useEffect(() => {
  const container = chatContainerRef.current
  if (!container) return

  const handleScroll = () => {
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    setShowScrollButton(distanceFromBottom > 100)

    if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      const oldScrollHeight = container.scrollHeight
      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - oldScrollHeight
        })
      })
    }
  }

  container.addEventListener("scroll", handleScroll)

  return () => {
    container.removeEventListener("scroll", handleScroll)
  }
}, [chatContainerRef.current, hasNextPage, isFetchingNextPage, fetchNextPage])

  
  const allMessages = React.useMemo(() => {
    return data?.pages.flatMap(page => page.messages) || [];
  }, [data])

  

    function scrollToBottom(instant = false) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      } else if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: instant ? "auto" : "smooth" })
      }
    }
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const prevLength = prevAllMessagesRef.current.length;
    const newLength = allMessages.length;

    // Only scroll to bottom if messages increased at the bottom (new messages)
    if (newLength > prevLength) {
      const lastMessage = allMessages[allMessages.length - 1];
      const prevLastMessage = prevAllMessagesRef.current[prevLength - 1];
      // Scroll if new message is newer than the previous last one
      if (!prevLastMessage || lastMessage._id !== prevLastMessage._id) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }

    prevAllMessagesRef.current = allMessages;
  }, [allMessages]);

  const inputRef = useRef(null)

  useEffect(() => {
    if (chatId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatId])

  const API = `${API_URI}/messages`



  useEffect(() => {
    setContent('')
  }, [selectedChat?._id])


  useEffect(() => {
    if (chatId) socket.emit("joinChat", chatId)
  }, [chatId])



  useEffect(() => {
    const handleMessageReceived = (message) => {
      const incomingChatId =
        message?.chatId?._id || message?.chat?._id || message?.chatId
      const isCurrentChat = incomingChatId === chatId

      if (isCurrentChat) {
        queryClient.setQueryData(["messages", chatId], (oldData) => {
          if (!oldData) return { pages: [{ messages: [message] }] }
          const updated = {
            ...oldData,
            pages: oldData.pages.map((p, i) =>
              i === oldData.pages.length - 1
                ? { ...p, messages: [...p.messages, message] }
                : p
            ),
          }
          return updated
        })
        setTimeout(() => scrollToBottom(false), 100)
      } else {
        if (document.hidden || !isCurrentChat) {
          showChatNotification(message)
        }
      }
      queryClient.invalidateQueries(["getChats"], { refetchType: "active" })
    }

    socket.on("messageReceived", handleMessageReceived)
    return () => socket.off("messageReceived", handleMessageReceived)
  }, [chatId])


  useEffect(() => {
    if (selectedChat && user) {
      socket.emit("markMessagesAsRead", {
        chatId: selectedChat._id,
        userId: user._id
      })
    }
  }, [selectedChat])



  useEffect(() => {
    setContent(drafts[chatId] || "")
  }, [chatId])



  useEffect(() => {
    if (chatId) {
      setDrafts((prev) => ({ ...prev, [chatId]: content }))
    }
  }, [content, chatId])

  function handleSendMessage() {
    if (!content.trim()) return toast.error("Message cannot be empty")

      const tempId = `temp-${Date.now()}`
      const tempMessage = {
        _id: tempId,
        chatId,
        content,
        sender: user,
        timestamp: new Date().toISOString(),
        readBy: [],
        deliveredTo: [],
        status: "sending",
      }

      queryClient.setQueryData(["messages", chatId], (oldData) => {
      if (!oldData) return { pages: [{ messages: [tempMessage] }] }
      const updated = {
        ...oldData,
        pages: oldData.pages.map((p, i) =>
          i === oldData.pages.length - 1
            ? { ...p, messages: [...p.messages, tempMessage] }
            : p
        ),
      }
      return updated
    })

    queryClient.setQueryData(["getChats"], (oldChats) => {
      if (!oldChats) return oldChats

      return oldChats.map((chat) => {
        if (chat._id === chatId) {
          return {
            ...chat,
            latestMessage: {
              content: content,
              sender: user?._id,
              timestamp: new Date().toISOString(),
              status: "sending",
            },
            latestMessageAt: new Date().toISOString(),
          }
        }
        return chat
      })
    })

    setContent("")
    scrollToBottom(true)

    sendMessage({ chatId, content, recipient }, {
      onSuccess: (newMessage) => {
        queryClient.invalidateQueries(["getChats"], { refetchType: "active" })
        queryClient.setQueryData(["messages", chatId], (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg._id === tempId ? { ...newMessage, status: "sent" } : msg
              ),
            })),
          }
        })

        socket.emit("newMessage", newMessage)
      },
      onError: () => {
        queryClient.setQueryData(["messages", chatId], (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg._id === tempId ? { ...msg, status: "failed" } : msg
              ),
            })),
          }
        })

        queryClient.setQueryData(["getChats"], (oldChats) => {
          if (!oldChats) return oldChats

          return oldChats.map((chat) => {
            if (chat._id === chatId) {
              return {
                ...chat,
                latestMessage: {
                  content: content,
                  sender: user,
                  timestamp: new Date().toISOString(),
                  status: "failed",
                },
                latestMessageAt: new Date().toISOString(),
              }
            }
            return chat
          })
        })
      }
    })
  }

  useEffect(() => {
    const handleMessageDelivered = ({ messageId, deliveredTo }) => {
      queryClient.invalidateQueries(["getChats"], { refetchType: "active" })
      queryClient.setQueryData(["messages", chatId], (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((msg) =>
              msg._id === messageId
                ? { ...msg, deliveredTo, status: "delivered" }
                : msg
            ),
          })),
        }
      })
    }

    const handleMessagesRead = ({ chatId, userId }) => {
      queryClient.invalidateQueries(["getChats"], { refetchType: "active" })
      queryClient.setQueryData(["messages", chatId], (oldData) => {
        if (!oldData) return oldData
        const updated = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) => {
              const mChatId = m.chatId?._id || m.chatId
              if (!mChatId) return m
              if (mChatId.toString() !== chatId.toString()) return m

              const readBy = m.readBy || []
              if (!readBy.some(id => id.toString() === userId.toString())) {
                return { ...m, readBy: [...readBy, userId], status: 'read' }
              }
              return m
            }),
          })),
        }
        return updated
      })
       
    }

    socket.on("messageDelivered", handleMessageDelivered)
    socket.on("messagesRead", handleMessagesRead)
    return () => {
      socket.off("messageDelivered", handleMessageDelivered)
      socket.off("messagesRead", handleMessagesRead)
    }
  }, [chatId, queryClient])


  function showChatNotification(message) {
    if (!("Notification" in window) || Notification.permission !== "granted") return

    const senderName = message.sender?.name || "New message"
    const messageText = message.content || ""

    const circularIcon = message.sender?.profilePic?.includes("cloudinary.com")
    ? message.sender?.profilePic.replace("/upload/", "/upload/w_100,h_100,c_fill,r_max/")
    : "/whatsapp.png"

    const notification = new Notification(senderName, {
      body: messageText,
      icon: circularIcon,
    })

    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
    }
  }

  if (selectedChat === null) {
    return <ChatPreview />
  }

  const groupedMessages = groupMessagesByDate(allMessages)

  const recipientData = selectedChat.users.find((u) => u._id !== loggedInUser)

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)


  return (
    <div className="messagesection">
      <div className="messageheader">
        <span className="messageheaderrecipient">
        <img src={recipientData.profilePic} alt="profilepicture" className='profilepicture' />
          <span style={{display: 'flex', flexDirection: 'column'}}>
            <span>
              {recipientData?.name + ' ' || 'Unknown User'}
            </span>
            <span>
              {recipientData?.isOnline ? (
                <span className="online-dot">Online</span>
              ) : (
                <span className="last-seen">
                  Last seen{" "}
                  {recipientData?.lastSeen ? (
                    (() => {
                      const lastSeenDate = new Date(recipientData.lastSeen);
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);

                      if (lastSeenDate.toDateString() === today.toDateString()) {
                        return formatTime(recipientData.lastSeen);
                      } else if (lastSeenDate.toDateString() === yesterday.toDateString()) {
                        return `Yesterday at ${formatTime(recipientData.lastSeen)}`;
                      } else {
                        return `${formatDate(recipientData.lastSeen)} at ${formatTime(recipientData.lastSeen)}`;
                      }
                    })()
                  ) : (
                    "Recently"
                  )}
                </span>
              )}
            </span>
          </span>
        </span>
        <span className="messagesoptionsopenbtn" onClick={() => setOptions((prev) => !prev)}>
          <FaEllipsisV />
        </span>
      </div>
      <div className={`messagesoptions ${options ? 'active' : ''} `}>
        <span className="messagesoptionsbtn" onClick={() => {
          dispatch(setSelectedChat(null))
          setOptions(false)
          }
        }
        >Close chat </span>
      </div>
      <div className="chatmessages" ref={chatContainerRef}>
        {isLoading ? (
          <RelativeLoader />
        ) : allMessages.length > 0 ? (
          Object.keys(groupedMessages).map((dateKey) => (
            <div key={dateKey} style={{display: 'flex', flexDirection: 'column'}}>
              <div className="date-separator">
                <span>{formatDate(groupedMessages[dateKey][0].timestamp)}</span>
              </div>
              {groupedMessages[dateKey].map((msg, index) => {
                return (
                <div
                  key={index}
                  className={`messagebubble ${
                    msg.sender._id === loggedInUser ? "sent" : "received"
                  }`}
                  >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">{formatTime(msg.timestamp)} {' '}
                      {msg.status === "sending" && msg.sender._id === user._id ? <FaClock className="clock-icon" /> : ''}
                      {msg.status === "sent" && msg.sender._id === user._id ? <img className='messagestatus' src="/sent.png" alt="" /> : ''}
                      {msg.status === "delivered" && msg.sender._id === user._id ? <img className='messagestatus' src="/delivered.png" alt="" /> : ''}
                      {msg.status === "read" && msg.sender._id === user._id ? <img className='messagestatus' src="/read.png" alt="" /> : ''}
                      {msg.status === "failed" && msg.sender._id === user._id ? <FaExclamationCircle className="error-icon" /> : ''}
                    
                    </div>
                </div>
              )})}
            </div>
          ))
        ) : (
          <div className="nomessages">
            <span>No messages yet</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {showScrollButton && (
        <button 
          className="tobottombtn"
          onClick={() => scrollToBottom(true)}
        >
          <FaChevronDown />
        </button>
      )}
      <div className="messageinput">
        <input type="text" placeholder='Type a message...' className='messageinput2' value={content} ref={inputRef} onChange={(e)=> setContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
        <button className='sendmessgebtn' onClick={handleSendMessage}><img src={message} alt="" className="sendmessge" /></button>
      </div>
    </div>
  )
}

export default MessagesSection