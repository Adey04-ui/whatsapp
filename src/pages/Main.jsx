import React from 'react'
import Sidebar from '../components/Sidebar'
import useAuthCheck from '../hooks/useAuthCheck'
import ChatsSection from '../components/ChatsSection'
import Loader from '../components/Loader'
import MessagesSection from '../components/MessagesSection'
import JoinAllChatsOnLoad from '../components/JoinAllChatsOnLoad'

function Main() {

  const [controlTab, setControlTab] = React.useState('chats')

  const { user, isLoading } = useAuthCheck()

    if (isLoading) {
      return <Loader />
    }
    if (!user) {
      return null
    }
  
  return (
    <div className="fullcontainer">
      <JoinAllChatsOnLoad />
      <Sidebar controlTab={controlTab} setControlTab={setControlTab} />
      <ChatsSection />
      <MessagesSection />
    </div>
  )
}

export default Main