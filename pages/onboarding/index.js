import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Head from 'next/head'
import Link from 'next/link'

// Define validation schema for account creation
const AccountSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function Onboarding() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAccountCreation = async (values, { setSubmitting }) => {
    setLoading(true)
    setError(null)

    try {
      // First check if the email already exists
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false, // Don't create a new user, just check if email exists
        }
      });

      // If no error on OTP request, that means the email exists
      if (!authError) {
        setError(`Email ${values.email} is already registered. Please use a different email or login instead.`);
        setLoading(false);
        setSubmitting(false);
        return;
      }
      
      // Only if the error indicates email doesn't exist, proceed with signup
      if (authError && !authError.message.includes("Email not confirmed")) {
        // Create user account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        })

        if (signUpError) {
          // Handle specific error for email in use as well
          if (signUpError.message.includes("already registered")) {
            throw new Error(`Email ${values.email} is already registered. Please use a different email or login instead.`);
          }
          throw signUpError;
        }
        
        if (!signUpData.user) {
          throw new Error('User account could not be created. Please try again.')
        }
        
        // Store user ID in local storage for next steps
        localStorage.setItem('onboardingUserId', signUpData.user.id)
        localStorage.setItem('onboardingEmail', values.email)
        
        // Redirect to next step
        router.push('/onboarding/personal-info')
      } else {
        // Email already exists error
        throw new Error(`Email ${values.email} is already registered. Please use a different email or login instead.`);
      }
    } catch (error) {
      console.error('Error creating account:', error)
      setError(error.message)
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create Account | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Create Your Account</h1>
        
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600">
                1
              </div>
              <div className="text-xs mt-1 text-blue-600 font-medium">Account Setup</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-400">
                2
              </div>
              <div className="text-xs mt-1 text-gray-400 font-medium">Personal Info</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-400">
                3
              </div>
              <div className="text-xs mt-1 text-gray-400 font-medium">Subjects</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-400">
                4
              </div>
              <div className="text-xs mt-1 text-gray-400 font-medium">Availability</div>
            </div>
          </div>
          
          <div className="relative h-2 bg-gray-200 rounded-full mt-2 mb-4">
            <div className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
          </div>
          
          <p className="text-center text-gray-600 text-sm">
            Step 1 of 4 - Create your account
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
            {error}
            {error.includes("already registered") && (
              <div className="mt-2">
                <Link href="/login" className="font-medium underline">
                  Login instead
                </Link>
              </div>
            )}
          </div>
        )}

        <Formik
          initialValues={{
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={AccountSchema}
          onSubmit={handleAccountCreation}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                <Field 
                  id="email" 
                  name="email" 
                  type="email" 
                  className="w-full p-2 border border-gray-300 rounded" 
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                <Field 
                  id="password" 
                  name="password" 
                  type="password" 
                  className="w-full p-2 border border-gray-300 rounded" 
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block mb-1 font-medium">Confirm Password</label>
                <Field 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  className="w-full p-2 border border-gray-300 rounded" 
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
} 