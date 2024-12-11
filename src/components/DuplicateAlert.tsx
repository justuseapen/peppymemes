import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Meme } from '../types/meme';

interface DuplicateAlertProps {
  duplicateOf: Meme;
  onClose: () => void;
}

export function DuplicateAlert({ duplicateOf, onClose }: DuplicateAlertProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-semibold">Duplicate Detected</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          This meme has already been uploaded as "{duplicateOf.title}" by {duplicateOf.creator}. 
          Duplicate uploads are not allowed to maintain content quality.
        </p>
        
        <div className="mb-4">
          <img
            src={duplicateOf.imageUrl}
            alt="Existing meme"
            className="w-full h-48 object-cover rounded"
          />
        </div>
        
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}