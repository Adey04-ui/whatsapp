import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaEyeSlash, FaIdCard, FaPencilAlt, FaPhoneAlt } from 'react-icons/fa'
import { useRegister } from '../hooks/useRegister'
import { io } from 'socket.io-client'
import { FaInfoCircle } from 'react-icons/fa'
import { ThreeDots } from 'react-loader-spinner'

function Register() {
  const socketRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission()
    }
  }, [])


  const [formData, setFormData] = useState({
    password: '',
    name: '',
    phone: '',
  })

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailTimeout, setEmailTimeout] = useState(null)
  const [phoneTimeout, setPhoneTimeout] = useState(null)
  const [emailStatus, setEmailStatus] = useState(null)
  const [phoneStatus, setPhoneStatus] = useState(null)

  const [profilePic, setProfilePic] = useState(null)

  const [preview, setPreview] = useState('/noprofile.jpg')

  const [pencil, setPencil] = useState(false)

  useEffect(() => {
    socketRef.current = io('https://whatsapp-backend-tamk.onrender.com/')

    socketRef.current.on('emailStatus', (data) => {
      setEmailStatus(data)
    })

    socketRef.current.on('phoneStatus', (data) => {
      setPhoneStatus(data)
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  const { password, name } = formData

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)

    if (emailTimeout) clearTimeout(emailTimeout)

    if (!value.trim()) {
      setEmailStatus(null)
      return
    }

    const timeout = setTimeout(() => {
      if (value && value.includes('@') && value.includes('.com')) {
        socketRef.current.emit('checkEmail', value)
      }
    }, 600)

    setEmailTimeout(timeout)
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    setPhone(value)

    if (phoneTimeout) clearTimeout(phoneTimeout)

    if (!value.trim()) {
      setPhoneStatus(null)
      return
    }

    const timeout = setTimeout(() => {
        socketRef.current.emit('checkPhone', value)
    }, 600)

    setPhoneTimeout(timeout)
  }

  const { mutate: register, isPending } = useRegister()

  function onSubmit(e) {
    e.preventDefault()

    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("phone", phone)
    formData.append("password", password)
    if (profilePic) { 
      formData.append("profilePic", profilePic)
    }
    register(formData, {
      onSuccess: () => navigate('/'),
    })
  }
  

  return (
    <div className="auth">
      <form onSubmit={onSubmit} className="login">
        <div className="login" style={{paddingTop: '30px', paddingBottom: '40px'}}>
          <h2 style={{marginBottom: '15px'}}>Sign-Up</h2>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '10px', cursor: 'pointer'}}>
            <label htmlFor="profilePic" className='profile-label' onMouseOver={() => setPencil(true)} onMouseOut={() => setPencil(false)}>
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="profile-preview"
                />
                <div className={`editoverlay ${pencil ? 'visible' : ''}`}>
                  <FaPencilAlt size={40} color="#1daa61" />
                </div>
              </label>
            </div>

          <div className="">
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="profile-input"
            />
          </div>

          <div className="input-cont">
            <label htmlFor="fullname">
              <FaIdCard size={15} />
            </label>
            <input
              type="text"
              placeholder="Fullname"
              id="fullname"
              name="name"
              value={name}
              onChange={onChange}
              className="textinput"
            />
          </div>

          {emailStatus && (
            <span className={`emailstatus ${emailStatus.available ? 'green' : 'red'}`}>
              <FaInfoCircle /> &nbsp; {emailStatus.message}
            </span>
          )}
          <div className="input-cont">
            <label htmlFor="email">
              <FaEnvelope size={15} />
            </label>
            <input
              type="email"
              placeholder="Email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              className="textinput"
            />
          </div>

          {phoneStatus && (
            <span className={`emailstatus ${phoneStatus.available ? 'green' : 'red'}`}>
              <FaInfoCircle /> &nbsp; {phoneStatus.message}
            </span>
          )}
          <div className="input-cont">
            <label htmlFor="phoneNumber">
              <FaPhoneAlt size={15} />
            </label>
            <input
              type="tel"
              placeholder="Phone Number"
              id="phoneNumber"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              className="textinput"
            />
          </div>

          <div className="input-cont">
            <label htmlFor="password">
              <FaEyeSlash size={15} />
            </label>
            <input
              type="password"
              placeholder="Password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="textinput"
            />
          </div>

          <div className="input-cont">
            <button type="submit" disabled={isPending} className="login-submit">
              {isPending ? (
                <ThreeDots
                  height="20"
                  width="40"
                  radius="9"
                  color="#fff"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register