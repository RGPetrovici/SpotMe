import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; // Importamos el detector de plataforma
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://dtgmyxamgxfwewylbgyo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Z215eGFtZ3hmd2V3eWxiZ3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDk1MzMsImV4cCI6MjA5ODkyNTUzM30.wW4woFcAZCGrCP4exlrEtyZdibHcKzU83uY_3sWatVs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Aquí está la magia: si es web, no usamos AsyncStorage
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});