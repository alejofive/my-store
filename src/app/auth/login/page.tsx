'use client'

import SigninForm from '@/components/auth/SigninForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md p-8 bg-white dark:border-gray-800 rounded-lg shadow'>
        <h1 className='text-2xl font-semibold mb-6 text-center'>Iniciar sesión</h1>

        <SigninForm />

        <p className='mt-4 text-center text-sm text-gray-600'>
          ¿No tienes cuenta?{' '}
          <Link href='/auth/register' className='text-blue-600 hover:underline'>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
