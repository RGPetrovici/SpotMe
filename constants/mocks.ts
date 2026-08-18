// ==========================================
// 🏋️ INTERFACES (Definición de los datos)
// ==========================================

export interface PRs {
    sentadilla?: string;
    banca?: string;
    hipThrust?: string;
    pesoMuerto?: string;
  }
  
  export interface Usuario {
    id: string;
    nombre: string;
    edad: number;
    fotos: string[];
    bio: string;
    disciplinas: string[];
    gym: string;
    horario: string;
    etiquetaHoy: string;
    prs: PRs;
    esGymBroOficial?: boolean; // Para los que ya tienen 5+ quedadas
    estadoMatch: 'none' | 'liked_me' | 'matched'; // Para saber dónde mostrarlos
  }
  
  export interface Mensaje {
    id: string;
    texto: string;
    esMio: boolean;
    hora: string;
  }
  
  export interface Chat {
    id: string;
    usuarioId: string;
    mensajes: Mensaje[];
    mensajesSinLeer: number;
  }
  
  // ==========================================
  // 🎬 EL "CASTING" DE USUARIOS (Mock Data)
  // ==========================================
  
  export const USUARIOS: Usuario[] = [
    {
      id: 'u1',
      nombre: 'Carlos',
      edad: 28,
      fotos: ['https://images.unsplash.com/photo-1583569704084-3990dd346761?q=80&w=400&auto=format&fit=crop'],
      bio: 'Si no duele, no vale. Busco a alguien que me aguante el ritmo los días de pierna 💀',
      disciplinas: ['Powerlifting', 'Hipertrofia'],
      gym: 'VivaGym Arganzuela',
      horario: 'Tardes (18:00 - 20:00)',
      etiquetaHoy: '🦍 A reventar PRs',
      prs: { sentadilla: '140', banca: '100', pesoMuerto: '180' },
      esGymBroOficial: true,
      estadoMatch: 'matched'
    },
    {
      id: 'u2',
      nombre: 'Elena',
      edad: 25,
      fotos: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop'],
      bio: 'Crossfitera intentando no morir en los WODs. Adicta a la cafeína pre-entreno ☕',
      disciplinas: ['CrossFit', 'Funcional'],
      gym: 'Crossfit Vaguada',
      horario: 'Mañanas (07:00 - 09:00)',
      etiquetaHoy: '🏃‍♀️ Cardio y sufrir',
      prs: { sentadilla: '80', hipThrust: '120' },
      estadoMatch: 'matched'
    },
    {
      id: 'u3',
      nombre: 'Laura',
      edad: 24,
      fotos: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'],
      bio: 'Chica fitness buscando a su gymsis para entrenar juntas y grabar la rutina 👯‍♀️📸',
      disciplinas: ['Hipertrofia'],
      gym: 'Basic-Fit Centro',
      horario: 'Tardes (19:00 - 21:00)',
      etiquetaHoy: '🤝 Busco Gym Sis',
      prs: { hipThrust: '160', sentadilla: '90' },
      estadoMatch: 'matched' // Matched, pero sin chat iniciado (Nuevos compis)
    },
    {
      id: 'u4',
      nombre: 'David',
      edad: 31,
      fotos: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'],
      bio: 'Volviendo al ruedo después de una lesión. Busco a alguien chill para no saltarme los días de torso.',
      disciplinas: ['Hipertrofia', 'Calistenia'],
      gym: 'McFit Ventas',
      horario: 'Mediodía (14:00 - 15:30)',
      etiquetaHoy: '🧘‍♂️ Chill y técnica',
      prs: { banca: '85' },
      estadoMatch: 'matched' // Matched, pero sin chat iniciado
    },
    {
      id: 'u5',
      nombre: 'Sofía',
      edad: 27,
      fotos: ['https://images.unsplash.com/photo-1609899517236-77a7d582dd75?q=80&w=400&auto=format&fit=crop'],
      bio: 'Principiante total 🥺. Necesito un Mentor que me enseñe a no romperme la espalda haciendo peso muerto.',
      disciplinas: ['Funcional'],
      gym: 'VivaGym Arganzuela',
      horario: 'Tardes (18:00 - 20:00)',
      etiquetaHoy: '🧠 Busco Mentor',
      prs: {},
      estadoMatch: 'liked_me' // Le gustamos, pero nosotros no hemos decidido (Aparece borrosa en la tienda)
    },
    {
      id: 'u6',
      nombre: 'Marcos',
      edad: 22,
      fotos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop'],
      bio: 'Volumen sucio todo el año 🍔. Si me ayudas con la técnica de sentadilla te invito al post-entreno.',
      disciplinas: ['Hipertrofia'],
      gym: 'Fitness Park',
      horario: 'Tardes (20:00 - 22:00)',
      etiquetaHoy: '🏋️ Spotter',
      prs: { sentadilla: '110', banca: '70' },
      estadoMatch: 'none' // Perfil libre para que nos salga en el Feed al explorar
    },
    {
      id: 'u7',
      nombre: 'Marta',
      edad: 29,
      fotos: ['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop'],
      bio: 'Preparando mi primer Hyrox. Si no te gusta correr, mejor desliza a la izquierda 🏃‍♀️💨',
      disciplinas: ['CrossFit', 'Hyrox'],
      gym: 'AltaFit',
      horario: 'Mañanas (06:30 - 08:00)',
      etiquetaHoy: '⚔️ Retos y sudor',
      prs: { sentadilla: '95', pesoMuerto: '110' },
      estadoMatch: 'none' // Para el Feed
    }
  ];
  
  // ==========================================
  // 💬 HISTORIALES DE CHAT (Mock Data)
  // ==========================================
  
  export const CHATS_ACTIVOS: Chat[] = [
    {
      id: 'c1',
      usuarioId: 'u1', // Chat con Carlos
      mensajesSinLeer: 0,
      mensajes: [
        { id: 'm1', texto: '¡Qué pasa crack! He visto que tiras 140 en sentadilla, ¡menuda bestia!', esMio: true, hora: '10:30' },
        { id: 'm2', texto: '¡Venga bro! Poco a poco. ¿Mañana a las 18:00 le damos a pata en el VivaGym?', esMio: false, hora: '12:45' }
      ]
    },
    {
      id: 'c2',
      usuarioId: 'u2', // Chat con Elena
      mensajesSinLeer: 1, // ¡Punto rojo en la bandeja!
      mensajes: [
        { id: 'm1', texto: 'Hola Elena! Veo que entrenas prontísimo, eres de las mías jaja', esMio: true, hora: 'Ayer' },
        { id: 'm2', texto: 'Me parece genial, ¿nos vemos en la zona de peso libre?', esMio: false, hora: 'Ayer' }
      ]
    }
  ];