import { useState } from 'react';
import * as subjectService from '../services/subjectService';

export function useSubjects(studentId) {
  const [subjects, setSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentSubjects = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await subjectService.getStudentSubjects(studentId);
      
      if (error) throw error;
      
      setSubjects(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSubjects = async (curriculum, yearLevel) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await subjectService.getAvailableSubjects(curriculum, yearLevel);
      
      if (error) throw error;
      
      setAvailableSubjects(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching available subjects:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateStudentSubjects = async (newSubjectIds) => {
    if (!studentId) return { success: false, error: new Error('Student ID is required') };
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await subjectService.updateStudentSubjects(
        studentId, 
        newSubjectIds, 
        subjects
      );
      
      if (error) throw error;
      
      setSubjects(data || []);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating student subjects:', error);
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    availableSubjects,
    loading,
    error,
    fetchStudentSubjects,
    fetchAvailableSubjects,
    updateStudentSubjects
  };
}

export function useCurriculums() {
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await subjectService.getCurriculums();
      
      if (error) throw error;
      
      setCurriculums(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching curriculums:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    curriculums,
    loading,
    error,
    fetchCurriculums
  };
}

export function useYearLevels() {
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchYearLevels = async (curriculum) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await subjectService.getYearLevels(curriculum);
      
      if (error) throw error;
      
      setYearLevels(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching year levels:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    yearLevels,
    loading,
    error,
    fetchYearLevels
  };
} 