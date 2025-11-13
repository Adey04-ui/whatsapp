import React from 'react'
import ClipLoader from 'react-spinners/ClipLoader'

function RelativeLoader() {
  return (
    <div className='loader2'>
      <ClipLoader color="#295d42" size={90} speedMultiplier={1.0} />
    </div>
  )
}

export default RelativeLoader