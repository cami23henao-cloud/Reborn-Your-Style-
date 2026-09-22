import React, { useState, useEffect } from 'react';
import { User, Garment, Professional, Tutorial, Conversation, ChatMessage } from './types';
import { INITIAL_GARMENTS, INITIAL_PROFESSIONALS, INITIAL_TUTORIALS, INITIAL_USER } from './data/initialData';

// Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Manifesto } from './components/Manifesto';
import { Purpose } from './components/Purpose';
import { HowItWorks } from './components/HowItWorks';
import { GarmentsSection } from './components/GarmentsSection';
import { ProfessionalsSection } from './components/ProfessionalsSection';
import { TutorialsSection } from './components/TutorialsSection';
import { ImpactSection } from './components/ImpactSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

// Modals and Drawers
import { AuthModal } from './components/AuthModal';
import { PublishModal } from './components/PublishModal';
import { ProfileModal } from './components/ProfileModal';
import { ChatDrawer } from './components/ChatDrawer';
import { AdvisorModal } from './components/AdvisorModal';
import { ProfessionalModal } from './components/ProfessionalModal';
import { TutorialModal } from './components/TutorialModal';
import { ProposeIdeaModal } from './components/ProposeIdeaModal';

export const App: React.FC = () => {
  // Application Data States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reborn_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USER;
  });

  const [garments, setGarments] = useState<Garment[]>(INITIAL_GARMENTS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [tutorials] = useState<Tutorial[]>(INITIAL_TUTORIALS);

  // Conversations State (empty clean state by default as requested!)
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('reborn_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Modals Visibility
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  // Modal Contexts
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [selectedGarmentForIdea, setSelectedGarmentForIdea] = useState<Garment | null>(null);
  const [advisorTargetGarment, setAdvisorTargetGarment] = useState<Garment | null>(null);

  // Fetch initial data from server on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [garmentsRes, profRes, chatsRes] = await Promise.all([
          fetch('/api/garments'),
          fetch('/api/professionals'),
          fetch('/api/chats'),
        ]);

        if (garmentsRes.ok) {
          const gData = await garmentsRes.json();
          if (Array.isArray(gData) && gData.length > 0) setGarments(gData);
        }
        if (profRes.ok) {
          const pData = await profRes.json();
          if (Array.isArray(pData) && pData.length > 0) setProfessionals(pData);
        }
        if (chatsRes.ok) {
          const cData = await chatsRes.json();
          if (Array.isArray(cData) && cData.length > 0) {
            setConversations(cData);
            setActiveConversationId(cData[0].id);
          }
        }
      } catch (err) {
        console.log('App running in preview state, local data active.');
      }
    };

    fetchData();
  }, []);

  // Save persistent local changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('reborn_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('reborn_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('reborn_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Handler: User publishes a new garment
  const handleGarmentPublished = (newGarment: Garment) => {
    setGarments((prev) => [newGarment, ...prev]);
    // Smoothly scroll to catalog to see the new garment
    const el = document.getElementById('explora-catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler: Contact a professional (opens chat drawer and creates/switches thread)
  const handleContactProfessional = (prof: Professional) => {
    const existing = conversations.find((c) => c.participantName === prof.name);

    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const newConv: Conversation = {
        id: `conv-prof-${prof.id}-${Date.now()}`,
        participantId: prof.id,
        participantName: prof.name,
        participantAvatar: prof.avatar,
        participantRole: prof.title,
        lastMessage: `Hola ${prof.name.split(' ')[0]}, vi tu perfil en el directorio de Reborn Your Style.`,
        lastMessageTime: 'Ahora',
        lastUpdated: 'Ahora',
        unreadCount: 0,
        messages: [
          {
            id: `msg-1-${Date.now()}`,
            conversationId: `conv-prof-${prof.id}-${Date.now()}`,
            senderId: 'me',
            senderName: currentUser?.name || 'Yo',
            text: `Hola ${prof.name.split(' ')[0]}, vi tu perfil en el directorio de Reborn Your Style y me gustaría consultarte sobre una transformación textil.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `msg-2-${Date.now()}`,
            conversationId: `conv-prof-${prof.id}-${Date.now()}`,
            senderId: prof.id,
            senderName: prof.name,
            text: `¡Hola! Con mucho gusto. Cuéntame qué tipo de prenda tienes, qué tejido es y qué idea tienes en mente.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }

    setIsChatOpen(true);
  };

  // Handler: Propose an idea on a garment
  const handleSendIdea = (garment: Garment, ideaText: string) => {
    const authorName = garment.authorName || 'Autor de la prenda';
    const convId = `conv-garment-${garment.id}-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: `idea-${Date.now()}`,
      conversationId: convId,
      senderId: 'me',
      senderName: currentUser?.name || 'Yo',
      text: `💡 Propuesta de transformación para "${garment.title}":\n\n${ideaText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const existing = conversations.find((c) => c.participantName === authorName);
    if (!existing) {
      const newConv: Conversation = {
        id: convId,
        participantName: authorName,
        participantAvatar: garment.photos[0],
        participantRole: `Propuesta sobre: ${garment.title}`,
        lastMessage: `💡 Propuesta: ${ideaText.substring(0, 40)}...`,
        lastMessageTime: 'Ahora',
        lastUpdated: 'Ahora',
        unreadCount: 0,
        messages: [newMsg],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    } else {
      existing.messages.push(newMsg);
      existing.lastMessage = newMsg.text;
      setConversations([...conversations]);
      setActiveConversationId(existing.id);
    }
  };

  // Handler: Send a new message in active conversation
  const handleSendMessage = async (convId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: 'me',
      senderName: currentUser?.name || 'Yo',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: text,
            lastUpdated: 'Ahora',
          };
        }
        return c;
      })
    );

    // Call server API for persistence
    try {
      await fetch('/api/chats/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, text, senderId: 'me' }),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Handler: Advisor inquiry submitted
  const handleAdvisorInquirySent = (data: any) => {
    const advisorConvId = `conv-advisor-${Date.now()}`;
    const advisorConv: Conversation = {
      id: advisorConvId,
      participantName: 'Asesor Textil Reborn',
      participantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      participantRole: 'Especialista en Upcycling & Patronaje',
      lastMessage: 'Hemos recibido tu consulta técnica. Uno de nuestros maestros modistas te atenderá aquí.',
      lastMessageTime: 'Ahora',
      lastUpdated: 'Ahora',
      unreadCount: 1,
      messages: [
        {
          id: `msg-adv-1-${Date.now()}`,
          conversationId: advisorConvId,
          senderId: 'advisor',
          senderName: 'Asesor Textil',
          text: `¡Hola ${currentUser?.name ? currentUser.name.split(' ')[0] : ''}! Hemos recibido tu consulta: "${data.inquiry?.subject || 'Asesoría textil'}". En breve revisaremos los detalles técnicos para darte la mejor recomendación.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setConversations((prev) => [advisorConv, ...prev]);
    setActiveConversationId(advisorConv.id);
  };

  // Handler: User deletes their account
  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/profile', { method: 'DELETE' });
    } catch (e) {}
    setCurrentUser(null);
    setConversations([]);
  };

  return (
    <div className="min-h-screen bg-[#fef8f3] text-[#1d1b19] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#caecc6] selection:text-[#032517]">
      {/* 1. Header with Full Functionality */}
      <Header
        currentUser={currentUser}
        unreadCount={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPublish={() => setIsPublishOpen(true)}
        onOpenProfile={() => {
          if (currentUser) setIsProfileOpen(true);
          else setIsAuthOpen(true);
        }}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAdvisor={() => {
          setAdvisorTargetGarment(null);
          setIsAdvisorOpen(true);
        }}
      />

      {/* 2. Main Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onReutilizarClick={() => setIsPublishOpen(true)}
          onOfrecerServiciosClick={() => {
            const el = document.getElementById('contacto');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Circular Manifesto */}
        <Manifesto />

        {/* Platform Purpose & Pillars */}
        <Purpose />

        {/* Interactive Step-by-step How It Works */}
        <HowItWorks
          onOpenPublish={() => setIsPublishOpen(true)}
        />

        {/* Garments Catalog & Visual Palette Filters */}
        <GarmentsSection
          garments={garments}
          onOpenPublish={() => setIsPublishOpen(true)}
          onProposeIdea={(garment) => setSelectedGarmentForIdea(garment)}
        />

        {/* Master Artisans & Tailors Directory */}
        <ProfessionalsSection
          professionals={professionals}
          onSelectProfessional={(prof) => setSelectedProfessional(prof)}
          onContactProfessional={handleContactProfessional}
        />

        {/* DIY Tutorials & Open Knowledge */}
        <TutorialsSection
          tutorials={tutorials}
          onSelectTutorial={(tut) => setSelectedTutorial(tut)}
        />

        {/* Environmental Impact & Circular Calculator */}
        <ImpactSection />

        {/* About Us: Mission, Vision, Values */}
        <AboutSection />

        {/* Contact Form & FAQs */}
        <ContactSection
          onOpenAdvisor={() => {
            setAdvisorTargetGarment(null);
            setIsAdvisorOpen(true);
          }}
        />
      </main>

      {/* 3. Footer */}
      <Footer
        onOpenAdvisor={() => {
          setAdvisorTargetGarment(null);
          setIsAdvisorOpen(true);
        }}
        onOpenPublish={() => setIsPublishOpen(true)}
      />

      {/* 4. Modals & Drawers */}

      {/* Real Google GSI & 6-Digit Email Verification Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setCurrentUser(loggedUser);
          setIsAuthOpen(false);
        }}
      />

      {/* Publish Garment Modal with Color Swatches & Google Maps Preview */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        currentUser={currentUser}
        onGarmentPublished={handleGarmentPublished}
      />

      {/* Profile Management Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onLogout={() => setCurrentUser(null)}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Chat Drawer: clean empty state, real messaging */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onSendMessage={handleSendMessage}
        onOpenAdvisor={() => {
          setAdvisorTargetGarment(null);
          setIsAdvisorOpen(true);
        }}
      />

      {/* Advisor Consultation Modal */}
      <AdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        currentUser={currentUser}
        targetGarment={advisorTargetGarment}
        onAdvisorInquirySent={handleAdvisorInquirySent}
      />

      {/* Professional Profile Modal */}
      <ProfessionalModal
        professional={selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
        onContact={handleContactProfessional}
      />

      {/* DIY Tutorial Guide Modal */}
      <TutorialModal
        tutorial={selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
      />

      {/* Propose Idea on Garment Modal */}
      <ProposeIdeaModal
        garment={selectedGarmentForIdea}
        onClose={() => setSelectedGarmentForIdea(null)}
        onSubmitIdea={handleSendIdea}
      />
    </div>
  );
};

export default App;
