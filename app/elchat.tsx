import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { supabase } from '../supabase';

export default function ChatIndividualScreen() {
  const router = useRouter();
  const { id, nombre } = useLocalSearchParams(); 
  
  const idCompi = typeof id === 'string' ? id : '';
  const nombreCompi = typeof nombre === 'string' ? nombre : 'Compi';

  const [miId, setMiId] = useState<string | null>(null);
  const [miNombre, setMiNombre] = useState<string>('Yo');
  
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalEntrenoVisible, setModalEntrenoVisible] = useState(false);
  const [modalOpcionesVisible, setModalOpcionesVisible] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const frasesHechas = [
    "Te renta un entreno esta semana? 💪",
    "En qué gym sueles entrenar? 🏃‍♂️",
    "Buscamos PR o klk 🦍",
    "Haces push-pull o cómo entrenas? 🏋️‍♂️",
    "Voy a tirar pesado, me ayudas a no morir 💀",
    "Tengo pensado romper marcas 🔥, te renta?"
  ];

  useEffect(() => {
    async function cargarChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMiId(user.id);

      // Traemos nuestro propio nombre para poder guardarlo en el mensaje
      const { data: misDatos } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single();
      if (misDatos) setMiNombre(misDatos.nombre);

      // Cargamos el historial de mensajes
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .or(`and(emisor_id.eq.${user.id},receptor_id.eq.${idCompi}),and(emisor_id.eq.${idCompi},receptor_id.eq.${user.id})`)
        .order('creado_en', { ascending: true });

      if (data) setMensajes(data);
      setCargando(false);
      
      setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: false }); }, 200);
    }
    cargarChat();
  }, [idCompi]);

  // 🔥 NUEVO: ESCUCHADOR DE TIEMPO REAL
  useEffect(() => {
    if (!miId || !idCompi) return;

    // Nos suscribimos a cualquier mensaje nuevo que caiga en la tabla 'mensajes'
    const canal = supabase
      .channel('chat_en_vivo')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload) => {
          const nuevoMensaje = payload.new;
          // Si el mensaje es PARA MÍ y viene DE ESTE COMPI, lo mostramos al instante
          if (nuevoMensaje.receptor_id === miId && nuevoMensaje.emisor_id === idCompi) {
            setMensajes((prev) => [...prev, nuevoMensaje]);
            setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100);
          }
        }
      )
      .subscribe();

    // Cuando salimos del chat, apagamos la radio para no gastar batería
    return () => {
      supabase.removeChannel(canal);
    };
  }, [miId, idCompi]);

  const enviarMensaje = async (texto: string = mensajeTexto) => {
    if (texto.trim() === '' || !miId) return;

    const textoAEnviar = texto.trim();
    setMensajeTexto(''); 

    // 1. Mostrar en mi pantalla al instante (no hacemos esperar al usuario)
    const mensajeFalso = { id: Date.now().toString(), texto: textoAEnviar, emisor_id: miId, creado_en: new Date().toISOString() };
    setMensajes(prev => [...prev, mensajeFalso]);
    setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100);

    // 2. Mandarlo a Supabase (con el orden de columnas que pediste)
    await supabase.from('mensajes').insert({
      nombre_emisor: miNombre,
      nombre_receptor: nombreCompi,
      texto: textoAEnviar,
      emisor_id: miId,
      receptor_id: idCompi
    });
  };

  const enviarPropuesta = () => {
    enviarMensaje(`🗓️ Propuesta de entreno:\nMañana a las 18:30`);
    setModalEntrenoVisible(false);
  };

  const confirmarDeshacerMatch = () => {
    Alert.alert(
      "Deshacer Match",
      `¿Seguro que quieres deshacer el match con ${nombreCompi}? Desaparecerá de tus conexiones.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deshacer", style: "destructive", onPress: deshacerMatchReal }
      ]
    );
  };

  const deshacerMatchReal = async () => {
    if (!miId || !idCompi) return;
    setModalOpcionesVisible(false);
    await supabase.from('likes').delete().match({ usuario_origen: miId, usuario_destino: idCompi });
    router.replace('/chats');
  };

  const reportarUsuario = () => {
    setModalOpcionesVisible(false);
    Alert.alert("Usuario reportado", `Hemos recibido tu reporte sobre ${nombreCompi}. Nuestro equipo lo revisará en breve.`);
  };

  const verPerfil = () => {
    setModalOpcionesVisible(false);
    Alert.alert("Próximamente", `Aquí se abrirá el perfil completo de ${nombreCompi}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>{nombreCompi.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.headerName}>{nombreCompi}</Text>
        </View>
        
        <TouchableOpacity style={styles.optionsBtn} onPress={() => setModalOpcionesVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer} 
          contentContainerStyle={mensajes.length === 0 ? styles.messagesContentEmpty : styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {!cargando && mensajes.length === 0 ? (
            <View style={styles.emptyChatContainer}>
              <View style={styles.emptyChatIconBox}>
                <Text style={{fontSize: 40}}>👋</Text>
              </View>
              <Text style={styles.emptyChatTitle}>¡Dile algo a {nombreCompi}!</Text>
              <Text style={styles.emptyChatSubtitle}>Rompe el hielo con alguna de estas frases:</Text>
              
              <View style={styles.emptyChatPhrasesGrid}>
                {frasesHechas.map((frase, index) => (
                  <TouchableOpacity key={index} style={styles.emptyChatPhraseBtn} onPress={() => setMensajeTexto(frase)} activeOpacity={0.8}>
                    <Text style={styles.emptyChatPhraseText}>{frase}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {mensajes.length > 0 && <Text style={styles.dateSeparator}>Hoy</Text>}
          
          {mensajes.map((msg) => {
            const esMio = msg.emisor_id === miId;
            const dateObj = msg.creado_en ? new Date(msg.creado_en) : new Date();
            const horaStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
            
            return (
              <View key={msg.id} style={[styles.messageRow, esMio ? styles.messageRowRight : styles.messageRowLeft]}>
                <View style={[styles.messageBubble, esMio ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
                  <Text style={[styles.messageText, esMio ? styles.messageTextRight : styles.messageTextLeft]}>
                    {msg.texto}
                  </Text>
                </View>
                <Text style={styles.messageTime}>{horaStr}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.bottomActionsContainer}>
          
          <View style={styles.proponerEntrenoRow}>
            <TouchableOpacity style={styles.quickActionBtnProponer} onPress={() => setModalEntrenoVisible(true)} activeOpacity={0.8}>
              <Ionicons name="calendar" size={16} color="#E11D48" style={{marginRight: 6}} />
              <Text style={styles.quickActionTextProponer}>Proponer entreno</Text>
            </TouchableOpacity>
          </View>

          {mensajes.length > 0 && (
            <View style={styles.frasesRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
                {frasesHechas.map((frase, index) => (
                  <TouchableOpacity key={index} style={styles.quickActionBtn} onPress={() => setMensajeTexto(frase)} activeOpacity={0.8}>
                    <Text style={styles.quickActionText}>{frase}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.textInputWrapper}>
              <TextInput 
                style={styles.textInput}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#9ca3af"
                value={mensajeTexto}
                onChangeText={setMensajeTexto}
                multiline
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendBtn, mensajeTexto.trim() === '' ? styles.sendBtnDisabled : null]} 
              onPress={() => enviarMensaje(mensajeTexto)}
              disabled={mensajeTexto.trim() === ''}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>

      {/* MODAL: PROPONER ENTRENO */}
      <Modal visible={modalEntrenoVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Ionicons name="calendar" size={24} color="#E11D48" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.modalTitle}>Proponer entreno</Text>
                <Text style={styles.modalSubtitle}>con {nombreCompi}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalEntrenoVisible(false)}>
                <Ionicons name="close" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <Ionicons name="time-outline" size={18} color="#6b7280" style={{marginRight: 6}} />
                <Text style={styles.modalLabel}>Fecha y Hora</Text>
              </View>
              <View style={styles.modalRow}>
                <View style={styles.modalSelect}>
                  <Text style={styles.modalSelectText}>Mañana</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </View>
                <View style={styles.modalSelect}>
                  <Text style={styles.modalSelectText}>18:30</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={enviarPropuesta} activeOpacity={0.9}>
              <Text style={styles.modalSubmitBtnText}>Enviar Propuesta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: MENÚ DE OPCIONES (3 PUNTITOS) */}
      <Modal visible={modalOpcionesVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.optionsOverlay} activeOpacity={1} onPress={() => setModalOpcionesVisible(false)}>
          <View style={styles.optionsMenu}>
            <TouchableOpacity style={styles.optionItem} onPress={verPerfil}>
              <Ionicons name="person-outline" size={20} color="#111827" style={{marginRight: 12}} />
              <Text style={styles.optionText}>Ver perfil de {nombreCompi}</Text>
            </TouchableOpacity>
            
            <View style={styles.optionDivider} />
            
            <TouchableOpacity style={styles.optionItem} onPress={reportarUsuario}>
              <Ionicons name="flag-outline" size={20} color="#f59e0b" style={{marginRight: 12}} />
              <Text style={[styles.optionText, {color: '#f59e0b'}]}>Reportar usuario</Text>
            </TouchableOpacity>
            
            <View style={styles.optionDivider} />
            
            <TouchableOpacity style={styles.optionItem} onPress={confirmarDeshacerMatch}>
              <Ionicons name="heart-dislike-outline" size={20} color="#E11D48" style={{marginRight: 12}} />
              <Text style={[styles.optionText, {color: '#E11D48', fontWeight: 'bold'}]}>Deshacer Match</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', zIndex: 10 },
  backBtn: { padding: 8 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  avatarMini: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarMiniText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  headerName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  optionsBtn: { padding: 8 },
  messagesContainer: { flex: 1, backgroundColor: '#f8fafc' },
  messagesContent: { padding: 16, paddingBottom: 32 },
  messagesContentEmpty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  
  emptyChatContainer: { alignItems: 'center', width: '100%' },
  emptyChatIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyChatTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptyChatSubtitle: { fontSize: 15, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  emptyChatPhrasesGrid: { width: '100%', gap: 12 },
  emptyChatPhraseBtn: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', ...Platform.select({ web: { boxShadow: '0px 2px 5px rgba(0,0,0,0.05)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}) },
  emptyChatPhraseText: { fontSize: 15, color: '#374151', fontWeight: '500', textAlign: 'center' },

  dateSeparator: { alignSelf: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12, color: '#6b7280', fontWeight: 'bold', marginBottom: 24, marginTop: 10 },
  messageRow: { marginBottom: 16, maxWidth: '80%' },
  messageRowLeft: { alignSelf: 'flex-start' },
  messageRowRight: { alignSelf: 'flex-end' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  messageBubbleLeft: { backgroundColor: '#e2e8f0', borderBottomLeftRadius: 4 },
  messageBubbleRight: { backgroundColor: '#E11D48', borderBottomRightRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTextLeft: { color: '#111827' },
  messageTextRight: { color: '#ffffff' },
  messageTime: { fontSize: 11, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },
  
  bottomActionsContainer: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 10 },
  proponerEntrenoRow: { paddingHorizontal: 16, marginBottom: 8, alignItems: 'flex-start' },
  quickActionBtnProponer: { flexDirection: 'row', backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  quickActionTextProponer: { color: '#E11D48', fontSize: 14, fontWeight: 'bold' },
  frasesRow: { marginBottom: 10 },
  quickActionsScroll: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  quickActionBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  quickActionText: { color: '#4b5563', fontSize: 14, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16 },
  textInputWrapper: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 12 : 8, paddingBottom: Platform.OS === 'ios' ? 12 : 8, marginRight: 12, minHeight: 44, maxHeight: 100 },
  textInput: { flex: 1, fontSize: 16, color: '#111827' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#fca5a5' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  modalIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: { fontSize: 15, color: '#6b7280' },
  modalBody: { marginBottom: 32 },
  modalLabel: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalSelect: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  modalSelectText: { fontSize: 16, color: '#111827', fontWeight: '500' },
  modalSubmitBtn: { backgroundColor: '#E11D48', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  modalSubmitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  optionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  optionsMenu: { position: 'absolute', top: Platform.OS === 'android' ? 80 : 60, right: 16, backgroundColor: '#ffffff', borderRadius: 16, width: 220, ...Platform.select({ web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}) },
  optionItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  optionText: { fontSize: 16, color: '#111827', fontWeight: '500' },
  optionDivider: { height: 1, backgroundColor: '#f1f5f9' }
});