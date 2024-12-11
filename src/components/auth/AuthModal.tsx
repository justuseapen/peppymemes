import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, mode = 'signin' }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(mode === 'signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, error, setError } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignIn) {
        await signIn(email, password);
        onClose();
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      // Error is handled in the store
    }
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError(null);
    setShowForgotPassword(false);
  };

  const handleForgotPasswordSuccess = () => {
    setError('Password reset instructions have been sent to your email.');
    setShowForgotPassword(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {showForgotPassword
              ? 'Reset Password'
              : isSignIn ? 'Sign In' : 'Sign Up'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {showForgotPassword ? (
          <div className="p-4">
            <ForgotPasswordForm
              onCancel={() => setShowForgotPassword(false)}
              onSuccess={handleForgotPasswordSuccess}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </button>

            {isSignIn && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot your password?
              </button>
            )}

            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
