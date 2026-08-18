import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ZONAS = ['Chamberí', 'Salamanca', 'Retiro', 'Aravaca', 'Chueca', 'La Latina', 'Tetuán', 'Puerta de Hierro', 'Arganzuela'];
const HORARIOS = [
  { id: 'manana', label: 'Mañana (6–12h)', icon: 'partly-sunny-outline' },
  { id: 'tarde', label: 'Tarde (12–18h)', icon: 'sunny-outline' },
  { id: 'noche', label: 'Noche (18–23h)', icon: 'moon-outline' },
];

const MOCK_GYMS = [
  { id: '1', nombre: 'VivaGym Arganzuela', direccion: 'Paseo de las Acacias 8' },
  { id: '2', nombre: 'VivaGym Chamartín', direccion: 'Calle Mateo Inurria 26' },
  { id: '3', nombre: 'Basic-Fit Delicias', direccion: 'Paseo de las Delicias 44' },
  { id: '4', nombre: 'McFit Ventas', direccion: 'Calle de Alcalá 234' }
];

// Arreglo de números para poder hacer cálculos de "Desde" y "Hasta"
const HORAS_NUMEROS = Array.from({ length: 18 }, (_, i) => i + 6); // De 6 a 23

export default function Setup3Screen() {
  const router = useRouter();
  
  const [ciudad, setCiudad] = useState('Madrid');
  const [modo, setModo] = useState<'gimnasio' | 'zona' | null>(null);
  const [gimnasio, setGimnasio] = useState('');
  const [mostrarResultadosGym, setMostrarResultadosGym] = useState(false);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  
  // Estados Horario
  const [horariosSeleccionados, setHorariosSeleccionados] = useState<string[]>([]);
  const [isHoraParticular, setIsHoraParticular] = useState(false);
  const [horaDesde, setHoraDesde] = useState('');
  const [horaHasta, setHoraHasta] = useState('');

  const toggleZona = (zona: string) => {
    setZonasSeleccionadas(prev => prev.includes(zona) ? prev.filter(z => z !== zona) : [...prev, zona]);
  };

  // LÓGICA DE EXCLUSIVIDAD: Si tocas un bloque genérico, se desactiva la hora particular
  const toggleHorario = (id: string) => {
    if (isHoraParticular) {
      setIsHoraParticular(false);
      setHoraDesde('');
      setHoraHasta('');
    }
    setHorariosSeleccionados(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  // LÓGICA DE EXCLUSIVIDAD: Si tocas hora particular, se borran los bloques genéricos
  const toggleParticular = () => {
    const newState = !isHoraParticular;
    setIsHoraParticular(newState);
    if (newState) {
      setHorariosSeleccionados([]); // Borramos mañana, tarde o noche si estaban marcados
    } else {
      setHoraDesde('');
      setHoraHasta('');
    }
  };

  // Manejo inteligente del cambio de hora
  const handleChangeDesde = (valor: string) => {
    setHoraDesde(valor);
    // Si la hora de salida actual es anterior o igual a la nueva hora de entrada, la borramos por coherencia
    if (horaHasta && parseInt(valor) >= parseInt(horaHasta)) {
      setHoraHasta('');
    }
  };

  const gymsFiltrados = MOCK_GYMS.filter(gym => gym.nombre.toLowerCase().includes(gimnasio.toLowerCase()));

  const seleccionarGym = (nombre: string) => {
    setGimnasio(nombre);
    setMostrarResultadosGym(false);
  };

  const ubicacionValida = modo === 'gimnasio' ? gimnasio.trim() !== '' : (modo === 'zona' ? zonasSeleccionadas.length > 0 : false);
  const horaParticularValida = isHoraParticular ? (horaDesde !== '' && horaHasta !== '') : false;
  const horarioValido = horariosSeleccionados.length > 0 || horaParticularValida;
  const formCompleto = ciudad !== '' && ubicacionValida && horarioValido;

  function finalizarOnboarding() {
    if (!formCompleto) return;
    router.push('/setup5'); 
  }

  // Calculamos las horas que se pueden mostrar en el desplegable "Hasta"
  // Solo mostramos horas mayores que la que se ha elegido en "Desde"
  const horasHastaDisponibles = horaDesde ? HORAS_NUMEROS.filter(h => h > parseInt(horaDesde)) : HORAS_NUMEROS;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.progressBarContainer}><View style={styles.progressBarFill} /></View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#e11d48" /></TouchableOpacity>
        <View style={styles.logoContainer}><View style={styles.logoCircle}><Text style={styles.logoText}>CF</Text></View><Text style={styles.headerTitle}>CompiFit</Text></View>
        <View style={styles.placeholderSpace} /> 
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titlesContainer}><Text style={styles.mainTitle}>¿Dónde y cuándo entrenas?</Text></View>

        <Text style={styles.sectionLabel}>TU CIUDAD</Text>
        <TouchableOpacity style={styles.cityButton} activeOpacity={0.7}>
          <Ionicons name="location-outline" size={20} color="#e11d48" style={styles.iconMargin} />
          <Text style={styles.cityText}>{ciudad}</Text>
        </TouchableOpacity>

        <View style={styles.modeContainer}>
          <TouchableOpacity style={[styles.modeButton, modo === 'gimnasio' && styles.modeButtonActive]} onPress={() => setModo('gimnasio')}>
            <MaterialCommunityIcons name="dumbbell" size={20} color={modo === 'gimnasio' ? '#e11d48' : '#6b7280'} style={styles.iconMargin} />
            <Text style={[styles.modeText, modo === 'gimnasio' && styles.modeTextActive]}>Tengo gimnasio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, modo === 'zona' && styles.modeButtonActive]} onPress={() => setModo('zona')}>
            <Ionicons name="location-outline" size={20} color={modo === 'zona' ? '#e11d48' : '#6b7280'} style={styles.iconMargin} />
            <Text style={[styles.modeText, modo === 'zona' && styles.modeTextActive]}>Entreno por zona</Text>
          </TouchableOpacity>
        </View>

        {modo === 'gimnasio' && (
          <View style={styles.dynamicSection}>
            <Text style={styles.sectionLabel}>TU GIMNASIO</Text>
            <View style={[styles.searchInputContainer, gimnasio.length > 0 && styles.searchInputActive]}>
              <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.iconMargin} />
              <TextInput 
                style={styles.textInput} placeholder="Busca tu gimnasio..." placeholderTextColor="#9ca3af" value={gimnasio}
                onChangeText={(texto) => { setGimnasio(texto); setMostrarResultadosGym(true); }}
              />
            </View>
            {mostrarResultadosGym && gimnasio.length > 0 && gymsFiltrados.length > 0 && (
              <View style={styles.resultsContainer}>
                {gymsFiltrados.map((gym) => (
                  <TouchableOpacity key={gym.id} style={styles.resultCard} onPress={() => seleccionarGym(gym.nombre)}>
                    <Text style={styles.resultName}>{gym.nombre}</Text>
                    <Text style={styles.resultAddress}>{gym.direccion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {modo === 'zona' && (
          <View style={styles.dynamicSection}>
            <Text style={styles.sectionLabel}>TU ZONA HABITUAL</Text>
            <View style={styles.zonesGrid}>
              {ZONAS.map((zona) => (
                <TouchableOpacity key={zona} style={[styles.zoneButton, zonasSeleccionadas.includes(zona) && styles.zoneButtonActive]} onPress={() => toggleZona(zona)}>
                  <Text style={[styles.zoneText, zonasSeleccionadas.includes(zona) && styles.zoneTextActive]}>{zona}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hintText}>Puedes seleccionar varias zonas</Text>
          </View>
        )}

        {/* HORARIOS CON LÓGICA DE EXCLUSIVIDAD */}
        <Text style={styles.sectionLabel}>TU HORARIO HABITUAL</Text>
        <View style={styles.scheduleGrid}>
          {HORARIOS.map((horario) => (
            <TouchableOpacity key={horario.id} style={[styles.scheduleCard, horariosSeleccionados.includes(horario.id) && styles.scheduleCardActive]} onPress={() => toggleHorario(horario.id)}>
              <Ionicons name={horario.icon as any} size={28} color={horariosSeleccionados.includes(horario.id) ? '#a855f7' : '#6b7280'} style={styles.scheduleIcon} />
              <Text style={[styles.scheduleText, horariosSeleccionados.includes(horario.id) && styles.scheduleTextActive]}>{horario.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.particularToggle, isHoraParticular && styles.particularToggleActive]} onPress={toggleParticular} activeOpacity={0.7}>
          <Ionicons name="time-outline" size={20} color={isHoraParticular ? '#e11d48' : '#4b5563'} style={styles.iconMargin} />
          <Text style={[styles.particularToggleText, isHoraParticular && styles.particularToggleTextActive]}>Hora en particular</Text>
        </TouchableOpacity>

        {isHoraParticular && (
          <View style={styles.timePickersRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Desde</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={horaDesde} onValueChange={handleChangeDesde} style={styles.picker}>
                  <Picker.Item label="Hora" value="" color="#9ca3af" />
                  {HORAS_NUMEROS.map(h => <Picker.Item key={`desde-${h}`} label={`${h < 10 ? '0'+h : h}:00`} value={h.toString()} />)}
                </Picker>
              </View>
            </View>

            <View style={styles.timeSeparator}><Text style={styles.timeSeparatorText}>—</Text></View>

            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Hasta</Text>
              <View style={[styles.pickerWrapper, !horaDesde && { opacity: 0.5 }]}>
                {/* Desactivamos "Hasta" hasta que no haya seleccionado "Desde" */}
                <Picker selectedValue={horaHasta} onValueChange={(v) => setHoraHasta(v)} style={styles.picker} enabled={horaDesde !== ''}>
                  <Picker.Item label="Hora" value="" color="#9ca3af" />
                  {horasHastaDisponibles.map(h => <Picker.Item key={`hasta-${h}`} label={`${h < 10 ? '0'+h : h}:00`} value={h.toString()} />)}
                </Picker>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.button, formCompleto ? styles.buttonActive : styles.buttonDisabled]} disabled={!formCompleto} onPress={finalizarOnboarding}>
          <Text style={[styles.buttonText, formCompleto ? styles.buttonTextActive : styles.buttonTextDisabled]}>Siguiente →</Text>
        </TouchableOpacity>

      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  progressBarContainer: { height: 4, backgroundColor: '#e5e7eb', width: '100%' }, progressBarFill: { height: '100%', width: '100%', backgroundColor: '#a855f7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  backButton: { padding: 8 }, logoContainer: { flexDirection: 'row', alignItems: 'center' }, logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#e11d48', alignItems: 'center', justifyContent: 'center', marginRight: 6 }, logoText: { color: '#9333ea', fontWeight: 'bold', fontSize: 12 }, headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }, placeholderSpace: { width: 40 },
  container: { flex: 1 }, scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  titlesContainer: { alignItems: 'center', marginBottom: 32 }, mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', paddingHorizontal: 20 },
  sectionLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600', letterSpacing: 1, marginBottom: 12, marginTop: 8 }, iconMargin: { marginRight: 8 },
  cityButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf2f8', borderWidth: 1, borderColor: '#e11d48', borderRadius: 12, paddingVertical: 14, marginBottom: 24 }, cityText: { fontSize: 16, color: '#111827', fontWeight: '500' },
  modeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }, modeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 14, marginHorizontal: 4 }, modeButtonActive: { borderColor: '#e11d48', backgroundColor: '#fdf2f8' }, modeText: { fontSize: 14, color: '#4b5563', fontWeight: '500' }, modeTextActive: { color: '#e11d48', fontWeight: '600' },
  dynamicSection: { marginBottom: 24, minHeight: 80 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, height: 50 }, searchInputActive: { borderColor: '#e11d48' }, textInput: { flex: 1, fontSize: 16, color: '#1f2937', height: '100%', ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
  resultsContainer: { marginTop: 12 }, resultCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 8 }, resultName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }, resultAddress: { fontSize: 14, color: '#9ca3af' },
  zonesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, zoneButton: { width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }, zoneButtonActive: { borderColor: '#4b5563', backgroundColor: '#f3f4f6' }, zoneText: { fontSize: 14, color: '#6b7280', fontWeight: '500' }, zoneTextActive: { color: '#1f2937', fontWeight: '600' }, hintText: { fontSize: 13, color: '#9ca3af', marginTop: -4 },
  scheduleGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, scheduleCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 4, alignItems: 'center', marginHorizontal: 4 }, scheduleCardActive: { borderColor: '#a855f7', backgroundColor: '#fdf4ff' }, scheduleIcon: { marginBottom: 12 }, scheduleText: { fontSize: 13, color: '#4b5563', fontWeight: '500', textAlign: 'center' }, scheduleTextActive: { color: '#a855f7', fontWeight: '700' },
  particularToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 16 }, particularToggleActive: { borderColor: '#e11d48', backgroundColor: '#fdf2f8' }, particularToggleText: { fontSize: 16, color: '#4b5563', fontWeight: '500' }, particularToggleTextActive: { color: '#e11d48', fontWeight: '600' },
  timePickersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, timeColumn: { flex: 1 }, timeLabel: { fontSize: 13, color: '#6b7280', marginBottom: 8, paddingLeft: 4 }, pickerWrapper: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' }, picker: { height: 50, width: '100%', color: '#1f2937', backgroundColor: 'transparent', borderWidth: 0, ...Platform.select({ web: { outlineStyle: 'none' as any } }) }, timeSeparator: { paddingHorizontal: 16, paddingTop: 20 }, timeSeparatorText: { color: '#9ca3af', fontSize: 16 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 }, buttonDisabled: { backgroundColor: '#e5e7eb' }, buttonActive: { backgroundColor: '#e11d48' }, buttonText: { fontSize: 18, fontWeight: 'bold' }, buttonTextDisabled: { color: '#ffffff' }, buttonTextActive: { color: '#ffffff' },
});