import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from './ui/button'

export default function Header({ title }) {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-100 text-gray-800 p-4 z-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/altitutor-logo.png" 
            alt="Altitutor Logo" 
            width={120} 
            height={32}
            className="object-contain"
            priority
          />
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center text-sm font-medium">
            {session ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={`hover:text-blue-600 transition ${
                      router.pathname === '/dashboard' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className={`hover:text-blue-600 transition ${
                      router.pathname === '/profile' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
                    }`}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className={`hover:text-blue-600 transition ${
                      router.pathname === '/login' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
                    }`}
                  >
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-blue-700 border-blue-700 hover:bg-blue-50"
                    >
                      Register
                    </Button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white md:hidden p-4 shadow-md border-t border-gray-200">
            <ul className="flex flex-col space-y-4 text-gray-800">
              {session ? (
                <>
                  <li>
                    <Link 
                      href="/dashboard" 
                      className={`block py-2 px-4 rounded hover:bg-gray-100 ${
                        router.pathname === '/dashboard' ? 'bg-gray-200 font-semibold' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/profile" 
                      className={`block py-2 px-4 rounded hover:bg-gray-100 ${
                        router.pathname === '/profile' ? 'bg-gray-200 font-semibold' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      Sign Out
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/login" 
                      className={`block py-2 px-4 rounded hover:bg-gray-100 ${
                        router.pathname === '/login' ? 'bg-gray-200 font-semibold' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant="outline"
                        className="w-full justify-start text-blue-700 border-blue-700 hover:bg-blue-50"
                      >
                        Register
                      </Button>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
