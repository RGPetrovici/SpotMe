import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';
// IMPORTAMOS LA MEMORIA LOCAL
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  
  const router = useRouter();

  // MAGIA 1: Al abrir la pantalla, buscamos si hay un email guardado en la memoria
  useEffect(() => {
    async function cargarEmailGuardado() {
      const emailGuardado = await AsyncStorage.getItem('email_guardado');
      if (emailGuardado) {
        setEmail(emailGuardado);
        setRememberEmail(true); // Marcamos la casilla automáticamente
      }
    }
    cargarEmailGuardado();
  }, []); // El corchete vacío significa "haz esto solo una vez al arrancar"

  async function signInWithEmail() {
    setLoading(true);
    console.log("Intentando iniciar sesión con:", email);

    // MAGIA 2: Si la casilla está marcada, guardamos el email. Si no, lo borramos.
    if (rememberEmail) {
      await AsyncStorage.setItem('email_guardado', email);
    } else {
      await AsyncStorage.removeItem('email_guardado');
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Error Supabase:', error.message);
      alert('Error: ' + error.message);
    } else {
      console.log('¡BINGO! Sesión iniciada correctamente');
      alert('¡Has entrado a la app!');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View>
          <Text style={styles.headerTitle}>CompiFit</Text>
        </View>

        <Text style={styles.mainTitle}>Inicia sesión</Text>

        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="tu@email.com" autoCapitalize="none" value={email} onChangeText={setEmail} />
          
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberEmail(!rememberEmail)} activeOpacity={0.7}>
            <Ionicons name={rememberEmail ? "checkbox" : "square-outline"} size={22} color="#e11d48" />
            <Text style={styles.checkboxText}>Recordar email</Text>
          </TouchableOpacity>
          
          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Contraseña" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.forgotPasswordContainer}><Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text></TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/registro')}>
            <Text style={styles.footerLink}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoText: { color: '#9333ea', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 30 },
  formContainer: { width: '100%', maxWidth: 400 },
  input: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 12 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxText: { marginLeft: 8, color: '#6b7280', fontSize: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, marginBottom: 12 },
  passwordInput: { flex: 1, padding: 16, fontSize: 16 },
  eyeIcon: { padding: 16 },
  forgotPasswordContainer: { alignSelf: 'flex-start', marginBottom: 30 },
  forgotPasswordText: { color: '#6b7280', fontSize: 15 },
  button: { backgroundColor: '#b91c1c', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  footerContainer: { flexDirection: 'row', marginTop: 'auto', marginBottom: 40 },
  footerText: { color: '#6b7280', fontSize: 15 },
  footerLink: { color: '#e11d48', fontSize: 15, fontWeight: 'bold' },
});