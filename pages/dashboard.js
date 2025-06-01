import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'
import { FaEdit, FaCheckCircle, FaTimesCircle, FaBook, FaChalkboardTeacher, FaCalendarAlt, FaPlus, FaMinus } from 'react-icons/fa'

export default function Dashboard() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [error, setError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  
  // New state variables for subjects editing
  const [isSubjectsEditMode, setIsSubjectsEditMode] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  // Fetch student data, subjects, and classes
  useEffect(() => {
    async function fetchData() {
      if (!session) return

      try {
        setLoading(true)
        setError(null)

        // Fetch student profile linked to auth user
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (studentError) throw studentError
        
        if (studentData) {
          setStudent(studentData)
          setFormData(studentData)
          
          // Fetch student subjects
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('students_subjects')
            .select(`
              id,
              subject_id,
              subjects:subject_id (
                id,
                name,
                curriculum,
                year_level,
                discipline,
                level
              )
            `)
            .eq('student_id', studentData.id)
          
          if (subjectsError) throw subjectsError
          setSubjects(subjectsData || [])
          
          // If no subjects are selected, redirect to subject selection
          if (!subjectsData || subjectsData.length === 0) {
            console.log('No subjects selected, redirecting to subject selection...');
            // Store student ID in localStorage for the onboarding flow
            localStorage.setItem('onboardingStudentId', studentData.id);
            localStorage.setItem('onboardingUserId', session.user.id);
            
            // Redirect to subject selection page
            router.push('/onboarding/subject-selection');
            return;
          }
          
          // Set selected subject IDs for the edit mode
          setSelectedSubjectIds(subjectsData ? subjectsData.map(item => item.subject_id) : [])
          
          // Fetch assigned classes
          const { data: classesData, error: classesError } = await supabase
            .rpc('get_student_classes', {
              p_student_id: studentData.id
            })
          
          if (classesError) {
            console.error('Error fetching classes with RPC function:', classesError);
            
            // Fallback to the student_classes_view directly if RPC fails
            try {
              const { data: viewData, error: viewError } = await supabase
                .from('student_classes_view')
                .select('*')
                .eq('student_id', studentData.id);
                
              if (viewError) throw viewError;
              setClasses(viewData || []);
            } catch (fallbackError) {
              console.error('Error with fallback classes query:', fallbackError);
              throw fallbackError;
            }
          } else {
            setClasses(classesData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, supabase, router])

  // Add a function to fetch available subjects based on student's curriculum and year level
  const fetchAvailableSubjects = async () => {
    if (!student) return
    
    try {
      setSubjectsLoading(true)
      setSubjectsError(null)
      
      // Fetch subjects that match the student's curriculum and year level
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('curriculum', student.curriculum)
        .eq('year_level', student.year_level)
        .order('name', { ascending: true })
      
      if (error) throw error
      
      setAvailableSubjects(data || [])
    } catch (error) {
      console.error('Error fetching available subjects:', error)
      setSubjectsError(error.message)
    } finally {
      setSubjectsLoading(false)
    }
  }
  
  // Toggle subject edit mode
  const toggleSubjectsEditMode = async () => {
    if (!isSubjectsEditMode) {
      // Entering edit mode, fetch available subjects
      await fetchAvailableSubjects()
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
    try {
      setSubjectsLoading(true)
      setSubjectsError(null)
      
      // Get current subject IDs
      const currentSubjectIds = subjects.map(item => item.subject_id)
      
      // Find subjects to add (in selectedSubjectIds but not in currentSubjectIds)
      const subjectsToAdd = selectedSubjectIds.filter(id => !currentSubjectIds.includes(id))
        .map(subjectId => ({
          student_id: student.id,
          subject_id: subjectId
        }))
      
      // Find subject relationships to remove (in currentSubjectIds but not in selectedSubjectIds)
      const subjectsToRemove = subjects
        .filter(item => !selectedSubjectIds.includes(item.subject_id))
        .map(item => item.id)
      
      // Add new subjects if any
      if (subjectsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('students_subjects')
          .insert(subjectsToAdd)
        
        if (addError) throw addError
      }
      
      // Remove subjects if any
      if (subjectsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('students_subjects')
          .delete()
          .in('id', subjectsToRemove)
        
        if (removeError) throw removeError
      }
      
      // Refresh subjects data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('students_subjects')
        .select(`
          id,
          subject_id,
          subjects:subject_id (
            id,
            name,
            curriculum,
            year_level,
            discipline,
            level
          )
        `)
        .eq('student_id', student.id)
      
      if (refreshError) throw refreshError
      
      // Update state
      setSubjects(refreshedData || [])
      setIsSubjectsEditMode(false)
      
      // Create a task for admin if subjects were added
      if (subjectsToAdd.length > 0) {
        await supabase
          .from('tasks')
          .insert({
            title: `Review subject changes for student`,
            description: `Student ${student.first_name} ${student.last_name} has added new subjects. Please review and assign appropriate classes.`,
            status: 'PENDING',
            priority: 'HIGH',
            related_to: 'STUDENT',
            related_id: student.id
          })
      }
      
    } catch (error) {
      console.error('Error saving subject changes:', error)
      setSubjectsError(error.message)
    } finally {
      setSubjectsLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          parent_first_name: formData.parent_first_name,
          parent_last_name: formData.parent_last_name,
          parent_email: formData.parent_email,
          parent_phone: formData.parent_phone,
          student_phone: formData.student_phone,
          school: formData.school,
          availability_monday: formData.availability_monday,
          availability_tuesday: formData.availability_tuesday,
          availability_wednesday: formData.availability_wednesday,
          availability_thursday: formData.availability_thursday,
          availability_friday: formData.availability_friday,
          availability_saturday_am: formData.availability_saturday_am,
          availability_saturday_pm: formData.availability_saturday_pm,
          availability_sunday_am: formData.availability_sunday_am,
          availability_sunday_pm: formData.availability_sunday_pm,
        })
        .eq('id', student.id)
      
      if (error) throw error
      
      // Update the student state with the new data
      setStudent(formData)
      setIsEditMode(false)
    } catch (error) {
      console.error('Error updating student:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Format day of week number to text
  const getDayOfWeek = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNum] || 'Unknown'
  }

  if (!session) {
    return null // Don't render until we confirm authentication
  }

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
          <h1 className="text-3xl font-bold mb-8 text-blue-800">Student Dashboard</h1>

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
                    {classes.map((classItem) => (
                      <li key={classItem.id} className="py-3 first:pt-0 last:pb-0">
                        <h3 className="font-medium text-gray-800">{classItem.subject_name}</h3>
                        <p className="text-sm text-gray-600">
                          {getDayOfWeek(classItem.day_of_week)} {classItem.start_time} - {classItem.end_time}
                        </p>
                        {classItem.room && (
                          <p className="text-sm text-gray-500">Room: {classItem.room}</p>
                        )}
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            classItem.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            classItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {classItem.status}
                          </span>
                        </div>
                      </li>
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