import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'
import { FaEdit, FaCheckCircle, FaTimesCircle, FaBook, FaChalkboardTeacher, FaCalendarAlt, FaPlus, FaMinus } from 'react-icons/fa'

// Import custom hooks
import { useStudentProfile } from '../lib/hooks/useStudent'
import { useSubjects } from '../lib/hooks/useSubjects'
import { useClasses } from '../lib/hooks/useClasses'
import { useAuth } from '../lib/hooks/useAuth'

export default function Dashboard() {
  const router = useRouter()
  const session = useSession()
  
  // Use our custom hooks
  const { student, loading: studentLoading, error: studentError, updateProfile } = useStudentProfile()
  const { signOut } = useAuth()
  
  // State for UI
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [isSubjectsEditMode, setIsSubjectsEditMode] = useState(false)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  
  // Initialize hooks that need studentId when it's available
  const [subjectHook, setSubjectHook] = useState(null)
  const [classHook, setClassHook] = useState(null)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])
  
  // Initialize student-dependent hooks when student is loaded
  useEffect(() => {
    if (student && student.id) {
      setFormData(student)
      setSubjectHook(useSubjects(student.id))
      setClassHook(useClasses(student.id))
    }
  }, [student])
  
  // Fetch subjects and classes when their hooks are initialized
  useEffect(() => {
    async function fetchData() {
      if (subjectHook) {
        const subjects = await subjectHook.fetchStudentSubjects()
        if (subjects) {
          setSelectedSubjectIds(subjects.map(item => item.subject_id))
        }
      }
      
      if (classHook) {
        await classHook.fetchStudentClasses()
      }
    }
    
    fetchData()
  }, [subjectHook, classHook])
  
  // Toggle subject edit mode
  const toggleSubjectsEditMode = async () => {
    if (!isSubjectsEditMode && subjectHook) {
      // Entering edit mode, fetch available subjects
      await subjectHook.fetchAvailableSubjects(student.curriculum, student.year_level)
    }
    setIsSubjectsEditMode(!isSubjectsEditMode)
  }
  
  // Handle subject selection toggle
  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId)
      } else {
        return [...prev, subjectId]
      }
    })
  }
  
  // Save subject changes
  const saveSubjectChanges = async () => {
    if (!subjectHook) return
    
    const { success, error } = await subjectHook.updateStudentSubjects(selectedSubjectIds)
    
    if (success) {
      setIsSubjectsEditMode(false)
    }
  }
  
  // Handle input change for profile edit
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { success, error } = await updateProfile(formData)
    
    if (success) {
      setIsEditMode(false)
    }
  }
  
  // Helper function to format day of week
  const getDayOfWeek = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNum] || 'Unknown'
  }
  
  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHours = hours % 12 || 12
      const formattedMinutes = minutes.toString().padStart(2, '0')
      
      return `${formattedHours}:${formattedMinutes} ${ampm}`
    } catch (error) {
      return timeString
    }
  }
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut()
  }
  
  // Loading state
  if (studentLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (studentError) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{studentError}</p>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }
  
  // Student not found state
  if (!student) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center max-w-md mx-auto p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Student Profile Not Found</h2>
          <p className="text-yellow-600 mb-4">
            We couldn't find your student profile. Please complete the onboarding process.
          </p>
          <Link href="/onboarding">
            <a className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition">
              Start Onboarding
            </a>
          </Link>
        </div>
      </div>
    )
  }
  
  // Get data from hooks
  const subjects = subjectHook?.subjects || []
  const availableSubjects = subjectHook?.availableSubjects || []
  const classes = classHook?.classes || []
  const subjectsLoading = subjectHook?.loading || false
  const classesLoading = classHook?.loading || false
  const subjectsError = subjectHook?.error || null
  const classesError = classHook?.error || null

  // Main dashboard render
  return (
    <>
      <Head>
        <title>Student Dashboard | Altitutor Student Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>     
        <div className="max-w-6xl mx-auto my-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-800">Student Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-600">Loading your information...</p>
            </div>
          ) : student ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Panel */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaChalkboardTeacher className="mr-2 text-blue-500" /> Student Profile
                  </h2>
                  {!isEditMode ? (
                    <button 
                      onClick={() => setIsEditMode(true)}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsEditMode(false)}
                        className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 flex items-center"
                      >
                        <FaTimesCircle className="mr-1" /> Cancel
                      </button>
                      <button 
                        onClick={handleSubmit}
                        className="bg-green-50 text-green-600 px-3 py-1 rounded-md hover:bg-green-100 flex items-center"
                      >
                        <FaCheckCircle className="mr-1" /> Save
                      </button>
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-blue-700 mb-3">Personal Information</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.student_email || ''}
                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="text"
                            name="student_phone"
                            value={formData.student_phone || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                          <input
                            type="text"
                            name="school"
                            value={formData.school || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Curriculum</label>
                          <input
                            type="text"
                            value={formData.curriculum || ''}
                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">Contact support to change curriculum</p>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                          <input
                            type="text"
                            value={formData.year_level || ''}
                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">Contact support to change year level</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-blue-700 mb-3">Parent/Guardian Information</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Parent First Name</label>
                          <input
                            type="text"
                            name="parent_first_name"
                            value={formData.parent_first_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Last Name</label>
                          <input
                            type="text"
                            name="parent_last_name"
                            value={formData.parent_last_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                          <input
                            type="email"
                            name="parent_email"
                            value={formData.parent_email || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                          <input
                            type="text"
                            name="parent_phone"
                            value={formData.parent_phone || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <h3 className="font-medium text-blue-700 mb-3">Availability</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_monday"
                                checked={formData.availability_monday || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Monday</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_tuesday"
                                checked={formData.availability_tuesday || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Tuesday</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_wednesday"
                                checked={formData.availability_wednesday || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Wednesday</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_thursday"
                                checked={formData.availability_thursday || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Thursday</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_friday"
                                checked={formData.availability_friday || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Friday</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_saturday_am"
                                checked={formData.availability_saturday_am || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Saturday AM</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_saturday_pm"
                                checked={formData.availability_saturday_pm || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Saturday PM</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_sunday_am"
                                checked={formData.availability_sunday_am || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Sunday AM</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                name="availability_sunday_pm"
                                checked={formData.availability_sunday_pm || false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="text-sm">Sunday PM</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-6">
                        <h3 className="font-medium text-blue-700 mb-3">Personal Information</h3>
                        <ul className="space-y-3">
                          <li>
                            <span className="block text-sm text-gray-500">Full Name</span>
                            <span className="text-gray-800">{student.first_name} {student.last_name}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Email</span>
                            <span className="text-gray-800">{student.student_email || 'Not provided'}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Phone</span>
                            <span className="text-gray-800">{student.student_phone || 'Not provided'}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">School</span>
                            <span className="text-gray-800">{student.school || 'Not provided'}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Curriculum</span>
                            <span className="text-gray-800">{student.curriculum || 'Not provided'}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Year Level</span>
                            <span className="text-gray-800">{student.year_level || 'Not provided'}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              student.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {student.status}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-6">
                        <h3 className="font-medium text-blue-700 mb-3">Parent/Guardian Information</h3>
                        <ul className="space-y-3">
                          <li>
                            <span className="block text-sm text-gray-500">Full Name</span>
                            <span className="text-gray-800">{student.parent_first_name} {student.parent_last_name}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Email</span>
                            <span className="text-gray-800">{student.parent_email || 'Not provided'}</span>
                          </li>
                          <li>
                            <span className="block text-sm text-gray-500">Phone</span>
                            <span className="text-gray-800">{student.parent_phone || 'Not provided'}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-blue-700 mb-3">Availability</h3>
                        <div className="flex flex-wrap">
                          {student.availability_monday && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Monday</span>}
                          {student.availability_tuesday && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Tuesday</span>}
                          {student.availability_wednesday && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Wednesday</span>}
                          {student.availability_thursday && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Thursday</span>}
                          {student.availability_friday && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Friday</span>}
                          {student.availability_saturday_am && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Saturday AM</span>}
                          {student.availability_saturday_pm && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Saturday PM</span>}
                          {student.availability_sunday_am && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Sunday AM</span>}
                          {student.availability_sunday_pm && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded m-1">Sunday PM</span>}
                          
                          {!student.availability_monday && 
                           !student.availability_tuesday && 
                           !student.availability_wednesday && 
                           !student.availability_thursday && 
                           !student.availability_friday && 
                           !student.availability_saturday_am && 
                           !student.availability_saturday_pm && 
                           !student.availability_sunday_am && 
                           !student.availability_sunday_pm && 
                            <span className="text-gray-500 text-sm">No availability set</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Subjects Panel */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaBook className="mr-2 text-blue-500" /> My Subjects
                    </h2>
                    {!isSubjectsEditMode ? (
                      <button 
                        onClick={toggleSubjectsEditMode}
                        className="bg-blue-50 text-blue-600 px-3 py-1 text-sm rounded-md hover:bg-blue-100 flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button 
                          onClick={toggleSubjectsEditMode}
                          className="bg-gray-100 text-gray-600 px-2 py-1 text-sm rounded-md hover:bg-gray-200 flex items-center"
                        >
                          <FaTimesCircle className="mr-1" /> Cancel
                        </button>
                        <button 
                          onClick={saveSubjectChanges}
                          disabled={subjectsLoading}
                          className="bg-green-50 text-green-600 px-2 py-1 text-sm rounded-md hover:bg-green-100 flex items-center disabled:opacity-50"
                        >
                          <FaCheckCircle className="mr-1" /> Save
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {subjectsError && (
                    <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">
                      {subjectsError}
                    </div>
                  )}
                  
                  {isSubjectsEditMode ? (
                    <div>
                      {subjectsLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-3">
                            Select the subjects you want to study:
                          </p>
                          <div className="max-h-80 overflow-y-auto pr-1">
                            {availableSubjects.length === 0 ? (
                              <p className="text-gray-500 text-sm py-2">No subjects available for your curriculum and year level.</p>
                            ) : (
                              <ul className="divide-y divide-gray-100">
                                {availableSubjects.map((subject) => (
                                  <li key={subject.id} className="py-2">
                                    <div className="flex items-start">
                                      <input
                                        type="checkbox"
                                        id={`subject-${subject.id}`}
                                        checked={selectedSubjectIds.includes(subject.id)}
                                        onChange={() => handleSubjectToggle(subject.id)}
                                        className="h-5 w-5 mt-0.5 text-blue-600 rounded"
                                      />
                                      <label htmlFor={`subject-${subject.id}`} className="ml-2 cursor-pointer">
                                        <div className="font-medium text-gray-800">{subject.name}</div>
                                        <div className="flex flex-wrap mt-1">
                                          {subject.discipline && (
                                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded mr-1 mb-1">
                                              {subject.discipline}
                                            </span>
                                          )}
                                          {subject.level && (
                                            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded mb-1">
                                              {subject.level}
                                            </span>
                                          )}
                                        </div>
                                      </label>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <p className="italic">Note: Adding new subjects will create a notification for admin to review and assign you to appropriate classes.</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {subjects.length === 0 ? (
                        <p className="text-gray-500">No subjects selected.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {subjects.map((item) => (
                            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                              <h3 className="font-medium text-gray-800">{item.subjects.name}</h3>
                              <div className="mt-1 flex flex-wrap">
                                {item.subjects.curriculum && (
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                    {item.subjects.curriculum}
                                  </span>
                                )}
                                {item.subjects.discipline && (
                                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                    {item.subjects.discipline}
                                  </span>
                                )}
                                {item.subjects.level && (
                                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-1">
                                    {item.subjects.level}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
                
                {/* Classes Panel */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" /> My Classes
                  </h2>
                  
                  {classes.length === 0 ? (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded text-sm">
                      <p className="mb-2">You haven't been assigned to any classes yet.</p>
                      <p>Our admin team will assign you based on your subject selections and availability.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {classes.map((enrollment) => (
                        enrollment.classes && (
                          <li key={enrollment.id} className="py-3 first:pt-0 last:pb-0">
                            <h3 className="font-medium text-gray-800">{enrollment.classes.subject}</h3>
                            <p className="text-sm text-gray-600">
                              {getDayOfWeek(enrollment.classes.day_of_week)} {formatTime(enrollment.classes.start_time)} - {formatTime(enrollment.classes.end_time)}
                            </p>
                            {enrollment.classes.room && (
                              <p className="text-sm text-gray-500">Room: {enrollment.classes.room}</p>
                            )}
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {enrollment.status}
                              </span>
                            </div>
                          </li>
                        )
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No student profile found. Please complete your registration.
                  </p>
                  <div className="mt-4">
                    <Link href="/onboarding" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm">
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 