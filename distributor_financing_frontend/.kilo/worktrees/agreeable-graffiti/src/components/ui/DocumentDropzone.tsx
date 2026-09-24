'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export interface DocumentDropzoneProps {
  label: string;
  hint?: string;
  required?: boolean;
  file: File | null;
  existingUrl?: string;
  existingFileName?: string;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  isUploading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function DocumentDropzone({
  label,
  hint = 'PDF, PNG, JPG up to 10MB',
  required = false,
  file,
  existingUrl,
  existingFileName,
  onFileSelect,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
  isUploading = false,
  disabled = false,
  error,
}: DocumentDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleValidateAndSelect = useCallback(
    (selectedFile: File) => {
      setLocalError(null);

      // Check max size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxBytes) {
        setLocalError(`File exceeds maximum size of ${maxSizeMB}MB.`);
        return;
      }

      // Check extension
      const acceptedExts = accept
        .split(',')
        .map((ext) => ext.trim().toLowerCase().replace('.', ''));
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || '';

      if (acceptedExts.length > 0 && !acceptedExts.includes(fileExt)) {
        setLocalError(`Invalid file format. Accepted formats: ${accept}`);
        return;
      }

      onFileSelect(selectedFile);
    },
    [accept, maxSizeMB, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleValidateAndSelect(droppedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleValidateAndSelect(selected);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeError = error || localError;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label={label}
      />

      {/* When a file is selected or already exists */}
      {file ? (
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-white border border-blue-100 text-[#1F4DA8] shrink-0">
              <FileCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">{file.name}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{formatFileSize(file.size)}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ready for upload
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Remove document"
          >
            <X size={16} />
          </button>
        </div>
      ) : existingUrl ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">
                {existingFileName || 'Attached Document'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Document on file
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#1F4DA8] bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ExternalLink size={12} /> View
            </a>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        /* Empty Drag & Drop Zone */
        <div
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-[#1F4DA8] bg-blue-50/70 scale-[0.99]'
              : activeError
              ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/60'
              : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
          } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div
              className={`p-2.5 rounded-full ${
                isDragOver ? 'bg-blue-100 text-[#1F4DA8]' : 'bg-white text-slate-400 border border-slate-200'
              }`}
            >
              <Upload size={18} />
            </div>
            <div className="text-xs font-semibold text-slate-700">
              <span className="text-[#1F4DA8] font-bold hover:underline">Click to browse</span> or drag and drop
            </div>
            <p className="text-[10px] text-slate-400">
              Supported: PDF, JPG, PNG (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}

      {activeError && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 mt-1">
          <AlertCircle size={13} className="shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}

