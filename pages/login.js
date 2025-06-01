import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../lib/hooks/useAuth'

export default function Login() {
  const router = useRouter()
  const session = useSession()
  const { signIn, signUp, loading: authLoading, error: authError } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    const { success, error } = await signIn(email, password)
    
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again or register for a new account.')
      } else {
        setError(error.message)
      }
    } else if (success) {
      router.push('/dashboard')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const { success, error, user } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
    } else if (success) {
      setError(null)
      // Show success message
      alert('Registration successful! Please check your email to confirm your account.')
      setMode('login')
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Login' : 'Register'} | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
        {isDev && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs text-center rounded">
            Development Mode
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </h1>
        
        {(error || authError) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error || authError}
          </div>
        )}
        
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your-email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {mode === 'register' && (
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {authLoading ? 
                (mode === 'login' ? 'Logging in...' : 'Registering...') : 
                (mode === 'login' ? 'Log In' : 'Register')
              }
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={toggleMode} 
              className="text-blue-600 hover:underline"
            >
              {mode === 'login' ? 'Register' : 'Log In'}
            </button>
          </p>
        </div>

        {mode === 'login' && isDev && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              For testing, you can use:
              <br />
              Email: test@example.com
              <br />
              Password: password123
            </p>
          </div>
        )}
      </div>
    </>
  )
} 