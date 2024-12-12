import React, { useState } from 'react';
import { X, Share2, Link, Code } from 'lucide-react';
import { Meme } from '../types/meme';

interface MemeModalProps {
  meme: Meme;
  isOpen: boolean;
  onClose: () => void;
}

export function MemeModal({ meme, isOpen, onClose }: MemeModalProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/meme/${meme.id}`;
  const embedCode = `<iframe src="${shareUrl}/embed" width="500" height="400" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(type);
      setTimeout(() => setShowCopiedMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTruthShare = () => {
    const shareText = encodeURIComponent(meme.title);
    const shareUrl = encodeURIComponent(`${window.location.origin}/meme/${meme.id}`);
    window.open(`https://truthsocial.com/share?title=${shareText}&url=${shareUrl}`, '_blank', 'width=600,height=400');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="text-xl font-semibold">{meme.title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <img
            src={meme.image_url}
            alt={meme.title}
            className="w-full object-contain max-h-[70vh] rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {meme.tags.map((tag) => (
            <span
              key={tag}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Share2 size={20} />
            Share & Embed
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(shareUrl, 'link')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Link size={18} />
                  Copy Link
                </button>
                {showCopiedMessage === 'link' && (
                  <span className="text-green-600 text-sm">Copied!</span>
                )}
              </div>

              <button
                onClick={handleTruthShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-5 h-5"
                  viewBox="0 0 92 93"
                >
                  <path d="M69.444 55.716H56.772v10.37h12.672zM64.487 37.795V27.32H38.666v38.664h13.18v-28.19zM21.05 27.321h12.653v10.471H21.051z" />
                </svg>
                Share on Truth Social
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Code size={18} />
                <span className="font-medium">Embed Code</span>
                <button
                  onClick={() => handleCopy(embedCode, 'embed')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Copy
                </button>
                {showCopiedMessage === 'embed' && (
                  <span className="text-green-600 text-sm">Copied!</span>
                )}
              </div>
              <pre className="bg-gray-100 p-2 rounded-lg text-sm overflow-x-auto">
                {embedCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
