import { io } from "socket.io-client"
import { BASE_URI } from "../config/backend"

const BASE_URL = "https://mock-backend-mjwh.onrender.com/"
export const socket = io(BASE_URL, {
  autoConnect: false, 
  withCredentials: true,
  query: { client: "web" },
})