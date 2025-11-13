import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaEnvelope, FaEyeSlash, FaIdCard, FaPhoneAlt, FaUserAlt } from 'react-icons/fa'
import { useLogin } from "../hooks/useLogin"
import useAuthCheck from '../hooks/useAuthCheck'
import { ThreeDots } from 'react-loader-spinner'
import Loader from './Loader'

function Login() {

  const navigate = useNavigate()


  const [formData, setFormData] = useState({
    password: '',
    email: '',
  })

  const {password, email} = formData

  const onChange = (e) => {
  setFormData((prevState) => ({
    ...prevState,
    [e.target.name]: e.target.value,
  }))
  }
  const { mutate: login, isPending } = useLogin()

  function onSubmit(e) {
    e.preventDefault()
     const userData = { email, password }
    login(userData, {
      onSuccess: () => navigate("/"),
    })
  }

  
  const { user, isLoading } = useAuthCheck()
  
      if (isLoading) {
        return <Loader />
      }
      if (user) {
        navigate("/")
      }
      
  return (
    <div className='auth'>
      <form onSubmit={onSubmit} className="login">
        <div className="login">
          <h2>Sign-In</h2>
          <div className="input-cont">
            <label htmlFor="email"><FaEnvelope size={15} style={{cursor: 'pointer'}} id='label' /></label>
            <input type="email"
                  placeholder='Email'
                  id='email'
                  name='email'
                  value={email}
                  onChange={onChange}
                  className='textinput' />
          </div>
          <div className="input-cont">
            <label htmlFor="username"><FaEyeSlash size={15} style={{cursor: 'pointer'}} id='label' /></label>
            <input type="password"
                  placeholder='Password'
                  id='password'
                  name='password'
                  value={password}
                  onChange={onChange}
                  className='textinput' />
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
                "Sign In"
              )}
            </button>
          </div>
          <p>Don't have an account ?. <Link to="/join-whatsapp" className='link'>Sign Up</Link></p>
        </div>
      </form>
    </div>
  )
}

export default Login