import React from 'react';
import { X } from 'lucide-react';
import { Meme } from '../types/meme';

export interface DuplicateAlertProps {
  duplicateOf: Meme;
  onClose: () => void;
}

export function DuplicateAlert({ duplicateOf, onClose }: DuplicateAlertProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Duplicate Meme Found</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <p>
            A similar meme titled "{duplicateOf.title}" has already been uploaded.
          </p>
          <img
            src={duplicateOf.image_url}
            alt="Existing meme"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
