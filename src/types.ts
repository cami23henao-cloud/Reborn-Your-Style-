export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  country: string;
  department: string;
  city: string;
  neighborhood: string;
  address: string;
  phone?: string;
  preferences: string[];
  isVerified: boolean;
  joinedDate: string;
  authProvider: 'email' | 'google';
}

export type GarmentCategory =
  | 'todas'
  | 'camisas'
  | 'blusas'
  | 'pantalones'
  | 'vestidos'
  | 'faldas'
  | 'chaquetas'
  | 'bolsos'
  | 'accesorios';

export type GarmentCondition =
  | 'Excelente (Sin uso)'
  | 'Muy bueno'
  | 'Con desgaste'
  | 'Con pequeño defecto'
  | 'Desgaste para patronaje';

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  border?: boolean;
}

export interface Garment {
  id: string;
  title: string;
  category: GarmentCategory;
  condition: GarmentCondition;
  size?: string;
  composition?: string;
  description: string;
  country: string;
  department: string;
  city: string;
  neighborhood: string;
  address: string;
  colorName: string;
  colorHex: string;
  photos: string[];
  createdAt: string;
  authorName: string;
  authorEmail?: string;
  status: 'disponible' | 'en_proceso' | 'transformada';
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  verified: boolean;
  country: string;
  department: string;
  city: string;
  neighborhood: string;
  tags: string[];
  bio: string;
  available: string;
  rating: number;
  projectsCount: number;
  avatar: string;
  specialties: string[];
  portfolioImages?: string[];
}

export interface TutorialStep {
  number: number;
  title: string;
  instruction: string;
}

export interface Tutorial {
  id: string;
  title: string;
  category: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado' | 'Todos los niveles' | 'Principiante';
  duration: string;
  description: string;
  image: string;
  materials: string[];
  steps: TutorialStep[];
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isAdvisor?: boolean;
}

export interface Conversation {
  id: string;
  participantId?: string;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  participantLocation?: string;
  lastMessage: string;
  lastMessageTime?: string;
  lastUpdated?: string;
  unreadCount: number;
  messages: ChatMessage[];
  isAdvisor?: boolean;
}

export interface AdvisorInquiry {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'Recibido' | 'En revisión' | 'Respondido';
}
