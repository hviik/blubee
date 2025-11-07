'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import PromptCards from './components/PromptCards';
import SearchInput from './components/SearchInput';
import Footer from './components/Footer';
import HowToUseModal from './components/HowToUseModal';
import ChatInterface from './components/ChatInterface';
import AuthPromptModal from './components/AuthPromptModal';

export default function BlubeezHome() {
  const { isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);

  const handleSendMessage = (message: string) => {
    if (!isSignedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setInitialMessage(message);
    setIsChatActive(true);
  };

  const handlePromptClick = (prompt: string) => {
    if (!isSignedIn) {
      setIsAuthModalOpen(true);
      return;
    }
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

  // Close auth modal when user signs in
  useEffect(() => {
    if (isSignedIn && isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  }, [isSignedIn, isAuthModalOpen]);

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
        // Chat Interface - bounded container to prevent scroll issues
        // Using absolute positioning with calculated height to stay below header
        // z-30: below sidebar(40) and header(50), above background content
        <div 
          className="absolute left-0 right-0 z-[30] overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            top: isDesktop ? '80px' : '64px',
            height: isDesktop ? 'calc(100vh - 80px)' : 'calc(100vh - 64px)',
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
            pt-24 md:pt-[clamp(4.5rem,9vh,6rem)] pb-4 md:pb-[clamp(3rem,6vh,4.5rem)]
            h-screen md:h-auto md:min-h-0 justify-between md:justify-center md:gap-[clamp(5rem,11vh,7.5rem)]
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
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </div>
  );
}
