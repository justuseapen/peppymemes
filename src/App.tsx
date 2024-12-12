import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { MemeGrid } from './components/MemeGrid';
import { UploadModal } from './components/UploadModal';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { ProfilePage } from './components/profile/ProfilePage';
import { useMemeStore } from './store/useMemeStore';

export function App() {
  const { isLoading, error, loadMemes } = useMemeStore();
  const location = useLocation();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  return (
    <>
      {location.pathname !== '/profile' && location.pathname !== '/auth/reset-password' && (
        <Header onUploadClick={() => setIsUploadModalOpen(true)} />
      )}

      {location.pathname === '/' && (
        isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen text-red-600">
            Error Loading Memes: {error}
          </div>
        ) : (
          <MemeGrid />
        )
      )}

      <Routes>
        <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </>
  );
}
