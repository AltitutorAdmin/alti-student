import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Head from 'next/head'
import Link from 'next/link'

// Define validation schema for personal info
const PersonalInfoSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  parentFirstName: Yup.string().required('Parent first name is required'),
  parentLastName: Yup.string().required('Parent last name is required'),
  parentEmail: Yup.string().email('Invalid email').required('Parent email is required'),
  parentPhone: Yup.string().required('Parent phone is required'),
  school: Yup.string().required('School is required'),
  curriculum: Yup.string().required('Curriculum is required'),
  yearLevel: Yup.number().required('Year level is required').positive().integer(),
});

export default function PersonalInfo() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [email, setEmail] = useState('')

  // Load user ID from localStorage or session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If we have a session, use it
      if (session && session.user) {
        setUserId(session.user.id)
        setEmail(session.user.email)
        // Also store in localStorage for other steps
        localStorage.setItem('onboardingUserId', session.user.id)
        localStorage.setItem('onboardingEmail', session.user.email)
        
        // Check if student record already exists for this user
        const checkExistingStudent = async () => {
          try {
            const { data: existingStudent, error } = await supabase
              .from('students')
              .select('id')
              .eq('user_id', session.user.id)
              .eq('student_email', session.user.email)
              .single();
              
            if (error && error.code !== 'PGRST116') {
              console.error('Error checking existing student:', error);
              return;
            }
            
            // If student record exists, store the ID and skip to subject selection
            if (existingStudent && existingStudent.id) {
              console.log('Student record already exists, skipping to subject selection');
              localStorage.setItem('onboardingStudentId', existingStudent.id);
              router.push('/onboarding/subject-selection');
            }
          } catch (err) {
            console.error('Error in checkExistingStudent:', err);
          }
        };
        
        checkExistingStudent();
        return;
      }
      
      // Otherwise fall back to localStorage
      const storedUserId = localStorage.getItem('onboardingUserId')
      const storedEmail = localStorage.getItem('onboardingEmail')
      
      if (!storedUserId || !storedEmail) {
        router.push('/onboarding')
        return
      }
      
      setUserId(storedUserId)
      setEmail(storedEmail)
      
      // Check if student record already exists for the stored user
      const checkExistingStudent = async () => {
        try {
          const { data: existingStudent, error } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', storedUserId)
            .eq('student_email', storedEmail)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error checking existing student:', error);
            return;
          }
          
          // If student record exists, store the ID and skip to subject selection
          if (existingStudent && existingStudent.id) {
            console.log('Student record already exists, skipping to subject selection');
            localStorage.setItem('onboardingStudentId', existingStudent.id);
            router.push('/onboarding/subject-selection');
          }
        } catch (err) {
          console.error('Error in checkExistingStudent:', err);
        }
      };
      
      checkExistingStudent();
    }
  }, [router, session, supabase])

  const handlePersonalInfoSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    setError(null)

    try {
      if (!userId) {
        throw new Error('User registration incomplete. Please start again.')
      }

      // Check if the email is already used by another student
      const { data: existingStudents, error: checkError } = await supabase
        .from('students')
        .select('id, first_name, last_name, user_id')
        .eq('student_email', email)

      if (checkError) {
        console.error('Error checking existing student:', checkError)
      }

      // If we found an existing student with this email
      if (existingStudents && existingStudents.length > 0) {
        // Check if it belongs to the current user
        const ownedStudent = existingStudents.find(student => student.user_id === userId);
        
        if (ownedStudent) {
          // This is our student, store ID and proceed to next step
          console.log('Using existing student record:', ownedStudent.id);
          localStorage.setItem('onboardingStudentId', ownedStudent.id);
          router.push('/onboarding/subject-selection');
          return;
        } else {
          // The email is used by another user's student record
          throw new Error(`A student account with email ${email} already exists. Please use a different email.`)
        }
      }

      // Debug logging
      console.log('Form values being submitted:', {
        first_name: values.firstName,
        last_name: values.lastName,
        parent_first_name: values.parentFirstName,
        parent_last_name: values.parentLastName,
        parent_email: values.parentEmail,
        parent_phone: values.parentPhone,
        student_email: email,
        school: values.school,
        curriculum: values.curriculum,
        year_level: parseInt(values.yearLevel),
        status: 'INACTIVE',
        user_id: userId,
        student_phone: values.studentPhone || null
      });

      // Create student record
      const studentData = {
        first_name: values.firstName,
        last_name: values.lastName,
        parent_first_name: values.parentFirstName,
        parent_last_name: values.parentLastName,
        parent_email: values.parentEmail,
        parent_phone: values.parentPhone,
        student_email: email,
        school: values.school,
        curriculum: values.curriculum,
        year_level: parseInt(values.yearLevel),
        status: 'INACTIVE',
        user_id: userId,
        student_phone: values.studentPhone || null
      };

      console.log('Inserting student record with data:', studentData);
      
      let data, studentError;
      
      try {
        // First try direct insert
        const result = await supabase
          .from('students')
          .insert(studentData)
          .select('id')
          .single();
          
        data = result.data;
        studentError = result.error;
      } catch (insertError) {
        console.warn('Direct insert failed, falling back to function:', insertError);
        studentError = insertError;
      }
      
      // If direct insert fails, try the security definer function
      if (studentError) {
        console.log('Trying fallback with create_student function');
        const { data: fnResult, error: fnError } = await supabase.rpc('create_student', {
          p_first_name: values.firstName,
          p_last_name: values.lastName,
          p_parent_first_name: values.parentFirstName,
          p_parent_last_name: values.parentLastName,
          p_parent_email: values.parentEmail,
          p_parent_phone: values.parentPhone,
          p_student_email: email,
          p_school: values.school,
          p_curriculum: values.curriculum,
          p_year_level: parseInt(values.yearLevel),
          p_user_id: userId,
          p_student_phone: values.studentPhone || null
        });
        
        if (fnError) {
          console.error('Function fallback also failed:', fnError);
          throw fnError;
        }
        
        data = { id: fnResult };
        console.log('Student created via function with ID:', data.id);
      }

      if (!data || !data.id) {
        throw new Error('Failed to create student record');
      }
      
      console.log('Student record created successfully:', data);
      
      // Store student ID for next step
      localStorage.setItem('onboardingStudentId', data.id);
      
      // Redirect to subject selection page
      router.push('/onboarding/subject-selection');
    } catch (error) {
      console.error('Error saving personal info:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }

  if (!userId || !email) {
    return null // Don't render until we've checked for userId
  }

  return (
    <>
      <Head>
        <title>Personal Information | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Personal Information</h1>
        
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-100 text-green-600">
                ✓
              </div>
              <div className="text-xs mt-1 text-green-600 font-medium">Account Setup</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600">
                2
              </div>
              <div className="text-xs mt-1 text-blue-600 font-medium">Personal Info</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-400">
                3
              </div>
              <div className="text-xs mt-1 text-gray-400 font-medium">Subjects</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-400">
                4
              </div>
              <div className="text-xs mt-1 text-gray-400 font-medium">Availability</div>
            </div>
          </div>
          
          <div className="relative h-2 bg-gray-200 rounded-full mt-2 mb-4">
            <div className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
          </div>
          
          <p className="text-center text-gray-600 text-sm">
            Step 2 of 4 - Personal Information
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            parentFirstName: '',
            parentLastName: '',
            parentEmail: '',
            parentPhone: '',
            school: '',
            curriculum: 'SACE',
            yearLevel: '',
            studentPhone: '',
          }}
          validationSchema={PersonalInfoSchema}
          onSubmit={handlePersonalInfoSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-blue-700">Student Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="firstName" className="block mb-1 font-medium">First Name</label>
                    <Field 
                      id="firstName" 
                      name="firstName" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="lastName" className="block mb-1 font-medium">Last Name</label>
                    <Field 
                      id="lastName" 
                      name="lastName" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                    <input
                      id="email" 
                      type="email" 
                      value={email}
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email from your account</p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="studentPhone" className="block mb-1 font-medium">Student Phone (optional)</label>
                    <Field 
                      id="studentPhone" 
                      name="studentPhone" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-blue-700">Parent/Guardian Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="parentFirstName" className="block mb-1 font-medium">Parent First Name</label>
                    <Field 
                      id="parentFirstName" 
                      name="parentFirstName" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="parentFirstName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="parentLastName" className="block mb-1 font-medium">Parent Last Name</label>
                    <Field 
                      id="parentLastName" 
                      name="parentLastName" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="parentLastName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="parentEmail" className="block mb-1 font-medium">Parent Email</label>
                    <Field 
                      id="parentEmail" 
                      name="parentEmail" 
                      type="email" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="parentEmail" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="parentPhone" className="block mb-1 font-medium">Parent Phone</label>
                    <Field 
                      id="parentPhone" 
                      name="parentPhone" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="parentPhone" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-blue-700">School Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="school" className="block mb-1 font-medium">School Name</label>
                    <Field 
                      id="school" 
                      name="school" 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="school" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="curriculum" className="block mb-1 font-medium">Curriculum</label>
                    <Field 
                      as="select"
                      id="curriculum" 
                      name="curriculum" 
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="SACE">SACE</option>
                      <option value="IB">IB</option>
                      <option value="PRESACE">Pre-SACE</option>
                      <option value="PRIMARY">Primary</option>
                      <option value="MEDICINE">Medicine</option>
                    </Field>
                    <ErrorMessage name="curriculum" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="yearLevel" className="block mb-1 font-medium">Year Level</label>
                    <Field 
                      id="yearLevel" 
                      name="yearLevel" 
                      type="number" 
                      min="1"
                      max="12"
                      className="w-full p-2 border border-gray-300 rounded" 
                    />
                    <ErrorMessage name="yearLevel" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Link
                  href="/onboarding"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back
                </Link>
                <button 
                  type="submit" 
                  disabled={isSubmitting || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Continue to Subject Selection'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  )
} 