import React, { useRef } from 'react';
import { Button } from './button';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (imageUrl: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  maxSize = 5000000,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      alert('Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }

    if (file.size > maxSize) {
      alert(`L'image doit faire moins de ${maxSize / 1000000}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 flex items-center justify-center bg-muted">
        {currentImage ? (
          <img
            src={currentImage}
            alt="Preview"
            className="max-h-48 object-contain"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Choisir une image
      </Button>
    </div>
  );
};