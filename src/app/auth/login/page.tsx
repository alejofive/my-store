'use client'

import SigninForm from '@/components/auth/SigninForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className='grid grid-cols-12'>
      <div className=' col-span-6 bg-slate-900'></div>
      <div className='min-h-screen  col-span-6 flex items-center justify-center'>
        <div className='w-full max-w-md p-8 bg-white '>
          <h1 className='text-3xl font-bold mb-6 text-center text-slate-900'>Welcome back</h1>

          <SigninForm />

          <p className='mt-4 text-center text-sm text-slate-600'>
            Don't you have an account?{' '}
            <Link href='/auth/register' className='text-slate-700 hover:underline'>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
