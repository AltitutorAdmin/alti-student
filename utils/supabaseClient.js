import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ysfslbdcacpbemodkwtl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZnNsYmRjYWNwYmVtb2Rrd3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Njc2NDksImV4cCI6MjA2MDM0MzY0OX0.XX8r1IA9jK0sCSkP3wccqICZhJ8AEXWAnG9X2mezA8s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for student registration flow
export async function createStudent(studentData) {
  // First check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: new Error('Not authenticated') }
  
  // Add the user_id to student data
  const studentWithUserId = {
    ...studentData,
    user_id: user.id
  }
  
  // Insert the student record
  const { data, error } = await supabase
    .from('students')
    .insert(studentWithUserId)
    .select('id')
    .single()
  
  if (error) return { data: null, error }
  
  // Create a task for admin to assign classes
  await createClassAssignmentTask(data.id, studentWithUserId.firstName, studentWithUserId.lastName)
  
  return { data, error }
}

export async function addStudentSubjects(studentId, subjectIds) {
  if (!studentId || !subjectIds || !subjectIds.length) {
    return { data: null, error: new Error('Student ID and subject IDs are required') }
  }
  
  // Create records for each subject
  const subjectRecords = subjectIds.map(subjectId => ({
    student_id: studentId,
    subject_id: subjectId
  }))
  
  const { data, error } = await supabase
    .from('students_subjects')
    .insert(subjectRecords)
    .select()
  
  return { data, error }
}

export async function getSubjects(curriculum, yearLevel) {
  let query = supabase.from('subjects').select('*')
  
  if (curriculum) {
    query = query.eq('curriculum', curriculum)
  }
  
  if (yearLevel) {
    query = query.eq('year_level', yearLevel)
  }
  
  const { data, error } = await query
  return { data, error }
}

export async function getStudentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: new Error('Not authenticated') }
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  return { data, error }
}

export async function getStudentSubjects(studentId) {
  const { data, error } = await supabase
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
    .eq('student_id', studentId)
  
  return { data, error }
}

export async function getStudentClasses(studentId) {
  const { data, error } = await supabase
    .from('classes_students')
    .select(`
      id,
      class_id,
      classes:class_id (
        id,
        name,
        day_of_week,
        start_time,
        end_time,
        subject:subject_id (
          id,
          name,
          curriculum,
          year_level
        ),
        staff:staff_id (
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq('student_id', studentId)
  
  return { data, error }
}

export async function getAvailableCurriculums() {
  const { data, error } = await supabase
    .from('subjects')
    .select('curriculum')
    .distinct()
  
  return { data, error }
}

export async function getYearLevels(curriculum) {
  let query = supabase
    .from('subjects')
    .select('year_level')
    .distinct()
  
  if (curriculum) {
    query = query.eq('curriculum', curriculum)
  }
  
  const { data, error } = await query
  return { data, error }
}

async function createClassAssignmentTask(studentId, firstName, lastName) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: `Assign classes for new student: ${firstName} ${lastName}`,
      description: `New student ${firstName} ${lastName} has registered and selected subjects. Please assign appropriate classes.`,
      status: 'PENDING',
      priority: 'HIGH',
      related_to: 'STUDENT',
      related_id: studentId
    })
    .select()
  
  return { data, error }
} 