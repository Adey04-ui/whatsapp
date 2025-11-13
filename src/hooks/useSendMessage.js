import { useMutation } from "@tanstack/react-query"
import { sendMessage } from "../services/messageService"
import { toast } from "sonner"

export const useSendMessage = () => {

  return useMutation({
    mutationFn: sendMessage,
    onError: (error) => {
      toast.error(error.response?.data?.message || "send message failed")
    },
  })
}
