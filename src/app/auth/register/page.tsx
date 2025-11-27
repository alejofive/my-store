import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

const RegisterPage = () => {
  return (
    <div className='grid grid-cols-12'>
      <div className=' col-span-6 bg-slate-900'></div>
      <div className='min-h-screen  col-span-6 flex items-center justify-center'>
        <div className='w-full max-w-md p-8 bg-white '>
          <h1 className='text-3xl font-bold mb-6 text-center text-slate-900'>Welcome back</h1>

          <SignupForm />

          <p className='mt-4 text-center text-sm text-slate-600'>
            You already have an account.{' '}
            <Link href='/auth/login' className='text-slate-700 hover:underline'>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
