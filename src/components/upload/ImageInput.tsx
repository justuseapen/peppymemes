import React from 'react';

interface ImageInputProps {
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function ImageInput({ disabled, onChange }: ImageInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Image
      </label>
      <input
        type="file"
        name="image"
        accept="image/*"
        required
        disabled={disabled}
        onChange={onChange}
        className="mt-1 block w-full"
      />
    </div>
  );
}