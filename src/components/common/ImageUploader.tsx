import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Upload Disaster Photo / Evidence',
  hint = 'Supports JPG, JPEG, PNG, WEBP up to 10MB. Used for AI Vision Triage.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setError(null);
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(15);

    // Simulate progressive upload with local preview creation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      }, 500);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setError('Failed to read image file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
          <span>{label}</span>
          {value && (
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> IMAGE ATTACHED
            </span>
          )}
        </label>
      )}

      {/* Upload Drop Zone / Preview Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !value && !isUploading && fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition-all p-4 text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-red-500 bg-red-500/10 scale-[1.01]'
            : value
            ? 'border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#121215]'
            : 'border-stone-300 dark:border-zinc-800 bg-stone-50/50 dark:bg-[#121215]/60 hover:border-stone-400 dark:hover:border-zinc-700 hover:bg-stone-100 dark:hover:bg-[#121215]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Uploading State Progress Bar */}
        {isUploading && (
          <div className="py-6 space-y-3">
            <RefreshCw className="w-6 h-6 text-red-600 dark:text-red-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                PROCESSING IMAGE ENCODING ({uploadProgress}%)
              </p>
              <div className="w-48 max-w-full mx-auto bg-stone-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 dark:bg-red-500 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Active Image Preview Mode */}
        {!isUploading && value && (
          <div className="relative group">
            <div className="relative rounded-lg overflow-hidden border border-stone-300 dark:border-zinc-700 max-h-56 bg-stone-900 flex items-center justify-center">
              <img
                src={value}
                alt="Uploaded evidence preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-90 transition-opacity flex flex-col justify-between p-3 text-left">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded bg-stone-900/80 text-stone-100 text-[10px] font-mono border border-stone-700">
                    {fileName || 'Disaster_Evidence_Photo.jpg'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-white text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">✓ Ready for AI Triage</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="underline text-stone-300 hover:text-white"
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Upload Prompt State */}
        {!isUploading && !value && (
          <div className="py-6 space-y-2">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
                Drag & drop disaster photo here, or <span className="text-red-600 dark:text-red-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                {hint}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-mono text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
