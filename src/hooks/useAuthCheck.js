import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useQuery } from "@tanstack/react-query"
import axios from '../config/axios.js'
import { setUser, logoutUser } from "../features/user/userSlice.js"
import API_URI from "../config/backend.js"

export default function useAuthCheck() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user } = useSelector((state) => state.user)

  const { data, error, isLoading, isSuccess } = useQuery({
    queryKey: ["authCheck"],
    queryFn: async () => {
      const res = await axios.get(`${API_URI}/users/me`, {
        withCredentials: true,
      })
      return res.data
    },
    retry: false, 
    staleTime: 1000 * 60 * 5, 
  })

  useEffect(() => {
    if (isLoading) return 

    if (error) {
      dispatch(logoutUser())
      navigate("/login")
    } else if (isSuccess && data && !user) {
      dispatch(setUser(data))
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission()
      }
    }
  }, [isLoading, error, isSuccess, data, dispatch, navigate, user])

  return { user, isLoading, data }
}
