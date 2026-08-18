import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();

  // ESTADOS EDITABLES
  const [bio, setBio] = useState('"Si no duele, no vale. Busco a alguien que me aguante el ritmo los días de pierna 💀"');
  const [prSentadilla, setPrSentadilla] = useState('90');
  const [prBanca, setPrBanca] = useState('45');
  const [prHipThrust, setPrHipThrust] = useState('140');
  
  // NUEVOS ESTADOS
  const [disciplinas, setDisciplinas] = useState<string[]>(['Hipertrofia']);
  const [preferencia, setPreferencia] = useState('Mixto');
  const [ig, setIg] = useState('');
  const [tiktok, setTiktok] = useState('');
  
  const FOTOS_MOCK = [
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
    null,
    null 
  ];

  const TODAS_DISCIPLINAS = ['Hipertrofia', 'CrossFit', 'Calistenia', 'Powerlifting', 'Halterofilia', 'Funcional'];

  const toggleDisciplina = (disc: string) => {
    if (disciplinas.includes(disc)) {
      setDisciplinas(disciplinas.filter(d => d !== disc));
    } else {
      setDisciplinas([...disciplinas, disc]);
    }
  };

  const simularSubidaFoto = () => Alert.alert("Galería", "Aquí se abriría la galería de tu móvil.");
  const guardarCambios = () => {
    Alert.alert("¡Guardado!", "Tu perfil se ha actualizado correctamente.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER DE EDICIÓN */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={guardarCambios} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* BOTÓN ESTRELLA: VISTA PREVIA */}
          <TouchableOpacity style={styles.previewBtn} activeOpacity={0.9} onPress={() => Alert.alert("Vista Previa", "Aquí se abriría tu tarjeta a pantalla completa.")}>
            <LinearGradient colors={['#E11D48', '#d946ef']} style={styles.previewGradient} start={{x:0, y:0}} end={{x:1, y:0}} />
            <Ionicons name="eye" size={20} color="#ffffff" style={{marginRight: 8}} />
            <Text style={styles.previewBtnText}>Ver cómo me ven los demás</Text>
          </TouchableOpacity>

          {/* ============================================== */}
          {/* 📸 SECCIÓN FOTOS */}
          {/* ============================================== */}
          <Text style={styles.sectionTitle}>TUS FOTOS</Text>
          <View style={styles.photosGrid}>
            <TouchableOpacity style={styles.photoMain} onPress={simularSubidaFoto} activeOpacity={0.8}>
              <Image source={{uri: FOTOS_MOCK[0]!}} style={styles.photoImgMain} />
              <View style={styles.editIconBadge}><Ionicons name="pencil" size={14} color="#ffffff" /></View>
            </TouchableOpacity>
            
            <View style={styles.photosSubGrid}>
              {[1, 2, 3].map((index) => (
                <TouchableOpacity key={index} style={styles.photoSub} onPress={simularSubidaFoto} activeOpacity={0.8}>
                  {FOTOS_MOCK[index] ? (
                    <>
                      <Image source={{uri: FOTOS_MOCK[index]!}} style={styles.photoImgSub} />
                      <View style={styles.editIconBadgeSmall}><Ionicons name="close" size={12} color="#ffffff" /></View>
                    </>
                  ) : (
                    <Ionicons name="add" size={24} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ============================================== */}
          {/* ✍️ SECCIÓN BIO */}
          {/* ============================================== */}
          <Text style={styles.sectionTitle}>SOBRE TI</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.bioInput}
              multiline
              value={bio}
              onChangeText={setBio}
              placeholder="Escribe algo sobre ti, tu rutina o tu objetivo..."
              placeholderTextColor="#9ca3af"
            />
            <Ionicons name="pencil" size={16} color="#9ca3af" style={styles.inputIconAbsolute} />
          </View>

          {/* ============================================== */}
          {/* 📍 SECCIÓN DÓNDE Y CUÁNDO */}
          {/* ============================================== */}
          <Text style={styles.sectionTitle}>UBICACIÓN Y RUTINA</Text>
          <View style={styles.listContainer}>
            <TouchableOpacity style={styles.ajusteRow} activeOpacity={0.7} onPress={() => Alert.alert("Cambiar Gym", "Buscador de zonas.")}>
              <Ionicons name="location" size={20} color="#E11D48" style={{marginRight: 12}} />
              <View style={{flex: 1}}>
                <Text style={styles.ajusteTitulo}>Gimnasio y Zona</Text>
                <Text style={styles.ajusteValor}>VivaGym Arganzuela</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.ajusteRow} activeOpacity={0.7} onPress={() => Alert.alert("Cambiar Horario", "Selector de horario.")}>
              <Ionicons name="time" size={20} color="#E11D48" style={{marginRight: 12}} />
              <View style={{flex: 1}}>
                <Text style={styles.ajusteTitulo}>Horario habitual</Text>
                <Text style={styles.ajusteValor}>Tardes (18:00 - 20:00)</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.ajusteRow} activeOpacity={0.7} onPress={() => Alert.alert("Etiqueta", "Elige qué buscas hoy.")}>
              <Ionicons name="pricetag" size={20} color="#E11D48" style={{marginRight: 12}} />
              <View style={{flex: 1}}>
                <Text style={styles.ajusteTitulo}>Buscando...</Text>
                <Text style={styles.ajusteValor}>🏋️ Spotter y Técnica</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          </View>

          {/* ============================================== */}
          {/* 🏋️ NUEVO: DISCIPLINAS Y PREFERENCIAS */}
          {/* ============================================== */}
          
          <Text style={styles.sectionTitle}>TUS DISCIPLINAS</Text>
          <View style={styles.pillsGrid}>
            {TODAS_DISCIPLINAS.map((disc) => {
              const isActive = disciplinas.includes(disc);
              return (
                <TouchableOpacity 
                  key={disc} 
                  style={[styles.pill, isActive && styles.pillActive]} 
                  onPress={() => toggleDisciplina(disc)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{disc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>A QUIÉN BUSCAS (FILTRO)</Text>
          <View style={styles.pillsGrid}>
            {['Gymbros 🦍', 'Gymsis 👯‍♀️', 'Mixto 🤝'].map((pref) => {
              const isActive = preferencia === pref;
              return (
                <TouchableOpacity 
                  key={pref} 
                  style={[styles.pill, isActive && styles.pillActive]} 
                  onPress={() => setPreferencia(pref)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{pref}</Text>
                </TouchableOpacity>
              );
            })}
          </View>


          {/* ============================================== */}
          {/* 🦍 SECCIÓN PRs */}
          {/* ============================================== */}
          <View style={styles.titleRowPrs}>
            <Text style={styles.sectionTitleNoMargin}>TUS MARCAS (MÁX. 3)</Text>
            <TouchableOpacity onPress={() => Alert.alert("Elegir", "Menú para cambiar ejercicios.")}>
              <Text style={styles.btnElegirPrs}>⚙️ Elegir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.prsGrid}>
            <View style={styles.prBoxEditable}>
              <Text style={styles.prLabelEditable}>Sentadilla</Text>
              <View style={styles.prInputRow}>
                <TextInput style={styles.prInput} value={prSentadilla} onChangeText={setPrSentadilla} keyboardType="numeric" maxLength={3} />
                <Text style={styles.prUnit}>kg</Text>
              </View>
            </View>
            <View style={styles.prBoxEditable}>
              <Text style={styles.prLabelEditable}>Banca</Text>
              <View style={styles.prInputRow}>
                <TextInput style={styles.prInput} value={prBanca} onChangeText={setPrBanca} keyboardType="numeric" maxLength={3} />
                <Text style={styles.prUnit}>kg</Text>
              </View>
            </View>
            <View style={styles.prBoxEditable}>
              <Text style={styles.prLabelEditable}>Hip Thrust</Text>
              <View style={styles.prInputRow}>
                <TextInput style={styles.prInput} value={prHipThrust} onChangeText={setPrHipThrust} keyboardType="numeric" maxLength={3} />
                <Text style={styles.prUnit}>kg</Text>
              </View>
            </View>
          </View>

          {/* ============================================== */}
          {/* 📱 NUEVO: REDES SOCIALES */}
          {/* ============================================== */}
          <Text style={styles.sectionTitle}>TUS REDES SOCIALES (OPCIONAL)</Text>
          <View style={styles.socialContainer}>
            <View style={styles.socialInputRow}>
              <View style={styles.socialIconBox}>
                <Ionicons name="logo-instagram" size={22} color="#E11D48" />
              </View>
              <TextInput style={styles.socialInput} value={ig} onChangeText={setIg} placeholder="@tu_instagram" placeholderTextColor="#9ca3af" autoCapitalize="none" />
            </View>
            
            <View style={styles.socialInputRow}>
              <View style={styles.socialIconBox}>
                <Ionicons name="logo-tiktok" size={22} color="#111827" />
              </View>
              <TextInput style={styles.socialInput} value={tiktok} onChangeText={setTiktok} placeholder="@tu_tiktok" placeholderTextColor="#9ca3af" autoCapitalize="none" />
            </View>
          </View>

          <View style={{height: 80}} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fdf2f8', borderRadius: 12 },
  saveButtonText: { color: '#E11D48', fontWeight: 'bold', fontSize: 14 },
  
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, marginBottom: 32, overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(225, 29, 72, 0.3)' }, default: { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}) },
  previewGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  previewBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' },
  
  photosGrid: { gap: 12, marginBottom: 32 },
  photoMain: { width: '100%', height: 250, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', overflow: 'hidden', position: 'relative' },
  photoImgMain: { width: '100%', height: '100%', objectFit: 'cover' },
  editIconBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#111827', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' },
  
  photosSubGrid: { flexDirection: 'row', gap: 12 },
  photoSub: { flex: 1, aspectRatio: 1, backgroundColor: '#f1f5f9', borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  photoImgSub: { width: '100%', height: '100%', objectFit: 'cover' },
  editIconBadgeSmall: { position: 'absolute', bottom: 4, right: 4, backgroundColor: '#E11D48', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#ffffff' },

  inputContainer: { position: 'relative', marginBottom: 32 },
  bioInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, paddingTop: 16, fontSize: 15, color: '#111827', minHeight: 100, textAlignVertical: 'top', lineHeight: 22, ...Platform.select({ web: { outlineStyle: 'none' } as any, default: {} }) },
  inputIconAbsolute: { position: 'absolute', top: 12, right: 12 },

  listContainer: { backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 16, marginBottom: 32, borderWidth: 1, borderColor: '#e5e7eb' },
  ajusteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  ajusteTitulo: { fontSize: 11, color: '#9ca3af', fontWeight: 'bold', marginBottom: 2 },
  ajusteValor: { fontSize: 15, color: '#111827', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f5f9' },

  // PILDORAS (Disciplinas y Preferencias)
  pillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  pillActive: { backgroundColor: '#fdf2f8', borderColor: '#E11D48' },
  pillText: { color: '#6b7280', fontSize: 13, fontWeight: 'bold' },
  pillTextActive: { color: '#E11D48', fontWeight: '900' },

  titleRowPrs: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  sectionTitleNoMargin: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' },
  btnElegirPrs: { fontSize: 13, fontWeight: 'bold', color: '#111827', backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  
  prsGrid: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  prBoxEditable: { flex: 1, backgroundColor: '#f8fafc', paddingVertical: 14, paddingHorizontal: 8, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  prLabelEditable: { color: '#6b7280', fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
  prInputRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  prInput: { fontSize: 24, fontWeight: '900', color: '#111827', minWidth: 40, textAlign: 'center', padding: 0, ...Platform.select({ web: { outlineStyle: 'none' } as any, default: {} }) },
  prUnit: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold', marginLeft: 2, marginBottom: 4 },

  // REDES SOCIALES
  socialContainer: { gap: 12, marginBottom: 32 },
  socialInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 12 },
  socialIconBox: { width: 36, alignItems: 'center', justifyContent: 'center' },
  socialInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#111827', ...Platform.select({ web: { outlineStyle: 'none' } as any, default: {} }) },
});