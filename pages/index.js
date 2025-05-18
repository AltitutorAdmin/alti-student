import Head from 'next/head'
import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  return (
    <>
      <Head>
        <title>Altitutor Signup</title>
        <meta name="description" content="Altitutor Student Registration Portal" />
      </Head>

      <div className="min-h-screen flex flex-col justify-center items-center w-full h-full bg-blue-900 text-white px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Altitutor Student Portal</h1>
        <p className="text-blue-200 mb-8 text-center">
          Pre-existing students can create their account or log in below.
        </p>
        <div className="flex space-x-4">
          <Link href="/onboarding" className="px-6 py-3 bg-white text-blue-800 rounded-md font-medium shadow hover:bg-blue-100">
            Register
          </Link>
          <Link href="/login" className="px-6 py-3 border border-white rounded-md font-medium hover:bg-blue-800">
            Login
          </Link>
        </div>
      </div>
    </>
  )
}