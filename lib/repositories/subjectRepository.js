import { supabase } from '../../utils/supabaseClient';

export async function getSubjects(curriculum, yearLevel) {
  let query = supabase.from('subjects').select('*');
  
  if (curriculum) {
    query = query.eq('curriculum', curriculum);
  }
  
  if (yearLevel) {
    query = query.eq('year_level', yearLevel);
  }
  
  const { data, error } = await query.order('name', { ascending: true });
  return { data, error };
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
    .eq('student_id', studentId);
  
  return { data, error };
}

export async function addStudentSubjects(studentId, subjectIds) {
  if (!studentId || !subjectIds || !subjectIds.length) {
    return { data: null, error: new Error('Student ID and subject IDs are required') };
  }
  
  // Create records for each subject
  const subjectRecords = subjectIds.map(subjectId => ({
    student_id: studentId,
    subject_id: subjectId
  }));
  
  const { data, error } = await supabase
    .from('students_subjects')
    .insert(subjectRecords)
    .select();
  
  return { data, error };
}

export async function removeStudentSubjects(subjectRelationIds) {
  if (!subjectRelationIds || !subjectRelationIds.length) {
    return { data: null, error: new Error('Subject relation IDs are required') };
  }
  
  const { data, error } = await supabase
    .from('students_subjects')
    .delete()
    .in('id', subjectRelationIds);
  
  return { data, error };
}

export async function getAvailableCurriculums() {
  const { data, error } = await supabase
    .from('subjects')
    .select('curriculum')
    .distinct();
  
  return { data, error };
}

export async function getYearLevels(curriculum) {
  let query = supabase
    .from('subjects')
    .select('year_level')
    .distinct();
  
  if (curriculum) {
    query = query.eq('curriculum', curriculum);
  }
  
  const { data, error } = await query;
  return { data, error };
} 