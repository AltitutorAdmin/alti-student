import Header from './Header'
import Footer from './Footer'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Layout({ children }) {
  const [initialSession, setInitialSession] = useState(null)

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={initialSession}
    >
      <div className="flex flex-col min-h-screen">
        {/* Fixed Header */}
        <Header />

        {/* Main content has top padding so it isn't hidden behind the header */}
        <main className="flex-grow pt-16">
          {children}
        </main>

        {/* Footer at the bottom */}
        <Footer />
      </div>
    </SessionContextProvider>
  )
}