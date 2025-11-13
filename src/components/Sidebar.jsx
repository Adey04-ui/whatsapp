import React from 'react'
import { BiChat, BiMessage } from 'react-icons/bi'
import {BsPerson, BsPersonAdd, BsPhone, BsTelephone} from 'react-icons/bs'
import { FaInfoCircle } from 'react-icons/fa'
import { useLogout } from '../hooks/useLogout'

function Sidebar({controlTab, setControlTab}) {

  const { mutate: logout, isLoading } = useLogout()

  return (
    <div className='sidebar'>
      <div className="tabcontrols">
        <ul className="tabcontrols2">
          <li 
            className={`tabcontrol ${controlTab === 'chats' && 'active'}`}
            onClick={() => controlTab !== 'chats' && setControlTab('chats')}
          >
            <BiChat style={{marginRight: '7px'}} /> chats
          </li>
          <li 
            className={`tabcontrol ${controlTab === 'status' && 'active'}`}
            onClick={() => controlTab !== 'status' && setControlTab('status')}
          >
            <BsPerson style={{marginRight: '7px'}} /> status
          </li>
          <li 
            className={`tabcontrol ${controlTab === 'calls' && 'active'}`}
            onClick={() => controlTab !== 'calls' && setControlTab('calls')}
          >
            <BsTelephone style={{marginRight: '7px'}} /> calls
          </li>
        </ul>
        <div className="logout" onClick={()=> logout()} disable={isLoading}>
          <FaInfoCircle style={{marginRight: '9px'}} /> {isLoading ? "Logging out..." : "Logout"}
        </div>
      </div>
    </div>
  )
}

export default Sidebar