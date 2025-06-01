import { useState } from 'react';
import * as classService from '../services/classService';

export function useClasses(studentId) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentClasses = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await classService.getStudentClasses(studentId);
      
      if (error) throw error;
      
      setClasses(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    classes,
    loading,
    error,
    fetchStudentClasses
  };
} 