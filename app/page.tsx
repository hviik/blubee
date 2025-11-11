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
import ChatWithMap from './components/chat/map/ChatWithMap';
import AuthPromptModal from './components/AuthPromptModal';
import ExplorePage from './components/ExplorePage';

export default function BlubeezHome() {
  const { isSignedIn } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isExploreActive, setIsExploreActive] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileGap, setMobileGap] = useState(20);
  
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const calculateGap = () => {
        const heroSection = document.querySelector('[class*="flex flex-col gap-2.5"]');
        const promptCards = document.querySelector('[class*="w-full flex flex-col gap-2"]');
        const searchInput = document.querySelector('[class*="w-full bg-white rounded-t-2xl"]');
        
        if (heroSection && promptCards && searchInput) {
          const heroHeight = heroSection.getBoundingClientRect().height;
          const promptHeight = promptCards.getBoundingClientRect().height;
          const searchHeight = searchInput.getBoundingClientRect().height;
          const viewportHeight = window.innerHeight;
          
          const topPadding = 112;
          const totalContentHeight = topPadding + heroHeight + promptHeight + searchHeight + 120 + 16;
          
          if (totalContentHeight > viewportHeight) {
            const overflow = totalContentHeight - viewportHeight;
            const newGap = Math.max(16, 120 - overflow);
            setMobileGap(newGap);
          } else {
            setMobileGap(120);
          }
        } else {
          setMobileGap(120);
        }
      };
      calculateGap();
      const timeoutId = setTimeout(calculateGap, 100);
      window.addEventListener('resize', calculateGap);
      window.addEventListener('orientationchange', calculateGap);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculateGap);
        window.removeEventListener('orientationchange', calculateGap);
      };
    }
  }, []);

  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
  
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

  const handleDestinationClick = (countryName: string, route: string[]) => {
    if (!isSignedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    
    let placesText = '';
    if (route.length > 0) {
      if (route.length === 1) {
        placesText = ` visiting ${route[0]}`;
      } else if (route.length === 2) {
        placesText = ` visiting ${route[0]} and ${route[1]}`;
      } else {
        const lastPlace = route[route.length - 1];
        const otherPlaces = route.slice(0, -1).join(', ');
        placesText = ` visiting ${otherPlaces}, and ${lastPlace}`;
      }
    }
    
    const message = `Plan me a trip to ${countryName}${placesText}`;
    setInitialMessage(message);
    setIsExploreActive(false);
    setIsChatActive(true);
  };

  useEffect(() => {
    if (isChatActive) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isChatActive]);

  useEffect(() => {
    if (isChatActive && initialMessage) {
      const t = setTimeout(() => setInitialMessage(null), 0);
      return () => clearTimeout(t);
    }
  }, [isChatActive, initialMessage]);

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
        isChatMode={isChatActive || isExploreActive}
        onExploreClick={() => setIsExploreActive(true)}
      />
      <Header 
        sidebarExpanded={isSidebarExpanded}
        isChatMode={isChatActive || isExploreActive}
      />

      {isExploreActive ? (
        <div 
          className="fixed inset-x-0 z-10 transition-all duration-300 ease-in-out"
          style={{
            top: isDesktop ? '80px' : '64px',
            height: isDesktop ? 'calc(var(--vh, 1vh) * 100 - 80px)' : 'calc(var(--vh, 1vh) * 100 - 64px)',
            paddingLeft: isDesktop ? `${sidebarWidth}px` : '0px',
            maxHeight: isDesktop ? 'calc(100vh - 80px)' : 'calc(100vh - 64px)',
          }}
        >
          <ExplorePage onDestinationClick={handleDestinationClick} />
        </div>
      ) : isChatActive ? (
        <div 
          className="fixed inset-x-0 z-10 transition-all duration-300 ease-in-out"
          style={{
            top: isDesktop ? '80px' : '64px',
            height: isDesktop ? 'calc(var(--vh, 1vh) * 100 - 80px)' : 'calc(var(--vh, 1vh) * 100 - 64px)',
            paddingLeft: isDesktop ? `${sidebarWidth}px` : '0px',
            maxHeight: isDesktop ? 'calc(100vh - 80px)' : 'calc(100vh - 64px)',
          }}
        >
          <div className="w-full h-full">
            <ChatWithMap
              initialMessage={initialMessage || undefined}
            />
          </div>
        </div>
      ) : (
        <div className="
            w-full mx-auto px-4 md:px-0 md:max-w-[675px] relative z-10 flex flex-col items-center
            pt-[112px] md:pt-[clamp(4.5rem,9vh,6rem)] pb-2 md:pb-[clamp(3rem,6vh,4.5rem)]
            h-screen md:h-auto md:min-h-0 justify-between md:justify-center md:gap-[clamp(5rem,11vh,7.5rem)]
          ">
          <HeroSection />
          <div 
            className="w-full flex flex-col items-end justify-end gap-4 mb-2 md:mb-0 pb-[env(safe-area-inset-bottom,0px)]"
            style={{
              marginTop: !isDesktop ? `${mobileGap}px` : undefined
            }}
          >
            <PromptCards onPromptClick={handlePromptClick} />
            <div className="w-full bg-white rounded-t-2xl shadow-[0px_-10px_10px_0px_rgba(0,0,0,0.05)] p-2 md:p-0 md:bg-transparent md:shadow-none">
              <SearchInput
                onHelpClick={handleOpenModal}
                isMobileSidebarOpen={isMobileSidebarOpen}
                onSendMessage={handleSendMessage}
                onExploreClick={() => setIsExploreActive(true)}
              />
            </div>
          </div>
        </div>
      )}

      {!isChatActive && !isExploreActive && (
        <Footer 
          onHelpClick={handleOpenModal}
          onExploreClick={() => setIsExploreActive(true)}
        />
      )}

      <HowToUseModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </div>
  );
}
