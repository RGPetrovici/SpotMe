import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [guardando, setGuardando] = useState(false);
  // AUMENTAMOS A 6 PASOS
  const TOTAL_STEPS = 6;

  // ==========================
  // ESTADOS: PASO 1 
  // ==========================
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState(''); 
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [showDia, setShowDia] = useState(false);
  const [showMes, setShowMes] = useState(false);
  const [showAno, setShowAno] = useState(false);

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ANOS = Array.from({length: 60}, (_, i) => (2010 - i).toString());

  const getMaxDays = (m: string, y: string) => {
    if (!m) return 31;
    if (m === 'Feb') {
      const yearNum = y ? parseInt(y) : 2000;
      return (yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)) ? 29 : 28;
    }
    if (['Abr', 'Jun', 'Sep', 'Nov'].includes(m)) return 30;
    return 31;
  };
  const DIAS = Array.from({length: getMaxDays(mes, ano)}, (_, i) => (i + 1).toString());

  const handleMonthYearChange = (newMes: string, newAno: string) => {
    const maxDays = getMaxDays(newMes, newAno);
    if (dia && parseInt(dia) > maxDays) setDia('');
  };

  const getEdad = () => {
    if (!dia || !mes || !ano) return null;
    const birthDate = new Date(parseInt(ano), MESES.indexOf(mes), parseInt(dia));
    const today = new Date('2026-07-12');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  const edadCalculada = getEdad();
  const esMayorDeEdad = edadCalculada !== null && edadCalculada >= 18;

  // ==========================
  // ESTADOS: PASO 2 
  // ==========================
  const [ciudad, setCiudad] = useState('Madrid');
  const [tipoLugar, setTipoLugar] = useState(''); 
  const [nombreGym, setNombreGym] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [showZona, setShowZona] = useState(false);
  
  const ZONAS_MADRID = [
    'Centro', 'Arganzuela', 'Retiro', 'Salamanca', 'Chamartín', 'Tetuán', 'Chamberí', 
    'Moncloa', 'Latina', 'Carabanchel', 'Usera', 'Puente de Vallecas', 'Moratalaz', 'Ciudad Lineal'
  ];

  const [horarios, setHorarios] = useState<string[]>([]); 
  const [horaDesde, setHoraDesde] = useState('');
  const [horaHasta, setHoraHasta] = useState('');

  const toggleHorario = (opcion: string) => {
    if (opcion === 'rango') {
      setHorarios(['rango']);
    } else {
      let nuevos = horarios.filter(h => h !== 'rango');
      if (nuevos.includes(opcion)) {
        nuevos = nuevos.filter(h => h !== opcion);
      } else {
        nuevos.push(opcion);
      }
      setHorarios(nuevos);
    }
  };

  // ==========================
  // ESTADOS: PASO 3 (DEPORTES)
  // ==========================
  const [deportes, setDeportes] = useState<string[]>([]); 

  const toggleDeporte = (opcion: string) => {
    if (deportes.includes(opcion)) {
      setDeportes(deportes.filter(d => d !== opcion));
    } else {
      setDeportes([...deportes, opcion]);
    }
  };

  // ==========================
  // ESTADOS: PASO 4 (PREFERENCIAS)
  // ==========================
  const [preferencia, setPreferencia] = useState(''); 

  // ==========================
  // ESTADOS: PASO 5 (FOTOS)
  // ==========================
  const [fotos, setFotos] = useState<string[]>([]);

  // ==========================
  // LÓGICA DE SUPABASE 
  // ==========================
  const guardarPerfilEnSupabase = async () => {
    setGuardando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "No hemos encontrado tu cuenta.");
        setGuardando(false);
        return;
      }

      const horarioFinal = horarios.includes('rango') ? `${horaDesde}-${horaHasta}` : horarios.join(' y ');

      const { error } = await supabase
        .from('perfiles')
        .insert({
          id: user.id,
          nombre: nombre,
          apellido: apellido, // 👈 ¡AQUÍ ESTÁ! Ahora sí lo mandamos a la nube
          edad: edadCalculada,
          gym: tipoLugar === 'gym' ? nombreGym : 'Entrena por zona',
          zona: tipoLugar === 'zona' ? zonaSeleccionada : 'Madrid',
          bio: '¡Hola! Soy nuevo en SpotMe. Busco compis para reventar PRs 💪.',
          fotos: fotos,
          etiquetas: [preferencia, horarioFinal, ...deportes] 
        });

      if (error) throw error;
      router.replace('/feed'); 
      
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error al guardar tu perfil", error.message);
    } finally {
      setGuardando(false);
    }
  };

  // ==========================
  // VALIDACIÓN BOTÓN SIGUIENTE
  // ==========================
  const isStepValid = () => {
    if (step === 1) return nombre.trim() !== '' && apellido.trim() !== '' && dia !== '' && mes !== '' && ano !== '' && genero !== '' && esMayorDeEdad;
    if (step === 2) {
      const lugarOk = tipoLugar === 'zona' ? zonaSeleccionada !== '' : (tipoLugar === 'gym' ? nombreGym.trim() !== '' : false);
      const tiempoOk = horarios.includes('rango') ? (horaDesde !== '' && horaHasta !== '') : horarios.length > 0;
      return lugarOk && tiempoOk;
    }
    if (step === 3) return deportes.length > 0; // PASO 3: Solo deportes
    if (step === 4) return preferencia !== '';  // PASO 4: Solo preferencias
    if (step === 5) return true; // PASO 5: Fotos
    if (step === 6) return true; // PASO 6: Final
    return true;
  };

  const isNextEnabled = isStepValid();

  const handleNext = () => {
    if (!isNextEnabled) return;
    if (step === 6) { // AHORA EL ÚLTIMO PASO ES EL 6
      guardarPerfilEnSupabase();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const simularSubirFoto = () => {
    if (fotos.length < 4) setFotos([...fotos, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop']);
  };

  const closeAllDropdowns = () => {
    setShowDia(false); setShowMes(false); setShowAno(false); setShowZona(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {step < 6 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#E11D48" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SM</Text>
            </View>
            <Text style={styles.headerBrandText}>SpotMe</Text>
          </View>
          <View style={{width: 40}} /> 
        </View>
      )}

      {step < 6 && (
        <View style={styles.progressContainer}>
          <LinearGradient colors={['#E11D48', '#d946ef']} style={[styles.progressBar, { width: `${(step / TOTAL_STEPS) * 100}%` }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
        </View>
      )}

      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" onScrollBeginDrag={closeAllDropdowns}>
          
          {/* PASO 1 */}
          {step === 1 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>Tus datos básicos</Text>
              
              <View style={{marginBottom: 16}}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor="#9ca3af" value={nombre} onChangeText={setNombre} />
              </View>

              <View style={{marginBottom: 24}}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput style={styles.input} placeholder="Tus apellidos" placeholderTextColor="#9ca3af" value={apellido} onChangeText={setApellido} />
              </View>

              <Text style={styles.label}>Fecha de nacimiento</Text>
              <View style={[styles.rowGrid, {marginBottom: 8, zIndex: 30}]}>
                <View style={{flex: 1}}>
                  <TouchableOpacity style={styles.pickerBox} onPress={() => {setShowDia(!showDia); setShowMes(false); setShowAno(false);}}>
                    <Text style={[styles.pickerText, !dia && {color: '#9ca3af'}]}>{dia || 'Día'}</Text>
                    <Ionicons name="chevron-down" size={16} color="#9ca3af"/>
                  </TouchableOpacity>
                  {showDia && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled style={{maxHeight: 180}}><View onStartShouldSetResponder={() => true}>
                        {DIAS.map(d => (
                          <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => {setDia(d); setShowDia(false);}}>
                            <Text style={styles.dropdownItemText}>{d}</Text>
                          </TouchableOpacity>
                        ))}
                      </View></ScrollView>
                    </View>
                  )}
                </View>

                <View style={{flex: 1}}>
                  <TouchableOpacity style={styles.pickerBox} onPress={() => {setShowMes(!showMes); setShowDia(false); setShowAno(false);}}>
                    <Text style={[styles.pickerText, !mes && {color: '#9ca3af'}]}>{mes || 'Mes'}</Text>
                    <Ionicons name="chevron-down" size={16} color="#9ca3af"/>
                  </TouchableOpacity>
                  {showMes && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled style={{maxHeight: 180}}><View onStartShouldSetResponder={() => true}>
                        {MESES.map(m => (
                          <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setMes(m); setShowMes(false); handleMonthYearChange(m, ano); }}>
                            <Text style={styles.dropdownItemText}>{m}</Text>
                          </TouchableOpacity>
                        ))}
                      </View></ScrollView>
                    </View>
                  )}
                </View>

                <View style={{flex: 1}}>
                  <TouchableOpacity style={styles.pickerBox} onPress={() => {setShowAno(!showAno); setShowDia(false); setShowMes(false);}}>
                    <Text style={[styles.pickerText, !ano && {color: '#9ca3af'}]}>{ano || 'Año'}</Text>
                    <Ionicons name="chevron-down" size={16} color="#9ca3af"/>
                  </TouchableOpacity>
                  {showAno && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled style={{maxHeight: 180}}><View onStartShouldSetResponder={() => true}>
                        {ANOS.map(a => (
                          <TouchableOpacity key={a} style={styles.dropdownItem} onPress={() => { setAno(a); setShowAno(false); handleMonthYearChange(mes, a); }}>
                            <Text style={styles.dropdownItemText}>{a}</Text>
                          </TouchableOpacity>
                        ))}
                      </View></ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {edadCalculada !== null && (
                <Text style={[styles.ageMessageText, esMayorDeEdad ? styles.ageTextSuccess : styles.ageTextError]}>
                  {esMayorDeEdad ? `Tienes ${edadCalculada} años` : 'Hay que ser mayor de 18 años'}
                </Text>
              )}

              <Text style={[styles.label, {marginTop: 24}]}>Género</Text>
              <View>
                <View style={[styles.rowGrid, {marginBottom: 12}]}>
                  {['Masculino', 'Femenino'].map(op => (
                    <TouchableOpacity key={op} style={[styles.cardBtn, genero === op && styles.cardBtnActive]} onPress={() => setGenero(op)} activeOpacity={0.8}>
                      <Text style={[styles.cardBtnText, genero === op && styles.cardBtnTextActive]}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{alignItems: 'center'}}>
                  <TouchableOpacity style={[styles.cardBtnCenter, genero === 'Prefiero no decir' && styles.cardBtnActive]} onPress={() => setGenero('Prefiero no decir')} activeOpacity={0.8}>
                    <Text style={[styles.cardBtnText, genero === 'Prefiero no decir' && styles.cardBtnTextActive]}>Prefiero no decir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>¿Dónde y cuándo entrenas?</Text>
              <Text style={styles.subtitleCenter}>Podrás cambiar esto más adelante en ajustes.</Text>

              <Text style={styles.sectionLabel}>TU CIUDAD</Text>
              <TouchableOpacity style={[styles.cardBtnCenterWide, {borderColor: '#E11D48', backgroundColor: '#fff1f2', marginBottom: 24}]} activeOpacity={0.8}>
                <Ionicons name="location-outline" size={20} color="#E11D48" style={{marginRight: 8}} />
                <Text style={[styles.cardBtnText, {color: '#111827', fontWeight: 'bold'}]}>{ciudad}</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>LUGAR DE ENTRENAMIENTO</Text>
              <View style={[styles.rowGrid, {marginBottom: 16}]}>
                <TouchableOpacity style={[styles.cardBtn, tipoLugar === 'gym' && styles.cardBtnActive]} onPress={() => {setTipoLugar('gym'); setShowZona(false);}}>
                  <MaterialCommunityIcons name="dumbbell" size={24} color={tipoLugar === 'gym' ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, tipoLugar === 'gym' && styles.cardBtnTextActive]}>Tengo gimnasio</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.cardBtn, tipoLugar === 'zona' && styles.cardBtnActive]} onPress={() => setTipoLugar('zona')}>
                  <Ionicons name="map-outline" size={24} color={tipoLugar === 'zona' ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, tipoLugar === 'zona' && styles.cardBtnTextActive]}>Entreno por zona</Text>
                </TouchableOpacity>
              </View>

              {tipoLugar === 'gym' && (
                <View style={{marginBottom: 32}}>
                  <TextInput style={styles.input} placeholder="¿Cómo se llama tu gimnasio?" placeholderTextColor="#9ca3af" value={nombreGym} onChangeText={setNombreGym} />
                </View>
              )}

              {tipoLugar === 'zona' && (
                <View style={{marginBottom: 32, zIndex: 20}}>
                  <TouchableOpacity style={styles.pickerBoxLargo} onPress={() => setShowZona(!showZona)}>
                    <Text style={[styles.pickerText, !zonaSeleccionada && {color: '#9ca3af'}]}>
                      {zonaSeleccionada ? `${zonaSeleccionada} (Madrid)` : 'Selecciona una zona...'}
                    </Text>
                    <Ionicons name={showZona ? "chevron-up" : "chevron-down"} size={16} color="#9ca3af"/>
                  </TouchableOpacity>
                  {showZona && (
                    <View style={styles.dropdownListLarga}>
                      <ScrollView nestedScrollEnabled style={{maxHeight: 200}}><View onStartShouldSetResponder={() => true}>
                        {ZONAS_MADRID.map(z => (
                          <TouchableOpacity key={z} style={styles.dropdownItem} onPress={() => {setZonaSeleccionada(z); setShowZona(false);}}>
                            <Text style={styles.dropdownItemText}>{z}</Text>
                          </TouchableOpacity>
                        ))}
                      </View></ScrollView>
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.sectionLabel}>TU HORARIO HABITUAL (Puedes elegir varios)</Text>
              <View style={[styles.rowGrid, {marginBottom: 16}]}>
                <TouchableOpacity style={[styles.cardBtn, horarios.includes('Mañana') && styles.cardBtnActive]} onPress={() => toggleHorario('Mañana')}>
                  <Ionicons name="partly-sunny-outline" size={26} color={horarios.includes('Mañana') ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, horarios.includes('Mañana') && styles.cardBtnTextActive]}>Mañana</Text>
                  <Text style={styles.cardBtnSub}>(6:00-14:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cardBtn, horarios.includes('Tarde') && styles.cardBtnActive]} onPress={() => toggleHorario('Tarde')}>
                  <Ionicons name="sunny-outline" size={26} color={horarios.includes('Tarde') ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, horarios.includes('Tarde') && styles.cardBtnTextActive]}>Tarde</Text>
                  <Text style={styles.cardBtnSub}>(14:00-20:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cardBtn, horarios.includes('Noche') && styles.cardBtnActive]} onPress={() => toggleHorario('Noche')}>
                  <Ionicons name="moon-outline" size={26} color={horarios.includes('Noche') ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, horarios.includes('Noche') && styles.cardBtnTextActive]}>Noche</Text>
                  <Text style={styles.cardBtnSub}>(20:00-23:00)</Text>
                </TouchableOpacity>
              </View>

              <View style={{paddingBottom: 20}}>
                <TouchableOpacity style={[styles.cardBtnCenterWide, horarios.includes('rango') && styles.cardBtnActive]} onPress={() => toggleHorario('rango')} activeOpacity={0.8}>
                  <Ionicons name="time-outline" size={20} color={horarios.includes('rango') ? '#E11D48' : '#6b7280'} style={{marginRight: 8}} />
                  <Text style={[styles.cardBtnText, horarios.includes('rango') && styles.cardBtnTextActive]}>Hora en particular</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PASO 3: AHORA ES SOLO DEPORTES */}
          {step === 3 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>¿Qué te gusta hacer?</Text>
              <Text style={styles.subtitleCenter}>Puedes elegir varias disciplinas.</Text>
              
              <View style={styles.sportsGrid2x2}>
                <TouchableOpacity style={[styles.sportCard, deportes.includes('Pesas / Fuerza') && styles.sportCardActive]} onPress={() => toggleDeporte('Pesas / Fuerza')}>
                  <MaterialCommunityIcons name="dumbbell" size={32} color={deportes.includes('Pesas / Fuerza') ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.sportCardText, deportes.includes('Pesas / Fuerza') && styles.sportCardTextActive]}>Pesas / Fuerza</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sportCard, deportes.includes('CrossFit') && styles.sportCardActive]} onPress={() => toggleDeporte('CrossFit')}>
                  <MaterialCommunityIcons name="kettlebell" size={32} color={deportes.includes('CrossFit') ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.sportCardText, deportes.includes('CrossFit') && styles.sportCardTextActive]}>CrossFit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sportCard, deportes.includes('Calistenia') && styles.sportCardActive]} onPress={() => toggleDeporte('Calistenia')}>
                  <MaterialCommunityIcons name="human-handsup" size={32} color={deportes.includes('Calistenia') ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.sportCardText, deportes.includes('Calistenia') && styles.sportCardTextActive]}>Calistenia</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sportCard, deportes.includes('HIIT / Funcional') && styles.sportCardActive]} onPress={() => toggleDeporte('HIIT / Funcional')}>
                  <Ionicons name="flash" size={32} color={deportes.includes('HIIT / Funcional') ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.sportCardText, deportes.includes('HIIT / Funcional') && styles.sportCardTextActive]}>HIIT / Funcional</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PASO 4: AHORA ES SOLO PREFERENCIAS */}
          {step === 4 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>¿Con quién buscas entrenar?</Text>
              <Text style={styles.subtitleCenter}>Podrás cambiar esto más adelante en ajustes.</Text>
              
              <View style={styles.colGrid}>
                <TouchableOpacity style={[styles.bigCardBtn, preferencia === 'Gymbro' && styles.bigCardBtnActive]} onPress={() => setPreferencia('Gymbro')} activeOpacity={0.8}>
                  <Ionicons name="man-outline" size={28} color={preferencia === 'Gymbro' ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.bigCardBtnText, preferencia === 'Gymbro' && styles.bigCardBtnTextActive]}>Hombres (Gymbros)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.bigCardBtn, preferencia === 'Gymsis' && styles.bigCardBtnActive]} onPress={() => setPreferencia('Gymsis')} activeOpacity={0.8}>
                  <Ionicons name="woman-outline" size={28} color={preferencia === 'Gymsis' ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.bigCardBtnText, preferencia === 'Gymsis' && styles.bigCardBtnTextActive]}>Mujeres (Gymsis)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.bigCardBtn, preferencia === 'Mixto' && styles.bigCardBtnActive]} onPress={() => setPreferencia('Mixto')} activeOpacity={0.8}>
                  <Ionicons name="people-outline" size={28} color={preferencia === 'Mixto' ? '#E11D48' : '#6b7280'} />
                  <Text style={[styles.bigCardBtnText, preferencia === 'Mixto' && styles.bigCardBtnTextActive]}>Mixto (Cualquiera)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PASO 5: FOTOS */}
          {step === 5 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>Añade tus fotos</Text>
              
              <View style={styles.infoAlert}>
                <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
                <Text style={styles.infoAlertText}>
                  Subir <Text style={{fontWeight: 'bold'}}>2 o más fotos</Text> inspirará mucha más confianza al resto de usuarios.
                </Text>
              </View>

              <View style={styles.photosGrid}>
                <TouchableOpacity style={styles.photoMain} onPress={simularSubirFoto} activeOpacity={0.8}>
                  {fotos.length > 0 ? (
                    <Image source={{uri: fotos[0]}} style={styles.photoImgMain} />
                  ) : (
                    <View style={{alignItems: 'center'}}>
                      <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                      <Text style={styles.photoMainText}>Foto principal (Cara)</Text>
                    </View>
                  )}
                  {fotos.length === 0 && <View style={styles.photoMainBadge}><Text style={styles.photoBadgeText}>Obligatorio</Text></View>}
                </TouchableOpacity>

                <View style={styles.photosSubGrid}>
                  {[1, 2, 3].map((index) => (
                    <TouchableOpacity key={index} style={styles.photoSub} onPress={simularSubirFoto} activeOpacity={0.8}>
                      {fotos.length > index ? (
                        <Image source={{uri: fotos[index]}} style={styles.photoImgSub} />
                      ) : (
                        <Ionicons name="add" size={28} color="#9ca3af" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* PASO 6: GRÁFICO */}
          {step === 6 && (
            <View style={styles.hypeContainer}>
              <View style={styles.hypeTop}>
                <Text style={styles.hypeTitle}>¡Todo listo, {nombre || 'Compi'}!</Text>
                <Text style={styles.hypeSubtitle}>
                  Está demostrado científicamente que entrenar con compañeros dispara tu motivación y mejora tus resultados finales:
                </Text>
              </View>

              <View style={styles.graphBox}>
                <View style={styles.graphYAxis}>
                  <Text style={styles.graphAxisText}>Alto</Text>
                  <Text style={styles.graphAxisText}>Medio</Text>
                  <Text style={styles.graphAxisText}>Bajo</Text>
                </View>

                <View style={styles.barsArea}>
                  <View style={styles.singleBarCol}>
                    <View style={[styles.barShape, {height: '35%', backgroundColor: '#cbd5e1'}]} />
                    <Text style={styles.barLabel}>Entrenar{"\n"}solo</Text>
                  </View>
                  <View style={styles.singleBarCol}>
                    <View style={[styles.barShape, {height: '100%', backgroundColor: '#E11D48'}]}>
                      <LinearGradient colors={['#E11D48', '#d946ef']} style={{flex: 1, borderRadius: 12}} start={{x:0, y:1}} end={{x:0, y:0}} />
                    </View>
                    <View style={styles.rocketBadge}>
                      <Text style={{fontSize: 24}}>🚀</Text>
                    </View>
                    <Text style={[styles.barLabel, {color: '#E11D48', fontWeight: 'bold'}]}>Con{"\n"}SpotMe</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.mainBtn, !isNextEnabled && styles.mainBtnDisabled, step === 6 && styles.mainBtnFinal]} 
          onPress={handleNext} 
          activeOpacity={isNextEnabled && !guardando ? 0.9 : 1}
          disabled={guardando || !isNextEnabled}
        >
          {step === 6 && !guardando && <LinearGradient colors={['#E11D48', '#d946ef']} style={styles.mainBtnGradient} start={{x:0, y:0}} end={{x:1, y:0}} />}
          
          {guardando ? (
            <ActivityIndicator color="#E11D48" size="large" />
          ) : (
            <Text style={[styles.mainBtnText, !isNextEnabled && styles.mainBtnTextDisabled, step === 6 && {color: '#ffffff'}]}>
              {step === 6 ? 'Empezar a descubrir' : 'Siguiente'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16, backgroundColor: '#ffffff' },
  backButton: { padding: 4 },
  headerTitleBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoText: { color: '#E11D48', fontWeight: '900', fontSize: 12 },
  headerBrandText: { fontSize: 20, fontWeight: '900', color: '#111827' },
  progressContainer: { height: 4, backgroundColor: '#e5e7eb', width: '100%' },
  progressBar: { height: '100%' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  stepBox: { flex: 1 },
  titleCenter: { fontSize: 26, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 6 },
  subtitleCenter: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', letterSpacing: 1, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  ageMessageText: { fontSize: 14, fontWeight: 'bold', marginTop: 4, marginBottom: 16 },
  ageTextSuccess: { color: '#10b981' },
  ageTextError: { color: '#E11D48' },
  pickerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 14, borderRadius: 12 },
  pickerBoxLargo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12 },
  pickerText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  dropdownList: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, zIndex: 100 },
  dropdownListLarga: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, zIndex: 100 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 15, color: '#4b5563', textAlign: 'center' },
  rowGrid: { flexDirection: 'row', gap: 12 },
  colGrid: { flexDirection: 'column', gap: 12 },
  cardBtn: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  cardBtnCenter: { paddingHorizontal: 32, backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  cardBtnCenterWide: { flexDirection: 'row', width: '100%', backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  cardBtnActive: { borderColor: '#E11D48', backgroundColor: '#fff1f2', borderWidth: 1.5 },
  cardBtnText: { color: '#4b5563', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  cardBtnTextActive: { color: '#E11D48', fontWeight: 'bold' },
  cardBtnSub: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  
  sportsGrid2x2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sportCard: { width: '48%', backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  sportCardActive: { borderColor: '#E11D48', backgroundColor: '#fff1f2', borderWidth: 1.5 },
  sportCardText: { color: '#4b5563', fontSize: 14, fontWeight: '600', marginTop: 12 },
  sportCardTextActive: { color: '#E11D48', fontWeight: 'bold' },

  bigCardBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  bigCardBtnActive: { borderColor: '#E11D48', backgroundColor: '#fff1f2', borderWidth: 1.5 },
  bigCardBtnText: { color: '#4b5563', fontSize: 16, fontWeight: '600', marginLeft: 16 },
  bigCardBtnTextActive: { color: '#E11D48', fontWeight: 'bold' },
  infoAlert: { flexDirection: 'row', backgroundColor: '#fffbeb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a', marginBottom: 24, alignItems: 'flex-start' },
  infoAlertText: { flex: 1, color: '#92400e', fontSize: 13, lineHeight: 20, marginLeft: 12 },
  photosGrid: { gap: 16 },
  photoMain: { width: '100%', height: 350, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImgMain: { width: '100%', height: '100%', objectFit: 'cover' },
  photoMainText: { color: '#9ca3af', fontSize: 15, fontWeight: 'bold', marginTop: 12 },
  photoMainBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#E11D48', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  photoBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  photosSubGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  photoSub: { flex: 1, aspectRatio: 1, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImgSub: { width: '100%', height: '100%', objectFit: 'cover' },
  hypeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  hypeTop: { alignItems: 'center', marginBottom: 40 },
  hypeTitle: { fontSize: 26, fontWeight: '900', color: '#111827', marginBottom: 16, textAlign: 'center' },
  hypeSubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  graphBox: { flexDirection: 'row', width: '95%', height: 280, marginTop: 10 },
  graphYAxis: { justifyContent: 'space-between', paddingRight: 12, paddingBottom: 40 },
  graphAxisText: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold' },
  barsArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#e5e7eb', paddingBottom: 0, paddingHorizontal: 10 },
  singleBarCol: { width: '35%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barShape: { width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  barLabel: { position: 'absolute', bottom: -45, textAlign: 'center', fontSize: 13, color: '#6b7280', fontWeight: '600' },
  rocketBadge: { position: 'absolute', top: -25, backgroundColor: '#ffffff', borderRadius: 20, padding: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  mainBtn: { width: '100%', paddingVertical: 18, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  mainBtnDisabled: { backgroundColor: '#e2e8f0' },
  mainBtnFinal: { backgroundColor: 'transparent', overflow: 'hidden' },
  mainBtnGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  mainBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  mainBtnTextDisabled: { color: '#9ca3af' },
});