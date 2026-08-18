import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MOCK_PHOTO = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop';
const MOCK_EXTRA = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop';

export default function Setup4Screen() {
  const router = useRouter();
  
  const [fotoPrincipal, setFotoPrincipal] = useState<string | null>(null);
  const [fotosExtra, setFotosExtra] = useState<(string | null)[]>([null, null, null, null]);
  const [bio, setBio] = useState('');
  const [cancion, setCancion] = useState(''); // NUEVO ESTADO PARA LA CANCIÓN

  const toggleFotoPrincipal = () => setFotoPrincipal(prev => prev ? null : MOCK_PHOTO);
  
  const toggleFotoExtra = (index: number) => {
    const nuevasFotos = [...fotosExtra];
    nuevasFotos[index] = nuevasFotos[index] ? null : MOCK_EXTRA;
    setFotosExtra(nuevasFotos);
  };

  const formCompleto = fotoPrincipal !== null;

  const finalizarRegistro = () => {
    if (!formCompleto) return;
    router.replace('/feed'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#e11d48" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View>
            <Text style={styles.headerTitle}>CompiFit</Text>
          </View>
          <View style={styles.placeholderSpace} /> 
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.titlesContainer}>
            <Text style={styles.mainTitle}>¡Ya casi!</Text>
            <Text style={styles.subtitle}>
              Sube tus mejores fotos entrenando para que tus compis de entreno te reconozcan.
              {"\n\n"}
              <Text style={styles.subtitleSmall}>
                (Los perfiles con foto de cara reciben muchas más conexiones 💪)
              </Text>
            </Text>
          </View>

          <Text style={styles.sectionLabel}>FOTO PRINCIPAL *</Text>
          <TouchableOpacity 
            style={[styles.mainPhotoContainer, !fotoPrincipal && styles.dashedBorder]} 
            onPress={toggleFotoPrincipal}
            activeOpacity={0.8}
          >
            {fotoPrincipal ? (
              <>
                <Image source={{ uri: fotoPrincipal }} style={styles.imageFull} />
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={16} color="#ffffff" />
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.addCircle}>
                  <Ionicons name="camera" size={32} color="#ffffff" />
                </View>
                <Text style={styles.emptyText}>Añadir portada</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>MÁS FOTOS (Opcional)</Text>
          <View style={styles.extraPhotosGrid}>
            {fotosExtra.map((foto, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.extraPhotoSlot, !foto && styles.dashedBorder]} 
                onPress={() => toggleFotoExtra(index)}
                activeOpacity={0.8}
              >
                {foto ? (
                  <>
                    <Image source={{ uri: foto }} style={styles.imageFull} />
                    <View style={styles.deleteBadge}>
                      <Ionicons name="close" size={12} color="#ffffff" />
                    </View>
                  </>
                ) : (
                  <Ionicons name="add" size={24} color="#9ca3af" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>TU FRASE (Opcional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInputMulti}
              placeholder="Ej: Si no duele, no vale..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={120}
              value={bio}
              onChangeText={setBio}
            />
            <Text style={styles.charCount}>{bio.length}/120</Text>
          </View>

          {/* NUEVA SECCIÓN: CANCIÓN DE PR */}
          <Text style={styles.sectionLabel}>TU CANCIÓN DE PR (Opcional)</Text>
          <View style={styles.singleInputContainer}>
            <Ionicons name="musical-notes" size={20} color="#1DB954" style={styles.inputIcon} />
            <TextInput
              style={styles.textInputSingle}
              placeholder="Enlaza tu canción de tirar pesado..."
              placeholderTextColor="#9ca3af"
              value={cancion}
              onChangeText={setCancion}
            />
          </View>

          <View style={styles.alertBox}>
            <Ionicons name="alert-circle-outline" size={24} color="#E11D48" style={styles.alertIcon} />
            <Text style={styles.alertText}>
              Tu foto ayuda a otros a sentirse <Text style={styles.alertTextBold}>cómodos al quedar para entrenar</Text>. Que se vea tu cara 😊
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, formCompleto ? styles.buttonActive : styles.buttonDisabled]} 
            disabled={!formCompleto} 
            onPress={finalizarRegistro}
          >
            <Text style={[styles.buttonText, formCompleto ? styles.buttonTextActive : styles.buttonTextDisabled]}>
              ¡A entrenar! 🚀
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  progressBarContainer: { height: 4, backgroundColor: '#e5e7eb', width: '100%' }, 
  progressBarFill: { height: '100%', width: '100%', backgroundColor: '#a855f7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  backButton: { padding: 8 }, 
  logoContainer: { flexDirection: 'row', alignItems: 'center' }, 
  logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 6 }, 
  logoText: { color: '#9333ea', fontWeight: 'bold', fontSize: 12 }, 
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }, 
  placeholderSpace: { width: 40 },
  container: { flex: 1 }, 
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  titlesContainer: { alignItems: 'center', marginBottom: 24 }, 
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  subtitleSmall: { fontSize: 13, color: '#9ca3af' }, 
  sectionLabel: { fontSize: 12, color: '#9ca3af', fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  mainPhotoContainer: { width: '100%', aspectRatio: 3/4, backgroundColor: '#f1f5f9', borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  extraPhotosGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  extraPhotoSlot: { width: '22%', aspectRatio: 1, backgroundColor: '#f1f5f9', borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  dashedBorder: { borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed' },
  imageFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  emptyState: { alignItems: 'center' },
  addCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 16, fontWeight: '600' },
  editBadge: { position: 'absolute', bottom: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17, 24, 39, 0.7)', alignItems: 'center', justifyContent: 'center' },
  deleteBadge: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(17, 24, 39, 0.7)', alignItems: 'center', justifyContent: 'center' },
  
  inputContainer: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, marginBottom: 24 },
  textInputMulti: { fontSize: 16, color: '#1f2937', minHeight: 80, textAlignVertical: 'top', ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#9ca3af', marginTop: 8 },
  
  singleInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  textInputSingle: { flex: 1, fontSize: 16, color: '#1f2937', ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
  
  alertBox: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, marginTop: 16, marginBottom: 24, alignItems: 'center' },
  alertIcon: { marginRight: 12 },
  alertText: { flex: 1, fontSize: 15, color: '#4b5563', lineHeight: 22 },
  alertTextBold: { fontWeight: 'bold', color: '#111827' },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' }, 
  buttonDisabled: { backgroundColor: '#e5e7eb' }, 
  buttonActive: { backgroundColor: '#111827' }, 
  buttonText: { fontSize: 18, fontWeight: 'bold' }, 
  buttonTextDisabled: { color: '#9ca3af' }, 
  buttonTextActive: { color: '#ffffff' },
});