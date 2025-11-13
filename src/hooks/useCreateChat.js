import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from '../config/axios.js'
import { toast } from "sonner"
import API_URI from "../config/backend"

export default function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const res = await axios.post(
        `${API_URI}/chats`,
        { userId },
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Chat started!");
      queryClient.invalidateQueries(["getChats"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to start chat");
    },
  });
}
