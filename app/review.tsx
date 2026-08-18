import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReviewScreen() {
  const router = useRouter();

  const compi = {
    nombre: 'Marcos',
    foto: 'https://images.unsplash.com/photo-1583569704084-3990dd346761?q=80&w=300&auto=format&fit=crop',
    gym: 'McFit Centro',
    horaEntreno: '16:00'
  };

  const [asistencia, setAsistencia] = useState<'yes' | 'no' | null>(null);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  
  const [timeLeft, setTimeLeft] = useState(10); 
  const [canReportGhost, setCanReportGhost] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !asistencia) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setCanReportGhost(true);
    }
  }, [timeLeft, asistencia]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const calcularHoraCortesia = (horaString: string) => {
    const [h, m] = horaString.split(':').map(Number);
    let nuevosMinutos = m + 10;
    let nuevaHora = h;
    if (nuevosMinutos >= 60) {
      nuevosMinutos -= 60;
      nuevaHora += 1;
    }
    return `${nuevaHora.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  };

  const horaLimite = calcularHoraCortesia(compi.horaEntreno);

  const ETIQUETAS_DISPONIBLES = [
    { id: '1', texto: 'Puntual ⏱️' },
    { id: '2', texto: 'Máquina de spottear 🛡️' },
    { id: '3', texto: 'Motivador nato 🗣️' },
    { id: '4', texto: 'Buena vibra 🤙' },
    { id: '5', texto: 'Tiró PRs 🦍' },
    { id: '6', texto: 'Enseñó técnica 🧠' },
  ];

  const toggleEtiqueta = (id: string) => {
    if (etiquetas.includes(id)) {
      setEtiquetas(etiquetas.filter(e => e !== id));
    } else {
      if (etiquetas.length < 3) setEtiquetas([...etiquetas, id]);
    }
  };

  const isSubmitEnabled = etiquetas.length > 0;

  const finalizarReview = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in</Text>
        <View style={{width: 28}} /> 
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <Image source={{ uri: compi.foto }} style={styles.avatar} />
          <Text style={styles.questionText}>Entreno con {compi.nombre}</Text>
          <Text style={styles.gymText}>📍 {compi.gym} • 🕒 {compi.horaEntreno}</Text>
        </View>

        {/* PASO 1: ASISTENCIA Y CONTADOR */}
        {!asistencia && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>¿Ya ha llegado {compi.nombre}?</Text>
            
            <View style={styles.asistenciaRow}>
              
              <TouchableOpacity 
                style={[styles.asistenciaBtnNo, !canReportGhost && styles.asistenciaBtnDisabled]} 
                onPress={() => setAsistencia('no')} 
                activeOpacity={0.8}
                disabled={!canReportGhost}
              >
                <View style={[styles.iconCircleNo, !canReportGhost && styles.iconCircleNoDisabled]}>
                  {canReportGhost ? (
                    <Ionicons name="warning" size={32} color="#E11D48" />
                  ) : (
                    <Ionicons name="time" size={32} color="#9ca3af" />
                  )}
                </View>
                {canReportGhost ? (
                  <Text style={styles.asistenciaBtnTextNo}>No apareció</Text>
                ) : (
                  <View style={{alignItems: 'center'}}>
                    <Text style={styles.asistenciaBtnTextDisabled}>Margen de cortesía</Text>
                    <Text style={styles.timerText}>{timeString}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.asistenciaBtnYes} onPress={() => setAsistencia('yes')} activeOpacity={0.8}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.yesGradient} />
                <View style={styles.iconCircleYes}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={styles.asistenciaBtnTextYes}>¡Sí, ya entrenamos!</Text>
              </TouchableOpacity>

            </View>

            {!canReportGhost && (
               <Text style={styles.disclaimerTimer}>
                 Habrá que darle 10 minutos de cortesía (hasta las {horaLimite}) antes de reportarlo... que igual se ha liado preparando la mochila 😞
               </Text>
            )}
          </View>
        )}

        {/* PASO 2A: REPORTE FANTASMA */}
        {asistencia === 'no' && (
          <View style={styles.ghostContainer}>
            <View style={styles.ghostIconBox}>
              <Ionicons name="warning" size={40} color="#d97706" />
            </View>
            <Text style={styles.ghostTitle}>Reporte registrado</Text>
            <Text style={styles.ghostDesc}>
              Sentimos que te hayan dejado tirado/a. Hemos penalizado la cuenta de {compi.nombre}. Tu racha semanal se mantiene intacta y te regalamos un Boost de visibilidad por las molestias.
            </Text>
            <TouchableOpacity style={styles.submitBtnGhost} onPress={finalizarReview}>
              <Text style={styles.submitBtnText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PASO 2B: GAMIFICACIÓN Y ETIQUETAS */}
        {asistencia === 'yes' && (
          <View style={styles.successContainer}>
            
            <Text style={styles.stepTitle}>Destaca lo mejor de {compi.nombre}</Text>
            <Text style={styles.stepSubtitle}>
              Elige entre 1 y 3 reconocimientos. Esto le ayudará a conseguir la Mancuerna Dorada.
            </Text>

            <View style={styles.tagsGrid}>
              {ETIQUETAS_DISPONIBLES.map(tag => {
                const isSelected = etiquetas.includes(tag.id);
                return (
                  <TouchableOpacity 
                    key={tag.id} 
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    onPress={() => toggleEtiqueta(tag.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag.texto}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* BOTÓN DE RECLAMAR ACTUALIZADO Y SIN SCROLL */}
            <TouchableOpacity 
              style={[styles.submitBtnSuccess, !isSubmitEnabled && styles.submitBtnSuccessDisabled]} 
              onPress={finalizarReview} 
              activeOpacity={0.9}
              disabled={!isSubmitEnabled}
            >
              {isSubmitEnabled && <LinearGradient colors={['#111827', '#374151']} style={styles.submitGradient} />}
              <Text style={[styles.submitBtnText, !isSubmitEnabled && styles.submitBtnTextDisabled]}>
                {isSubmitEnabled ? 'Validar y Reclamar +2 💧' : 'Elige al menos 1 etiqueta'}
              </Text>
            </TouchableOpacity>
            
          </View>
        )}

      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  container: { flex: 1, paddingHorizontal: 20 },

  profileSection: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, borderWidth: 4, borderColor: '#f1f5f9' },
  questionText: { fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 8 },
  gymText: { fontSize: 15, color: '#6b7280', fontWeight: 'bold' },

  stepContainer: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16, textAlign: 'center' },

  asistenciaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  
  asistenciaBtnNo: { flex: 1, backgroundColor: '#fff1f2', paddingVertical: 24, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#ffe4e6' },
  asistenciaBtnDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e5e7eb' },
  
  iconCircleNo: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...Platform.select({ web: { boxShadow: '0px 4px 10px rgba(225,29,72,0.1)' }, default: { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}) },
  iconCircleNoDisabled: { backgroundColor: '#e5e7eb', ...Platform.select({ web: { boxShadow: 'none' }, default: { elevation: 0, shadowOpacity: 0 }}) },
  
  asistenciaBtnTextNo: { color: '#E11D48', fontWeight: 'bold', fontSize: 15 },
  asistenciaBtnTextDisabled: { color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  timerText: { color: '#6b7280', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },

  disclaimerTimer: { textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 24, lineHeight: 20, paddingHorizontal: 4 },

  asistenciaBtnYes: { flex: 1, paddingVertical: 24, borderRadius: 20, alignItems: 'center', overflow: 'hidden' },
  yesGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  iconCircleYes: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  asistenciaBtnTextYes: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, textAlign: 'center', paddingHorizontal: 10 },

  ghostContainer: { backgroundColor: '#fffbeb', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#fef3c7', alignItems: 'center' },
  ghostIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ghostTitle: { fontSize: 20, fontWeight: 'bold', color: '#92400e', marginBottom: 12 },
  ghostDesc: { fontSize: 15, color: '#b45309', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  submitBtnGhost: { backgroundColor: '#111827', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  submitBtnTextDisabled: { color: '#9ca3af' },

  successContainer: { marginTop: 12 },
  stepSubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 32 },
  tagPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  tagPillSelected: { backgroundColor: '#10b981', borderColor: '#059669' },
  tagText: { color: '#4b5563', fontWeight: '600', fontSize: 14 },
  tagTextSelected: { color: '#ffffff', fontWeight: 'bold' },

  submitBtnSuccess: { width: '100%', borderRadius: 16, alignItems: 'center', paddingVertical: 18, overflow: 'hidden' },
  submitBtnSuccessDisabled: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e5e7eb' },
  submitGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
});