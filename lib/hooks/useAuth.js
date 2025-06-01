import { useState } from 'react';
import { useRouter } from 'next/router';
import * as authService from '../services/authService';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await authService.signInWithEmail(email, password);
      
      if (error) throw error;
      
      return { success: true, session: data.session, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
      return { success: false, session: null, error };
    } finally {
      setLoading(false);
    }
  };
  
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await authService.signUpWithEmail(email, password);
      
      if (error) throw error;
      
      return { success: true, user: data.user, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
      return { success: false, user: null, error };
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await authService.signOut();
      
      if (error) throw error;
      
      router.push('/login');
      return { success: true, error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    signIn,
    signUp,
    signOut,
    loading,
    error
  };
} 