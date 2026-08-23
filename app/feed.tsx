import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Modal, PanResponder, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { supabase } from '../supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.10 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default function FeedScreen() {
  const router = useRouter();
  
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [miId, setMiId] = useState<string | null>(null); 
  const [miNombre, setMiNombre] = useState<string>('Yo');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardHeight, setCardHeight] = useState(500); 
  
  const [matchData, setMatchData] = useState<any>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const position = useRef(new Animated.ValueXY()).current;
  
  const isExpandedRef = useRef(isExpanded);
  const perfilesRef = useRef<any[]>([]);
  const currentIndexRef = useRef(0);

  useEffect(() => { isExpandedRef.current = isExpanded; }, [isExpanded]);
  useEffect(() => { perfilesRef.current = perfiles; }, [perfiles]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  useEffect(() => {
    async function cargarCompis() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setMiId(user.id);
          const { data: misDatos } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single();
          if (misDatos && misDatos.nombre) {
            setMiNombre(misDatos.nombre);
          }
        }

        // 🔥 NUEVO: BUSCAMOS A QUIÉN YA HEMOS DESLIZADO (LIKES Y DISLIKES)
        const { data: misInteracciones } = await supabase
          .from('likes')
          .select('usuario_destino')
          .eq('usuario_origen', user?.id);

        // Creamos una lista negra con sus IDs, y añadimos nuestro propio ID para no vernos a nosotros
        const idsIgnorados = misInteracciones ? misInteracciones.map(i => i.usuario_destino) : [];
        if (user) idsIgnorados.push(user.id);

        // Traemos a todos los usuarios
        const { data, error } = await supabase.from('perfiles').select('*');

        if (error) throw error;

        if (data) {
          // 🔥 NUEVO: FILTRAMOS A LA GENTE PARA ENSEÑAR SOLO A LOS QUE NO ESTÁN EN LA LISTA NEGRA
          const usuariosNuevos = data.filter(u => !idsIgnorados.includes(u.id));

          const perfilesMapeados = usuariosNuevos.map(u => {
            const preferencia = (u.etiquetas && u.etiquetas[0]) ? u.etiquetas[0] : 'Compi';
            const horarioReal = (u.etiquetas && u.etiquetas[1]) ? u.etiquetas[1] : 'Tardes';
            
            const deportesGuardados = (u.etiquetas && u.etiquetas.length > 2) ? u.etiquetas.slice(2) : [];
            const deportesMapeados = deportesGuardados.map((dep: string) => {
              let icono = 'dumbbell'; 
              if (dep === 'CrossFit') icono = 'kettlebell';
              if (dep === 'Calistenia') icono = 'human-handsup';
              if (dep === 'HIIT / Funcional') icono = 'lightning-bolt';
              return { nombre: dep, icon: icono };
            });

            if (deportesMapeados.length === 0) deportesMapeados.push({ nombre: 'Fitness general', icon: 'dumbbell' });

            return {
              id: u.id,
              nombre: u.nombre || 'Anónimo',
              edad: u.edad || '?',
              gym: u.gym || 'Gimnasio desconocido',
              zona: u.zona || 'Madrid',
              etiquetas: [{ id: '1', icon: '🔥', title: `Busca: ${preferencia}` }],
              bio: u.bio || '¡Hola! Busco compis para entrenar.',
              horario: horarioReal.toUpperCase(),
              foto: (u.fotos && u.fotos.length > 0 && u.fotos[0]) ? u.fotos[0] : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=300&auto=format&fit=crop',
              fotosExtra: (u.fotos && u.fotos.length > 1) ? u.fotos.slice(1) : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop'],
              deportes: deportesMapeados, 
              hasFireAura: false,
              hasGoldenCheck: false,
              endorsements: []
            };
          });

          setPerfiles(perfilesMapeados);
        }
      } catch (error) {
        console.error("Error cargando el feed:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarCompis();
  }, []);

  const toggleExpand = () => {
    if (isExpanded) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => setIsExpanded(false), 300);
    } else {
      setIsExpanded(true);
      setTimeout(() => { scrollViewRef.current?.scrollTo({ y: 180, animated: true }); }, 50);
    }
  };

  const forceSwipe = (direction: 'right' | 'left') => {
    setIsExpanded(false); 
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !isExpandedRef.current && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isExpandedRef.current) {
          position.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isExpandedRef.current) return;
        if (gestureState.dx > SWIPE_THRESHOLD) forceSwipe('right');
        else if (gestureState.dx < -SWIPE_THRESHOLD) forceSwipe('left');
        else resetPosition();
      }
    })
  ).current;

  const onSwipeComplete = async (direction: 'right' | 'left') => {
    position.setValue({ x: 0, y: 0 });
    const perfilDeslizado = perfilesRef.current[currentIndexRef.current];
    
    setCurrentIndex(prev => prev + 1);

    if (perfilDeslizado && miId) {
      try {
        const tipoSwipe = direction === 'right' ? 'like' : 'dislike';

        const { error } = await supabase
          .from('likes')
          .insert({
            usuario_origen: miId,
            usuario_destino: perfilDeslizado.id,
            tipo: tipoSwipe,
            nombre_origen: miNombre,          
            nombre_destino: perfilDeslizado.nombre 
          });

        if (!error && direction === 'right') {
          const { data: matchCheck } = await supabase
            .from('likes')
            .select('*')
            .eq('usuario_origen', perfilDeslizado.id)
            .eq('usuario_destino', miId)
            .eq('tipo', 'like')
            .single(); 

          if (matchCheck) {
            setMatchData(perfilDeslizado);
          }
        }
      } catch (err) {
        console.error("Error al gestionar el swipe:", err);
      }
    }
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    });
    return { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] };
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}><Text style={styles.logoText}>SM</Text></View>
            <Text style={styles.headerTitle}>SpotMe</Text>
          </View>
        </View>
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={{marginTop: 20, fontSize: 16, color: '#6b7280', fontWeight: 'bold'}}>Buscando compis cerca...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const PERFIL_ACTUAL = perfiles[currentIndex];

  const CardWrapper = ({ children }: any) => {
    if (PERFIL_ACTUAL && PERFIL_ACTUAL.hasFireAura) {
      return (
        <LinearGradient 
          colors={['#9333ea', '#E11D48', '#f59e0b']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.fireAuraBorder}
        >
          {children}
        </LinearGradient>
      );
    }
    return <>{children}</>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <Modal visible={matchData !== null} transparent animationType="slide">
        <View style={styles.matchOverlay}>
          <LinearGradient colors={['rgba(225,29,72,0.95)', 'rgba(76,29,149,0.95)']} style={styles.matchGradient}>
            <Text style={styles.matchTitle}>¡ES UN MATCH!</Text>
            <Text style={styles.matchSubtitle}>Tú y {matchData?.nombre} queréis entrenar juntos.</Text>
            
            <View style={styles.matchImagesContainer}>
              <Image source={{ uri: matchData?.foto }} style={styles.matchImage} />
            </View>

            <TouchableOpacity 
              style={styles.matchButtonPrimary} 
              activeOpacity={0.8}
              onPress={() => {
                setMatchData(null);
                // Viajamos directo al chat
                router.push({ pathname: '/elchat', params: { id: matchData?.id, nombre: matchData?.nombre } });
              }}
            >
              <Text style={styles.matchButtonPrimaryText}>Enviar mensaje</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.matchButtonSecondary} 
              activeOpacity={0.8}
              onPress={() => setMatchData(null)}
            >
              <Text style={styles.matchButtonSecondaryText}>Seguir deslizando</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>SM</Text></View>
          <Text style={styles.headerTitle}>SpotMe</Text>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {currentIndex >= perfiles.length ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyEmoji}>radar</Text>
            <Text style={styles.emptyTitle}>¡No hay nadie nuevo!</Text>
            <Text style={styles.emptySub}>Ya has interactuado con todos los compis en tu zona.</Text>
            <TouchableOpacity style={styles.reloadBtn} onPress={() => setCurrentIndex(0)}>
              <Text style={styles.reloadBtnText}>Volver a cargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Animated.View 
              style={[styles.animatedWrapper, getCardStyle()]} 
              {...panResponder.panHandlers}
              onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
            >
              <CardWrapper>
                <View style={[styles.card, PERFIL_ACTUAL.hasFireAura && styles.cardInnerFuego]}>
                  <ScrollView 
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    scrollEnabled={isExpanded}
                    contentContainerStyle={{ flexGrow: 1 }}
                  >
                    <View style={{ height: PERFIL_ACTUAL.hasFireAura ? cardHeight - 6 : cardHeight, position: 'relative' }}>
                      <Image source={{ uri: PERFIL_ACTUAL.foto }} style={styles.profileImage} />
                      <LinearGradient colors={['transparent', 'rgba(17, 24, 39, 0.95)']} style={styles.imageGradient} />

                      <View style={styles.infoOverlay}>
                        <View style={styles.nameRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                            <Text style={styles.nameText}>{PERFIL_ACTUAL.nombre}, {PERFIL_ACTUAL.edad}</Text>
                          </View>
                          
                          <TouchableOpacity style={[styles.expandButton, isExpanded && { backgroundColor: '#374151' }]} onPress={toggleExpand} activeOpacity={0.8}>
                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#ffffff" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.tagsContainer}>
                          {PERFIL_ACTUAL.etiquetas.map((tag: any) => (
                            <View key={tag.id} style={styles.tagPill}>
                              <Text style={styles.tagPillText}>{tag.icon} {tag.title}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.locationPill}>
                          <Ionicons name="location-outline" size={14} color="#ffffff" style={{marginRight: 4}} />
                          <Text style={styles.locationText}>{PERFIL_ACTUAL.gym} • {PERFIL_ACTUAL.zona}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailsContainer}>
                      <Text style={styles.sectionTitle}>Sobre mí</Text>
                      <Text style={styles.bioText}>{PERFIL_ACTUAL.bio}</Text>
                      <View style={styles.divider} />

                      <Text style={styles.sectionTitle}>Horario habitual</Text>
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#e11d48" style={styles.infoIcon} />
                        <Text style={styles.infoTextValue}>{PERFIL_ACTUAL.horario}</Text>
                      </View>
                      <View style={styles.divider} />

                      <Text style={styles.sectionTitle}>Disciplinas</Text>
                      <View style={styles.sportsList}>
                        {PERFIL_ACTUAL.deportes.map((deporte: any, index: any) => (
                          <View key={index} style={styles.sportItem}>
                            <MaterialCommunityIcons name={deporte.icon as any} size={18} color="#e11d48" />
                            <Text style={styles.sportText}>{deporte.nombre}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </CardWrapper>
            </Animated.View>

            {!isExpanded && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.dislikeButton} activeOpacity={0.7} onPress={() => forceSwipe('left')}>
                  <Text style={styles.emojiIcon}>👎</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.likeButton} activeOpacity={0.8} onPress={() => forceSwipe('right')}>
                  <LinearGradient colors={['#E11D48', '#4C1D95']} style={styles.likeGradient}>
                    <Text style={styles.emojiIconLarge}>💪</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}><Ionicons name="person-outline" size={26} color="#6b7280" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}><MaterialCommunityIcons name="cards-outline" size={28} color="#E11D48" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}><Ionicons name="chatbubbles-outline" size={26} color="#6b7280" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/store')}><MaterialCommunityIcons name="lightning-bolt" size={28} color="#6b7280" /></TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#ffffff', paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  logoText: { color: '#e11d48', fontWeight: 'bold', fontSize: 12 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  mainContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  animatedWrapper: { flex: 1, zIndex: 10 },
  fireAuraBorder: { flex: 1, padding: 3, borderRadius: 27 },
  card: { flex: 1, backgroundColor: '#111827', borderRadius: 24, overflow: 'hidden' },
  cardInnerFuego: { borderRadius: 24 },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  infoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, zIndex: 10 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  nameText: { color: '#ffffff', fontSize: 32, fontWeight: '900', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
  expandButton: { backgroundColor: '#E11D48', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagPill: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  tagPillText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  locationPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#E11D48', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  locationText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  detailsContainer: { backgroundColor: '#111827', padding: 24, paddingBottom: 60, minHeight: 400 },
  sectionTitle: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  bioText: { fontSize: 18, color: '#ffffff', fontStyle: 'italic', fontWeight: '500', lineHeight: 26, marginBottom: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { marginRight: 12 },
  infoTextValue: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  sportsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, 
  sportItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
  sportText: { fontSize: 15, color: '#ffffff', marginLeft: 6, fontWeight: '600' },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32, paddingTop: 16, paddingBottom: 8 },
  dislikeButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  emojiIcon: { fontSize: 24 },
  likeButton: { width: 80, height: 80, borderRadius: 40 },
  likeGradient: { flex: 1, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emojiIconLarge: { fontSize: 36 },
  bottomNav: { backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  navItem: { alignItems: 'center', padding: 8 },
  emptyStateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, color: '#9ca3af', marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  reloadBtn: { backgroundColor: '#111827', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
  reloadBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  matchOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  matchGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  matchTitle: { fontSize: 48, fontWeight: '900', color: '#ffffff', fontStyle: 'italic', marginBottom: 12, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10, textAlign: 'center' },
  matchSubtitle: { fontSize: 18, color: '#ffffff', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
  matchImagesContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  matchImage: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, borderColor: '#ffffff' },
  matchButtonPrimary: { backgroundColor: '#ffffff', width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  matchButtonPrimaryText: { color: '#E11D48', fontSize: 18, fontWeight: 'bold' },
  matchButtonSecondary: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', borderWidth: 2, borderColor: '#ffffff' },
  matchButtonSecondaryText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});