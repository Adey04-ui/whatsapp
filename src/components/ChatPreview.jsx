import React from 'react'
import { FaLock, FaWhatsapp } from 'react-icons/fa'

function ChatPreview() {
  return (
    <div className="chatpreview">
      <span className="encryptmessage">
        <FaLock size={13} style={{marginRight: '4px'}} /> End-to-end encrypted
      </span>
      <div className="chatpreview2">
        <FaWhatsapp size={90} style={{color: '#4d4d4dff', marginBottom: '10px'}} />
        <span className="nochatmessage2">
          WhatsApp
        </span>
        <span className="nochatmessage">
          Select a chat to start messaging
        </span>
      </div>
    </div>
  )
}

export default ChatPreview