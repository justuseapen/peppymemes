import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Key, Plus, Trash2 } from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  user_id: string;
  tier: 'free' | 'developer' | 'enterprise';
  created_at: string;
  last_used: string | null;
  is_active: boolean;
  name: string;
}

export function DeveloperSection() {
  const { user, setError } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError(error instanceof Error ? error.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      setError('API key name is required');
      return;
    }

    setIsCreating(true);
    try {
      // Generate a random API key
      const apiKey = crypto.randomUUID().replace(/-/g, '');

      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          key: apiKey,
          name: newKeyName.trim(),
          user_id: user?.id,
          tier: 'free' // Default to free tier
        }])
        .select()
        .single();

      if (error) throw error;

      setApiKeys([data, ...apiKeys]);
      setNewKeyName('');
    } catch (error) {
      console.error('Error creating API key:', error);
      setError(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user?.id); // Extra safety check

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete API key');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key className="w-5 h-5" />
        <h2 className="text-xl font-semibold">API Keys</h2>
      </div>

      <form onSubmit={createApiKey} className="flex gap-2">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="API Key Name (required)"
          className="flex-1 px-3 py-2 border rounded-lg"
          disabled={isCreating}
          required
        />
        <button
          type="submit"
          disabled={isCreating || !newKeyName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </form>

      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No API keys yet</p>
        ) : (
          apiKeys.map((key) => (
            <div key={key.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{key.name}</span>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                {key.key}
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(key.created_at).toLocaleDateString()}
                {key.last_used && (
                  <> · Last used: {new Date(key.last_used).toLocaleDateString()}</>
                )}
                {!key.is_active && (
                  <span className="text-red-500 ml-2">· Inactive</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
