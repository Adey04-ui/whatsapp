import { useMutation } from "@tanstack/react-query"
import { registerUser } from "../services/userService"
import { useDispatch } from "react-redux"
import { setUser } from "../features/user/userSlice"
import { toast } from "sonner"

export const useRegister = () => {
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setUser(data.user))
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Registration failed"

      toast.error(message)
    },
  })
}
