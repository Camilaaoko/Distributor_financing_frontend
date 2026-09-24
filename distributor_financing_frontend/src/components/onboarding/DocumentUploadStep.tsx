'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { DOCUMENT_CATEGORIES, validateFile, getDocumentConfigById } from '@/components/onboarding/constants/documentConfig';
import type { DocumentUpload } from '@/services/onboarding.service';

interface DocumentUploadStepProps {
  documents: DocumentUpload[];
  formErrors: Record<string, string>;
  handleDocumentChange: (docId: string, updates: Partial<DocumentUpload>) => void;
  handleFileUpload: (docId: string, file: File) => void;
  handleFileRemove: (docId: string) => void;
}

export function DocumentUploadStep({
  documents,
  formErrors,
  handleDocumentChange,
  handleFileUpload,
  handleFileRemove,
}: DocumentUploadStepProps) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, docId: string) => {
    e.preventDefault();
    setDragOver(docId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, docId: string) => {
    e.preventDefault();
    if (dragOver === docId) setDragOver(null);
  }, [dragOver]);

  const handleDrop = useCallback(
    (e: React.DragEvent, docId: string) => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(docId, file);
      }
    },
    [handleFileUpload]
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-[#1F4DA8]">
          Upload the required compliance and verification documents. Supported formats: PDF, Word (DOC/DOCX), JPG, PNG (Max 10 MB per file).
        </p>
      </div>

      {formErrors.documents && (
        <div className="text-sm font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
          {formErrors.documents}
        </div>
      )}

      {DOCUMENT_CATEGORIES.map((category) => (
        <div key={category.id} className="p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div>
              <h4 className="text-sm font-semibold text-[#1E293B]">{category.title}</h4>
              <p className="text-xs text-[#64748B] mt-0.5">{category.description}</p>
            </div>
            <span className="text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full">
              {category.documents.filter((d) => d.required).length} Required
            </span>
          </div>

          <div className="space-y-3">
            {category.documents.map((docConfig) => {
              const doc = documents.find((d) => d.id === docConfig.id);
              const isUploaded = doc?.status === 'uploaded';
              const isUploading = doc?.status === 'uploading';
              const hasError = doc?.status === 'error';
              const fileError = formErrors[docConfig.id];

              return (
                <div
                  key={docConfig.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    dragOver === docConfig.id
                      ? 'border-[#1F4DA8] bg-blue-50/50'
                      : fileError
                      ? 'border-red-200 bg-red-50/30'
                      : isUploaded
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-[#E2E8F0] hover:border-[#1F4DA8]/40 bg-[#F7F9FC]'
                  }`}
                  onDragOver={(e) => handleDragOver(e, docConfig.id)}
                  onDragLeave={(e) => handleDragLeave(e, docConfig.id)}
                  onDrop={(e) => handleDrop(e, docConfig.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                          isUploaded
                            ? 'bg-emerald-100 text-emerald-600'
                            : fileError
                            ? 'bg-red-100 text-red-600'
                            : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[#1E293B] truncate">{docConfig.label}</p>
                          {docConfig.required ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] truncate mt-0.5">{docConfig.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUploading && (
                        <div className="flex items-center gap-1.5 text-xs text-[#1F4DA8] font-medium">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading…</span>
                        </div>
                      )}

                      {isUploaded && doc && (
                        <button
                          type="button"
                          onClick={() => handleFileRemove(docConfig.id)}
                          className="text-[#64748B] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${docConfig.label}`}
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}

                      {!isUploaded && !isUploading && (
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F4DA8] bg-white border border-[#E2E8F0] rounded-lg cursor-pointer hover:bg-blue-50 transition-colors shadow-2xs">
                          <Upload className="h-3.5 w-3.5" />
                          Choose File
                          <input
                            type="file"
                            accept={docConfig.acceptedTypes.join(',')}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(docConfig.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {doc?.fileName && (
                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-mono text-[#1E293B] truncate max-w-[260px]">{doc.fileName}</span>
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-xs text-red-600 font-medium mt-2" role="alert">
                      {fileError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}