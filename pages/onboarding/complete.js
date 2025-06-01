import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'
import { FaCheckCircle } from 'react-icons/fa'

export default function RegistrationComplete() {
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
    
    // Clear onboarding data from localStorage since we're done with onboarding
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboardingStudentId')
      localStorage.removeItem('onboardingUserId')
      localStorage.removeItem('onboardingEmail')
    }
  }, [session, router])

  if (!session) {
    return null // Don't render until we confirm authentication
  }

  return (
    <>
      <Head>
        <title>Registration Complete | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="text-green-500 flex justify-center mb-4">
          <FaCheckCircle size={64} />
        </div>
        
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Registration Complete!</h1>
        
        <div className="mb-8 text-gray-700">
          <p className="mb-4">
            Thank you for registering with Altitutor. Your enrollment information has been received.
          </p>
          <p className="mb-4">
            Our administrative team will review your information and assign you to appropriate classes based on your subject selections and availability.
          </p>
          <p>
            You will receive an email notification once your class assignments are confirmed.
          </p>
        </div>
        
        <div className="p-4 mb-8 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
          <h3 className="font-bold mb-2">What happens next?</h3>
          <ul className="text-left list-disc list-inside">
            <li>Our staff will review your enrollment</li>
            <li>You'll be assigned to classes that match your subject selections</li>
            <li>You'll receive an email with class details</li>
            <li>You can log in to your dashboard anytime to view your status</li>
          </ul>
        </div>
        
        <div className="mt-8">
          <Link 
            href="/dashboard" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </>
  )
} 