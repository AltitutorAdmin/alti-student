import { supabase } from '../../utils/supabaseClient';
import * as studentRepository from '../repositories/studentRepository';

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Error in getCurrentUser service:', error);
    return { user: null, error };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in signInWithEmail service:', error);
    return { data: null, error };
  }
}

export async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // If this is the test account, create student record immediately
    if (email === 'test@example.com') {
      try {
        // Check if student record already exists for this user
        const { data: existingStudent } = await studentRepository.checkExistingStudentByEmail(email);
        
        if (!existingStudent || existingStudent.length === 0) {
          // Create a student record for the test user
          await studentRepository.createStudent({
            user_id: data.user.id,
            first_name: 'Test',
            last_name: 'User',
            student_email: email,
            parent_first_name: 'Parent',
            parent_last_name: 'User',
            parent_email: 'parent@example.com',
            parent_phone: '123-456-7890',
            school: 'Test School',
            curriculum: 'VCE',
            year_level: 11,
            status: 'ACTIVE'
          });
        }
      } catch (studentError) {
        console.error('Error creating test student:', studentError);
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in signUpWithEmail service:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error in signOut service:', error);
    return { error };
  }
}

// Creates a test user for development purposes
export async function createTestUserIfNotExists() {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Check if the user already exists
    const { error: signInError } = await signInWithEmail(testEmail, testPassword);
    
    // If the user doesn't exist, create it
    if (signInError && signInError.message === 'Invalid login credentials') {
      const { data, error } = await signUpWithEmail(testEmail, testPassword);
      
      if (error) {
        throw error;
      }
      
      console.log('Test user created successfully:', data.user.email);
      return { success: true };
    } else {
      console.log('Test user already exists');
      return { success: true };
    }
  } catch (error) {
    console.error('Error creating test user:', error);
    return { success: false, error };
  }
} 