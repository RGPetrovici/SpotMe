import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LikesScreen() {
  const router = useRouter();
  
  // Saldo simulado del usuario (ponemos 5 para forzar que salte el aviso de que no tiene suficiente)
  const [tokens, setTokens] = useState(5); 

  // MOCK DATA: Perfiles difuminados
  const perfilesBorroso = [
    { id: '1', edad: 22, foto: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop', verificado: false },
    { id: '2', edad: 25, foto: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop', verificado: true },
    { id: '3', edad: 21, foto: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop', verificado: false },
    { id: '4', edad: 28, foto: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=300&auto=format&fit=crop', verificado: true },
  ];

  const intentarDescubrir = () => {
    if (tokens >= 10) {
      Alert.alert("¡Likes Revelados!", "Has gastado 10 💧. Ahora puedes ver quién te ha dado like.");
      // Aquí iría la lógica para quitar el difuminado
    } else {
      Alert.alert(
        "Falta de Sudor 💧", 
        "Necesitas 10 gotas para revelar a quién le gustas. Ve a la tienda a completar retos, ver un anuncio o validar tus entrenos.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ir a la Tienda", onPress: () => router.push('/store') }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Me gusta</Text>
        <View style={{width: 28}} /> {/* Espaciador para centrar el texto */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.subtitle}>
          Gasta 10 💧 para ver a las personas que ya han dicho que les gustas y hacer match instantáneo.
        </Text>

        {/* CUADRÍCULA DE FOTOS BORROSAS */}
        <View style={styles.grid}>
          {perfilesBorroso.map((perfil) => (
            <View key={perfil.id} style={styles.cardBlur}>
              {/* Imagen con un desenfoque (blurRadius) muy alto */}
              <Image source={{uri: perfil.foto}} style={styles.imageBlur} blurRadius={40} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />
              
              <View style={styles.infoOverlay}>
                <View style={styles.agePill}>
                  <Text style={styles.ageText}>{perfil.edad}</Text>
                  {perfil.verificado && (
                    <Ionicons name="checkmark-circle" size={14} color="#3b82f6" style={{marginLeft: 4}} />
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* BOTÓN FLOTANTE ESTILO TINDER */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.discoverButton} onPress={intentarDescubrir} activeOpacity={0.9}>
          <Text style={styles.discoverButtonText}>Descubre a quién le gustas</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#f8fafc' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  container: { flex: 1, paddingHorizontal: 16 },
  subtitle: { fontSize: 15, color: '#4b5563', textAlign: 'center', marginBottom: 24, paddingHorizontal: 10, lineHeight: 22 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardBlur: { width: '48%', aspectRatio: 3/4, borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#e5e7eb' },
  imageBlur: { width: '100%', height: '100%', resizeMode: 'cover' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  
  infoOverlay: { position: 'absolute', bottom: 12, left: 12 },
  agePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ageText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  floatingButtonContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 24, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 },
  discoverButton: { backgroundColor: '#111827', width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.2)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}) },
  discoverButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});