import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { supabase } from '../supabase';

export default function ChatsScreen() {
  const router = useRouter();
  
  const [cargando, setCargando] = useState(true);
  const [tabActual, setTabActual] = useState('Mensajes');
  
  const [matches, setMatches] = useState<any[]>([]);
  const [numeroLikesOcultos, setNumeroLikesOcultos] = useState(0);

  const cargarConexiones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: misLikes } = await supabase.from('likes').select('usuario_destino').eq('usuario_origen', user.id).eq('tipo', 'like');
      const { data: likesRecibidos } = await supabase.from('likes').select('usuario_origen').eq('usuario_destino', user.id).eq('tipo', 'like');

      if (misLikes && likesRecibidos) {
        const arrayMisLikes = misLikes.map(l => l.usuario_destino);
        const arrayLikesRecibidos = likesRecibidos.map(l => l.usuario_origen);

        const idsMatches = arrayLikesRecibidos.filter(id => arrayMisLikes.includes(id));
        const idsPendientes = arrayLikesRecibidos.filter(id => !arrayMisLikes.includes(id));
        
        setNumeroLikesOcultos(idsPendientes.length);

        if (idsMatches.length > 0) {
          const { data: perfilesMatch } = await supabase.from('perfiles').select('id, nombre, fotos').in('id', idsMatches);
          
          const { data: mensajesTodos } = await supabase
            .from('mensajes')
            .select('*')
            .or(`emisor_id.eq.${user.id},receptor_id.eq.${user.id}`)
            .order('creado_en', { ascending: false });

          if (perfilesMatch) {
            const matchesConChat = perfilesMatch.map(perfil => {
              const mensajesConEstePerfil = mensajesTodos?.filter(m => m.emisor_id === perfil.id || m.receptor_id === perfil.id) || [];
              const ultimoMensaje = mensajesConEstePerfil.length > 0 ? mensajesConEstePerfil[0] : null;
              
              const noLeidos = mensajesConEstePerfil.filter(m => m.emisor_id === perfil.id && m.leido === false).length;
              const esMatchNuevo = mensajesConEstePerfil.length === 0;
              
              let horaStr = 'Nuevo';
              let previewTexto = '¡Tienes un nuevo Match! Toca para saludar.';

              if (ultimoMensaje) {
                const dateObj = new Date(ultimoMensaje.creado_en);
                horaStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                
                if (ultimoMensaje.emisor_id === user.id) {
                  previewTexto = `Tú: ${ultimoMensaje.texto}`;
                } else {
                  previewTexto = ultimoMensaje.texto;
                }
              }

              // 🔥 AQUÍ ESTÁ LA MAGIA: Calculamos si debe mostrar punto/negrita
              const mostrarNotificacion = noLeidos > 0 || esMatchNuevo;

              return {
                ...perfil,
                ultimo_mensaje: previewTexto,
                hora_mensaje: horaStr,
                no_leidos: noLeidos,
                es_nuevo: esMatchNuevo,
                mostrar_notificacion: mostrarNotificacion
              };
            });

            setMatches(matchesConChat);
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar chats:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarConexiones();

    const canalPreview = supabase
      .channel('preview_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, () => {
        cargarConexiones();
      })
      .subscribe();

    return () => { supabase.removeChannel(canalPreview); };
  }, []);

  const hayNotificaciones = matches.some(match => match.mostrar_notificacion) || numeroLikesOcultos > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conexiones</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabBtn, tabActual === 'Mensajes' ? styles.tabBtnActive : null]} onPress={() => setTabActual('Mensajes')} activeOpacity={0.8}>
          <Text style={[styles.tabBtnText, tabActual === 'Mensajes' ? styles.tabBtnTextActive : null]}>Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tabActual === 'Agenda' ? styles.tabBtnActive : null]} onPress={() => setTabActual('Agenda')} activeOpacity={0.8}>
          <Text style={[styles.tabBtnText, tabActual === 'Agenda' ? styles.tabBtnTextActive : null]}>Agenda (0)</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E11D48" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {tabActual === 'Mensajes' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nuevos compis</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  <TouchableOpacity style={styles.matchItem} activeOpacity={0.8} onPress={() => router.push('/likes')}>
                    <View style={styles.likesCircle}>
                      <Ionicons name="heart" size={32} color="#ffffff" />
                      {numeroLikesOcultos > 0 ? (
                        <View style={styles.redDotCount}><Text style={styles.redDotText}>{numeroLikesOcultos}</Text></View>
                      ) : null}
                    </View>
                    <Text style={styles.matchName}>Likes</Text>
                  </TouchableOpacity>

                  {matches.map((match) => (
                    <TouchableOpacity 
                      key={`top-${match.id}`} 
                      style={styles.matchItem} 
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/elchat', params: { id: match.id, nombre: match.nombre } })}
                    >
                      <View style={styles.matchAvatarContainer}>
                        <Image source={{ uri: (match.fotos && match.fotos.length > 0) ? match.fotos[0] : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=100&auto=format&fit=crop' }} style={styles.matchAvatar} />
                        {match.mostrar_notificacion && <View style={styles.redDot} />}
                      </View>
                      <Text style={styles.matchName} numberOfLines={1}>{match.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mensajes</Text>
                {matches.length === 0 ? (
                  <Text style={styles.emptyStateTextList}>Aún no tienes mensajes. ¡Sigue deslizando para conocer compis!</Text>
                ) : (
                  matches.map((match) => (
                    <TouchableOpacity 
                      key={`list-${match.id}`} 
                      style={styles.chatRow} 
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/elchat', params: { id: match.id, nombre: match.nombre } })}
                    >
                      <View style={styles.chatAvatarPlaceholder}>
                        {(match.fotos && match.fotos.length > 0) ? (
                          <Image source={{ uri: match.fotos[0] }} style={{width: '100%', height: '100%', borderRadius: 28}} />
                        ) : (
                          <Text style={styles.chatAvatarText}>{match.nombre.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      
                      <View style={styles.chatInfo}>
                        <View style={styles.chatNameRow}>
                          <Text style={[styles.chatName, match.mostrar_notificacion && {fontWeight: '900'}]}>{match.nombre}</Text>
                          <Text style={[styles.chatTime, match.mostrar_notificacion ? {color: '#E11D48', fontWeight: 'bold'} : {color: '#9ca3af'}]}>
                            {match.hora_mensaje}
                          </Text>
                        </View>
                        <Text style={[styles.chatMessagePreview, match.mostrar_notificacion && {color: '#111827', fontWeight: 'bold'}]} numberOfLines={1}>
                          {match.ultimo_mensaje}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          )}

          {tabActual === 'Agenda' && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={64} color="#e5e7eb" />
              <Text style={styles.emptyStateText}>No tienes entrenos programados aún.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}><Ionicons name="person-outline" size={26} color="#6b7280" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}><MaterialCommunityIcons name="cards-outline" size={28} color="#6b7280" /></TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}>
          <View style={{position: 'relative'}}>
            <Ionicons name="chatbubbles" size={26} color="#E11D48" />
            {hayNotificaciones && <View style={styles.navRedDot} />}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/store')}><MaterialCommunityIcons name="lightning-bolt" size={28} color="#6b7280" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 10, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, backgroundColor: '#ffffff' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#f1f5f9' },
  tabBtnActive: { borderBottomColor: '#111827' },
  tabBtnText: { fontSize: 16, fontWeight: '600', color: '#9ca3af' },
  tabBtnTextActive: { color: '#111827' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, backgroundColor: '#ffffff' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', paddingHorizontal: 20, marginBottom: 16 },
  horizontalScroll: { paddingHorizontal: 20, paddingRight: 40, flexDirection: 'row' },
  matchItem: { alignItems: 'center', marginRight: 20, width: 72 },
  likesCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#f3f4f6' },
  redDotCount: { position: 'absolute', top: -5, right: -5, backgroundColor: '#E11D48', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', paddingHorizontal: 4 },
  redDotText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  matchAvatarContainer: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#E11D48', padding: 2, justifyContent: 'center', alignItems: 'center' },
  matchAvatar: { width: 60, height: 60, borderRadius: 30 },
  redDot: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#ffffff' },
  matchName: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 8, textAlign: 'center' },
  chatRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  chatAvatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  chatAvatarText: { fontSize: 24, fontWeight: 'bold', color: '#9ca3af' },
  chatInfo: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f8fafc', paddingBottom: 12 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 8 },
  chatTime: { fontSize: 12 },
  chatMessagePreview: { fontSize: 14, color: '#6b7280' },
  emptyStateContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { marginTop: 16, fontSize: 15, color: '#9ca3af', textAlign: 'center' },
  emptyStateTextList: { color: '#9ca3af', paddingHorizontal: 20, fontStyle: 'italic' },
  bottomNav: { backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  navItem: { alignItems: 'center', padding: 8, position: 'relative' },
  navRedDot: { position: 'absolute', top: -2, right: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#ffffff' }
});