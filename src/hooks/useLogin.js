import { useMutation } from "@tanstack/react-query"
import { loginUser } from "../services/userService"
import { useDispatch } from "react-redux"
import { setUser } from "../features/user/userSlice"
import { toast } from "sonner"

export const useLogin = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(setUser(data.user))
      toast.success(`Logged in in as ${data.email}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed")
    },
  })
}
