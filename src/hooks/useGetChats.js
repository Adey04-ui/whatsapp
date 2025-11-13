import { useQuery } from "@tanstack/react-query"
import axios from '../config/axios.js'
import API_URI from "../config/backend"

export default function useGetChats() {
  return useQuery({
    queryKey: ["getChats"],
    queryFn: async () => {
      const res = await axios.get(`${API_URI}/chats`, {
        withCredentials: true,
      })
      return res.data
    },
  })
}
