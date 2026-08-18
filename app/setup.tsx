import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SetupScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

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
  const ANOS = Array.from({length: 60}, (_, i) => (2010 - i).toString()); // 1950 - 2010

  // Cálculo a prueba de fallos de los días del mes
  const getMaxDays = (m: string, y: string) => {
    if (!m) return 31;
    if (m === 'Feb') {
      const yearNum = y ? parseInt(y) : 2000; // Si no hay año, asumimos bisiesto 2000 por defecto para mostrar el 29
      return (yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)) ? 29 : 28;
    }
    if (['Abr', 'Jun', 'Sep', 'Nov'].includes(m)) return 30;
    return 31;
  };
  
  const DIAS = Array.from({length: getMaxDays(mes, ano)}, (_, i) => (i + 1).toString());

  const handleMonthYearChange = (newMes: string, newAno: string) => {
    const maxDays = getMaxDays(newMes, newAno);
    if (dia && parseInt(dia) > maxDays) {
      setDia(''); // Borra el día si ya no es válido para ese mes/año
    }
  };

  // Calcular edad real
  const getEdad = () => {
    if (!dia || !mes || !ano) return null;
    const birthDate = new Date(parseInt(ano), MESES.indexOf(mes), parseInt(dia));
    const today = new Date('2026-07-12'); // Fecha actual simulada
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const edadCalculada = getEdad();
  const esMayorDeEdad = edadCalculada !== null && edadCalculada >= 18;

  // ==========================
  // ESTADOS: PASO 2 
  // ==========================
  const [tipoLugar, setTipoLugar] = useState(''); 
  const [nombreGym, setNombreGym] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [showZona, setShowZona] = useState(false);
  
  const ZONAS_MADRID = [
    'Centro', 'Arganzuela', 'Retiro', 'Salamanca', 'Chamartín', 'Tetuán', 'Chamberí', 
    'Moncloa', 'Latina', 'Carabanchel', 'Usera', 'Puente de Vallecas', 'Moratalaz', 'Ciudad Lineal'
  ];

  const [horario, setHorario] = useState(''); 
  const [horaDesde, setHoraDesde] = useState('');
  const [horaHasta, setHoraHasta] = useState('');
  const [showDesde, setShowDesde] = useState(false);
  const [showHasta, setShowHasta] = useState(false);

  const HORAS_TODAS = Array.from({length: 18}, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`); 
  const HORAS_HASTA = horaDesde ? HORAS_TODAS.filter(h => parseInt(h.split(':')[0]) > parseInt(horaDesde.split(':')[0])) : [];

  // ==========================
  // ESTADOS: PASO 3 & 4
  // ==========================
  const [preferencia, setPreferencia] = useState(''); 
  const [fotos, setFotos] = useState<string[]>([]);

  // ==========================
  // VALIDACIÓN BOTÓN SIGUIENTE
  // ==========================
  const isStepValid = () => {
    if (step === 1) return nombre.trim() !== '' && apellido.trim() !== '' && dia !== '' && mes !== '' && ano !== '' && genero !== '' && esMayorDeEdad;
    if (step === 2) {
      const lugarOk = tipoLugar === 'zona' ? zonaSeleccionada !== '' : (tipoLugar === 'gym' ? nombreGym.trim() !== '' : false);
      const tiempoOk = horario === 'rango' ? (horaDesde !== '' && horaHasta !== '') : horario !== '';
      return lugarOk && tiempoOk;
    }
    if (step === 3) return preferencia !== '';
    
    // ⚠️ ATENCIÓN: Retorna `true` temporalmente para probar el gráfico sin subir foto. 
    if (step === 4) return true; 
    // En producción usar esto: if (step === 4) return fotos.length > 0;
    
    return true;
  };

  const isNextEnabled = isStepValid();

  const handleNext = () => {
    if (!isNextEnabled) {
      if (step === 1) {
        if (!nombre || !apellido) Alert.alert("Faltan datos", "Por favor, escribe tu nombre y apellidos.");
        else if (!dia || !mes || !ano) Alert.alert("Faltan datos", "Completa tu fecha de nacimiento.");
        else if (!esMayorDeEdad) Alert.alert("Restricción de edad", "Debes ser mayor de 18 años para usar CompiFit.");
        else if (!genero) Alert.alert("Faltan datos", "Por favor, selecciona tu género.");
      } else if (step === 2) {
        if (!tipoLugar) Alert.alert("Faltan datos", "Selecciona si tienes gimnasio o entrenas por zona.");
        else if (tipoLugar === 'gym' && !nombreGym) Alert.alert("Faltan datos", "Escribe el nombre de tu gimnasio.");
        else if (tipoLugar === 'zona' && !zonaSeleccionada) Alert.alert("Faltan datos", "Selecciona una zona en el desplegable.");
        else if (!horario) Alert.alert("Faltan datos", "Selecciona tu horario habitual.");
        else if (horario === 'rango' && (!horaDesde || !horaHasta)) Alert.alert("Faltan datos", "Completa la hora de inicio y fin de tu entreno.");
      } else if (step === 3) {
        Alert.alert("Faltan datos", "Elige con quién prefieres entrenar.");
      } else if (step === 4) {
        Alert.alert("Sube una foto", "Necesitas al menos 1 foto donde se te vea la cara.");
      }
      return;
    }

    if (step === 5) {
      router.replace('/feed'); 
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const simularSubirFoto = () => {
    if (fotos.length < 4) {
      setFotos([...fotos, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop']);
    }
  };

  const closeAllDropdowns = () => {
    setShowDia(false); setShowMes(false); setShowAno(false);
    setShowZona(false); setShowDesde(false); setShowHasta(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* HEADER & BARRA PROGRESO */}
      {step < 5 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#E11D48" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>CF</Text>
            </View>
            <Text style={styles.headerBrandText}>CompiFit</Text>
          </View>
          <View style={{width: 40}} /> 
        </View>
      )}

      {step < 5 && (
        <View style={styles.progressContainer}>
          <LinearGradient colors={['#E11D48', '#d946ef']} style={[styles.progressBar, { width: `${(step / TOTAL_STEPS) * 100}%` }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
        </View>
      )}

      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" onScrollBeginDrag={closeAllDropdowns}>
          
          {/* ==================================== */}
          {/* PASO 1: DATOS BÁSICOS                */}
          {/* ==================================== */}
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
                          <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => {
                            setMes(m); 
                            setShowMes(false);
                            handleMonthYearChange(m, ano);
                          }}>
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
                          <TouchableOpacity key={a} style={styles.dropdownItem} onPress={() => {
                            setAno(a); 
                            setShowAno(false);
                            handleMonthYearChange(mes, a);
                          }}>
                            <Text style={styles.dropdownItemText}>{a}</Text>
                          </TouchableOpacity>
                        ))}
                      </View></ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* EDAD DEBAJO DE LA FECHA */}
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

          {/* ==================================== */}
          {/* PASO 2: LUGAR Y HORARIO */}
          {/* ==================================== */}
          {step === 2 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>¿Dónde y cuándo entrenas?</Text>
              <Text style={styles.subtitleCenter}>Podrás cambiar esto más adelante en ajustes.</Text>

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

              <Text style={styles.sectionLabel}>TU HORARIO HABITUAL</Text>
              <View style={[styles.rowGrid, {marginBottom: 16}]}>
                <TouchableOpacity style={[styles.cardBtn, horario === 'manana' && styles.cardBtnActive]} onPress={() => {setHorario('manana'); setHoraDesde(''); setHoraHasta(''); setShowDesde(false); setShowHasta(false);}}>
                  <Ionicons name="partly-sunny-outline" size={26} color={horario === 'manana' ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, horario === 'manana' && styles.cardBtnTextActive]}>Mañana</Text>
                  <Text style={styles.cardBtnSub}>(6:00-14:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cardBtn, horario === 'tarde' && styles.cardBtnActive]} onPress={() => {setHorario('tarde'); setHoraDesde(''); setHoraHasta(''); setShowDesde(false); setShowHasta(false);}}>
                  <Ionicons name="sunny-outline" size={26} color={horario === 'tarde' ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, horario === 'tarde' && styles.cardBtnTextActive]}>Tarde</Text>
                  <Text style={styles.cardBtnSub}>(14:00-20:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cardBtn, horario === 'noche' && styles.cardBtnActive]} onPress={() => {setHorario('noche'); setHoraDesde(''); setHoraHasta(''); setShowDesde(false); setShowHasta(false);}}>
                  <Ionicons name="moon-outline" size={26} color={horario === 'noche' ? '#E11D48' : '#6b7280'} style={{marginBottom: 8}}/>
                  <Text style={[styles.cardBtnText, horario === 'noche' && styles.cardBtnTextActive]}>Noche</Text>
                  <Text style={styles.cardBtnSub}>(20:00-23:00)</Text>
                </TouchableOpacity>
              </View>

              <View style={{paddingBottom: 20}}>
                <TouchableOpacity style={[styles.cardBtnCenterWide, horario === 'rango' && styles.cardBtnActive]} onPress={() => setHorario('rango')} activeOpacity={0.8}>
                  <Ionicons name="time-outline" size={20} color={horario === 'rango' ? '#E11D48' : '#6b7280'} style={{marginRight: 8}} />
                  <Text style={[styles.cardBtnText, horario === 'rango' && styles.cardBtnTextActive]}>Hora en particular</Text>
                </TouchableOpacity>

                {horario === 'rango' && (
                  <View style={[styles.rowGrid, {marginTop: 16, alignItems: 'center', zIndex: 10}]}>
                    <View style={{flex: 1}}>
                      <Text style={styles.miniLabel}>Desde</Text>
                      <TouchableOpacity style={styles.pickerBox} onPress={() => {setShowDesde(!showDesde); setShowHasta(false);}}>
                        <Text style={[styles.pickerText, !horaDesde && {color: '#9ca3af'}]}>{horaDesde || 'Hora'}</Text>
                        <Ionicons name="chevron-down" size={16} color="#9ca3af"/>
                      </TouchableOpacity>
                      {showDesde && (
                        <View style={styles.dropdownList}>
                          <ScrollView nestedScrollEnabled style={{maxHeight: 150}}><View onStartShouldSetResponder={() => true}>
                            {HORAS_TODAS.map(h => (
                              <TouchableOpacity key={h} style={styles.dropdownItem} onPress={() => {setHoraDesde(h); setHoraHasta(''); setShowDesde(false);}}>
                                <Text style={styles.dropdownItemText}>{h}</Text>
                              </TouchableOpacity>
                            ))}
                          </View></ScrollView>
                        </View>
                      )}
                    </View>
                    
                    <Text style={{color: '#9ca3af', marginTop: 16}}>—</Text>

                    <View style={{flex: 1}}>
                      <Text style={styles.miniLabel}>Hasta</Text>
                      <TouchableOpacity style={[styles.pickerBox, !horaDesde && {backgroundColor: '#f1f5f9'}]} onPress={() => {if(horaDesde) { setShowHasta(!showHasta); setShowDesde(false); }}}>
                        <Text style={[styles.pickerText, (!horaHasta || !horaDesde) && {color: '#9ca3af'}]}>{horaHasta || 'Hora'}</Text>
                        <Ionicons name="chevron-down" size={16} color="#9ca3af"/>
                      </TouchableOpacity>
                      {showHasta && horaDesde && (
                        <View style={styles.dropdownList}>
                          <ScrollView nestedScrollEnabled style={{maxHeight: 150}}><View onStartShouldSetResponder={() => true}>
                            {HORAS_HASTA.map(h => (
                              <TouchableOpacity key={h} style={styles.dropdownItem} onPress={() => {setHoraHasta(h); setShowHasta(false);}}>
                                <Text style={styles.dropdownItemText}>{h}</Text>
                              </TouchableOpacity>
                            ))}
                          </View></ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>

            </View>
          )}

          {/* ==================================== */}
          {/* PASO 3: PREFERENCIAS                 */}
          {/* ==================================== */}
          {step === 3 && (
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

          {/* ==================================== */}
          {/* PASO 4: FOTOS                        */}
          {/* ==================================== */}
          {step === 4 && (
            <View style={styles.stepBox}>
              <Text style={styles.titleCenter}>Añade tus fotos</Text>
              
              <View style={styles.infoAlert}>
                <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
                <Text style={styles.infoAlertText}>
                  Subir <Text style={{fontWeight: 'bold'}}>2 o más fotos</Text> inspirará mucha más confianza al resto de usuarios y seguramente quieran entrenar contigo más gente.
                </Text>
              </View>

              <View style={styles.photosGrid}>
                <TouchableOpacity style={styles.photoMain} onPress={simularSubirFoto} activeOpacity={0.8}>
                  {fotos.length > 0 && typeof fotos[0] === 'string' && fotos[0].startsWith('http') ? (
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
                      {fotos.length > index && typeof fotos[index] === 'string' && fotos[index].startsWith('http') ? (
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

          {/* ==================================== */}
          {/* PASO 5: EL GRÁFICO CIENTÍFICO        */}
          {/* ==================================== */}
          {step === 5 && (
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
                  {/* Barra Entrenar Solo */}
                  <View style={styles.singleBarCol}>
                    <View style={[styles.barShape, {height: '35%', backgroundColor: '#cbd5e1'}]} />
                    <Text style={styles.barLabel}>Entrenar{"\n"}solo</Text>
                  </View>

                  {/* Barra CompiFit */}
                  <View style={styles.singleBarCol}>
                    <View style={[styles.barShape, {height: '100%', backgroundColor: '#E11D48'}]}>
                      <LinearGradient colors={['#E11D48', '#d946ef']} style={{flex: 1, borderRadius: 12}} start={{x:0, y:1}} end={{x:0, y:0}} />
                    </View>
                    <View style={styles.rocketBadge}>
                      <Text style={{fontSize: 24}}>🚀</Text>
                    </View>
                    <Text style={[styles.barLabel, {color: '#E11D48', fontWeight: 'bold'}]}>Con{"\n"}CompiFit</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTÓN PRINCIPAL */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.mainBtn, !isNextEnabled && styles.mainBtnDisabled, step === 5 && styles.mainBtnFinal]} 
          onPress={handleNext} 
          activeOpacity={isNextEnabled ? 0.9 : 1}
        >
          {step === 5 && <LinearGradient colors={['#E11D48', '#d946ef']} style={styles.mainBtnGradient} start={{x:0, y:0}} end={{x:1, y:0}} />}
          <Text style={[styles.mainBtnText, !isNextEnabled && styles.mainBtnTextDisabled, step === 5 && {color: '#ffffff'}]}>
            {step === 5 ? 'Empezar a descubrir' : 'Siguiente'}
          </Text>
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
  miniLabel: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  
  input: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  
  ageMessageText: { fontSize: 14, fontWeight: 'bold', marginTop: 4, marginBottom: 16 },
  ageTextSuccess: { color: '#10b981' },
  ageTextError: { color: '#E11D48' },

  pickerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 14, borderRadius: 12 },
  pickerBoxLargo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12 },
  pickerText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  dropdownList: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, zIndex: 100, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 }}) },
  dropdownListLarga: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, zIndex: 100, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 }}) },
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
  rocketBadge: { position: 'absolute', top: -25, backgroundColor: '#ffffff', borderRadius: 20, padding: 4, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 }}) },

  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  mainBtn: { width: '100%', paddingVertical: 18, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  mainBtnDisabled: { backgroundColor: '#e2e8f0' },
  mainBtnFinal: { backgroundColor: 'transparent', overflow: 'hidden' },
  mainBtnGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  mainBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  mainBtnTextDisabled: { color: '#9ca3af' },
});