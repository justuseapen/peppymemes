import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { Meme } from '../types/meme';
import { useMemeStore } from '../store/useMemeStore';
import { MemeModal } from './MemeModal';
import { FavoriteButton } from './FavoriteButton';

interface MemeCardProps {
  meme: Meme;
}

export function MemeCard({ meme }: MemeCardProps) {
  const { toggleTag, selectedTags } = useMemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]">
        <div className="relative" onClick={() => setIsModalOpen(true)}>
          <img
            src={meme.image_url}
            alt={meme.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-2 right-2">
            <FavoriteButton
              memeId={meme.id}
              initialFavorited={meme.is_favorited}
              className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{meme.title}</h3>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {meme.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTag(tag);
                }}
                className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full ${selectedTags.includes(tag)
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-700'
                  }`}
              >
                <Tag size={14} />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <MemeModal
        meme={meme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
