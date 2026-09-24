import type { DocumentUpload } from '@/services/onboarding.service';

export type DocumentCategoryId =
  | 'banking_documents'
  | 'business_documents'
  | 'director_kyc_documents'
  | 'manufacturer_documents';

export interface DocumentConfig {
  id: string;
  label: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
  maxSizeMB: number;
}

export interface DocumentCategoryConfig {
  id: DocumentCategoryId;
  title: string;
  description: string;
  documents: DocumentConfig[];
}

export const DOCUMENT_CATEGORIES: DocumentCategoryConfig[] = [
  {
    id: 'banking_documents',
    title: 'Banking Documents',
    description: 'Bank account verification documents',
    documents: [
      {
        id: 'bank_statement',
        label: 'Bank Statement (1 Year)',
        description: 'Recent 1-year bank statement for account verification',
        required: true,
        acceptedTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
        maxSizeMB: 10,
      },
      {
        id: 'national_id_copy',
        label: 'Copy of National ID',
        description: 'Clear front and back copy of Director / Signatory National ID card',
        required: true,
        acceptedTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
        maxSizeMB: 10,
      },
    ],
  },
];

export function getAllDocumentConfigs(): DocumentConfig[] {
  return DOCUMENT_CATEGORIES.flatMap((cat) => cat.documents);
}

export function getRequiredDocumentCount(): number {
  return getAllDocumentConfigs().filter((d) => d.required).length;
}

export function getDocumentConfigById(id: string): DocumentConfig | undefined {
  return getAllDocumentConfigs().find((d) => d.id === id);
}

export function createInitialDocuments(): DocumentUpload[] {
  return getAllDocumentConfigs().map((config) => {
    const category = DOCUMENT_CATEGORIES.find((c) =>
      c.documents.some((d) => d.id === config.id)
    );
    return {
      id: config.id,
      category: category?.id ?? 'banking_documents',
      documentType: config.label,
      fileName: '',
      fileSize: 0,
      fileType: '',
      status: 'pending' as const,
      required: config.required,
    };
  });
}

export function validateFile(file: File, config: DocumentConfig): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!config.acceptedTypes.includes(ext)) {
    return `Unsupported file type. Please upload ${config.acceptedTypes.join(', ')}.`;
  }
  if (file.size > config.maxSizeMB * 1024 * 1024) {
    return `File is too large. Maximum allowed size is ${config.maxSizeMB} MB.`;
  }
  return null;
}