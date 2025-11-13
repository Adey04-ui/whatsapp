import React, {useState} from 'react'
import Chats from './Chats'
import Users from './Users'

function ChatsSection() {
  const [showChats, setShowChats] = useState(true)
  const [showusers, setShowusers] = useState(false)
  return (
    <div className="tabselector-chat">
      <div className="chatsusers">
        <Chats showChats={showChats} setShowChats={setShowChats} setShowusers={setShowusers} />
        <Users showChats={showChats} setShowChats={setShowChats} setShowusers={setShowusers} showusers={showusers} />
      </div>
    </div>
  )
}

export default ChatsSection