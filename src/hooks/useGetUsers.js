import { useQuery } from "@tanstack/react-query"
import axios from '../config/axios.js'
import API_URI from "../config/backend"

export default function useGetUsers() {
  const { data, error, isLoading, isSuccess } = useQuery({
    queryKey: ["getUsers"],
    queryFn: async () => {
      const res = await axios.get(`${API_URI}/users`, {
        withCredentials: true,
      })
      return res.data
    },
    refetchOnWindowFocus: false,
  })

  return { data, isLoading, error, isSuccess }
}