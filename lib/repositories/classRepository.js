import { supabase } from '../../utils/supabaseClient';

export async function getStudentClasses(studentId) {
  const { data, error } = await supabase
    .from('classes_students')
    .select(`
      id,
      class_id,
      status,
      classes:class_id (
        id,
        subject,
        day_of_week,
        start_time,
        end_time,
        room,
        status,
        staff:staff_id (
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq('student_id', studentId);
  
  return { data, error };
}

export async function createClassAssignmentTask(studentId, firstName, lastName) {
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
    .select();
  
  return { data, error };
} 