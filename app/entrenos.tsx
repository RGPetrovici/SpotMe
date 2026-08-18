import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EntrenosScreen() {
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState('Pendientes');

  const TABS = ['Pendientes', 'Próximos', 'Historial'];

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* CABECERA */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View>
          <Text style={styles.headerTitle}>CompiFit</Text>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.pageTitle}>Mis entrenos</Text>

        {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={styles.tabItem} 
              onPress={() => setTabActiva(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, tabActiva === tab && styles.tabTextActive]}>{tab}</Text>
              {/* Raya inferior degradada si el tab está activo */}
              {tabActiva === tab && (
                <LinearGradient 
                  colors={['#e11d48', '#9333ea']} 
                  style={styles.tabIndicator} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENIDO CONDICIONAL: ESTADO VACÍO */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={40} color="#e11d48" />
          </View>
          
          <Text style={styles.emptyStateTitle}>Sin propuestas {tabActiva.toLowerCase()}</Text>
          <Text style={styles.emptyStateSubtitle}>
            Cuando alguien te proponga entrenar o te invite a un partido, aparecerá aquí
          </Text>
        </View>
      </View>


      {/* BARRA DE NAVEGACIÓN (4 ICONOS) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
          <Ionicons name="person-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}>
          <Ionicons name="people-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}>
          <Ionicons name="chatbubble-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          {/* Calendario activo */}
          <Ionicons name="calendar" size={24} color="#e11d48" />
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  
  header: { backgroundColor: '#ffffff', paddingVertical: 16, alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  logoText: { color: '#9333ea', fontWeight: 'bold', fontSize: 12 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },

  container: { flex: 1, backgroundColor: '#f8fafc' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#ffffff' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingHorizontal: 12 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 14, position: 'relative' },
  tabText: { fontSize: 15, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#111827', fontWeight: 'bold' },
  tabIndicator: { position: 'absolute', bottom: -1, left: '20%', right: '20%', height: 3, borderRadius: 3 },

  emptyStateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 80 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fce7f3', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyStateTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  emptyStateSubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  floatingButton: { position: 'absolute', bottom: 90, right: 20, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(147, 51, 234, 0.4)' }, default: { shadowColor: '#9333ea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }}) },
  sparkleGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  navItem: { alignItems: 'center', padding: 8, flex: 1 },
});