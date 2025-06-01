import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'

export default function Availability() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [studentId, setStudentId] = useState(null)
  const [availability, setAvailability] = useState({
    availability_monday: false,
    availability_tuesday: false,
    availability_wednesday: false,
    availability_thursday: false,
    availability_friday: false,
    availability_saturday_am: false,
    availability_saturday_pm: false,
    availability_sunday_am: false,
    availability_sunday_pm: false
  })

  // Load user ID and student ID from localStorage or session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use session user ID if available
      const currentUserId = session?.user?.id || localStorage.getItem('onboardingUserId')
      const storedStudentId = localStorage.getItem('onboardingStudentId')
      
      if (!currentUserId || !storedStudentId) {
        router.push('/onboarding')
        return
      }
      
      setUserId(currentUserId)
      setStudentId(storedStudentId)
      
      // Fetch existing availability settings
      const fetchAvailability = async () => {
        try {
          const { data, error } = await supabase
            .from('students')
            .select(`
              availability_monday,
              availability_tuesday,
              availability_wednesday,
              availability_thursday,
              availability_friday,
              availability_saturday_am,
              availability_saturday_pm,
              availability_sunday_am,
              availability_sunday_pm
            `)
            .eq('id', storedStudentId)
            .single()
            
          if (error) {
            console.error('Error fetching availability:', error)
            return
          }
          
          if (data) {
            // Filter out null values and set availability state
            const availabilityData = {}
            for (const key in data) {
              if (data[key] !== null) {
                availabilityData[key] = !!data[key] // Convert to boolean
              }
            }
            
            if (Object.keys(availabilityData).length > 0) {
              setAvailability(prev => ({
                ...prev,
                ...availabilityData
              }))
              console.log('Loaded existing availability settings')
            }
          }
        } catch (err) {
          console.error('Error in fetchAvailability:', err)
        }
      }
      
      fetchAvailability()
    }
  }, [router, session, supabase])

  const handleToggleAvailability = (field) => {
    setAvailability(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!studentId) {
        throw new Error('Student registration incomplete. Please start again.')
      }

      console.log('Updating student with availability:', availability)
      
      // Update student record with availability
      const { error: updateError } = await supabase
        .from('students')
        .update(availability)
        .eq('id', studentId)

      if (updateError) {
        console.error('Error updating availability:', updateError)
        throw updateError
      }
      
      console.log('Availability updated successfully')
      
      // Redirect to registration complete page
      router.push('/onboarding/complete')
    } catch (error) {
      console.error('Error saving availability:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!userId || !studentId) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Loading Availability Selection...</h1>
        <div className="flex justify-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Availability | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Your Availability</h1>
        
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600">
                ✓
              </div>
              <div className="text-xs mt-1 text-green-600 font-medium">Account Setup</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600">
                ✓
              </div>
              <div className="text-xs mt-1 text-green-600 font-medium">Personal Info</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600">
                ✓
              </div>
              <div className="text-xs mt-1 text-green-600 font-medium">Subjects</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600">
                4
              </div>
              <div className="text-xs mt-1 text-blue-600 font-medium">Availability</div>
            </div>
          </div>
          
          <div className="relative h-2 bg-gray-200 rounded-full mt-2 mb-4">
            <div className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
          </div>
          
          <p className="text-center text-gray-600 text-sm">
            Step 4 of 4 - Set your availability
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-700">Available Days & Times</h2>
          <p className="mb-4 text-gray-700">
            Select all the days and times when you're available for tutoring sessions. This helps us assign you to the most suitable classes.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Weekdays</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="monday"
                      checked={availability.availability_monday}
                      onChange={() => handleToggleAvailability('availability_monday')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="monday" className="ml-2 text-gray-700">Monday</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tuesday"
                      checked={availability.availability_tuesday}
                      onChange={() => handleToggleAvailability('availability_tuesday')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="tuesday" className="ml-2 text-gray-700">Tuesday</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="wednesday"
                      checked={availability.availability_wednesday}
                      onChange={() => handleToggleAvailability('availability_wednesday')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="wednesday" className="ml-2 text-gray-700">Wednesday</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="thursday"
                      checked={availability.availability_thursday}
                      onChange={() => handleToggleAvailability('availability_thursday')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="thursday" className="ml-2 text-gray-700">Thursday</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="friday"
                      checked={availability.availability_friday}
                      onChange={() => handleToggleAvailability('availability_friday')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="friday" className="ml-2 text-gray-700">Friday</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Weekends</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saturdayAm"
                      checked={availability.availability_saturday_am}
                      onChange={() => handleToggleAvailability('availability_saturday_am')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="saturdayAm" className="ml-2 text-gray-700">Saturday Morning</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saturdayPm"
                      checked={availability.availability_saturday_pm}
                      onChange={() => handleToggleAvailability('availability_saturday_pm')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="saturdayPm" className="ml-2 text-gray-700">Saturday Afternoon</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sundayAm"
                      checked={availability.availability_sunday_am}
                      onChange={() => handleToggleAvailability('availability_sunday_am')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="sundayAm" className="ml-2 text-gray-700">Sunday Morning</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sundayPm"
                      checked={availability.availability_sunday_pm}
                      onChange={() => handleToggleAvailability('availability_sunday_pm')}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <label htmlFor="sundayPm" className="ml-2 text-gray-700">Sunday Afternoon</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm mb-6">
            <p className="font-medium">Tip: Select multiple options</p>
            <p>The more availability you select, the easier it will be to assign you to classes that match your preferences.</p>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Link
            href="/onboarding/subject-selection"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Registration'}
          </button>
        </div>
      </div>
    </>
  )
} 