import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function RegistroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    console.log("Creando usuario nuevo:", email);
    
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      console.error('Error al registrar:', error.message);
      alert('Error: ' + error.message);
    } else {
      console.log('¡Usuario creado en Supabase con éxito!');
      alert('Cuenta creada. Ya puedes iniciar sesión con esos datos.');
      router.back(); // Esta es la instrucción que te devuelve al Login
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Únete a CompiFit</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Correo electrónico" 
        autoCapitalize="none"
        value={email} 
        onChangeText={setEmail} 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Contraseña (mínimo 6 caracteres)" 
        secureTextEntry
        value={password} 
        onChangeText={setPassword} 
      />

      <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});