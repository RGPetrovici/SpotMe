import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. IMPORTAMOS NUESTRA BASE DE DATOS (EL CEREBRO)
import { USUARIOS } from '../constants/mocks';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

// 2. INYECTAMOS LA INTELIGENCIA:
// Filtramos solo a los usuarios "libres" (estadoMatch: 'none') y adaptamos 
// sus datos del mock al formato visual que requiere tu tarjeta de diseño.
const PERFILES = USUARIOS.filter(u => u.estadoMatch === 'none').map(u => {
  // Extraemos el emoji de la etiqueta que guardamos en mocks.ts
  const etiquetaEmoji = u.etiquetaHoy.split(' ')[0];
  const etiquetaTexto = u.etiquetaHoy.split(' ').slice(1).join(' ');

  return {
    id: u.id,
    nombre: u.nombre,
    edad: u.edad,
    gym: u.gym,
    zona: "Madrid", // Dato general para rellenar el diseño
    etiquetas: [
      { id: '1', icon: etiquetaEmoji, title: etiquetaTexto }
    ],
    bio: u.bio,
    horario: u.horario,
    foto: u.fotos[0],
    // Rellenamos con fotos extra genéricas si en la DB solo tienen 1, para no dejar la vista vacía
    fotosExtra: u.fotos.length > 1 ? u.fotos.slice(1) : [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop'
    ],
    // Asignamos iconos automáticos según el deporte que hagan
    deportes: u.disciplinas.map((d, index) => ({ 
      nombre: d, 
      icon: d.toLowerCase() === 'crossfit' ? 'weight-lifter' : (d.toLowerCase() === 'calistenia' ? 'gymnastics' : 'dumbbell') 
    })),
    hasFireAura: u.esGymBroOficial || false,
    hasGoldenCheck: u.esGymBroOficial || false,
    endorsements: u.esGymBroOficial ? ['Puntual ⏱️', 'Motivador 🗣️'] : []
  };
});

export default function FeedScreen() {
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardHeight, setCardHeight] = useState(500); 
  
  const scrollViewRef = useRef<ScrollView>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const isExpandedRef = useRef(isExpanded);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  const toggleExpand = () => {
    if (isExpanded) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => setIsExpanded(false), 300);
    } else {
      setIsExpanded(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 180, animated: true });
      }, 50);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !isExpandedRef.current && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
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

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete());
  };

  const resetPosition = () => {
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  };

  const onSwipeComplete = () => {
    setIsExpanded(false);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev + 1);
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    });
    return { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] };
  };

  if (currentIndex >= PERFILES.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View>
            <Text style={styles.headerTitle}>CompiFit</Text>
          </View>
        </View>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyEmoji}>😢</Text>
          <Text style={styles.emptyTitle}>¡Vaya! No hay más perfiles</Text>
          <Text style={styles.emptySub}>Prueba a cambiar tus filtros o aumenta la distancia para ver a más gente en tu zona.</Text>
          <TouchableOpacity style={styles.reloadBtn} onPress={() => setCurrentIndex(0)}>
            <Text style={styles.reloadBtnText}>Volver a ver perfiles</Text>
          </TouchableOpacity>
        </View>
        
        {/* BARRA INFERIOR EN EL EMPTY STATE PARA NO QUEDARNOS ATRAPADOS */}
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

  const PERFIL_ACTUAL = PERFILES[currentIndex];

  const CardWrapper = ({ children }: any) => {
    if (PERFIL_ACTUAL.hasFireAura) {
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
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View>
          <Text style={styles.headerTitle}>CompiFit</Text>
        </View>
      </View>

      <View style={styles.mainContainer}>
        
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
                        
                        {PERFIL_ACTUAL.hasGoldenCheck && (
                          <View style={styles.goldenCheck}>
                            <MaterialCommunityIcons name="dumbbell" size={14} color="#ffffff" />
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.expandButton, isExpanded && { backgroundColor: '#374151' }]} 
                        onPress={toggleExpand}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#ffffff" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.tagsContainer}>
                      {PERFIL_ACTUAL.etiquetas.map((tag) => (
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
                  
                  {PERFIL_ACTUAL.endorsements.length > 0 && (
                    <View style={styles.endorsementsSection}>
                      <Text style={styles.sectionTitle}>Reconocimientos de la comunidad</Text>
                      <View style={styles.endorsementsList}>
                        {PERFIL_ACTUAL.endorsements.map((end, idx) => (
                          <View key={idx} style={styles.endorsementPill}>
                            <Text style={styles.endorsementText}>{end}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.divider} />
                    </View>
                  )}
                  
                  <Text style={styles.sectionTitle}>Más fotos</Text>
                  <View style={styles.photosGrid}>
                    {PERFIL_ACTUAL.fotosExtra.map((foto, idx) => (
                      <Image key={idx} source={{ uri: foto }} style={styles.extraPhoto} />
                    ))}
                  </View>

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
                    {PERFIL_ACTUAL.deportes.map((deporte, index) => (
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
      </View>

      {/* BARRA DE NAVEGACIÓN INFERIOR OFICIAL (4 BOTONES) */}
      <View style={styles.bottomNav}>
        {/* Botón 1: Perfil */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
          <Ionicons name="person-outline" size={26} color="#6b7280" />
        </TouchableOpacity>

        {/* Botón 2: Explorar (Feed) */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}>
          <MaterialCommunityIcons name="cards-outline" size={28} color="#E11D48" /> {/* ACTIVO */}
        </TouchableOpacity>
        
        {/* Botón 3: Chats & Agenda */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}>
          <Ionicons name="chatbubbles-outline" size={26} color="#6b7280" />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#ffffff', paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  logoText: { color: '#9333ea', fontWeight: 'bold', fontSize: 12 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  
  mainContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  animatedWrapper: { flex: 1, zIndex: 10 },
  
  fireAuraBorder: { flex: 1, padding: 3, borderRadius: 27, ...Platform.select({ web: { boxShadow: '0px 0px 20px rgba(225, 29, 72, 0.5)' }, default: { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 10 }}) },
  
  card: { flex: 1, backgroundColor: '#111827', borderRadius: 24, overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 }}) },
  cardInnerFuego: { borderRadius: 24 },

  profileImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  infoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, zIndex: 10 },
  
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  nameText: { color: '#ffffff', fontSize: 32, fontWeight: '900', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
  
  goldenCheck: { backgroundColor: '#f59e0b', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginBottom: 6, borderWidth: 1, borderColor: '#fbbf24', ...Platform.select({ web: { boxShadow: '0px 0px 8px rgba(245, 158, 11, 0.5)' }, default: { shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 5 }}) },
  
  expandButton: { backgroundColor: '#E11D48', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagPill: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  tagPillText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  
  locationPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#E11D48', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  locationText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },

  detailsContainer: { backgroundColor: '#111827', padding: 24, paddingBottom: 60, minHeight: 400 },
  sectionTitle: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  
  endorsementsSection: { marginBottom: 10 },
  endorsementsList: { flexDirection: 'row', flexWrap: 'wrap' },
  endorsementPill: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  endorsementText: { color: '#34d399', fontWeight: 'bold', fontSize: 13 },

  photosGrid: { flexDirection: 'row', justifyContent: 'flex-start', gap: 10, marginBottom: 32 },
  extraPhoto: { width: '23%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#374151' },
  
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
  
  bottomNav: { backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  navItem: { alignItems: 'center', padding: 8, position: 'relative' },
  navBadge: { position: 'absolute', top: 6, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#ffffff' },

  emptyStateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  reloadBtn: { backgroundColor: '#111827', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
  reloadBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});