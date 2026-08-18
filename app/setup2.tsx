import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const DEPORTES = [
  { id: 'pesas', nombre: 'Pesas / Fuerza', icon: 'dumbbell' },
  { id: 'crossfit', nombre: 'CrossFit', icon: 'weight-lifter' },
  { id: 'calistenia', nombre: 'Calistenia', icon: 'gymnastics' }, 
  { id: 'hiit', nombre: 'HIIT / Funcional', icon: 'lightning-bolt' },
];

export default function Setup2Screen() {
  const router = useRouter();
  
  // Estados para guardar las selecciones
  const [genero, setGenero] = useState('');
  const [deportesSeleccionados, setDeportesSeleccionados] = useState<string[]>([]);

  // Lógica para seleccionar o deseleccionar varios deportes
  const toggleDeporte = (id: string) => {
    if (deportesSeleccionados.includes(id)) {
      setDeportesSeleccionados(deportesSeleccionados.filter(item => item !== id));
    } else {
      setDeportesSeleccionados([...deportesSeleccionados, id]);
    }
  };

  // Validación: mínimo un género y un deporte
  const formCompleto = genero !== '' && deportesSeleccionados.length > 0;

  function continuar() {
    if (!formCompleto) return;
    router.push('/setup3'); // Viajamos a la fase 3
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barra de progreso (ahora al 66%) */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarFill} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#e11d48" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View>
          <Text style={styles.headerTitle}>CompiFit</Text>
        </View>
        <View style={styles.placeholderSpace} /> 
      </View>

      {/* Usamos ScrollView porque en móviles pequeños la cuadrícula no cabrá entera */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titlesContainer}>
          <Text style={styles.mainTitle}>Tu entrenamiento</Text>
          <Text style={styles.subTitle}>Selecciona tu género y deportes favoritos</Text>
        </View>

        <Text style={styles.sectionLabel}>GÉNERO</Text>
        <View style={styles.genderRow}>
          {['Masculino', 'Femenino', 'Prefiero no decir'].map((opcion) => (
            <TouchableOpacity 
              key={opcion} 
              style={[styles.genderButton, genero === opcion && styles.itemActive]}
              onPress={() => setGenero(opcion)}
            >
              <Text style={[styles.genderText, genero === opcion && styles.textActive]}>{opcion}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>¿QUÉ TE GUSTA HACER?</Text>
        <View style={styles.gridContainer}>
          {DEPORTES.map((deporte) => {
            const isActive = deportesSeleccionados.includes(deporte.id);
            return (
              <TouchableOpacity
                key={deporte.id}
                style={[styles.sportCard, isActive && styles.itemActive]}
                onPress={() => toggleDeporte(deporte.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={deporte.icon as any} 
                  size={32} 
                  color={isActive ? '#a855f7' : '#6b7280'} 
                  style={styles.sportIcon}
                />
                <Text style={[styles.sportText, isActive && styles.textActive]}>
                  {deporte.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.button, formCompleto ? styles.buttonActive : styles.buttonDisabled]} 
          disabled={!formCompleto}
          onPress={continuar}
        >
          <Text style={[styles.buttonText, formCompleto ? styles.buttonTextActive : styles.buttonTextDisabled]}>
            Siguiente →
          </Text>
        </TouchableOpacity>

      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  progressBarContainer: { height: 4, backgroundColor: '#e5e7eb', width: '100%' },
  progressBarFill: { height: '100%', width: '66%', backgroundColor: '#a855f7' }, // 66% de progreso
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  backButton: { padding: 8 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  logoText: { color: '#9333ea', fontWeight: 'bold', fontSize: 12 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  placeholderSpace: { width: 40 },

  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  titlesContainer: { alignItems: 'center', marginBottom: 32 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  subTitle: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  
  sectionLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
  
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  genderButton: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 14, marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  genderText: { fontSize: 14, color: '#4b5563', fontWeight: '500', textAlign: 'center' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  sportCard: { width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 8, alignItems: 'center', marginBottom: 16 },
  sportIcon: { marginBottom: 12 },
  sportText: { fontSize: 14, color: '#4b5563', fontWeight: '500', textAlign: 'center' },
  
  // Estilos compartidos para cuando algo está seleccionado
  itemActive: { borderColor: '#a855f7', backgroundColor: '#fdf4ff' }, // Borde morado y fondo morado súper claro
  textActive: { color: '#a855f7', fontWeight: '700' },
  
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#e5e7eb' },
  buttonActive: { backgroundColor: '#a855f7' },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
  buttonTextDisabled: { color: '#ffffff' },
  buttonTextActive: { color: '#ffffff' },
});