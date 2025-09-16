import React, { useRef } from 'react';
import { Button } from './button';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  onRemove,
  maxSize = 5000000,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
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

    onUpload(file);
    
    // Réinitialiser la valeur de l'input pour permettre le téléchargement du même fichier
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-muted hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={handleClick}
      >
        {currentImage ? (
          <div className="relative w-full">
            <img
              src={currentImage}
              alt="Preview"
              className="max-h-48 w-full object-contain rounded"
            />
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                Supprimer
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Cliquez pour télécharger ou glissez-déposez une image
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formats supportés: JPG, PNG, WebP (max {maxSize / 1000000}MB)
            </p>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
      />
    </div>
  );
};