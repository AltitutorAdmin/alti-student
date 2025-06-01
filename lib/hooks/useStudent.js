import { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import * as studentService from '../services/studentService';

export function useStudentProfile() {
  const session = useSession();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudentProfile() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await studentService.getStudentProfile(session.user.id);
        
        if (error) throw error;
        
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentProfile();
  }, [session]);

  const updateProfile = async (profileData) => {
    if (!student) return { success: false, error: new Error('Student profile not loaded') };
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await studentService.updateStudentProfile(student.id, profileData);
      
      if (error) throw error;
      
      setStudent(data);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating student profile:', error);
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    student,
    loading,
    error,
    updateProfile
  };
}

export function useRegisterStudent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerStudent = async (studentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await studentService.registerStudent(studentData);
      
      if (error) throw error;
      
      return { studentId: data.id, error: null };
    } catch (error) {
      console.error('Error registering student:', error);
      setError(error.message);
      return { studentId: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerStudent,
    loading,
    error
  };
} 