import { supabase } from '../../utils/supabaseClient';

export async function getStudentByUserId(userId) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

export async function createStudent(studentData) {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select('id')
    .single();
  
  return { data, error };
}

export async function updateStudent(studentId, studentData) {
  const { data, error } = await supabase
    .from('students')
    .update(studentData)
    .eq('id', studentId)
    .select()
    .single();
  
  return { data, error };
}

export async function getStudentById(studentId) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();
  
  return { data, error };
}

export async function checkExistingStudentByEmail(email) {
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .eq('student_email', email);
  
  return { data, error };
} 