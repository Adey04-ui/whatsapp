import React from 'react'
import ClipLoader from 'react-spinners/ClipLoader'

function Loader() {
  return (
    <div className='loader'>
      <ClipLoader color="#295d42" size={90} speedMultiplier={1.0} />
    </div>
  )
}

export default Loader