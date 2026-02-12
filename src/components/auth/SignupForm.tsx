'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Store, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

type FormValues = {
  email: string
  password: string
  store: string
  name: string
}

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onTouched' })

  async function onSubmit(data: FormValues) {
    // Simula una petición al backend
    await new Promise(res => setTimeout(res, 600))
    console.log('Registro mock submit:', data)
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Store Name Field */}
      <div className="space-y-2">
        <label className='block text-sm font-medium text-ink'>Nombre de la Tienda</label>
        <div className="relative">
          <input
            type='text'
            {...register('store', {
              required: 'El nombre de la tienda es requerido',
            })}
            placeholder='Mi Tienda S.A.'
            className={`w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand focus:bg-white transition-colors ${errors.store ? 'border-red-400 bg-red-50' : ''}`}
            aria-invalid={errors.store ? 'true' : 'false'}
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <Store className="h-5 w-5" />
          </div>
        </div>
        {errors.store && <p className='text-red-600 text-xs font-medium'>{errors.store.message}</p>}
      </div>

      {/* Your Name Field */}
      <div className="space-y-2">
        <label className='block text-sm font-medium text-ink'>Tu Nombre</label>
        <div className="relative">
          <input
            type='text'
            {...register('name', {
              required: 'Tu nombre es requerido',
            })}
            placeholder='Juan Pérez'
            className={`w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand focus:bg-white transition-colors ${errors.name ? 'border-red-400 bg-red-50' : ''}`}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <User className="h-5 w-5" />
          </div>
        </div>
        {errors.name && <p className='text-red-600 text-xs font-medium'>{errors.name.message}</p>}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className='block text-sm font-medium text-ink'>Correo Electrónico</label>
        <div className="relative">
          <input
            type='email'
            {...register('email', {
              required: 'El correo electrónico es requerido',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresa un correo electrónico válido' },
            })}
            placeholder='correo@ejemplo.com'
            className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand focus:bg-white transition-colors ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          <div className="absolute right-3 top-3.5 text-xs text-gray-400">
            @
          </div>
        </div>
        {errors.email && <p className='text-red-600 text-xs font-medium'>{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className='block text-sm font-medium text-ink'>Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
            placeholder='••••••'
            className={`w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-brand focus:bg-white transition-colors ${errors.password ? 'border-red-400 bg-red-50' : ''}`}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-ink transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && <p className='text-red-600 text-xs font-medium'>{errors.password.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full py-3 bg-brand text-white font-medium rounded-lg shadow-sm hover:bg-brand/90 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          </span>
        ) : (
          'Crear Cuenta'
        )}
      </button>
    </form>
  )
}

export default SignupForm
