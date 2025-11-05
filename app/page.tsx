'use client';

import { useState, useEffect } from 'react';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import PromptCards from './components/PromptCards';
import SearchInput from './components/SearchInput';
import Footer from './components/Footer';
import HowToUseModal from './components/HowToUseModal';
import ChatInterface from './components/ChatInterface';

export default function BlubeezHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Detect desktop screen size
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Calculate sidebar width for responsive chat positioning
  const sidebarWidth = isSidebarExpanded ? 240 : 67;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSendMessage = (message: string) => {
    setInitialMessage(message);
    setIsChatActive(true);
  };

  const handlePromptClick = (prompt: string) => {
    setInitialMessage(prompt);
    setIsChatActive(true);
  };

  // Prevent background/body scrolling while chat is active
  useEffect(() => {
    if (isChatActive) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isChatActive]);

  // Clear initial message once delivered to ChatInterface
  useEffect(() => {
    if (isChatActive && initialMessage) {
      const t = setTimeout(() => setInitialMessage(null), 0);
      return () => clearTimeout(t);
    }
  }, [isChatActive, initialMessage]);

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden relative">
      <BackgroundEffects />
      <Sidebar
        onExpandChange={setIsSidebarExpanded}
        onMobileOpenChange={setIsMobileSidebarOpen}
        isChatMode={isChatActive}
      />
      <Header 
        sidebarExpanded={isSidebarExpanded}
        isChatMode={isChatActive}
      />

      {isChatActive ? (
        // Chat Interface - responsive positioning with sidebar
        <div 
          className="fixed inset-x-0 bottom-0 z-10 transition-all duration-300 ease-in-out"
          style={{
            top: isDesktop ? '80px' : '64px',
            paddingLeft: isDesktop ? `${sidebarWidth}px` : '0px'
          }}
        >
          <div className="w-full h-full">
            <ChatInterface
              initialMessages={initialMessage ? [{ role: 'user', content: initialMessage }] : []}
            />
          </div>
        </div>
      ) : (
        <div className="
            w-full mx-auto px-4 md:px-0 md:max-w-[675px] relative z-10 flex flex-col items-center
            pt-20 md:pt-[135px] pb-4 md:pb-20
            min-h-screen md:min-h-0 justify-between md:justify-start md:gap-48
          ">
          <HeroSection />
          <div className="w-full flex flex-col items-end justify-end gap-4 mb-4 md:mb-0">
            <PromptCards onPromptClick={handlePromptClick} />
            <SearchInput
              onHelpClick={handleOpenModal}
              isMobileSidebarOpen={isMobileSidebarOpen}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}

      {!isChatActive && <Footer onHelpClick={handleOpenModal} />}

      <HowToUseModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
