import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'

export default function SubjectSelection() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [studentId, setStudentId] = useState(null)
  const [curriculum, setCurriculum] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])

  // Load user ID and student ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('onboardingUserId')
      const storedStudentId = localStorage.getItem('onboardingStudentId')
      
      if (!storedUserId || !storedStudentId) {
        router.push('/onboarding')
        return
      }
      
      setUserId(storedUserId)
      setStudentId(storedStudentId)
      
      // Fetch student data to get curriculum and year level
      fetchStudentData(storedStudentId)
    }
  }, [router])

  // Fetch student data
  const fetchStudentData = async (id) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('curriculum, year_level')
        .eq('id', id)
        .single()

      if (error) throw error
      
      setCurriculum(data.curriculum)
      setYearLevel(data.year_level)
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to load student data. Please try again.')
    }
  }

  // Load all subjects
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setSubjects(data || [])
      } catch (error) {
        console.error('Error fetching subjects:', error)
        setError('Failed to load subjects. Please try again.')
      }
    }

    if (userId) {
      fetchSubjects()
    }
  }, [userId, supabase])

  // Filter subjects based on curriculum and year level
  useEffect(() => {
    if (curriculum && yearLevel) {
      const filtered = subjects.filter(
        (subject) => 
          subject.curriculum === curriculum && 
          subject.year_level === parseInt(yearLevel)
      )
      setFilteredSubjects(filtered)
    } else {
      setFilteredSubjects([])
    }
  }, [curriculum, yearLevel, subjects])

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId)
      } else {
        return [...prev, subjectId]
      }
    })
  }

  const handleSubmitSubjects = async () => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Add selected subjects
      const subjectRecords = selectedSubjects.map(subjectId => ({
        student_id: studentId,
        subject_id: subjectId
      }))
      
      const { error: subjectsError } = await supabase
        .from('students_subjects')
        .insert(subjectRecords)

      if (subjectsError) throw subjectsError

      // Create a task for admin to assign classes
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: `Assign classes for new student`,
          description: `New student has registered with INACTIVE status and selected subjects. Please review and activate the account after assigning appropriate classes.`,
          status: 'PENDING',
          priority: 'HIGH',
          related_to: 'STUDENT',
          related_id: studentId
        })

      if (taskError) throw taskError

      // Don't clear localStorage yet, as we need it for the availability step
      
      // Redirect to availability selection page instead of registration complete
      router.push('/onboarding/availability')
    } catch (error) {
      console.error('Error saving subject data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!userId || !studentId || !curriculum || !yearLevel) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Loading Subject Selection...</h1>
        <div className="flex justify-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Subject Selection | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Subject Selection</h1>
        
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
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600">
                3
              </div>
              <div className="text-xs mt-1 text-blue-600 font-medium">Subjects</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-400">
                4
              </div>
              <div className="text-xs mt-1 text-gray-400 font-medium">Availability</div>
            </div>
          </div>
          
          <div className="relative h-2 bg-gray-200 rounded-full mt-2 mb-4">
            <div className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
          
          <p className="text-center text-gray-600 text-sm">
            Step 3 of 4 - Select your subjects
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <p className="mb-6 text-gray-600">
          Choose the subjects you would like to study. These will be used to assign you to appropriate classes.
        </p>
        
        {filteredSubjects.length === 0 ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded mb-4">
            <p>No subjects found for your selected curriculum and year level. Please contact support for assistance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {filteredSubjects.map((subject) => (
              <div 
                key={subject.id}
                className={`border ${selectedSubjects.includes(subject.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'} rounded-lg p-4 cursor-pointer transition-all`}
                onClick={() => handleSubjectToggle(subject.id)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => {}}
                    className="h-5 w-5 text-blue-600 mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                    <div className="mt-1 text-sm">
                      {subject.discipline && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {subject.discipline}
                        </span>
                      )}
                      {subject.level && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-1">
                          {subject.level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <Link
            href="/onboarding/personal-info"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={handleSubmitSubjects}
            disabled={loading || selectedSubjects.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to Availability'}
          </button>
        </div>
      </div>
    </>
  )
} 