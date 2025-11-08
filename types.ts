
export interface ImageSlot {
  id: number;
  file: File | null;
  base64: string | null;
  isSelected: boolean;
}

export type SeparationMode = 'basic' | 'detailed';

export interface Result {
  id: number;
  inputImage: string;
  outputImage: string | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}
