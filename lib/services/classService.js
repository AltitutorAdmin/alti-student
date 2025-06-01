import * as classRepository from '../repositories/classRepository';

export async function getStudentClasses(studentId) {
  try {
    const { data, error } = await classRepository.getStudentClasses(studentId);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentClasses service:', error);
    return { data: null, error };
  }
} 