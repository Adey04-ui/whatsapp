import axios from "axios"
import API_URI from "./backend.js"

axios.defaults.baseURL = API_URI
axios.defaults.withCredentials = true

export default axios