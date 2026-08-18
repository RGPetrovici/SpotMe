import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BuyTokensScreen() {
  const router = useRouter();
  
  // Saldo simulado
  const [tokens, setTokens] = useState(14);

  const verAnuncio = () => {
    Alert.alert("Viendo anuncio...", "Imagina un anuncio de 15s. ¡Has ganado 1 Token de Sudor! 💧");
    setTokens(prev => prev + 1);
  };

  const comprarPack = (cantidad: number, precio: string) => {
    Alert.alert(
      "Confirmar compra", 
      `¿Quieres comprar ${cantidad} 💧 por ${precio}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Comprar", 
          onPress: () => {
            setTokens(prev => prev + cantidad);
            Alert.alert("¡Pago completado!", "Tus gotas se han añadido al saldo.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recargar Sudor</Text>
        <View style={{width: 28}} /> {/* Espaciador */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* RESUMEN DE SALDO ACTUAL */}
        <View style={styles.balanceHero}>
          <Text style={styles.balanceHeroLabel}>TU SALDO ACTUAL</Text>
          <View style={styles.balanceHeroRow}>
            <Text style={styles.balanceHeroIcon}>💧</Text>
            <Text style={styles.balanceHeroNumber}>{tokens}</Text>
          </View>
        </View>

        {/* OPCIÓN 1: GRATIS (ANUNCIO) */}
        <Text style={styles.sectionLabel}>CONSEGUIR GRATIS</Text>
        <TouchableOpacity style={styles.earnCard} onPress={verAnuncio} activeOpacity={0.8}>
          <LinearGradient colors={['rgba(16, 185, 129, 0.1)', 'transparent']} style={styles.earnGradient} />
          <View style={styles.earnIconBox}>
            <Ionicons name="play-circle" size={28} color="#10b981" />
          </View>
          <View style={styles.earnInfo}>
            <Text style={styles.earnTitle}>Ver un anuncio (15s)</Text>
            <Text style={styles.earnDesc}>Apoya a los desarrolladores.</Text>
          </View>
          <View style={styles.earnReward}>
            <Text style={styles.earnRewardText}>+1 💧</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* OPCIÓN 2: COMPRAR PACKS */}
        <Text style={styles.sectionLabel}>COMPRAR GOTAS</Text>
        
        {/* PACK 1 */}
        <TouchableOpacity style={styles.packCard} onPress={() => comprarPack(15, '1,99 €')} activeOpacity={0.8}>
          <View style={styles.packIconBox}>
            <Text style={styles.packIcon}>🔋</Text>
          </View>
          <View style={styles.packInfo}>
            <Text style={styles.packTitle}>Pack Pre-Entreno</Text>
            <Text style={styles.packAmount}>15 Gotas</Text>
          </View>
          <View style={styles.packPriceBtn}>
            <Text style={styles.packPriceText}>1,99 €</Text>
          </View>
        </TouchableOpacity>

        {/* PACK 2 (MÁS POPULAR - Destacado) */}
        <TouchableOpacity style={[styles.packCard, styles.packCardPopular]} onPress={() => comprarPack(50, '4,99 €')} activeOpacity={0.9}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>⭐ MÁS POPULAR</Text>
          </View>
          <View style={[styles.packIconBox, { backgroundColor: '#fdf2f8' }]}>
            <Text style={styles.packIcon}>🔥</Text>
          </View>
          <View style={styles.packInfo}>
            <Text style={styles.packTitle}>Pack Creatina</Text>
            <Text style={styles.packAmount}>50 Gotas</Text>
          </View>
          <View style={[styles.packPriceBtn, { backgroundColor: '#E11D48' }]}>
            <Text style={[styles.packPriceText, { color: '#ffffff' }]}>4,99 €</Text>
          </View>
        </TouchableOpacity>

        {/* PACK 3 */}
        <TouchableOpacity style={styles.packCard} onPress={() => comprarPack(150, '9,99 €')} activeOpacity={0.8}>
          <View style={styles.packIconBox}>
            <Text style={styles.packIcon}>💪</Text>
          </View>
          <View style={styles.packInfo}>
            <Text style={styles.packTitle}>Pack Proteína</Text>
            <Text style={styles.packAmount}>150 Gotas</Text>
          </View>
          <View style={styles.packPriceBtn}>
            <Text style={styles.packPriceText}>9,99 €</Text>
          </View>
        </TouchableOpacity>

        {/* PACK 4 (MEJOR VALOR - Grande) */}
        <TouchableOpacity style={styles.packCardMega} onPress={() => comprarPack(400, '19,99 €')} activeOpacity={0.9}>
          <LinearGradient colors={['#111827', '#374151']} style={styles.megaGradient} />
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>🏆 MEJOR PRECIO / GOTA</Text>
          </View>
          <View style={styles.packIconBoxMega}>
            <Text style={styles.packIconMega}>👑</Text>
          </View>
          <View style={styles.packInfo}>
            <Text style={[styles.packTitle, {color: '#ffffff'}]}>Pack Mr. Olympia</Text>
            <Text style={[styles.packAmount, {color: '#9ca3af'}]}>400 Gotas</Text>
          </View>
          <View style={[styles.packPriceBtn, { backgroundColor: '#ffffff' }]}>
            <Text style={[styles.packPriceText, { color: '#111827' }]}>19,99 €</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Las compras se cargarán a tu cuenta de App Store / Google Play. Las gotas no caducan.
        </Text>

        <View style={{height: 60}} />
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  container: { flex: 1, paddingHorizontal: 16 },
  
  balanceHero: { alignItems: 'center', paddingVertical: 32, marginBottom: 8 },
  balanceHeroLabel: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', letterSpacing: 1, marginBottom: 8 },
  balanceHeroRow: { flexDirection: 'row', alignItems: 'center' },
  balanceHeroIcon: { fontSize: 48, marginRight: 8 },
  balanceHeroNumber: { fontSize: 64, fontWeight: '900', color: '#111827', letterSpacing: -2 },

  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },

  earnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#d1fae5', overflow: 'hidden' },
  earnGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  earnIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  earnInfo: { flex: 1 },
  earnTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  earnDesc: { fontSize: 13, color: '#6b7280' },
  earnReward: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  earnRewardText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 24 },

  packCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', ...Platform.select({ web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.03)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}) },
  packCardPopular: { borderColor: '#fbcfe8', borderWidth: 2, marginTop: 12, ...Platform.select({ web: { boxShadow: '0px 8px 16px rgba(225,29,72,0.1)' }, default: { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}) },
  
  popularBadge: { position: 'absolute', top: -12, left: 16, backgroundColor: '#E11D48', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  popularBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  
  packIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  packIcon: { fontSize: 24 },
  
  packInfo: { flex: 1 },
  packTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  packAmount: { fontSize: 16, color: '#0ea5e9', fontWeight: '900' },
  
  packPriceBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  packPriceText: { color: '#111827', fontWeight: 'bold', fontSize: 15 },

  packCardMega: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginTop: 12, marginBottom: 24, overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0px 8px 24px rgba(17,24,39,0.2)' }, default: { shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}) },
  megaGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  
  bestValueBadge: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#f59e0b', paddingVertical: 4, alignItems: 'center' },
  bestValueText: { color: '#ffffff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  packIconBoxMega: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16, marginTop: 12 },
  packIconMega: { fontSize: 24 },

  disclaimerText: { textAlign: 'center', color: '#9ca3af', fontSize: 12, lineHeight: 18, paddingHorizontal: 20 },
});