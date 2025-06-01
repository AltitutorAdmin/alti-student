import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import 'styles/globals.css'
import Layout from '../components/Layout'
import { createTestUserIfNotExists } from '../lib/services/authService'

// Create a Supabase client
const supabaseUrl = 'https://ysfslbdcacpbemodkwtl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZnNsYmRjYWNwYmVtb2Rrd3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Njc2NDksImV4cCI6MjA2MDM0MzY0OX0.XX8r1IA9jK0sCSkP3wccqICZhJ8AEXWAnG9X2mezA8s'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function Application({ Component, pageProps }) {
  useEffect(() => {
    // Create test user in development environment
    if (process.env.NODE_ENV === 'development') {
      createTestUserIfNotExists()
        .then((result) => {
          if (result.success) {
            console.log('Test user is ready for use')
          }
        })
        .catch(console.error)
    }
  }, [])

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  )
}

export default Application
