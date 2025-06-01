import * as subjectRepository from '../repositories/subjectRepository';

export async function getAvailableSubjects(curriculum, yearLevel) {
  try {
    const { data, error } = await subjectRepository.getSubjects(curriculum, yearLevel);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getAvailableSubjects service:', error);
    return { data: null, error };
  }
}

export async function getStudentSubjects(studentId) {
  try {
    const { data, error } = await subjectRepository.getStudentSubjects(studentId);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentSubjects service:', error);
    return { data: null, error };
  }
}

export async function updateStudentSubjects(studentId, newSubjectIds, currentSubjects) {
  try {
    // Get current subject IDs
    const currentSubjectIds = currentSubjects.map(item => item.subject_id);
    
    // Find subjects to add (in newSubjectIds but not in currentSubjectIds)
    const subjectsToAdd = newSubjectIds.filter(id => !currentSubjectIds.includes(id));
    
    // Find subject relationships to remove (in currentSubjectIds but not in newSubjectIds)
    const subjectsToRemove = currentSubjects
      .filter(item => !newSubjectIds.includes(item.subject_id))
      .map(item => item.id);
    
    let addError = null;
    let removeError = null;
    
    // Add new subjects if any
    if (subjectsToAdd.length > 0) {
      const { error } = await subjectRepository.addStudentSubjects(studentId, subjectsToAdd);
      addError = error;
    }
    
    // Remove subjects if any
    if (subjectsToRemove.length > 0) {
      const { error } = await subjectRepository.removeStudentSubjects(subjectsToRemove);
      removeError = error;
    }
    
    // If any operation failed, return error
    if (addError || removeError) {
      throw addError || removeError;
    }
    
    // Get updated subjects
    const { data, error } = await subjectRepository.getStudentSubjects(studentId);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateStudentSubjects service:', error);
    return { data: null, error };
  }
}

export async function getCurriculums() {
  try {
    const { data, error } = await subjectRepository.getAvailableCurriculums();
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getCurriculums service:', error);
    return { data: null, error };
  }
}

export async function getYearLevels(curriculum) {
  try {
    const { data, error } = await subjectRepository.getYearLevels(curriculum);
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getYearLevels service:', error);
    return { data: null, error };
  }
} 