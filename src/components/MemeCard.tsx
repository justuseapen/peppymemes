import React from 'react';
import { Tag } from 'lucide-react';
import { Meme } from '../types/meme';
import { useMemeStore } from '../store/useMemeStore';

interface MemeCardProps {
  meme: Meme;
}

export function MemeCard({ meme }: MemeCardProps) {
  const { toggleTag, selectedTags } = useMemeStore();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={meme.imageUrl}
        alt={meme.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{meme.title}</h3>
        <div className="flex flex-wrap gap-2">
          {meme.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
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
  );
}
