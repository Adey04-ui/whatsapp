import React, {useState} from 'react'
import Chats from './Chats'
import Users from './Users'
import { useSelector } from 'react-redux'

function ChatsSection() {
  const [showChats, setShowChats] = useState(true)
  const [showusers, setShowusers] = useState(false)
  const selectedChat = useSelector((state)=> state.chats.selectedChat)
  return (
    <div className={`tabselector-chat ${selectedChat !== null ? 'notactive' : ''}`}>
      <div className="chatsusers">
        <Chats showChats={showChats} setShowChats={setShowChats} setShowusers={setShowusers} />
        <Users showChats={showChats} setShowChats={setShowChats} setShowusers={setShowusers} showusers={showusers} />
      </div>
    </div>
  )
}

export default ChatsSection