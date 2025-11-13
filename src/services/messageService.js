import axios from '../config/axios.js'
import API_URI from "../config/backend"

export const sendMessage = async ({chatId, content, recipient}) => {
  const { data } = await axios.post(`${API_URI}/messages`, {content, chatId, recipient}, {
    withCredentials: true
  })
  return data
}