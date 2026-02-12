'use client'

import SigninForm from '@/components/auth/SigninForm'
import { KeySquare, Receipt } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-paper flex items-center justify-center p-4'>
      {/* Receipt container */}
      <div className='relative w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden'>
        {/* Folded corner effect */}
        <div className='absolute top-0 right-0 w-16 h-16'>
          <div className='absolute top-0 right-0 w-0 h-0 border-t-[64px] border-t-transparent border-r-[64px] border-r-counter-surface opacity-30'></div>
        </div>

        {/* Receipt header */}
        <div className='border-b border-gray-300 p-6 text-center'>
          <div className='flex justify-center mb-3'>
            <div className='p-3 bg-brand/10 rounded-full'>
              <Receipt className='w-8 h-8 text-brand' />
            </div>
          </div>
          <h1 className='text-2xl font-bold text-ink mb-1'>Mi Tienda</h1>
          <p className='text-sm text-gray-600 italic'>Sistema de Inventario</p>
          <div className='mt-3 text-xs text-gray-500'>================================</div>
        </div>

        {/* Receipt body */}
        <div className='p-6'>
          <h2 className='text-lg font-semibold text-center mb-6 text-ink'>
            Iniciar Sesión
          </h2>

          <SigninForm />

          <div className='mt-6 pt-4 border-t border-gray-300'>
            <p className='text-center text-sm text-gray-600'>
              ¿Nuevo en la tienda?{' '}
              <Link
                href='/auth/register'
                className='text-brand hover:text-brand/80 font-medium transition-colors'
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>

        {/* Receipt footer */}
        <div className='border-t border-gray-300  p-4 bg-counter-surface/30'>
          <p className='text-xs text-center text-gray-500'>
            © 2024 Mi Tienda • Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
