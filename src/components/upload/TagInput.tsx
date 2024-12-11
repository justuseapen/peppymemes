import React from 'react';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TagInput({ value, onChange, disabled }: TagInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Tags (comma separated)
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="funny, meme, cats"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
      />
    </div>
  );
}