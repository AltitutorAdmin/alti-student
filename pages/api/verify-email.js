import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ysfslbdcacpbemodkwtl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZnNsYmRjYWNwYmVtb2Rrd3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDYxMTE5MiwiZXhwIjoyMDE2MTg3MTkyfQ.t0mOLiKGnF8HQGzNgSw7lrZiV8Y-b-lOCZnIjZb3cPc'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Get the user from auth.users
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('email_confirmed_at')
      .eq('email', email)
      .single()

    if (userError) {
      console.error('Error checking email confirmation:', userError)
      return res.status(500).json({ message: 'Error checking email status' })
    }

    // If we can't find the user or email_confirmed_at is null
    if (!user || !user.email_confirmed_at) {
      // Force verify the email
      const { error: updateError } = await supabase
        .rpc('verify_email', { user_email: email })

      if (updateError) {
        console.error('Error verifying email:', updateError)
        return res.status(500).json({ message: 'Error verifying email' })
      }

      // Email has been verified
      return res.status(200).json({ 
        verified: true,
        message: 'Email has been verified successfully' 
      })
    }

    // Email was already verified
    return res.status(200).json({ 
      verified: true,
      message: 'Email is already verified' 
    })
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 