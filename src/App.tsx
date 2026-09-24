import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User, Garment, Professional, Tutorial, Conversation, ChatMessage, NavigationTab } from './types';
import { INITIAL_GARMENTS, INITIAL_PROFESSIONALS, INITIAL_TUTORIALS } from './data/initialData';

// Components & Independent Page Sheets
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InicioPage } from './components/pages/InicioPage';
import { QuienesSomosPage } from './components/pages/QuienesSomosPage';
import { MisionPage } from './components/pages/MisionPage';
import { VisionPage } from './components/pages/VisionPage';
import { CatalogoPage } from './components/pages/CatalogoPage';
import { ServiciosPage } from './components/pages/ServiciosPage';
import { TutorialesPage } from './components/pages/TutorialesPage';
import { ImpactoPage } from './components/pages/ImpactoPage';
import { ContactoPage } from './components/pages/ContactoPage';

// Modals and Drawers
import { AuthScreen } from './components/AuthScreen';
import { AuthModal } from './components/AuthModal';
import { PublishModal } from './components/PublishModal';
import { ProfileModal } from './components/ProfileModal';
import { ChatDrawer } from './components/ChatDrawer';
import { AdvisorModal } from './components/AdvisorModal';
import { ProfessionalModal } from './components/ProfessionalModal';
import { TutorialModal } from './components/TutorialModal';
import { ProposeIdeaModal } from './components/ProposeIdeaModal';
import { AdminPanel } from './components/AdminPanel';
import { PasswordResetPage } from './components/pages/PasswordResetPage';
import { logoutFirebaseUser, onFirebaseAuthStateChanged, updateUserProfileInFirestore } from './lib/firebase';

