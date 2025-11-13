import React, { useState } from "react"
import { FaPlus, FaSearch } from "react-icons/fa"
import useGetUsers from "../hooks/useGetUsers"
import { useSelector } from "react-redux"
import useCreateChat from "../hooks/useCreateChat"
import RelativeLoader from "./RelativeLoader"
import { useDispatch } from "react-redux"
import { setSelectedChat } from "../features/chats/chatSlice"

function Users({ showChats, setShowChats, showusers }) {
  const { user } = useSelector((state) => state.user)
  const [search, setSearch] = useState("")
  const { data } = useGetUsers()
  const dispatch = useDispatch()

  const { mutate: createChat, isPending } = useCreateChat()

  const loggedInUser = user?._id
  
  const filteredUsers = (data || []).filter(
    (u) =>
      u._id !== loggedInUser &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  )

  function handleUserClick(selectedUser) {
    createChat(selectedUser._id, {
      onSuccess: (chatData) => {
        dispatch(setSelectedChat(chatData))
        setShowChats(true)
      },
    })
  }

  if (isPending) return <RelativeLoader />

  return (
    <div className={`chatsection ${!showChats && "active"}`}>
      <div className="chatsheader">
        <div className="chatsheader2">Users</div>
        <div className="newchatbtn" onClick={() => setShowChats(true)}>
          <FaPlus style={{ transform: "rotate(45deg)" }} />
        </div>
      </div>

      <div className="searchchats">
        <label
          htmlFor="searchUsers"
          className="search-icon"
          style={{ display: !showChats ? "block" : "none" }}
        >
          <FaSearch />
        </label>
        <input
          type="search"
          id="searchUsers"
          placeholder="Search a user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="userss">
        {showusers &&
          filteredUsers.map((user, index) => (
            <div
              className="usersdiv-userspage"
              key={user._id || index}
              onClick={() => handleUserClick(user)}
            >
              <img src={user.profilePic} alt="" className="profilepicture" />
              <div>
                <span className="user-name-userscomp">{user.name}</span>
                <span className="user-email-userscomp">{user.email}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Users
