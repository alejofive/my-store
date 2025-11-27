'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type FormValues = {
  email: string
  password: string
  store: string
  name: string
}

const SignupForm = () => {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onTouched' })

  async function onSubmit(data: FormValues) {
    // Simula una petición al backend
    await new Promise(res => setTimeout(res, 600))
    console.log('Login mock submit:', data)
    setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className='block mb-1 text-sm font-medium'>My Store</label>
      <input
        type='store'
        {...register('store', {
          required: 'The store name is required',
        })}
        className={`w-full px-3 py-2 border rounded ${errors.store ? 'border-red-500' : 'border-gray-300'} mb-2`}
        aria-invalid={errors.store ? 'true' : 'false'}
      />
      {errors.store && <p className='text-red-600 text-sm mb-2'>{errors.store.message}</p>}

      <label className='block mb-1 text-sm font-medium'>Name</label>
      <input
        type='name'
        {...register('name', {
          required: 'The name name is required',
        })}
        className={`w-full px-3 py-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'} mb-2`}
        aria-invalid={errors.name ? 'true' : 'false'}
      />
      {errors.name && <p className='text-red-600 text-sm mb-2'>{errors.name.message}</p>}

      <label className='block mb-1 text-sm font-medium'>Email</label>
      <input
        type='email'
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
        })}
        className={`w-full px-3 py-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'} mb-2`}
        aria-invalid={errors.email ? 'true' : 'false'}
      />
      {errors.email && <p className='text-red-600 text-sm mb-2'>{errors.email.message}</p>}

      <label className='block mb-1 text-sm font-medium'>Password</label>
      <input
        type='password'
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Minimum 6 characters' },
        })}
        className={`w-full px-3 py-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'} mb-2`}
        aria-invalid={errors.password ? 'true' : 'false'}
      />
      {errors.password && <p className='text-red-600 text-sm mb-2'>{errors.password.message}</p>}

      <button type='submit' disabled={isSubmitting} className='w-full mt-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-950 disabled:opacity-60'>
        {isSubmitting ? 'Enviando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default SignupForm
