import * as studentRepository from '../repositories/studentRepository';
import * as classRepository from '../repositories/classRepository';

export async function registerStudent(studentData) {
  try {
    // Check if student with email already exists
    const { data: existingStudents, error: checkError } = 
      await studentRepository.checkExistingStudentByEmail(studentData.student_email);
    
    if (checkError) {
      throw checkError;
    }
    
    // If we found an existing student with this email
    if (existingStudents && existingStudents.length > 0) {
      throw new Error(`A student account with email ${studentData.student_email} already exists. Please use a different email.`);
    }
    
    // Create student record
    const { data, error } = await studentRepository.createStudent(studentData);
    
    if (error) {
      throw error;
    }
    
    // Create task for admin to assign classes
    await classRepository.createClassAssignmentTask(
      data.id, 
      studentData.first_name, 
      studentData.last_name
    );
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in registerStudent service:', error);
    return { data: null, error };
  }
}

export async function updateStudentProfile(studentId, profileData) {
  try {
    const { data, error } = await studentRepository.updateStudent(studentId, profileData);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateStudentProfile service:', error);
    return { data: null, error };
  }
}

export async function getStudentProfile(userId) {
  try {
    const { data, error } = await studentRepository.getStudentByUserId(userId);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentProfile service:', error);
    return { data: null, error };
  }
} 