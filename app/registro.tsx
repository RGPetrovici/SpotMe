import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function RegistroScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Por favor, rellena tu correo y contraseña.");
      return;
    }

    setCargando(true);
    // Registramos al usuario. Como hemos quitado la confirmación por email,
    // Supabase le inicia sesión automáticamente en este mismo paso.
    const { error } = await supabase.auth.signUp({ email, password });
    setCargando(false);

    if (error) {
      Alert.alert("Error al registrarse", error.message);
    } else {
      // ¡MAGIA! En vez de mandarlo a la pantalla de Login ('/'), 
      // lo mandamos directamente a crear su perfil ('/setup')
      router.replace('/setup'); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* OCULTAMOS LA BARRA FEA DE EXPO POR DEFECTO */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER: LOGO COMPLETAMENTE CENTRADO (SIN FLECHAS) */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>SM</Text>
              </View>
              <Text style={styles.brandText}>SpotMe</Text>
            </View>
          </View>

          {/* FORMULARIO DE REGISTRO */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Únete a SpotMe</Text>
            <Text style={styles.subtitle}>Crea tu cuenta gratis para empezar a descubrir compañeros de entreno.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput 
                style={styles.input} 
                placeholder="tu@email.com" 
                placeholderTextColor="#9ca3af"
                value={email} 
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Mínimo 6 caracteres" 
                placeholderTextColor="#9ca3af"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.mainBtn, cargando && styles.mainBtnDisabled]} 
              onPress={handleSignUp}
              disabled={cargando}
              activeOpacity={0.9}
            >
              <Text style={styles.mainBtnText}>
                {cargando ? 'Creando cuenta...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTÓN INFERIOR PARA VOLVER AL LOGIN (Única salida) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.loginLinkText}>
            ¿Ya tienes una cuenta? <Text style={styles.loginLinkTextBold}>Inicia sesión</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: Platform.OS === 'android' ? 50 : 24, paddingBottom: 16 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
  brandText: { fontSize: 26, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  formContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  mainBtn: { width: '100%', paddingVertical: 18, borderRadius: 16, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginTop: 12, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(225,29,72,0.3)' }, default: { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}) },
  mainBtnDisabled: { backgroundColor: '#fca5a5', opacity: 0.7 },
  mainBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  loginLink: { alignItems: 'center', paddingVertical: 12 },
  loginLinkText: { fontSize: 15, color: '#6b7280' },
  loginLinkTextBold: { color: '#E11D48', fontWeight: 'bold' }
});