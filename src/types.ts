export interface MicrostockMetadata {
  title: string;
  description: string;
  keywords: string;
}

export interface IdentifiedSpecies {
  commonName: string;
  scientificName: string;
  family?: string;
  conservationStatus?: string;
  confidence: 'High' | 'Medium' | 'Tentative';
}

export interface TechnicalDetails {
  lighting: string;
  composition: string;
  behavior: string;
  commercialConcepts: string[];
}

export interface ValidationStats {
  titleWordCount: number;
  isTitleValid: boolean; // 5 to 15 words
  descriptionWordCount: number;
  isDescriptionValid: boolean; // 25 to 50 words
  keywordCount: number;
  isKeywordCountValid: boolean; // 30 to 45 keywords
  keywordsList: string[];
}

export interface PlatformCompliance {
  shutterstock: {
    valid: boolean;
    recommendation: string;
  };
  adobeStock: {
    valid: boolean;
    topKeywords: string[];
    recommendation: string;
  };
  freepik: {
    valid: boolean;
    recommendation: string;
  };
}

export interface AnalysisResult {
  id: string;
  rawJson: MicrostockMetadata;
  species: IdentifiedSpecies;
  technical: TechnicalDetails;
  stats: ValidationStats;
  platformCompliance: PlatformCompliance;
  fileName: string;
  fileSize?: string;
  thumbnailUrl: string;
  timestamp: string;
  processingTimeMs: number;
}

export interface BatchItem {
  id: string;
  file?: File;
  fileName: string;
  fileSizeFormatted: string;
  thumbnailUrl: string;
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  progress: number;
  result?: AnalysisResult;
  error?: string;
  speciesHint?: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'trigger' | 'ai-vision' | 'prompt' | 'validator' | 'export';
  status: 'idle' | 'running' | 'success' | 'error';
  details: string;
}
