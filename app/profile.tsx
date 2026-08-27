import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { supabase } from '../supabase';

export default function ProfileScreen() {
  const router = useRouter();

  const [perfilReal, setPerfilReal] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  const [hayNotificaciones, setHayNotificaciones] = useState(false);

  useEffect(() => {
    async function cargarMiPerfil() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single(); 

          if (error) throw error;
          if (data) setPerfilReal(data);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarMiPerfil();
  }, []);

  useEffect(() => {
    async function comprobarNotificaciones() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('receptor_id', user.id)
        .eq('leido', false);

      if (count && count > 0) {
        setHayNotificaciones(true);
      }
    }
    comprobarNotificaciones();
  }, []);

  // 🔥 NUEVA FUNCIÓN: Menú de ajustes y Cerrar Sesión
  const abrirAjustes = () => {
    Alert.alert(
      "Ajustes de cuenta",
      "¿Qué deseas hacer?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar sesión", 
          style: "destructive", // Lo pone en rojo en iOS
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
              // Te mandamos a la pantalla inicial (Login/Registro)
              router.replace('/'); 
            } else {
              Alert.alert("Error", "No se pudo cerrar la sesión.");
            }
          } 
        }
      ]
    );
  };

  const GAMIFICACION = {
    tokens: 14,
    rachaSemanas: 3,
    gymBros: [
      { id: '1', nombre: 'Marcos', foto: 'https://images.unsplash.com/photo-1583569704084-3990dd346761?q=80&w=150&auto=format&fit=crop' },
    ]
  };

  const REPUTACION = ['Puntual ⏱️', 'Máquina de spottear 🛡️', 'Buena vibra 🤙'];

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        {/* 🔥 ACTUALIZADO: Botón de la tuerca conectado a la función abrirAjustes */}
        <TouchableOpacity style={styles.iconButton} onPress={abrirAjustes}>
          <Ionicons name="settings-outline" size={26} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topProfileSection}>
          {cargando ? (
            <View style={{height: 120, justifyContent: 'center'}}>
              <ActivityIndicator size="large" color="#E11D48" />
            </View>
          ) : (
            <>
              <Image 
                source={{ uri: perfilReal?.fotos?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' }} 
                style={styles.avatarLarge} 
              />
              <Text style={styles.nameText}>{perfilReal?.nombre || 'Compi'}</Text>
            </>
          )}

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Perfil al 75%</Text>
              <Text style={styles.progressAction}>Completar</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `75%` }]} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/edit-profile')} 
          >
            <Ionicons name="pencil" size={16} color="#111827" style={{marginRight: 8}} />
            <Text style={styles.editBtnText}>Editar Perfil y Preferencias</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitleMain}>ESTADO Y REPUTACIÓN</Text>
        
        <View style={styles.reputationCard}>
          <Text style={styles.reputationTitle}>Cómo te ve la comunidad</Text>
          <Text style={styles.reputationSub}>Estas etiquetas te las han dado otros usuarios tras entrenar contigo.</Text>
          
          <View style={styles.reputationGrid}>
            {REPUTACION.map((tag, idx) => (
              <View key={idx} style={styles.reputationPill}>
                <Text style={styles.reputationPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIconBox}>
              <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.statusLabel}>Estado de la cuenta</Text>
              <Text style={styles.statusValue}>Excelente</Text>
            </View>
          </View>
          <Text style={styles.statusDesc}>No tienes reportes de la comunidad ni has dejado tirado a nadie.</Text>
        </View>
        
        <Text style={styles.sectionTitleMain}>TU RED SPOTME</Text>

        <View style={styles.brosCard}>
          <View style={styles.brosHeader}>
            <Text style={styles.brosTitle}>Gym Bros Oficiales</Text>
            <Text style={styles.brosCount}>{GAMIFICACION.gymBros.length}/5</Text>
          </View>
          <Text style={styles.brosSub}>Llega a 5 quedadas con alguien para desbloquear su medalla.</Text>
          
          <View style={styles.brosContainer}>
            {GAMIFICACION.gymBros.map((bro) => (
              <View key={bro.id} style={styles.broBox}>
                <View style={styles.broAvatarContainer}>
                  <Image source={{uri: bro.foto}} style={styles.broAvatar} />
                  <View style={styles.broBadge}><Text style={{fontSize: 8}}>🤝</Text></View>
                </View>
                <Text style={styles.broName}>{bro.nombre}</Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.broBoxEmpty}>
              <View style={styles.broAvatarEmpty}>
                <Ionicons name="add" size={24} color="#9ca3af" />
              </View>
              <Text style={styles.broNameEmpty}>Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gamificationContainer}>
          
          <View style={styles.streakRow}>
            <View style={styles.streakIconBox}><Text style={{fontSize: 24}}>🔥</Text></View>
            <View style={{flex: 1, marginLeft: 16}}>
              <Text style={styles.streakTitle}>Racha Imparable</Text>
              <Text style={styles.streakValue}>{GAMIFICACION.rachaSemanas} Semanas</Text>
            </View>
          </View>

          <View style={styles.gamificationDivider} />

          <View style={styles.tokenRow}>
            <View style={{flex: 1}}>
              <Text style={styles.tokenTitle}>Saldo de Sudor</Text>
              <Text style={styles.tokenValue}>💧 {GAMIFICACION.tokens}</Text>
            </View>
            <TouchableOpacity style={styles.storeBtn} onPress={() => router.push('/store')} activeOpacity={0.8}>
              <Text style={styles.storeBtnText}>Ir a la Tienda</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={{height: 100}} /> 
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
          <Ionicons name="person" size={26} color="#E11D48" /> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}>
          <MaterialCommunityIcons name="cards-outline" size={28} color="#6b7280" /> 
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}>
         <View style={{position: 'relative'}}>
           <Ionicons name="chatbubbles-outline" size={26} color="#6b7280" />
           {hayNotificaciones && (
             <View style={{ position: 'absolute', top: -2, right: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#f1f5f9' }} />
            )}
         </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/store')}>
          <MaterialCommunityIcons name="lightning-bolt" size={28} color="#6b7280" /> 
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  iconButton: { padding: 4 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  topProfileSection: { alignItems: 'center', marginBottom: 32 },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#ffffff', marginBottom: 12, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}) },
  nameText: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 16 },
  progressContainer: { width: '85%', marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  progressText: { fontSize: 13, fontWeight: 'bold', color: '#4b5563' },
  progressAction: { fontSize: 13, fontWeight: 'bold', color: '#E11D48' },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#E11D48', borderRadius: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#e5e7eb', ...Platform.select({ web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}) },
  editBtnText: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  sectionTitleMain: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' },
  reputationCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  reputationTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  reputationSub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  reputationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reputationPill: { backgroundColor: '#fdf2f8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#fbcfe8' },
  reputationPillText: { color: '#db2777', fontSize: 13, fontWeight: 'bold' },
  statusCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#f1f5f9' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: 12, color: '#6b7280', fontWeight: 'bold', marginBottom: 2 },
  statusValue: { fontSize: 16, fontWeight: '900', color: '#10b981' },
  statusDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  brosCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  brosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  brosTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  brosCount: { fontSize: 14, fontWeight: 'bold', color: '#9ca3af' },
  brosSub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  brosContainer: { flexDirection: 'row', gap: 16 },
  broBox: { alignItems: 'center' },
  broAvatarContainer: { position: 'relative', marginBottom: 8 },
  broAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#E11D48' },
  broBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#ffffff', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  broName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  broBoxEmpty: { alignItems: 'center', opacity: 0.6 },
  broAvatarEmpty: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  broNameEmpty: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  gamificationContainer: { backgroundColor: '#111827', borderRadius: 24, padding: 20, marginBottom: 24 },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(245, 158, 11, 0.2)', alignItems: 'center', justifyContent: 'center' },
  streakTitle: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
  streakValue: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  gamificationDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tokenTitle: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  tokenValue: { color: '#ffffff', fontSize: 24, fontWeight: '900' },
  storeBtn: { backgroundColor: '#E11D48', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  storeBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  bottomNav: { backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  navItem: { alignItems: 'center', padding: 8, position: 'relative' },
});