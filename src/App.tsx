import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { MemeGrid } from './components/MemeGrid';
import { UploadModal } from './components/UploadModal';
import { useMemeStore } from './store/useMemeStore';

export function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { loadMemes, isLoading, error } = useMemeStore();

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Memes</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => loadMemes()}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <MemeGrid />
        )}
      </main>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}