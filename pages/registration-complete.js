import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function RegistrationComplete() {
  const router = useRouter()
  
  // Clear any remaining registration data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboardingUserId')
      localStorage.removeItem('onboardingEmail')
      localStorage.removeItem('onboardingStudentId')
    }
  }, [])

  return (
    <>
      <Head>
        <title>Registration Complete | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-blue-800">Registration Complete!</h1>
        
        <p className="text-lg text-gray-700 mb-8">
          Thank you for registering with Altitutor. Your account has been created successfully and is currently in an inactive state pending review.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 text-left">
          <h2 className="text-blue-800 font-semibold mb-2">What happens next?</h2>
          <ol className="list-decimal list-inside text-gray-700 ml-2 space-y-2">
            <li>Our admin team will review your registration information</li>
            <li>You'll be assigned to appropriate classes based on your selected subjects</li>
            <li>Your account status will be changed from INACTIVE to ACTIVE</li>
            <li>You'll receive confirmation via email when your registration is approved</li>
            <li>You can log in to your account to check your status anytime</li>
          </ol>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">
            Log In to Your Account
          </Link>
          
          <Link href="/" className="block text-blue-600 hover:underline mt-4">
            Return to Homepage
          </Link>
        </div>
      </div>
    </>
  )
} 