// Helper to extract NavigationTab from browser pathname
const getTabFromPath = (pathname: string): NavigationTab => {
  const clean = pathname.replace(/^\//, '').split('/')[0].toLowerCase();
  switch (clean) {
    case 'quienes-somos':
      return 'quienes-somos';
    case 'mision':
      return 'mision';
    case 'vision':
      return 'vision';
    case 'catalogo':
      return 'catalogo';
    case 'servicios':
      return 'servicios';
    case 'tutoriales':
      return 'tutoriales';
    case 'impacto':
      return 'impacto';
    case 'contacto':
      return 'contacto';
    case '':
    case 'inicio':
    default:
      return 'inicio';
  }
};

export const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Application Data States - User starts as null (guest) unless authenticated session exists
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reborn_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [garments, setGarments] = useState<Garment[]>(INITIAL_GARMENTS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [tutorials] = useState<Tutorial[]>(INITIAL_TUTORIALS);

  // Conversations State: completely private per user, starts empty
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const savedUser = localStorage.getItem('reborn_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const savedConvs = localStorage.getItem(`reborn_conversations_${u.id}`);
        if (savedConvs) {
          return JSON.parse(savedConvs);
        }
      } catch (e) {}
    }
    return [];
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Derive activeTab strictly from current URL route
  const activeTab: NavigationTab = getTabFromPath(location.pathname);

  // Automatically scroll to top whenever URL changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleSelectTab = (tab: NavigationTab) => {
    const targetPath = tab === 'inicio' ? '/' : `/${tab}`;
    navigate(targetPath);
  };

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

  // Fetch initial public catalog data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [garmentsRes, profRes] = await Promise.all([
          fetch('/api/garments'),
          fetch('/api/professionals'),
        ]);

        if (garmentsRes.ok) {
          const gData = await garmentsRes.json();
          if (Array.isArray(gData.garments) && gData.garments.length > 0) {
            setGarments(gData.garments);
          }
        }
        if (profRes.ok) {
          const pData = await profRes.json();
          if (Array.isArray(pData) && pData.length > 0) setProfessionals(pData);
        }
      } catch (err) {
        console.log('App running in preview state, catalog active.');
      }
    };

    fetchData();
  }, []);

  // Validate active session with backend on startup
  useEffect(() => {
    const token = localStorage.getItem('reborn_session_token');
    const savedUser = localStorage.getItem('reborn_user');
    if (savedUser && token) {
      try {
        const u = JSON.parse(savedUser);
        fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-Id': u.id,
          },
        })
          .then((res) => {
            if (!res.ok) {
              localStorage.removeItem('reborn_user');
              localStorage.removeItem('reborn_session_token');
              setCurrentUser(null);
            }
          })
          .catch(() => {});
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  // Listen to Firebase Auth state updates
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged((fbUser) => {
      if (fbUser) {
        setCurrentUser((prev) => {
          if (!prev || prev.id !== fbUser.id) {
            return fbUser;
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync private user data when authenticated user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('reborn_user', JSON.stringify(currentUser));

      // Fetch user's private conversations from backend
      fetch('/api/chats', {
        headers: { 'X-User-Id': currentUser.id },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.conversations && Array.isArray(data.conversations)) {
            setConversations(data.conversations);
            if (data.conversations.length > 0) {
              setActiveConversationId(data.conversations[0].id);
            }
          }
        })
        .catch(() => {});
    } else {
      localStorage.removeItem('reborn_user');
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [currentUser]);

  // Persist conversations keyed strictly by user ID
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `reborn_conversations_${currentUser.id}`,
        JSON.stringify(conversations)
      );
    }
  }, [conversations, currentUser]);

  // Handler: User publishes a new garment
  const handleGarmentPublished = (newGarment: Garment) => {
    setGarments((prev) => [newGarment, ...prev]);
    const el = document.getElementById('explora-catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler: Contact a professional (requires login)
  const handleContactProfessional = (prof: Professional) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

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
            senderName: currentUser.name,
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

  // Handler: Propose an idea on a garment (requires login)
  const handleSendIdea = (garment: Garment, ideaText: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const authorName = garment.authorName || 'Autor de la prenda';
    const convId = `conv-garment-${garment.id}-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: `idea-${Date.now()}`,
      conversationId: convId,
      senderId: 'me',
      senderName: currentUser.name,
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
    if (!currentUser) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: 'me',
      senderName: currentUser.name,
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
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
        },
        body: JSON.stringify({
          conversationId: convId,
          text,
          senderId: 'me',
          userId: currentUser.id,
        }),
      });
    } catch (e) {}
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

  // Handler: Profile updates
  const handleUpdateUser = async (updated: User) => {
    setCurrentUser(updated);
    updateUserProfileInFirestore(updated).catch(() => {});
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': updated.id,
        },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Error updating user profile:', e);
    }
  };

  // Handler: Logout (cleans all session data, resets auth state, prevents cross-user exposure)
  const handleLogout = async () => {
    try {
      await logoutFirebaseUser();
    } catch (e) {}

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser ? { 'X-User-Id': currentUser.id } : {}),
        },
      });
    } catch (e) {}

    // Disable Google One Tap auto-select so user can switch Google accounts freely
    try {
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
    } catch (e) {}

    if (currentUser) {
      localStorage.removeItem(`reborn_conversations_${currentUser.id}`);
    }
    localStorage.removeItem('reborn_user');
    localStorage.removeItem('reborn_session_token');

    setCurrentUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setIsProfileOpen(false);
    setIsChatOpen(false);
    setIsPublishOpen(false);
    window.history.replaceState(null, '', '/');
  };

  // Handler: User deletes their account
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
        },
      });
    } catch (e) {}

    // Disable Google auto-select
    try {
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
    } catch (e) {}

    localStorage.removeItem(`reborn_conversations_${currentUser.id}`);
    localStorage.removeItem('reborn_user');
    localStorage.removeItem('reborn_session_token');

    setCurrentUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setIsProfileOpen(false);
    window.history.replaceState(null, '', '/');
  };

  const handleOpenPublish = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setIsPublishOpen(true);
    }
  };

  const handleOpenChat = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setIsChatOpen(true);
    }
  };

  // Dedicated isolated route for Administrator Panel (Independent access exclusively for administrators)
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/administrador') ||
    location.pathname.startsWith('/panel-control')
  ) {
    return <AdminPanel onBackToSite={() => navigate('/')} />;
  }

  // Dedicated route for Password Recovery
  if (location.pathname.startsWith('/recuperar-clave')) {
    return (
      <PasswordResetPage
        onLoginSuccess={(loggedUser) => {
          setCurrentUser(loggedUser);
          localStorage.setItem('reborn_user', JSON.stringify(loggedUser));
          navigate('/');
        }}
      />
    );
  }

  // MANDATORY AUTHENTICATION GUARD:
  // Strictly prevent accessing internal content unless logged in.
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('reborn_user', JSON.stringify(user));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1c2e1b] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#9bb593] selection:text-[#1a2d19]">
      {/* 1. Header with Complete Navigation & User Control */}
      <Header
        currentUser={currentUser}
        unreadCount={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPublish={handleOpenPublish}
        onOpenProfile={() => {
          if (currentUser) setIsProfileOpen(true);
          else setIsAuthOpen(true);
        }}
        onOpenChat={handleOpenChat}
        onOpenAdvisor={() => {
          setAdvisorTargetGarment(null);
          setIsAdvisorOpen(true);
        }}
        onLogout={handleLogout}
        garments={garments}
        professionals={professionals}
        tutorials={tutorials}
        onSelectGarment={(garment) => {
          handleSelectTab('catalogo');
          setSelectedGarmentForIdea(garment);
        }}
        onSelectProfessional={(prof) => setSelectedProfessional(prof)}
        onSelectTutorial={(tut) => setSelectedTutorial(tut)}
      />

      {/* 2. Independent Multipage System: Each route renders its own isolated page */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <InicioPage
                onSelectTab={handleSelectTab}
                onOpenPublish={handleOpenPublish}
                onOpenAdvisor={() => {
                  setAdvisorTargetGarment(null);
                  setIsAdvisorOpen(true);
                }}
              />
            }
          />
          <Route path="/inicio" element={<Navigate to="/" replace />} />

          <Route
            path="/quienes-somos"
            element={
              <QuienesSomosPage
                onSelectTab={handleSelectTab}
                onOpenAdvisor={() => {
                  setAdvisorTargetGarment(null);
                  setIsAdvisorOpen(true);
                }}
              />
            }
          />

          <Route
            path="/mision"
            element={
              <MisionPage
                onSelectTab={handleSelectTab}
                onOpenPublish={handleOpenPublish}
              />
            }
          />

          <Route
            path="/vision"
            element={
              <VisionPage
                onSelectTab={handleSelectTab}
                onOpenPublish={handleOpenPublish}
              />
            }
          />

          <Route
            path="/catalogo"
            element={
              <CatalogoPage
                garments={garments}
                onSelectTab={handleSelectTab}
                onOpenPublish={handleOpenPublish}
                onProposeIdea={(garment) => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                  } else {
                    setSelectedGarmentForIdea(garment);
                  }
                }}
              />
            }
          />

          <Route
            path="/servicios"
            element={
              <ServiciosPage
                professionals={professionals}
                onSelectTab={handleSelectTab}
                onSelectProfessional={(prof) => setSelectedProfessional(prof)}
                onContactProfessional={handleContactProfessional}
                onOpenAdvisor={() => {
                  setAdvisorTargetGarment(null);
                  setIsAdvisorOpen(true);
                }}
              />
            }
          />

          <Route
            path="/tutoriales"
            element={
              <TutorialesPage
                tutorials={tutorials}
                onSelectTab={handleSelectTab}
                onSelectTutorial={(tut) => setSelectedTutorial(tut)}
              />
            }
          />

          <Route
            path="/impacto"
            element={
              <ImpactoPage
                onSelectTab={handleSelectTab}
                onOpenPublish={handleOpenPublish}
              />
            }
          />

          <Route
            path="/contacto"
            element={
              <ContactoPage
                onSelectTab={handleSelectTab}
                onOpenAdvisor={() => {
                  setAdvisorTargetGarment(null);
                  setIsAdvisorOpen(true);
                }}
              />
            }
          />

          <Route path="/admin" element={<AdminPanel onBackToSite={() => navigate('/')} />} />
          <Route path="/administrador" element={<AdminPanel onBackToSite={() => navigate('/')} />} />
          <Route path="/panel-control" element={<AdminPanel onBackToSite={() => navigate('/')} />} />
          <Route
            path="/recuperar-clave"
            element={
              <PasswordResetPage
                onLoginSuccess={(loggedUser) => {
                  setCurrentUser(loggedUser);
                  localStorage.setItem('reborn_user', JSON.stringify(loggedUser));
                  navigate('/');
                }}
              />
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Footer with Consistent Multipage Navigation */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenAdvisor={() => {
          setAdvisorTargetGarment(null);
          setIsAdvisorOpen(true);
        }}
        onOpenPublish={handleOpenPublish}
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

      {/* Publish Garment Modal */}
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
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Chat Drawer: private per user, real messaging */}
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
