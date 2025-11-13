import { io } from "socket.io-client"
import { BASE_URI } from "../config/backend"

const BASE_URL = "https://whatsapp-backend-tamk.onrender.com"
export const socket = io(BASE_URL, {
  autoConnect: false, 
  withCredentials: true,
})