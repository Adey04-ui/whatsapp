import React from 'react'
import whatsapp from '../assets/whatsapp.png'
import { useSelector } from 'react-redux'

function Topbar() {

  const {user} = useSelector((state)=> state.user)
  
    const loggedInUser = user?.email || null

  return (
    <div className='topbar'>
      <img src={whatsapp} alt="" className='topbarlogo' />
      <span className="topbarlogo2">
        WhatsApp
      </span>
      <span style={{display: loggedInUser ? 'block' : 'none', fontSize: '12px', color: '#999999'}} className="loggedinuser">
        &nbsp;&bull;&nbsp;{loggedInUser}
      </span>
    </div>
  )
}

export default Topbar