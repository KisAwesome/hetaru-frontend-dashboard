'use client';
import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons'; // Or import { CloudUpload } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        onImageSelect(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full h-full">
      <label
        htmlFor="image-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          group relative flex flex-col items-center justify-center w-full h-64 md:h-full min-h-[350px]
          border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all duration-300
          
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[0.99] ring-4 ring-primary/10' 
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-primary/50 dark:hover:border-primary/50'
          }
        `}
      >
        {previewUrl ? (
          // Preview State
          <div className="relative w-full h-full">
             <img src={previewUrl} alt="Preview" className="object-cover w-full h-full opacity-90 transition-opacity group-hover:opacity-100" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                 Click to change image
               </p>
             </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            
            {/* Icon Circle */}
            <div className={`
              p-4 rounded-full transition-all duration-300 
              ${isDragging ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:scale-110 group-hover:text-primary group-hover:bg-primary/10'}
            `}>
              <UploadIcon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">
                Upload your meal
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Drag and drop or click to browse files
              </p>
            </div>

            {/* File Type Badge */}
            <div className="pt-2">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                JPG, PNG, WEBP (Max 10MB)
              </span>
            </div>
          </div>
        )}
      </label>
      
      <input
        id="image-upload"
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;