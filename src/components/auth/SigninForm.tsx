import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type FormValues = {
  email: string
  password: string
}

const SigninForm = () => {
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
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className='block mb-1 text-sm font-medium'>Correo</label>
        <input
          type='email'
          {...register('email', {
            required: 'El correo es requerido',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Introduce un correo válido' },
          })}
          className={`w-full px-3 py-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'} mb-1`}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && <p className='text-red-600 text-sm mb-2'>{errors.email.message}</p>}

        <label className='block mb-1 text-sm font-medium'>Contraseña</label>
        <input
          type='password'
          {...register('password', {
            required: 'La contraseña es requerida',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          })}
          className={`w-full px-3 py-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'} mb-1`}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && <p className='text-red-600 text-sm mb-2'>{errors.password.message}</p>}

        <button type='submit' disabled={isSubmitting} className='w-full mt-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60'>
          {isSubmitting ? 'Enviando...' : 'Entrar'}
        </button>
      </form>
    </>
  )
}

export default SigninForm
