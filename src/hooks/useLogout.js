import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logoutUser } from "../services/userService"
import { useDispatch } from "react-redux"
import { logoutUser as logoutRedux } from "../features/user/userSlice"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { setSelectedChat } from "../features/chats/chatSlice"

export const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      dispatch(logoutRedux())
      queryClient.clear() 
      dispatch(setSelectedChat(null))
      toast.success(data.message || "Logged out successfully")
      navigate("/login")
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Logout failed")
    },
  })
}
