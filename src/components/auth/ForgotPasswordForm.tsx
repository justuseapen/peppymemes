import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface ForgotPasswordFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function ForgotPasswordForm({ onCancel, onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const { resetPassword, error, setError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(email);
      onSuccess();
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          placeholder="Enter your email"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}
