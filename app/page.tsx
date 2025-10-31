'use client';

import { useState } from 'react';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import PromptCards from './components/PromptCards';
import SearchInput from './components/SearchInput';
import Footer from './components/Footer';
import HowToUseModal from './components/HowToUseModal';

export default function BlubeezHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="w-full min-h-screen bg-white overflow-hidden relative">
      {/* Background Effects - Grid, Gradients, Clouds */}
      <BackgroundEffects />

      {/* Sidebar - Desktop Only, Shows when signed in */}
      <Sidebar onExpandChange={setIsSidebarExpanded} />

      {/* Header - Logo and Navigation */}
      <Header />

      {/* Main Content */}
      <div className="w-full mx-auto px-4 md:px-0 md:max-w-[675px] relative z-10 flex flex-col items-center
        pt-20 md:pt-[135px] pb-4 md:pb-20
        min-h-screen md:min-h-0 justify-between md:justify-start md:gap-48">
        
        {/* Hero Section - Logo and Intro */}
        <HeroSection />

        {/* Prompts and Search Section - Positioned lower on mobile */}
        <div className="w-full flex flex-col items-end justify-end gap-4 mb-4 md:mb-0">
          {/* Prompt Cards */}
          <PromptCards />

          {/* Search Input */}
          <SearchInput onHelpClick={handleOpenModal} />
        </div>
      </div>

      {/* Footer - Desktop Only */}
      <Footer onHelpClick={handleOpenModal} />

      {/* How to Use Modal */}
      <HowToUseModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
