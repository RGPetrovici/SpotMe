import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router'; // 👈 Añadido useLocalSearchParams
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. IMPORTAMOS LA BASE DE DATOS SIMULADA
import { CHATS_ACTIVOS, USUARIOS } from '../constants/mocks';

export default function ChatRoomScreen() {
  const router = useRouter();
  
  // 🧠 ATRAPAMOS LOS PARÁMETROS DE LA URL
  const { chatId, userId } = useLocalSearchParams();
  
  const scrollViewRef = useRef<ScrollView>(null);

  // ==============================================
  // 🧠 LÓGICA DE CARGA DEL CHAT DESDE MOCKS.TS
  // ==============================================
  const miGym = "VivaGym Arganzuela";

  // Buscamos si ya existe un historial de chat
  let chatEncontrado = CHATS_ACTIVOS.find(c => c.id === chatId);
  if (!chatEncontrado && userId) {
    chatEncontrado = CHATS_ACTIVOS.find(c => c.usuarioId === userId);
  }

  // Identificamos con quién estamos hablando
  const targetUserId = chatEncontrado ? chatEncontrado.usuarioId : userId;
  const usuarioMock = USUARIOS.find(u => u.id === targetUserId);

  // Mapeamos los datos para la cabecera
  const compi = usuarioMock ? {
    nombre: usuarioMock.nombre,
    foto: usuarioMock.fotos[0],
    gym: usuarioMock.gym,
    verificado: usuarioMock.esGymBroOficial || false
  } : {
    nombre: 'Compi',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    gym: 'Gimnasio desconocido',
    verificado: false
  };

  // Cargamos los mensajes anteriores si existen
  const mensajesIniciales = chatEncontrado ? chatEncontrado.mensajes.map(m => ({
    id: m.id,
    type: 'text',
    sender: m.esMio ? 'me' : 'other',
    text: m.texto,
    time: m.hora
  })) : [];

  const [messages, setMessages] = useState<any[]>(mensajesIniciales);

  // ==============================================
  // ESTADOS Y LÓGICA DE LA INTERFAZ ORIGINAL
  // ==============================================

  const [inputText, setInputText] = useState('');
  const [modalProponer, setModalProponer] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); 
  
  // ESTADOS DEL MODAL PROPONER
  const [lugarSeleccionado, setLugarSeleccionado] = useState('mi_gym'); 
  const [otroGym, setOtroGym] = useState('');
  
  const [diaSeleccionado, setDiaSeleccionado] = useState('Mañana');
  const [horaSeleccionada, setHoraSeleccionada] = useState('18:30');
  
  const [showDiaPicker, setShowDiaPicker] = useState(false);
  const [showHoraPicker, setShowHoraPicker] = useState(false);

  // GENERADOR DINÁMICO DE DÍAS Y HORAS
  const [DIAS, setDIAS] = useState<string[]>([]);
  const [HORAS, setHORAS] = useState<string[]>([]);

  useEffect(() => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoyDate = new Date();
    const diasCalculados = ['Hoy', 'Mañana'];
    
    for (let i = 2; i <= 6; i++) {
      const futureDate = new Date(hoyDate);
      futureDate.setDate(hoyDate.getDate() + i);
      diasCalculados.push(diasSemana[futureDate.getDay()]);
    }
    setDIAS(diasCalculados);

    const horasCalculadas = [];
    for (let i = 6; i <= 23; i++) {
      const h = i.toString().padStart(2, '0');
      horasCalculadas.push(`${h}:00`);
      horasCalculadas.push(`${h}:30`);
    }
    setHORAS(horasCalculadas);

    // Al cargar el chat, hacemos scroll hacia abajo automáticamente
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
  }, []);

  const ROMPE_HIELOS = [
    "Te renta un entreno esta semana? 💪",
    "En qué gym sueles entrenar? 🏃‍♂️",
    "Buscamos PR o klk 🦍",
    "Haces push-pull o cómo entrenas? 🏋️‍♂️",
    "Voy a tirar pesado, me ayudas a no morir 💀",
    "Tengo pensado romper marcas 🔥, te renta?"
  ];

  const enviarMensaje = (texto: string) => {
    if (!texto.trim()) return;
    const nuevoMensaje = {
      id: Date.now().toString(),
      type: 'text',
      sender: 'me',
      text: texto,
      time: 'Ahora'
    };
    setMessages([...messages, nuevoMensaje]);
    setInputText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const enviarPropuesta = () => {
    const gymFinal = lugarSeleccionado === 'mi_gym' ? miGym : (lugarSeleccionado === 'su_gym' ? compi.gym : (otroGym || 'Otro gimnasio'));
    
    const nuevaPropuesta = {
      id: Date.now().toString(),
      type: 'proposal',
      sender: 'me',
      status: 'pending',
      proposalData: { dia: diaSeleccionado, hora: horaSeleccionada, gym: gymFinal },
      time: 'Ahora'
    };
    setMessages([...messages, nuevaPropuesta]);
    setModalProponer(false);
    
    setShowDiaPicker(false);
    setShowHoraPicker(false);
    
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const aceptarPropuesta = (id: string) => {
    setMessages(messages.map(msg => msg.id === id ? { ...msg, status: 'accepted' } : msg));
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'system', 
        text: '¡Quedada confirmada! Añadida a vuestra Agenda. 📅', 
        sender: 'system',
        time: 'Ahora'
      }]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  const proponerOtraHora = (id: string) => {
    setMessages(messages.map(msg => msg.id === id ? { ...msg, status: 'reschedule' } : msg));
    setTimeout(() => setModalProponer(true), 300);
  };

  const cancelarPropuesta = (id: string) => {
    setMessages(messages.map(msg => msg.id === id ? { ...msg, status: 'canceled' } : msg));
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert("Reportar y bloquear", `¿Seguro que quieres reportar a ${compi.nombre}? No volveréis a coincidir.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Bloquear", style: "destructive", onPress: () => router.replace('/chats') }
    ]);
  };

  const handleUnfollow = () => {
    setMenuVisible(false);
    Alert.alert("Dejar de seguir", `Se eliminará el Match con ${compi.nombre}.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", style: "destructive", onPress: () => router.replace('/chats') }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/chats')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerProfileInfo} activeOpacity={0.8}>
          <Image source={{uri: compi.foto}} style={styles.headerAvatar} />
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.headerName}>{compi.nombre}</Text>
              {compi.verificado && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="dumbbell" size={10} color="#d97706" />
                </View>
              )}
            </View>
            <Text style={styles.headerGym}>{compi.gym}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* ZONA DE MENSAJES */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[styles.chatContainer, messages.length === 0 && {flexGrow: 1, justifyContent: 'center'}]}
          showsVerticalScrollIndicator={false}
        >
          
          {/* ESTADO VACÍO */}
          {messages.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#E11D48" />
              </View>
              <Text style={styles.emptyTitle}>¡Es tu momento!</Text>
              <Text style={styles.emptySubtitle}>Coincidís en horario y gimnasio. Escríbele para coordinar vuestro próximo entreno.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.dateSeparator}>Hoy</Text>
              {messages.map((msg) => {
                
                if (msg.type === 'system') {
                  return (
                    <View key={msg.id} style={styles.systemMessageContainer}>
                      <Text style={styles.systemMessageText}>{msg.text}</Text>
                    </View>
                  );
                }

                const isMe = msg.sender === 'me';

                if (msg.type === 'proposal' && msg.proposalData) {
                  return (
                    <View key={msg.id} style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
                      <View style={[styles.proposalCard, isMe ? styles.proposalCardMe : styles.proposalCardOther]}>
                        <View style={styles.proposalHeader}>
                          <MaterialCommunityIcons name="calendar-check" size={20} color={isMe ? "#ffffff" : "#E11D48"} />
                          <Text style={[styles.proposalTitle, isMe && {color: '#ffffff'}]}>Propuesta de entreno</Text>
                        </View>
                        <View style={styles.proposalDetails}>
                          <Text style={[styles.proposalDataText, isMe && {color: '#f3f4f6'}]}>📅 {msg.proposalData.dia} • {msg.proposalData.hora}</Text>
                          <Text style={[styles.proposalDataText, isMe && {color: '#f3f4f6'}]}>📍 {msg.proposalData.gym}</Text>
                        </View>

                        {msg.status === 'pending' && !isMe && (
                          <View style={{gap: 8}}>
                            <TouchableOpacity style={styles.acceptButton} onPress={() => aceptarPropuesta(msg.id)} activeOpacity={0.8}>
                              <Text style={styles.acceptButtonText}>Aceptar Quedada</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rescheduleButton} onPress={() => proponerOtraHora(msg.id)} activeOpacity={0.7}>
                              <Text style={styles.rescheduleButtonText}>Me viene mejor otra hora</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {msg.status === 'pending' && isMe && (
                          <View style={{alignItems: 'center', marginTop: 4}}>
                            <View style={styles.sentStatusBox}>
                              <Text style={styles.sentStatusText}>Propuesta enviada ⚡</Text>
                            </View>
                            <TouchableOpacity onPress={() => cancelarPropuesta(msg.id)} style={{marginTop: 8, padding: 4}}>
                              <Text style={styles.cancelProposalText}>Cancelar propuesta</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {msg.status === 'accepted' && (
                          <View style={styles.acceptedBox}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{marginRight: 4}} />
                            <Text style={styles.acceptedText}>Quedada Confirmada</Text>
                          </View>
                        )}

                        {msg.status === 'canceled' && (
                          <View style={styles.canceledBox}>
                            <Ionicons name="close-circle" size={16} color="#9ca3af" style={{marginRight: 4}} />
                            <Text style={styles.canceledText}>Propuesta cancelada</Text>
                          </View>
                        )}

                        {msg.status === 'reschedule' && (
                          <View style={styles.rescheduleBox}>
                            <Ionicons name="time" size={16} color="#f59e0b" style={{marginRight: 4}} />
                            <Text style={styles.rescheduleText}>Has pedido cambiar la hora</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.messageTime}>{msg.time}</Text>
                    </View>
                  );
                }

                return (
                  <View key={msg.id} style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
                    <View style={[styles.textBubble, isMe ? styles.textBubbleMe : styles.textBubbleOther]}>
                      <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>{msg.text}</Text>
                    </View>
                    <Text style={styles.messageTime}>{msg.time}</Text>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* ÁREA DE ENTRADA */}
        <View style={styles.inputAreaWrapper}>
          
          {/* ROMPEHIELOS (Aparecen si no hay mensajes aún) */}
          {messages.length === 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.icebreakersScroll} contentContainerStyle={{paddingHorizontal: 16}}>
              {ROMPE_HIELOS.map((frase, idx) => (
                <TouchableOpacity key={idx} style={styles.icebreakerChip} onPress={() => enviarMensaje(frase)}>
                  <Text style={styles.icebreakerText}>{frase}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.proposeMainBtn} onPress={() => setModalProponer(true)} activeOpacity={0.8}>
              <LinearGradient colors={['#d946ef', '#8b5cf6']} style={styles.proposeMainGradient} start={{x:0, y:0}} end={{x:1, y:0}} />
              <Ionicons name="calendar-outline" size={18} color="#ffffff" style={{marginRight: 6}} />
              <Text style={styles.proposeMainText}>Proponer entreno</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Mensaje..."
                placeholderTextColor="#9ca3af"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>

            {inputText.trim().length > 0 ? (
              <TouchableOpacity style={styles.sendBtn} onPress={() => enviarMensaje(inputText)}>
                <Ionicons name="send" size={18} color="#ffffff" style={{marginLeft: 2}} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micBtn}>
                <Ionicons name="mic-outline" size={24} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* MODAL: MENÚ DE 3 PUNTITOS */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuVisible(false)} activeOpacity={1}>
          <View style={styles.menuDropdown}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); }}>
              <Ionicons name="person-outline" size={20} color="#111827" style={{marginRight: 12}} />
              <Text style={styles.menuItemText}>Ver perfil</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Ionicons name="warning-outline" size={20} color="#E11D48" style={{marginRight: 12}} />
              <Text style={[styles.menuItemText, {color: '#E11D48'}]}>Reportar y bloquear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleUnfollow}>
              <Ionicons name="person-remove-outline" size={20} color="#E11D48" style={{marginRight: 12}} />
              <Text style={[styles.menuItemText, {color: '#E11D48'}]}>Dejar de seguir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL PROPONER ENTRENO */}
      <Modal animationType="slide" transparent={true} visible={modalProponer} onRequestClose={() => setModalProponer(false)}>
        <View style={styles.modalOverlayPropose}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.calendarIconBox}>
                  <Ionicons name="calendar" size={20} color="#E11D48" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Proponer entreno</Text>
                  <Text style={styles.modalSubTitle}>con {compi.nombre}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalProponer(false)}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}><Ionicons name="time-outline" size={16}/> Fecha y Hora</Text>
              <View style={styles.dateTimeRow}>
                
                <View style={{flex: 1, zIndex: 10}}>
                  <TouchableOpacity style={styles.pickerBox} onPress={() => {setShowDiaPicker(!showDiaPicker); setShowHoraPicker(false);}}>
                    <Text style={styles.pickerText}>{diaSeleccionado}</Text>
                    <Ionicons name={showDiaPicker ? "chevron-up" : "chevron-down"} size={16} color="#6b7280"/>
                  </TouchableOpacity>
                  {showDiaPicker && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
                        {DIAS.map(d => (
                          <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => {setDiaSeleccionado(d); setShowDiaPicker(false);}}>
                            <Text style={styles.dropdownItemText}>{d}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={{flex: 1, zIndex: 10}}>
                  <TouchableOpacity style={styles.pickerBox} onPress={() => {setShowHoraPicker(!showHoraPicker); setShowDiaPicker(false);}}>
                    <Text style={styles.pickerText}>{horaSeleccionada}</Text>
                    <Ionicons name={showHoraPicker ? "chevron-up" : "chevron-down"} size={16} color="#6b7280"/>
                  </TouchableOpacity>
                  {showHoraPicker && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
                        {HORAS.map(h => (
                          <TouchableOpacity key={h} style={styles.dropdownItem} onPress={() => {setHoraSeleccionada(h); setShowHoraPicker(false);}}>
                            <Text style={styles.dropdownItemText}>{h}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

              </View>
            </View>

            <View style={[styles.formGroup, {zIndex: -1}]}>
              <Text style={styles.formLabel}><Ionicons name="location-outline" size={16}/> Lugar</Text>
              
              <TouchableOpacity 
                style={[styles.gymOptionCard, lugarSeleccionado === 'mi_gym' && styles.gymOptionCardActive]}
                onPress={() => setLugarSeleccionado('mi_gym')}
                activeOpacity={0.8}
              >
                {lugarSeleccionado === 'mi_gym' && <LinearGradient colors={['#d946ef', '#8b5cf6']} style={styles.gymOptionGradient} start={{x:0, y:0}} end={{x:1, y:0}} />}
                <Text style={[styles.gymOptionLabel, lugarSeleccionado === 'mi_gym' && {color: '#fbcfe8'}]}>Mi gym</Text>
                <Text style={[styles.gymOptionName, lugarSeleccionado === 'mi_gym' && {color: '#ffffff'}]}>{miGym}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.gymOptionCard, lugarSeleccionado === 'su_gym' && styles.gymOptionCardActive]}
                onPress={() => setLugarSeleccionado('su_gym')}
                activeOpacity={0.8}
              >
                {lugarSeleccionado === 'su_gym' && <LinearGradient colors={['#d946ef', '#8b5cf6']} style={styles.gymOptionGradient} start={{x:0, y:0}} end={{x:1, y:0}} />}
                <Text style={[styles.gymOptionLabel, lugarSeleccionado === 'su_gym' && {color: '#fbcfe8'}]}>Gym de {compi.nombre}</Text>
                <Text style={[styles.gymOptionName, lugarSeleccionado === 'su_gym' && {color: '#ffffff'}]}>{compi.gym}</Text>
              </TouchableOpacity>

              <View style={[styles.gymOptionSearch, lugarSeleccionado === 'otro' && styles.gymOptionSearchActive]}>
                <Ionicons name="search" size={18} color={lugarSeleccionado === 'otro' ? "#d946ef" : "#9ca3af"} style={{marginRight: 8}} />
                <TextInput
                  style={styles.gymSearchInput}
                  placeholder="Buscar otro gimnasio..."
                  placeholderTextColor="#9ca3af"
                  value={otroGym}
                  onChangeText={(text) => {
                    setOtroGym(text);
                    setLugarSeleccionado('otro');
                  }}
                  onFocus={() => setLugarSeleccionado('otro')}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.sendProposalBtn} onPress={enviarPropuesta} activeOpacity={0.9}>
              <Text style={styles.sendProposalText}>Enviar Propuesta</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#ffffff', zIndex: 10 },
  backButton: { padding: 4, marginRight: 4 },
  headerProfileInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  headerName: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  verifiedBadge: { backgroundColor: '#fef3c7', padding: 2, borderRadius: 8, marginLeft: 6, borderWidth: 1, borderColor: '#fde68a' },
  headerGym: { fontSize: 13, color: '#6b7280', marginTop: 2, fontWeight: '500' },
  moreButton: { padding: 8 },

  keyboardAvoid: { flex: 1, backgroundColor: '#f8fafc' },
  chatContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  
  emptyStateContainer: { alignItems: 'center', paddingHorizontal: 32, marginTop: -40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fdf2f8', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#fbcfe8' },
  emptyTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  dateSeparator: { alignSelf: 'center', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 11, color: '#6b7280', fontWeight: 'bold', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },

  systemMessageContainer: { alignSelf: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#d1fae5' },
  systemMessageText: { color: '#059669', fontSize: 12, fontWeight: 'bold' },

  messageWrapper: { marginBottom: 16, maxWidth: '85%' },
  messageWrapperMe: { alignSelf: 'flex-end' },
  messageWrapperOther: { alignSelf: 'flex-start' },

  textBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  textBubbleMe: { backgroundColor: '#E11D48', borderBottomRightRadius: 4 },
  textBubbleOther: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextMe: { color: '#ffffff' },
  messageTextOther: { color: '#111827' },
  messageTime: { fontSize: 11, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end', paddingHorizontal: 4 },

  proposalCard: { padding: 16, borderRadius: 20, borderWidth: 1, width: 260 },
  proposalCardMe: { backgroundColor: '#111827', borderColor: '#374151', borderBottomRightRadius: 4 },
  proposalCardOther: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  proposalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  proposalTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginLeft: 8 },
  proposalDetails: { marginBottom: 16, gap: 4 },
  proposalDataText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  acceptButton: { backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  acceptButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  rescheduleButton: { backgroundColor: 'transparent', paddingVertical: 10, alignItems: 'center' },
  rescheduleButtonText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  sentStatusBox: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', alignSelf: 'center' },
  sentStatusText: { color: '#f3f4f6', fontSize: 13, fontWeight: 'bold' },
  cancelProposalText: { color: '#9ca3af', fontSize: 12, textDecorationLine: 'underline' },
  acceptedBox: { flexDirection: 'row', backgroundColor: '#ecfdf5', paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d1fae5' },
  acceptedText: { color: '#10b981', fontSize: 13, fontWeight: 'bold' },
  canceledBox: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  canceledText: { color: '#6b7280', fontSize: 13, fontWeight: 'bold' },
  rescheduleBox: { flexDirection: 'row', backgroundColor: '#fffbeb', paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fef3c7' },
  rescheduleText: { color: '#d97706', fontSize: 13, fontWeight: 'bold' },

  inputAreaWrapper: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 16 },
  
  icebreakersScroll: { maxHeight: 50, marginBottom: 12 },
  icebreakerChip: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, alignSelf: 'flex-start' },
  icebreakerText: { color: '#E11D48', fontSize: 13, fontWeight: '600' },
  
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, alignItems: 'center' },
  proposeMainBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, overflow: 'hidden' },
  proposeMainGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  proposeMainText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  textInputContainer: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 48, maxHeight: 100 },
  textInput: { fontSize: 15, color: '#111827', maxHeight: 80 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  micBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  menuDropdown: { position: 'absolute', top: 60, right: 16, backgroundColor: '#ffffff', borderRadius: 16, width: 220, padding: 8, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}) },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  menuItemText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },

  modalOverlayPropose: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  calendarIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  modalSubTitle: { fontSize: 14, color: '#6b7280' },

  formGroup: { marginBottom: 24 },
  formLabel: { fontSize: 14, fontWeight: 'bold', color: '#4b5563', marginBottom: 12 },
  
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  pickerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  pickerText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  dropdownList: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 }}) },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 15, color: '#4b5563' },

  gymOptionCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10, overflow: 'hidden' },
  gymOptionCardActive: { borderColor: '#d946ef', borderWidth: 0 },
  gymOptionGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gymOptionLabel: { fontSize: 12, color: '#6b7280', fontWeight: 'bold', marginBottom: 4 },
  gymOptionName: { fontSize: 15, color: '#111827', fontWeight: 'bold' },

  gymOptionSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  gymOptionSearchActive: { borderColor: '#d946ef', backgroundColor: '#ffffff' },
  gymSearchInput: { flex: 1, fontSize: 15, color: '#111827' },

  sendProposalBtn: { width: '100%', backgroundColor: '#E11D48', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  sendProposalText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});