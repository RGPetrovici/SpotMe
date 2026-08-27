import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// IMPORTAMOS SUPABASE
import { supabase } from '../supabase';

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Por favor, escribe tu correo y contraseña.");
      return;
    }

    setCargando(true);
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    setCargando(false);

    if (error) {
      // 🔥 SEGURIDAD APLICADA: Mensaje genérico para evitar la enumeración de usuarios
      Alert.alert("Error al iniciar sesión", "Correo o contraseña incorrectos.");
    } else {
      router.replace('/feed'); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SM</Text>
            </View>
            <Text style={styles.brandText}>SpotMe</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Inicia sesión</Text>
            
            <View style={styles.inputGroup}>
              <TextInput 
                style={styles.input} 
                placeholder="tu@email.com" 
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, {marginBottom: 16}]}>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.passwordInput} 
                  placeholder="Contraseña" 
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberBtn} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.8}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                </View>
                <Text style={styles.rememberText}>Recordar email</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, cargando && styles.loginBtnDisabled]} 
              onPress={handleLogin}
              disabled={cargando}
              activeOpacity={0.9}
            >
              {cargando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>Entrar</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/registro')} activeOpacity={0.8}>
          <Text style={styles.registerLinkText}>
            ¿No tienes cuenta? <Text style={styles.registerLinkTextBold}>Crear cuenta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: Platform.OS === 'android' ? 60 : 40, paddingBottom: 40 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { color: '#E11D48', fontWeight: '900', fontSize: 14 },
  brandText: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  formContainer: { flex: 1, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '900', color: '#111827', marginBottom: 32, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#111827' },
  eyeIcon: { padding: 16 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  rememberBtn: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  rememberText: { color: '#6b7280', fontSize: 14 },
  forgotText: { color: '#6b7280', fontSize: 14 },
  loginBtn: { width: '100%', paddingVertical: 18, borderRadius: 16, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(225,29,72,0.3)' }, default: { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}) },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  registerLink: { alignItems: 'center', paddingVertical: 12 },
  registerLinkText: { fontSize: 15, color: '#6b7280' },
  registerLinkTextBold: { color: '#E11D48', fontWeight: 'bold' }
});