import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Head from 'next/head'
import { getStudentProfile } from '../utils/supabaseClient'

// Form validation schema
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  parentFirstName: Yup.string().required('Parent first name is required'),
  parentLastName: Yup.string().required('Parent last name is required'),
  parentEmail: Yup.string().email('Invalid email').required('Parent email is required'),
  parentPhone: Yup.string().required('Parent phone number is required'),
})

export default function Profile() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      fetchStudentProfile()
    }
  }, [session, router])

  async function fetchStudentProfile() {
    setLoading(true)
    const { data, error } = await getStudentProfile()
    
    if (error) {
      console.error('Error fetching student profile:', error)
    } else {
      setStudent(data)
    }
    
    setLoading(false)
  }

  async function handleSubmit(values, { setSubmitting }) {
    try {
      setSaveSuccess(false)
      setSaveError(null)
      
      const { error } = await supabase
        .from('students')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          parent_first_name: values.parentFirstName,
          parent_last_name: values.parentLastName,
          parent_email: values.parentEmail,
          parent_phone: values.parentPhone,
        })
        .eq('id', student.id)
      
      if (error) throw error
      
      setSaveSuccess(true)
      await fetchStudentProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
        <p className="text-red-600">Unable to load your profile. Please try again later.</p>
        <button 
          onClick={fetchStudentProfile} 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Your Profile | Altitutor Student Portal</title>
      </Head>

      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">Your Profile</h1>
        
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Profile updated successfully!
          </div>
        )}
        
        {saveError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error saving profile: {saveError}
          </div>
        )}

        <Formik
          initialValues={{
            firstName: student.first_name || '',
            lastName: student.last_name || '',
            parentFirstName: student.parent_first_name || '',
            parentLastName: student.parent_last_name || '',
            parentEmail: student.parent_email || '',
            parentPhone: student.parent_phone || '',
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-blue-700">Your Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="firstName" className="block mb-1 font-medium">First Name</label>
                    <Field 
                      id="firstName" 
                      name="firstName" 
                      type="text" 
                      className={`w-full p-2 border rounded ${errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="lastName" className="block mb-1 font-medium">Last Name</label>
                    <Field 
                      id="lastName" 
                      name="lastName" 
                      type="text" 
                      className={`w-full p-2 border rounded ${errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-blue-700">Parent/Guardian Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="parentFirstName" className="block mb-1 font-medium">Parent First Name</label>
                    <Field 
                      id="parentFirstName" 
                      name="parentFirstName" 
                      type="text" 
                      className={`w-full p-2 border rounded ${errors.parentFirstName && touched.parentFirstName ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <ErrorMessage name="parentFirstName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="parentLastName" className="block mb-1 font-medium">Parent Last Name</label>
                    <Field 
                      id="parentLastName" 
                      name="parentLastName" 
                      type="text" 
                      className={`w-full p-2 border rounded ${errors.parentLastName && touched.parentLastName ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <ErrorMessage name="parentLastName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="parentEmail" className="block mb-1 font-medium">Parent Email</label>
                    <Field 
                      id="parentEmail" 
                      name="parentEmail" 
                      type="email" 
                      className={`w-full p-2 border rounded ${errors.parentEmail && touched.parentEmail ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <ErrorMessage name="parentEmail" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="parentPhone" className="block mb-1 font-medium">Parent Phone</label>
                    <Field 
                      id="parentPhone" 
                      name="parentPhone" 
                      type="text" 
                      className={`w-full p-2 border rounded ${errors.parentPhone && touched.parentPhone ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <ErrorMessage name="parentPhone" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  )
} 