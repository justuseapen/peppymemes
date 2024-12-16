import React, { useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../store/useAuthStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();

  useEffect(() => {
    console.log('Layout: isAuthModalOpen changed:', isAuthModalOpen);
  }, [isAuthModalOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {children}
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}
