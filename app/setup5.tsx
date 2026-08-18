import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ETIQUETAS = [
  {
    id: 'spotter',
    icon: '🏋️',
    title: 'Spotter y Técnica',
    desc: 'Para ir al fallo sin miedo a morir aplastado. Aseguramos series al fallo y vigilamos que la técnica esté clean.'
  },
  {
    id: 'motivacion',
    icon: '🔥',
    title: 'Motivación (Cero excusas)',
    desc: 'Alguien que me meta presión para sacar la última repetición y me obligue a NO saltarme los días duros (pierna 💀).'
  },
  {
    id: 'nuevo',
    icon: '🌱',
    title: 'Nuevo Gym / Primeros Pasos',
    desc: 'Acabo de empezar en los hierros o me he cambiado de centro. Busco conocer gente, pillar confianza y aprender a usar bien las máquinas.'
  },
  {
    id: 'mentor',
    icon: '🧠',
    title: 'Gym Mentor',
    desc: 'Llevo ya un tiempo en esto y sé lo que es empezar. No me importa turnar máquinas para guiar o echar una mano. Cero juicios 🤝.'
  },
  {
    id: 'retos',
    icon: '⚔️',
    title: 'Retos & Skills',
    desc: 'Para montar grupillo, competir a muerte en un circuito o sacar trucos nuevos en las barras. Busco a alguien que me siga el ritmo y nos hagamos mejores.'
  },
  {
    id: 'posing',
    icon: '📸',
    title: 'Content & Posing',
    desc: 'Para flexear esos gains 🔱. Ya sea para checkear el progreso, subir una story para mi crush o darnos consejos de posing con buena luz.'
  }
];

export default function Setup5Screen() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      // Si ya está seleccionada, la quitamos
      setSelectedTags(prev => prev.filter(tagId => tagId !== id));
    } else {
      // LÓGICA DE INCOMPATIBILIDAD: Nuevo Gym y Gym Mentor no pueden ir juntos
      if (id === 'nuevo') {
        setSelectedTags(prev => [...prev.filter(tagId => tagId !== 'mentor'), id]);
      } else if (id === 'mentor') {
        setSelectedTags(prev => [...prev.filter(tagId => tagId !== 'nuevo'), id]);
      } else {
        // Para el resto de etiquetas, simplemente la añadimos (pueden combinarse con todas)
        setSelectedTags(prev => [...prev, id]);
      }
    }
  };

  const formCompleto = selectedTags.length > 0;

  const finalizarOnboarding = () => {
    if (!formCompleto) return;
    // Aquí mandaremos a la pantalla de subir fotos (setup6) o directo al feed
    router.push('/setup4'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* BARRA DE PROGRESO */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarFill} />
      </View>
      
      {/* CABECERA */}
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

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titlesContainer}>
          <Text style={styles.mainTitle}>¿Cuál es tu rollo en el gym?</Text>
          <Text style={styles.subtitle}>Elige lo que buscas actualmente. Puedes marcar varias (y cambiarlas más adelante).</Text>
        </View>

        <View style={styles.tagsGrid}>
          {ETIQUETAS.map((etiqueta) => {
            const isSelected = selectedTags.includes(etiqueta.id);
            return (
              <TouchableOpacity 
                key={etiqueta.id} 
                style={[styles.tagCard, isSelected && styles.tagCardActive]} 
                onPress={() => toggleTag(etiqueta.id)}
                activeOpacity={0.7}
              >
                <View style={styles.tagHeader}>
                  <Text style={styles.tagIcon}>{etiqueta.icon}</Text>
                  <Text style={[styles.tagTitle, isSelected && styles.tagTitleActive]}>{etiqueta.title}</Text>
                  
                  {/* Círculo de check */}
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                  </View>
                </View>
                
                <Text style={[styles.tagDesc, isSelected && styles.tagDescActive]}>{etiqueta.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.button, formCompleto ? styles.buttonActive : styles.buttonDisabled]} 
          disabled={!formCompleto} 
          onPress={finalizarOnboarding}
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
  progressBarFill: { height: '100%', width: '85%', backgroundColor: '#a855f7' },
  
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
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  
  tagsGrid: { flexDirection: 'column', gap: 16, marginBottom: 32 },
  
  tagCard: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#f1f5f9', borderRadius: 16, padding: 16, ...Platform.select({ web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.02)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}) },
  tagCardActive: { borderColor: '#E11D48', backgroundColor: '#fff1f2' },
  
  tagHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tagIcon: { fontSize: 24, marginRight: 10 },
  tagTitle: { fontSize: 17, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  tagTitleActive: { color: '#E11D48' },
  
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  checkCircleActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  
  tagDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20, paddingLeft: 34 },
  tagDescActive: { color: '#4b5563' },
  
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 }, 
  buttonDisabled: { backgroundColor: '#e5e7eb' }, 
  buttonActive: { backgroundColor: '#111827' }, 
  buttonText: { fontSize: 18, fontWeight: 'bold' }, 
  buttonTextDisabled: { color: '#9ca3af' }, 
  buttonTextActive: { color: '#ffffff' },
});