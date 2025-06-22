import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'

export default function SubjectSelection() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [studentId, setStudentId] = useState(null)
  const [curriculum, setCurriculum] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [isFromDashboard, setIsFromDashboard] = useState(false)

  // Load user ID and student ID from localStorage or session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we came from dashboard by looking at referrer
      const referrer = document.referrer;
      setIsFromDashboard(referrer && referrer.includes('/dashboard'));
      
      // Use session user ID if available
      const currentUserId = session?.user?.id || localStorage.getItem('onboardingUserId')
      const storedStudentId = localStorage.getItem('onboardingStudentId')
      
      if (!currentUserId || !storedStudentId) {
        router.push('/onboarding')
        return
      }
      
      setUserId(currentUserId)
      setStudentId(storedStudentId)
      
      // Fetch student data to get curriculum and year level
      fetchStudentData(storedStudentId)
    }
  }, [router, session])

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
      
      // Immediately try to fetch subjects with the correct curriculum/year
      if (data.curriculum && data.year_level) {
        console.log('Got student data, fetching subjects for:', {
          curriculum: data.curriculum,
          yearLevel: data.year_level
        });
        
        // Try fetching via direct table access first
        let filterCurriculum = data.curriculum;
        
        // For SACE, years below 11 should be treated as "PRESACE" (no hyphen)
        if (data.curriculum === 'SACE' && parseInt(data.year_level) < 11) {
          filterCurriculum = 'PRESACE';
        }
        
        const { data: directSubjects, error: directError } = await supabase
          .from('subjects')
          .select('*')
          .eq('curriculum', filterCurriculum)
          .eq('year_level', parseInt(data.year_level))
          .order('name', { ascending: true });
          
        if (!directError && directSubjects && directSubjects.length > 0) {
          console.log(`Fetched ${directSubjects.length} subjects via direct table access`);
          setSubjects(directSubjects);
          setFilteredSubjects(directSubjects);
          return;
        }
        
        // If direct access fails or returns no results, try using the RPC function
        try {
          const { data: subjectData, error: subjectError } = await supabase.rpc(
            'get_subjects_for_student',
            {
              p_curriculum: filterCurriculum,
              p_year_level: parseInt(data.year_level)
            }
          );
          
          if (subjectError) {
            console.error('Error fetching subjects via RPC after student data load:', subjectError);
            
            // If RPC fails, try one more direct query with case-insensitive search
            const { data: iLikeSubjects, error: iLikeError } = await supabase
              .from('subjects')
              .select('*')
              .ilike('curriculum', filterCurriculum)
              .eq('year_level', parseInt(data.year_level))
              .order('name', { ascending: true });
              
            if (!iLikeError && iLikeSubjects && iLikeSubjects.length > 0) {
              console.log(`Fetched ${iLikeSubjects.length} subjects via case-insensitive query`);
              setSubjects(iLikeSubjects);
              setFilteredSubjects(iLikeSubjects);
            }
          } else {
            console.log(`Fetched ${subjectData?.length || 0} subjects via RPC after student data load`);
            setSubjects(subjectData || []);
            setFilteredSubjects(subjectData || []);
          }
        } catch (rpcError) {
          console.error('Exception in RPC call:', rpcError);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to load student data. Please try again.')
    }
  }

  // Load all subjects
  useEffect(() => {
    async function fetchSubjects() {
      try {
        console.log('Fetching subjects...');
        
        // First try to get all subjects directly
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching subjects via direct table access:', error);
          setError('Failed to load subjects. Please try again.');
          return;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} subjects`);
        setSubjects(data || []);
        
        // If we have curriculum and year level, filter the subjects client-side
        if (curriculum && yearLevel && data) {
          console.log(`Filtering ${data.length} subjects for ${curriculum} Year ${yearLevel}`);
          
          // For SACE, years below 11 should be treated as "PRESACE" (no hyphen)
          let filterCurriculum = curriculum;
          if (curriculum === 'SACE' && parseInt(yearLevel) < 11) {
            filterCurriculum = 'PRESACE';
          }
          
          const filtered = data.filter(subject => {
            // For IB, only show years 11 and 12
            if (curriculum.toUpperCase() === 'IB' && 
                (subject.year_level < 11 || subject.year_level > 12)) {
              return false;
            }
            
            // For SACE, handle PRESACE for years below 11
            if (curriculum === 'SACE' && parseInt(yearLevel) < 11) {
              // Look for PRESACE subjects (no hyphen)
              const curriculumMatch = subject.curriculum?.toUpperCase() === 'PRESACE';
              const yearLevelMatch = subject.year_level === parseInt(yearLevel);
              return curriculumMatch && yearLevelMatch;
            }
            
            // Standard case - match curriculum and year level
            const curriculumMatch = subject.curriculum?.toUpperCase() === curriculum?.toUpperCase();
            const yearLevelMatch = subject.year_level === parseInt(yearLevel);
            
            return curriculumMatch && yearLevelMatch;
          });
          
          console.log(`Found ${filtered.length} matching subjects after client-side filtering`);
          setFilteredSubjects(filtered);
        }
        
        // Check for existing subject selections
        if (studentId) {
          const { data: existingSelections, error: selectionsError } = await supabase
            .from('students_subjects')
            .select('subject_id')
            .eq('student_id', studentId)
            
          if (selectionsError) {
            console.error('Error fetching existing subject selections:', selectionsError)
          } else if (existingSelections && existingSelections.length > 0) {
            const selectedIds = existingSelections.map(selection => selection.subject_id)
            setSelectedSubjects(selectedIds)
            console.log('Loaded existing subject selections:', selectedIds)
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
        setError('Failed to load subjects. Please try again.')
      }
    }

    if (userId) {
      fetchSubjects()
    }
  }, [userId, studentId, curriculum, yearLevel, supabase])

  // Filter subjects based on curriculum and year level
  useEffect(() => {
    if (curriculum && yearLevel) {
      console.log('Filtering subjects:', { 
        curriculum, 
        yearLevel,
        totalSubjects: subjects.length,
        availableCurriculums: [...new Set(subjects.map(s => s.curriculum))],
        availableYearLevels: [...new Set(subjects.map(s => s.year_level))]
      });
      
      // Handle special curriculum naming rules
      let filterCurriculum = curriculum;
      
      // For SACE, years below 11 should be treated as "PRESACE" (no hyphen)
      if (curriculum === 'SACE' && parseInt(yearLevel) < 11) {
        filterCurriculum = 'PRESACE';
      }
      
      const filtered = subjects.filter(
        (subject) => {
          // For IB, only show years 11 and 12
          if (subject.curriculum?.toUpperCase() === 'IB' && 
              (subject.year_level < 11 || subject.year_level > 12)) {
            return false;
          }
          
          // For SACE, handle PRESACE for years below 11
          if (curriculum === 'SACE' && parseInt(yearLevel) < 11) {
            // Look for PRESACE subjects (no hyphen)
            const curriculumMatch = subject.curriculum?.toUpperCase() === 'PRESACE';
            const yearLevelMatch = subject.year_level === parseInt(yearLevel);
            return curriculumMatch && yearLevelMatch;
          }
          
          // Standard case - match curriculum and year level
          const curriculumMatch = subject.curriculum?.toUpperCase() === curriculum?.toUpperCase();
          const yearLevelMatch = subject.year_level === parseInt(yearLevel);
          
          return curriculumMatch && yearLevelMatch;
        }
      );
      
      console.log(`Found ${filtered.length} subjects matching ${curriculum} year ${yearLevel}`);
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
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
      console.log('Submitting subjects:', {
        studentId,
        selectedSubjects: selectedSubjects.length,
        subjectIds: selectedSubjects
      });
      
      // Use the new secure function to add selected subjects
      const { data, error } = await supabase
        .rpc('student_select_subjects', {
          p_student_id: studentId,
          p_subject_ids: selectedSubjects
        })

      if (error) {
        console.error('Error in student_select_subjects:', error);
        throw error;
      }
      
      if (!data.success) {
        console.error('Function returned error:', data);
        throw new Error(data.message || 'Failed to save subject selections');
      }
      
      console.log('Successfully saved subjects:', data);
      
      // Check if we came from the dashboard (checking referrer)
      const referrer = document.referrer;
      if (referrer && referrer.includes('/dashboard')) {
        // If coming from dashboard, redirect back there
        router.push('/dashboard')
      } else {
        // Otherwise continue normal onboarding flow
        router.push('/onboarding/availability')
      }
    } catch (error) {
      console.error('Error saving subject data:', error)
      setError(error.message || 'An error occurred while saving your subject selections. Please try again.')
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
        
        {!isFromDashboard && (
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
        )}
        
        {isFromDashboard && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded">
            <p>You need to select at least one subject before you can access your dashboard. Please choose the subjects you're interested in studying.</p>
          </div>
        )}
        
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
            <p className="font-medium">No subjects found for your selected curriculum and year level.</p>
            <p className="mt-2">
              {curriculum === 'SACE' && parseInt(yearLevel) < 11 ? (
                `We're currently setting up PRESACE Year ${yearLevel} subjects.`
              ) : curriculum === 'IB' && (parseInt(yearLevel) < 11 || parseInt(yearLevel) > 12) ? (
                `IB curriculum is only available for Years 11 and 12.`
              ) : (
                `We're currently setting up ${curriculum} Year ${yearLevel} subjects.`
              )}
              {' '}Please continue with the onboarding process, and we'll assign appropriate subjects to you later.
            </p>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => {
                  // Skip subject selection for now
                  if (isFromDashboard) {
                    router.push('/dashboard');
                  } else {
                    router.push('/onboarding/availability');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                {isFromDashboard ? 'Return to Dashboard' : 'Continue to Availability'}
              </button>
            </div>
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
          {!isFromDashboard ? (
            <Link
              href="/onboarding/personal-info"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </Link>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          {filteredSubjects.length > 0 && (
            <button
              type="button"
              onClick={handleSubmitSubjects}
              disabled={loading || selectedSubjects.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : isFromDashboard ? 'Save and Return to Dashboard' : 'Continue to Availability'}
            </button>
          )}
        </div>
      </div>
    </>
  )
} 