import axios from '../config/axios.js'
import API_URI from "../config/backend"

// Register user
export const registerUser = async (formData) => {
    const { data } = await axios.post(`${API_URI}/users`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
}

// Login user
export const loginUser = async (userData) => {
  const { data } = await axios.post(`${API_URI}/users/login`, userData, {
    withCredentials: true
})
  return data
}

// logout
export const logoutUser = async () => {
  const { data } = await axios.post(`${API_URI}/users/logout`, {}, {
    withCredentials: true,
  })
  return data
}
