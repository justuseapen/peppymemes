import React, { useState } from 'react';
import { ImagePlus, Search, LogIn, LogOut, User, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemeStore } from '../store/useMemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { AuthModal } from './auth/AuthModal';

interface HeaderProps {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  const { searchTerm, setSearchTerm } = useMemeStore();
  const { user, signOut } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      onUploadClick();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-green-500 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-white hover:text-green-100">
              Peppy
            </Link>
            <div className="relative">
              <input
                type="text"
                placeholder="Search memes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-green-600 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-green-200" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleUploadClick}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ImagePlus size={20} />
              <span>Upload Meme</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-white hover:text-green-100"
                >
                  <div className="flex items-center space-x-2 bg-green-600 px-3 py-2 rounded-lg">
                    <User size={20} />
                    <span>{user.username || 'Set display name'}</span>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-white hover:text-green-200"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-2 text-white hover:text-green-200"
              >
                <LogIn size={20} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
