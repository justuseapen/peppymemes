import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { MemeGrid } from './components/MemeGrid';
import { UploadModal } from './components/UploadModal';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { ProfilePage } from './components/profile/ProfilePage';
import { MemeView } from './components/MemeView';
import { MemeEmbed } from './components/MemeEmbed';
import { MetaTags } from './components/MetaTags';
import { useMemeStore } from './store/useMemeStore';
import { Layout } from './components/Layout';
import { useAppInitialization } from './hooks/useAppInitialization';

export function App() {
  const { isLoading, error: memeError } = useMemeStore();
  const { isInitialized, error: initError } = useAppInitialization();
  const location = useLocation();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const showHeader = !['/profile', '/auth/reset-password'].includes(location.pathname) &&
    !location.pathname.endsWith('/embed');

  const isHomePage = location.pathname === '/';

  // Show initialization error
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {initError}
      </div>
    );
  }

  // Show initialization loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      {showHeader && (
        <Header onUploadClick={() => setIsUploadModalOpen(true)} />
      )}

      {isHomePage && <MetaTags isHomePage={true} />}

      <Routes>
        <Route
          path="/"
          element={
            isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : memeError ? (
              <div className="flex items-center justify-center min-h-screen text-red-600">
                Error Loading Memes: {memeError}
              </div>
            ) : (
              <MemeGrid />
            )
          }
        />
        <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/meme/:id" element={<MemeView />} />
        <Route path="/meme/:id/embed" element={<MemeEmbed />} />
      </Routes>

      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </Layout>
  );
}
