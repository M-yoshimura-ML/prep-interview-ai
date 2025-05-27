import { Spinner } from '@heroui/react'
import React from 'react'

const Loader = () => {
  return (
    <div className='flex items-center justify-center min-h-screen'>
        <Spinner color='default' label='Loading...' size='lg' />
    </div>
  )
}

export default Loader