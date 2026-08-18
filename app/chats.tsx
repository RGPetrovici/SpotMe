import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. IMPORTAMOS NUESTRA BASE DE DATOS SIMULADA
import { CHATS_ACTIVOS, USUARIOS } from '../constants/mocks';

export default function ChatsScreen() {
  const router = useRouter();
  
  // Interruptor para cambiar entre Chats y Agenda de Entrenos
  const [activeTab, setActiveTab] = useState<'chats' | 'agenda'>('chats');

  // ==============================================
  // 🧠 LÓGICA INTELIGENTE LEYENDO DE MOCKS.TS
  // ==============================================

  // 1. Likes ocultos (Gente que nos dio like)
  const likesPendientes = USUARIOS.filter(u => u.estadoMatch === 'liked_me').length;

  // 2. Nuevos Matches (Match mutuo pero CERO mensajes aún)
  const nuevosMatches = USUARIOS.filter(u => 
    u.estadoMatch === 'matched' && 
    !CHATS_ACTIVOS.some(chat => chat.usuarioId === u.id)
  );

  // 3. Lista de Chats Activos (Cruzamos los CHATS con los datos del USUARIO)
  const misChats = CHATS_ACTIVOS.map(chat => {
    const usuario = USUARIOS.find(u => u.id === chat.usuarioId);
    const ultimoMsg = chat.mensajes[chat.mensajes.length - 1];
    
    // Mantenemos tus badges visuales de prueba para el diseño:
    let tipoBadge = undefined;
    if (usuario?.esGymBroOficial) tipoBadge = 'gymbro';
    else if (usuario?.nombre === 'Elena') tipoBadge = 'supercompi'; // Mantenemos el rayito
    else if (usuario?.nombre === 'Marcos') tipoBadge = 'fantasma';  // Mantenemos la alerta fantasma

    return { 
      id: chat.id, 
      usuarioId: usuario?.id,
      nombre: usuario?.nombre || 'Desconocido', 
      ultimoMensaje: ultimoMsg?.esMio ? `Tú: ${ultimoMsg.texto}` : ultimoMsg?.texto, 
      foto: usuario?.fotos[0] || '', 
      tipo: tipoBadge, 
      hora: ultimoMsg?.hora || '', 
      noLeidos: chat.mensajesSinLeer 
    };
  });

  // MOCK DATA: Agenda de Entrenos (La dejamos igual para no romper tu diseño)
  const agenda = [
    { id: 'e1', dia: 'Hoy', hora: '18:00', compi: 'Carlos', gym: 'VivaGym Arganzuela', estado: 'pendiente', isReady: true },
    { id: 'e2', dia: 'Mañana', hora: '10:30', compi: 'Laura', gym: 'McFit Centro', estado: 'pendiente', isReady: false },
  ];

  // Calculamos si hay notificaciones en general
  const notificacionesTotales = misChats.reduce((acc, chat) => acc + chat.noLeidos, 0) + nuevosMatches.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* CABECERA Y SWITCH DE PESTAÑAS */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conexiones</Text>
        
        {/* Toggle Chats / Agenda */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'chats' && styles.tabButtonActive]}
            onPress={() => setActiveTab('chats')}
          >
            <Text style={[styles.tabText, activeTab === 'chats' && styles.tabTextActive]}>Mensajes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'agenda' && styles.tabButtonActive]}
            onPress={() => setActiveTab('agenda')}
          >
            <Text style={[styles.tabText, activeTab === 'agenda' && styles.tabTextActive]}>Agenda (1)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* ============================================== */}
        {/* VISTA DE CHATS */}
        {/* ============================================== */}
        {activeTab === 'chats' && (
          <>
            {/* FILA HORIZONTAL DE MATCHES Y LIKES */}
            <Text style={styles.sectionTitle}>Nuevos compis</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesScroll}>
              
              {/* BOTÓN TRAMPA: A quién le gustas (Difuminado) */}
              <TouchableOpacity style={styles.matchItem} onPress={() => router.push('/likes')} activeOpacity={0.8}>
                <View style={styles.likesBlurContainer}>
                  <Image source={{uri: 'https://images.unsplash.com/photo-1583569704084-3990dd346761?q=80&w=150&auto=format&fit=crop'}} style={styles.likesBlurImage} blurRadius={15} />
                  <View style={styles.likesOverlay}>
                    <Ionicons name="heart" size={24} color="#ffffff" />
                    <Text style={styles.likesCount}>{likesPendientes > 0 ? likesPendientes : ''}</Text>
                  </View>
                </View>
                <Text style={styles.matchNameText}>Likes</Text>
              </TouchableOpacity>

              {/* Matches reales que vienen de mocks.ts */}
              {nuevosMatches.map(match => (
                <TouchableOpacity 
                  key={match.id} 
                  style={styles.matchItem} 
                  activeOpacity={0.8}
                  // Redirigimos al chat pasándole el ID del usuario
                  onPress={() => router.push(`/chat-room?userId=${match.id}`)}
                >
                  <Image source={{uri: match.fotos[0]}} style={styles.matchImage} />
                  <View style={styles.newBadge} />
                  <Text style={styles.matchNameText}>{match.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            {/* LISTA DE MENSAJES */}
            <Text style={styles.sectionTitle}>Mensajes</Text>
            
            {misChats.map(chat => (
              <TouchableOpacity 
                key={chat.id} 
                style={styles.chatRow} 
                activeOpacity={0.7}
                // Redirigimos al chat pasándole el ID de la conversación
                onPress={() => router.push(`/chat-room?chatId=${chat.id}`)}
              >
                <Image source={{uri: chat.foto}} style={styles.chatAvatar} />
                
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={[styles.chatName, chat.noLeidos > 0 && styles.chatNameUnread]}>{chat.nombre}</Text>
                      
                      {/* BADGE GYM BRO (Estatus máximo) */}
                      {chat.tipo === 'gymbro' && (
                        <View style={styles.badgeGymBro}>
                          <Text style={styles.badgeGymBroText}>🤝 Gym Bro</Text>
                        </View>
                      )}
                      {/* BADGE SUPER-COMPI (Pagado con tokens) */}
                      {chat.tipo === 'supercompi' && (
                        <View style={styles.badgeSuperCompi}>
                          <MaterialCommunityIcons name="lightning-bolt" size={12} color="#ffffff" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.chatTime, chat.noLeidos > 0 && styles.chatTimeUnread]}>{chat.hora}</Text>
                  </View>
                  
                  <Text style={[styles.chatMessage, chat.noLeidos > 0 && styles.chatMessageUnread]} numberOfLines={1}>
                    {chat.ultimoMensaje}
                  </Text>

                  {/* ⚠️ ALERTA PRIVADA ANTI-FANTASMAS (SOLO LO VES TÚ) */}
                  {chat.tipo === 'fantasma' && (
                    <View style={styles.ghostAlert}>
                      <Ionicons name="warning" size={12} color="#d97706" style={{marginRight: 4}} />
                      <Text style={styles.ghostAlertText}>La comunidad reporta que suele llegar tarde.</Text>
                    </View>
                  )}
                </View>

                {chat.noLeidos > 0 && (
                  <View style={styles.unreadDot}>
                    <Text style={styles.unreadDotText}>{chat.noLeidos}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ============================================== */}
        {/* VISTA DE AGENDA / ENTRENOS */}
        {/* ============================================== */}
        {activeTab === 'agenda' && (
          <View style={styles.agendaContainer}>
            
            <View style={styles.agendaAlert}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.agendaAlertText}>Queda en persona y valida el entreno aquí para ganar <Text style={{fontWeight: 'bold'}}>+2 💧 Tokens de Sudor</Text>.</Text>
            </View>

            {agenda.map(entreno => (
              <View key={entreno.id} style={styles.entrenoCard}>
                <View style={styles.entrenoHeader}>
                  <View style={styles.entrenoDateBadge}>
                    <Text style={styles.entrenoDateText}>{entreno.dia}</Text>
                    <Text style={styles.entrenoTimeText}>{entreno.hora}</Text>
                  </View>
                  <View style={styles.entrenoInfo}>
                    <Text style={styles.entrenoTitle}>Entreno con {entreno.compi}</Text>
                    <Text style={styles.entrenoLocation}>📍 {entreno.gym}</Text>
                  </View>
                </View>
                
                {/* BOTÓN DE VALIDACIÓN DE QUEDADA */}
                <TouchableOpacity 
                  style={[styles.validateBtn, !entreno.isReady && styles.validateBtnDisabled]} 
                  activeOpacity={0.8}
                  onPress={() => { if(entreno.isReady) router.push('/review') }}
                  disabled={!entreno.isReady}
                >
                  <Text style={[styles.validateBtnText, !entreno.isReady && styles.validateBtnTextDisabled]}>
                    {entreno.isReady ? 'Validar Entreno' : `Disponible a las ${entreno.hora}`}
                  </Text>
                </TouchableOpacity>
                
              </View>
            ))}

            <TouchableOpacity style={styles.historyBtn}>
              <Text style={styles.historyBtnText}>Ver historial de entrenos pasados</Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>

      {/* BARRA DE NAVEGACIÓN INFERIOR OFICIAL (4 BOTONES) */}
      <View style={styles.bottomNav}>
        {/* Botón 1: Perfil */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
          <Ionicons name="person-outline" size={26} color="#6b7280" />
        </TouchableOpacity>

        {/* Botón 2: Explorar (Feed) */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}>
          <MaterialCommunityIcons name="cards-outline" size={28} color="#6b7280" />
        </TouchableOpacity>
        
        {/* Botón 3: Chats & Agenda */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}>
          <Ionicons name="chatbubbles" size={26} color="#111827" /> {/* ACTIVO */}
          {notificacionesTotales > 0 && <View style={styles.navBadge} />} 
        </TouchableOpacity>

        {/* Botón 4: Tienda y Retos */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/store')}>
          <MaterialCommunityIcons name="lightning-bolt" size={28} color="#6b7280" /> 
        </TouchableOpacity>
        
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

// ========= ESTILOS INTACTOS DE TU CÓDIGO ORIGINAL =========
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5, marginBottom: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabButtonActive: { backgroundColor: '#ffffff', ...Platform.select({ web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}) },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#6b7280' },
  tabTextActive: { color: '#111827' },
  container: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginLeft: 16, marginTop: 24, marginBottom: 12, letterSpacing: 0.5 },
  matchesScroll: { paddingHorizontal: 16, paddingBottom: 8 },
  matchItem: { alignItems: 'center', marginRight: 16, width: 72 },
  matchImage: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: '#E11D48' },
  newBadge: { position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#ffffff' },
  matchNameText: { fontSize: 13, fontWeight: '600', color: '#4b5563', marginTop: 8 },
  likesBlurContainer: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', borderWidth: 2, borderColor: '#d946ef', alignItems: 'center', justifyContent: 'center' },
  likesBlurImage: { width: '100%', height: '100%', position: 'absolute' },
  likesOverlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%' },
  likesCount: { color: '#ffffff', fontWeight: '900', fontSize: 14, marginTop: 2 },
  divider: { height: 8, backgroundColor: '#f8fafc', marginTop: 16 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  chatAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f1f5f9' },
  chatInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  chatName: { fontSize: 16, fontWeight: '600', color: '#4b5563' },
  chatNameUnread: { fontWeight: 'bold', color: '#111827' },
  chatTime: { fontSize: 12, color: '#9ca3af' },
  chatTimeUnread: { color: '#E11D48', fontWeight: 'bold' },
  chatMessage: { fontSize: 14, color: '#9ca3af', paddingRight: 20 },
  chatMessageUnread: { color: '#111827', fontWeight: '500' },
  unreadDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  unreadDotText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  badgeGymBro: { backgroundColor: '#fdf2f8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 8, borderWidth: 1, borderColor: '#fbcfe8' },
  badgeGymBroText: { color: '#db2777', fontSize: 10, fontWeight: 'bold' },
  badgeSuperCompi: { backgroundColor: '#f59e0b', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  ghostAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' },
  ghostAlertText: { color: '#b45309', fontSize: 11, fontWeight: '600' },
  agendaContainer: { padding: 16 },
  agendaAlert: { flexDirection: 'row', backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
  agendaAlertText: { flex: 1, color: '#1d4ed8', fontSize: 14, lineHeight: 20, marginLeft: 12 },
  entrenoCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}) },
  entrenoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  entrenoDateBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: 'center', marginRight: 16 },
  entrenoDateText: { color: '#6b7280', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  entrenoTimeText: { color: '#111827', fontSize: 18, fontWeight: '900' },
  entrenoInfo: { flex: 1 },
  entrenoTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  entrenoLocation: { fontSize: 14, color: '#6b7280' },
  validateBtn: { flexDirection: 'row', backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  validateBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  validateBtnDisabled: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e5e7eb' },
  validateBtnTextDisabled: { color: '#9ca3af', fontWeight: '600' },
  historyBtn: { paddingVertical: 16, alignItems: 'center' },
  historyBtnText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  bottomNav: { backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  navItem: { alignItems: 'center', padding: 8, position: 'relative' },
  navBadge: { position: 'absolute', top: 6, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#ffffff' },
});