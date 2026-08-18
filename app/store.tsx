import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StoreScreen() {
  const router = useRouter();

  // ESTADOS
  const [tokens, setTokens] = useState(25); // 25 de inicio para el tutorial
  const [pasoActual, setPasoActual] = useState(1); // Ahora va del 1 al 5
  const [verTodosPasos, setVerTodosPasos] = useState(false);

  // LISTA DEL TUTORIAL (El Camino del Novato - 5 Pasos rápidos)
  const APRENDIZAJE = [
    { id: 1, titulo: "Perfil de Acero", desc: "Añade al menos 3 fotos a tu perfil." },
    { id: 2, titulo: "El Radar", desc: "Dale 'Like' a 3 perfiles en la pestaña Explorar." },
    { id: 3, titulo: "Tu Primera Compra", desc: "Usa tus gotas para comprar un 'Rewind' en tus ventajas." },
    { id: 4, titulo: "Rompe el Hielo", desc: "Consigue tu primer Match mutuo." },
    { id: 5, titulo: "Cazador de Gotas", desc: "Mira un anuncio para finalizar el tutorial (arriba)." },
  ];

  // MISIONES EXTRA (Se muestran en carrusel)
  const MISIONES_EXTRA = [
    { titulo: "Perfil 100%", desc: "Completa todos tus datos.", recompensa: 10 },
    { titulo: "Valora la app", desc: "Déjanos 5 estrellas.", recompensa: 15 },
    { titulo: "La Trinchera", desc: "Valida tu primer entreno presencial.", recompensa: 20 },
    { titulo: "Tus Marcas", desc: "Añade tus PRs de fuerza.", recompensa: 5 },
    { titulo: "Redes Sociales", desc: "Vincula tu IG o TikTok.", recompensa: 5 },
    { titulo: "Constancia", desc: "Abre la app 3 días seguidos.", recompensa: 8 },
    { titulo: "Leyenda Local", desc: "Recibe tu primera reseña positiva.", recompensa: 15 },
  ];

  const totalPasos = APRENDIZAJE.length;
  const isAprendizajeCompletado = pasoActual > totalPasos;

  const reclamarRecompensa = (cantidad: number, nombre: string) => {
    setTokens(prev => prev + cantidad);
    Alert.alert("¡Genial!", `Has completado: ${nombre}. Ganas +${cantidad} 💧.`);
    if (pasoActual <= totalPasos) setPasoActual(prev => prev + 1); 
  };

  const comprarBeneficio = (nombre: string, coste: number) => {
    if (tokens >= coste) {
      setTokens(prev => prev - coste);
      Alert.alert("¡Éxito!", `Beneficio activado. Has gastado ${coste} 💧.`);
      if (pasoActual === 3) setPasoActual(4); // Avanza si está en el paso de comprar
    } else {
      Alert.alert("Saldo Insuficiente", "No tienes suficientes Tokens de Sudor.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Retos</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>💧 {tokens}</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* ============================================== */}
        {/* 1. ANUNCIO DIARIO FIJO ARRIBA */}
        {/* ============================================== */}
        <View style={styles.adCard}>
          <View style={styles.adIconBox}><Ionicons name="play" size={24} color="#10b981" /></View>
          <View style={styles.adInfo}>
            <Text style={styles.adTitle}>Ver un anuncio (15s)</Text>
            <Text style={styles.adDesc}>Apoya la app y llévate saldo rápido.</Text>
          </View>
          <TouchableOpacity style={styles.adBtn} onPress={() => {
            setTokens(prev => prev + 4);
            Alert.alert("¡Gracias!", "Has ganado +4 💧");
            if (pasoActual === 5) setPasoActual(6); // Si es el último paso, se gradúa
          }}>
            <Text style={styles.adBtnText}>+4 💧</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================== */}
        {/* 2. PRIMEROS PASOS (TUTORIAL) */}
        {/* ============================================== */}
        <View style={styles.sectionHeader}>
          <Ionicons name="school" size={20} color="#3b82f6" />
          <Text style={styles.sectionTitle}>PRIMEROS PASOS</Text>
        </View>
        
        <View style={styles.learningContainer}>
          <View style={styles.learningHeader}>
            <Text style={styles.learningProgressText}>Paso {Math.min(pasoActual, totalPasos)} de {totalPasos}</Text>
            <View style={styles.learningRewardBadge}><Text style={styles.learningRewardText}>🎁 +20 💧 al acabar</Text></View>
          </View>
          
          {/* BARRA DE PROGRESO CORREGIDA */}
          <View style={styles.progressRow}>
             <View style={[styles.progressBarFill, {width: `${(Math.min(pasoActual-1, totalPasos)) * (100 / totalPasos)}%`}]} />
          </View>

          {!isAprendizajeCompletado ? (
            <View style={styles.activeMissionCard}>
              <Text style={styles.activeMissionLabel}>TU MISIÓN ACTUAL</Text>
              <Text style={styles.activeMissionTitle}>{APRENDIZAJE[pasoActual-1].titulo}</Text>
              <Text style={styles.activeMissionDesc}>{APRENDIZAJE[pasoActual-1].desc}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => reclamarRecompensa(2, APRENDIZAJE[pasoActual-1].titulo)}>
                <Text style={styles.actionBtnText}>Hacerlo ahora</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{marginLeft: 4}} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.graduatedCard}>
              <Text style={{fontSize: 32, marginBottom: 8}}>🎓</Text>
              <Text style={styles.graduatedTitle}>¡Tutorial Completado!</Text>
              <Text style={styles.graduatedDesc}>Ya tienes acceso a los retos avanzados y misiones extra.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.expandBtn} onPress={() => setVerTodosPasos(!verTodosPasos)}>
            <Text style={styles.expandBtnText}>{verTodosPasos ? "Ocultar ruta" : "Ver todos los pasos"}</Text>
            <Ionicons name={verTodosPasos ? "chevron-up" : "chevron-down"} size={16} color="#6b7280" />
          </TouchableOpacity>

          {/* LISTA DESPLEGABLE DE PASOS */}
          {verTodosPasos && (
            <View style={styles.stepsList}>
              {APRENDIZAJE.map((paso) => {
                const isCompleted = paso.id < pasoActual;
                const isCurrent = paso.id === pasoActual;
                return (
                  <View key={paso.id} style={[styles.stepItem, isCompleted && styles.stepCompleted]}>
                    <View style={[styles.stepDot, isCompleted ? styles.dotCompleted : (isCurrent ? styles.dotCurrent : styles.dotLocked)]}>
                      {isCompleted ? <Ionicons name="checkmark" size={12} color="#ffffff" /> : <Text style={styles.dotText}>{paso.id}</Text>}
                    </View>
                    <Text style={[styles.stepTitle, isCompleted && styles.stepTitleCompleted, isCurrent && styles.stepTitleCurrent]}>{paso.titulo}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ============================================== */}
        {/* 3. MISIONES EXTRA (CARRUSEL HORIZONTAL) */}
        {/* ============================================== */}
        <View style={[styles.sectionHeader, {marginTop: 24}, !isAprendizajeCompletado && {opacity: 0.5}]}>
          <Ionicons name="star" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>MISIONES EXTRA</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={[styles.extrasScroll, !isAprendizajeCompletado && {opacity: 0.5}]} 
          contentContainerStyle={{paddingRight: 16}}
          pointerEvents={isAprendizajeCompletado ? "auto" : "none"} // Bloquea los toques si no ha acabado
        >
          {MISIONES_EXTRA.map((extra, index) => (
            <View key={index} style={styles.extraCard}>
              <Text style={styles.extraTitle}>{extra.titulo}</Text>
              <Text style={styles.extraDesc}>{extra.desc}</Text>
              <TouchableOpacity style={styles.extraBtn} onPress={() => reclamarRecompensa(extra.recompensa, extra.titulo)}>
                <Text style={styles.extraBtnText}>+{extra.recompensa} 💧</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* ============================================== */}
        {/* 4. RETOS AVANZADOS (SEMANAL Y MENSUAL) */}
        {/* ============================================== */}
        <View style={[styles.sectionHeader, {marginTop: 16}]}>
          <Ionicons name="flame" size={20} color="#E11D48" />
          <Text style={styles.sectionTitle}>RETOS AVANZADOS</Text>
        </View>

        <View style={[styles.darkMissionCard, !isAprendizajeCompletado && styles.cardLocked]}>
          <View style={styles.darkMissionInfo}>
            <Text style={styles.darkMissionSubtitle}>MISIÓN DE LA SEMANA</Text>
            <Text style={styles.darkMissionTitle}>El Madrugador 🌅</Text>
            <Text style={styles.darkMissionStatus}>Valida 2 entrenos antes de las 9:00 AM.</Text>
            
            {!isAprendizajeCompletado && (
              <View style={styles.lockedWarningBox}>
                <Ionicons name="lock-closed" size={14} color="#f59e0b" />
                <Text style={styles.lockedWarningText}>Completa Primeros Pasos ({pasoActual-1}/{totalPasos})</Text>
              </View>
            )}
          </View>
          <View style={styles.darkMissionPill}><Text style={styles.darkMissionPillText}>+15 💧</Text></View>
        </View>

        <View style={[styles.darkMissionCard, !isAprendizajeCompletado && styles.cardLocked]}>
          <View style={styles.darkMissionInfo}>
            <Text style={styles.darkMissionSubtitle}>MISIÓN DEL MES</Text>
            <Text style={styles.darkMissionTitle}>El Mentor de Acero 🧠</Text>
            <Text style={styles.darkMissionStatus}>Entrena con 3 novatos (etiqueta Gym Mentor).</Text>

            {!isAprendizajeCompletado && (
              <View style={styles.lockedWarningBox}>
                <Ionicons name="lock-closed" size={14} color="#f59e0b" />
                <Text style={styles.lockedWarningText}>Completa Primeros Pasos ({pasoActual-1}/{totalPasos})</Text>
              </View>
            )}
          </View>
          <View style={styles.darkMissionPill}><Text style={styles.darkMissionPillText}>+50 💧</Text></View>
        </View>

        {/* ============================================== */}
        {/* 5. GASTAR TOKENS (Tus Ventajas) */}
        {/* ============================================== */}
        <View style={[styles.sectionHeader, {marginTop: 24}]}>
          <Ionicons name="cart" size={20} color="#E11D48" />
          <Text style={styles.sectionTitle}>TUS VENTAJAS</Text>
        </View>
        <Text style={styles.sectionSub}>Gasta tu Sudor para destacar en la comunidad.</Text>

        <View style={styles.storeGrid}>
          
          <TouchableOpacity style={styles.storeItem} activeOpacity={0.8} onPress={() => comprarBeneficio("Rewind", 3)}>
            <View style={[styles.storeIconBox, { backgroundColor: '#fef3c7' }]}><Ionicons name="refresh" size={28} color="#d97706" /></View>
            <Text style={styles.storeTitle}>Rewind</Text>
            <Text style={styles.storeDesc}>Recupera un perfil que descartaste.</Text>
            <View style={styles.costBadge}><Text style={styles.costText}>3 💧</Text></View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.storeItem} activeOpacity={0.8} onPress={() => comprarBeneficio("Revelar Likes", 15)}>
            <View style={[styles.storeIconBox, { backgroundColor: '#fce7f3' }]}><Ionicons name="heart" size={28} color="#db2777" /></View>
            <Text style={styles.storeTitle}>Revelar Likes</Text>
            <Text style={styles.storeDesc}>Mira quién te dio "Like" primero.</Text>
            <View style={styles.costBadge}><Text style={styles.costText}>15 💧</Text></View>
          </TouchableOpacity>

        </View>

        {/* ============================================== */}
        {/* 6. COMPRAR MÁS (€) */}
        {/* ============================================== */}
        <View style={styles.dividerMain} />
        <Text style={styles.buyMoreTitle}>¿Necesitas un empujón?</Text>
        <View style={styles.buyContainer}>
          <TouchableOpacity style={styles.buyBtn}><Text style={styles.buyTokensText}>💧 50</Text><Text style={styles.buyPriceText}>4.99 €</Text></TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn}>
            <View style={styles.popularBadge}><Text style={styles.popularText}>POPULAR</Text></View>
            <Text style={styles.buyTokensText}>💧 150</Text><Text style={styles.buyPriceText}>9.99 €</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* BARRA DE NAVEGACIÓN INFERIOR OFICIAL */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}><Ionicons name="person-outline" size={26} color="#6b7280" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/feed')}><MaterialCommunityIcons name="cards-outline" size={28} color="#6b7280" /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chats')}>
          <Ionicons name="chatbubbles-outline" size={26} color="#6b7280" /><View style={styles.navBadge} /> 
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/store')}><MaterialCommunityIcons name="lightning-bolt" size={28} color="#E11D48" /></TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  balancePill: { backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  balanceText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  adCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#d1fae5', marginBottom: 24 },
  adIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  adInfo: { flex: 1 },
  adTitle: { fontSize: 15, fontWeight: 'bold', color: '#065f46', marginBottom: 2 },
  adDesc: { fontSize: 13, color: '#047857' },
  adBtn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  adBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, marginLeft: 8 },
  sectionSub: { fontSize: 13, color: '#6b7280', marginBottom: 16 },

  learningContainer: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  learningHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  learningProgressText: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  learningRewardBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  learningRewardText: { color: '#d97706', fontSize: 11, fontWeight: 'bold' },
  
  progressRow: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },

  activeMissionCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12 },
  activeMissionLabel: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 1, marginBottom: 4 },
  activeMissionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 6 },
  activeMissionDesc: { fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 10, borderRadius: 8 },
  actionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },

  graduatedCard: { alignItems: 'center', padding: 16, backgroundColor: '#ecfdf5', borderRadius: 12, marginBottom: 12 },
  graduatedTitle: { fontSize: 16, fontWeight: 'bold', color: '#065f46', marginBottom: 4 },
  graduatedDesc: { fontSize: 12, color: '#047857', textAlign: 'center' },

  expandBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  expandBtnText: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginRight: 4 },
  
  stepsList: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepCompleted: { opacity: 0.5 },
  stepDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dotLocked: { backgroundColor: '#f1f5f9' },
  dotCurrent: { backgroundColor: '#3b82f6' },
  dotCompleted: { backgroundColor: '#10b981' },
  dotText: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' },
  stepTitle: { fontSize: 13, color: '#6b7280' },
  stepTitleCurrent: { color: '#3b82f6', fontWeight: 'bold' },
  stepTitleCompleted: { textDecorationLine: 'line-through' },

  extrasScroll: { marginBottom: 16 },
  extraCard: { width: 140, backgroundColor: '#ffffff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 12 },
  extraTitle: { fontSize: 13, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  extraDesc: { fontSize: 11, color: '#6b7280', marginBottom: 12, flex: 1 },
  extraBtn: { backgroundColor: '#fef3c7', paddingVertical: 6, alignItems: 'center', borderRadius: 8 },
  extraBtnText: { color: '#d97706', fontSize: 12, fontWeight: 'bold' },

  darkMissionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', padding: 20, borderRadius: 16, marginBottom: 12 },
  cardLocked: { opacity: 0.7 },
  darkMissionInfo: { flex: 1, paddingRight: 12 },
  darkMissionSubtitle: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1 },
  darkMissionTitle: { fontSize: 18, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
  darkMissionStatus: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  lockedWarningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start' },
  lockedWarningText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
  darkMissionPill: { backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  darkMissionPillText: { color: '#60a5fa', fontWeight: '900', fontSize: 14 },

  storeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 32 },
  storeItem: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  storeIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  storeTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  storeDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16, minHeight: 35 },
  costBadge: { backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  costText: { fontSize: 13, fontWeight: '900', color: '#3b82f6' },

  dividerMain: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 24 },
  buyMoreTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 16 },
  buyContainer: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  buyBtn: { flex: 1, backgroundColor: '#ffffff', padding: 20, borderRadius: 16, borderWidth: 2, borderColor: '#E11D48', alignItems: 'center', position: 'relative' },
  popularBadge: { position: 'absolute', top: -10, backgroundColor: '#E11D48', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  popularText: { color: '#ffffff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  buyTokensText: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 4 },
  buyPriceText: { fontSize: 14, color: '#6b7280', fontWeight: 'bold' },

  bottomNav: { backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  navItem: { alignItems: 'center', padding: 8, position: 'relative' },
  navBadge: { position: 'absolute', top: 6, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E11D48', borderWidth: 2, borderColor: '#ffffff' },
});