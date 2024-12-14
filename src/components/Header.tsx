import React, { useState } from 'react';
import { ImagePlus, Search, LogIn, LogOut, User, Menu, X, Plus } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      onUploadClick();
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-green-500 shadow-lg relative w-full overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="w-full px-2">
          <div className="flex items-center justify-between h-14 max-w-7xl mx-auto">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-white hover:text-green-100 flex-shrink-0 min-w-[60px]">
              Peppy
            </Link>

            {/* Search - Hidden on mobile, shown on md+ */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search memes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-green-600 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <Search className="absolute left-3 top-2 h-5 w-5 text-green-200" />
              </div>
            </div>

            {/* Mobile Search - Constrained width */}
            <div className="relative w-[120px] md:hidden mx-1.5">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-green-600 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
              />
              <Search className="absolute left-1.5 top-2 h-4 w-4 text-green-200" />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleUploadClick}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                <ImagePlus size={20} />
                <span>Upload</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-white hover:text-green-100"
                  >
                    <div className="flex items-center space-x-2 bg-green-600 px-3 py-1.5 rounded-lg">
                      <User size={20} />
                      <span>{user.username || 'Profile'}</span>
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-white hover:text-green-200 touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-green-500 shadow-lg md:hidden z-50">
              <div className="px-2 py-2 space-y-2 border-t border-green-400">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
                    >
                      <User size={20} />
                      <span>{user.username || 'Profile'}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
                    >
                      <LogOut size={20} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
                  >
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </header>

      {/* Mobile Upload FAB */}
      <button
        onClick={handleUploadClick}
        className="fixed right-4 bottom-4 md:hidden z-50 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg touch-manipulation"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          marginBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        aria-label="Upload meme"
      >
        <Plus size={28} />
      </button>
    </>
  );
}
