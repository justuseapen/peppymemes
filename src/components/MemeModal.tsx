import React, { useState, useEffect } from 'react';
import { X, Share2, Link, Code, Eye, Download, Heart } from 'lucide-react';
import { Meme, MemeStats, StatType } from '../types/meme';
import { FavoriteButton } from './FavoriteButton';
import { statsService } from '../services/statsService';

interface MemeModalProps {
  meme: Meme;
  isOpen: boolean;
  onClose: () => void;
}

const defaultStats: MemeStats = {
  view_count: 0,
  favorite_count: 0,
  share_count: 0,
  download_count: 0
};

export function MemeModal({ meme, isOpen, onClose }: MemeModalProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<MemeStats>({
    view_count: meme.view_count ?? 0,
    favorite_count: meme.favorite_count ?? 0,
    share_count: meme.share_count ?? 0,
    download_count: meme.download_count ?? 0
  });

  useEffect(() => {
    if (isOpen) {
      // Increment view count when modal opens
      statsService.incrementStat(meme.id, 'view');
    }
  }, [isOpen, meme.id]);

  useEffect(() => {
    // Update stats periodically while modal is open
    if (!isOpen) return;

    const updateStats = async () => {
      try {
        const newStats = await statsService.getStats(meme.id);
        setStats(newStats);
      } catch (err) {
        console.error('Error updating stats:', err);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [isOpen, meme.id]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/meme/${meme.id}`;
  const embedCode = `<iframe src="${shareUrl}/embed" width="500" height="400" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(type);
      setTimeout(() => setShowCopiedMessage(null), 2000);
      await statsService.incrementStat(meme.id, 'share');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTruthShare = async () => {
    const shareText = encodeURIComponent(meme.title);
    const shareUrl = encodeURIComponent(`${window.location.origin}/meme/${meme.id}`);
    window.open(`https://truthsocial.com/share?title=${shareText}&url=${shareUrl}`, '_blank', 'width=600,height=400');
    await statsService.incrementStat(meme.id, 'share');
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(meme.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meme.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      await statsService.incrementStat(meme.id, 'download');
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 md:px-6"
      onClick={onClose}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Safe area aware header */}
        <div
          className="flex justify-between items-center border-b sticky top-0 bg-white rounded-t-lg"
          style={{
            paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
            paddingBottom: '0.75rem'
          }}
        >
          <h3 id="modal-title" className="text-lg font-semibold truncate pr-4 leading-tight">{meme.title}</h3>
          <div className="flex items-center gap-2">
            <FavoriteButton
              memeId={meme.id}
              initialFavorited={meme.is_favorited}
              className="touch-manipulation"
            />
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1 -m-1 text-gray-500 hover:text-gray-700 touch-manipulation"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <img
              src={meme.image_url}
              alt={meme.title}
              className="w-full object-contain rounded-lg"
              style={{
                maxHeight: '60vh',
                WebkitTouchCallout: 'none'
              }}
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye size={16} />
              <span>{stats.view_count.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Heart size={16} />
              <span>{stats.favorite_count.toLocaleString()} favorites</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Download size={16} />
              <span>{stats.download_count.toLocaleString()} downloads</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {meme.tags.map((tag) => (
              <span
                key={tag}
                className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-sm select-none"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="border-t pt-3">
            <h4 className="text-base font-semibold mb-2 flex items-center gap-1.5">
              <Share2 size={18} />
              Share & Download
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(shareUrl, 'link')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <Link size={16} />
                    Copy Link
                  </button>
                  {showCopiedMessage === 'link' && (
                    <span className="text-green-600 text-sm">Copied!</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors text-sm touch-manipulation"
                  >
                    <Download size={16} />
                    Download
                  </button>

                  <button
                    onClick={handleTruthShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors justify-center text-sm touch-manipulation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="w-4 h-4"
                      viewBox="0 0 92 93"
                    >
                      <path d="M69.444 55.716H56.772v10.37h12.672zM64.487 37.795V27.32H38.666v38.664h13.18v-28.19zM21.05 27.321h12.653v10.471H21.051z" />
                    </svg>
                    Share on Truth Social
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Code size={16} />
                  <span className="text-sm font-medium">Embed Code</span>
                  <button
                    onClick={() => handleCopy(embedCode, 'embed')}
                    className="text-sm text-green-600 hover:text-green-700 active:text-green-800 touch-manipulation"
                  >
                    Copy
                  </button>
                  {showCopiedMessage === 'embed' && (
                    <span className="text-green-600 text-sm">Copied!</span>
                  )}
                </div>
                <pre className="bg-gray-100 p-2 rounded-lg text-xs overflow-x-auto select-all">
                  {embedCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
