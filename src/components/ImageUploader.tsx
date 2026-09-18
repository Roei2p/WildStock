import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, SlidersHorizontal, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { SAMPLE_WILDLIFE_IMAGES, SampleWildlifeImage } from '../data/samples';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onSampleSelected: (sample: SampleWildlifeImage) => void;
  speciesHint: string;
  setSpeciesHint: (val: string) => void;
  focusArea: string;
  setFocusArea: (val: string) => void;
  autoRun: boolean;
  setAutoRun: (val: boolean) => void;
  isProcessing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFilesSelected,
  onSampleSelected,
  speciesHint,
  setSpeciesHint,
  focusArea,
  setFocusArea,
  autoRun,
  setAutoRun,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = '';
    }
  };

  return (
    <div id="image-uploader-section" className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-5">
      {/* Upload Dropzone */}
      <div
        id="dropzone-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[1.005]'
            : 'border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50'
        }`}
      >
        <input
          id="file-input-upload"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/tiff"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-3 shadow-sm shadow-brand-500/10">
          <Upload className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h4 className="font-display text-lg font-semibold text-stone-800 text-center">
          Drop wildlife or raptor photos here
        </h4>
        <p className="text-xs text-stone-500 text-center mt-1 max-w-sm">
          Supports single or batch upload (JPEG, PNG, WebP). Automatic species recognition & microstock keyword generation.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
          >
            Browse Files from Computer
          </button>
        </div>
      </div>

      {/* Instant Raptor & Wildlife Test Samples */}
      <div id="sample-raptors-carousel">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Instant Test Samples (Click to analyze):</span>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">Birds of Prey & Wildlife</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SAMPLE_WILDLIFE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              id={`btn-sample-${sample.id}`}
              type="button"
              disabled={isProcessing}
              onClick={() => onSampleSelected(sample)}
              className="group relative flex flex-col text-left rounded-xl overflow-hidden border border-stone-200 hover:border-brand-500 hover:shadow-md transition-all bg-stone-50 disabled:opacity-50"
            >
              <div className="h-20 w-full overflow-hidden bg-stone-200 relative">
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  crossOrigin="anonymous"
                  loading="lazy"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-medium text-white">
                  Sample
                </span>
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between">
                <div className="text-xs font-semibold text-stone-800 line-clamp-1 group-hover:text-brand-600">
                  {sample.title}
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5">
                  {sample.species}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Automation Parameters */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            id="btn-toggle-advanced-params"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Workflow Fine-Tuning & Metadata Hints</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Auto-run toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-600 font-medium">
            <span>Auto-run on file select</span>
            <input
              type="checkbox"
              id="checkbox-autorun"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-stone-300 cursor-pointer accent-brand-600"
            />
          </label>
        </div>

        {showAdvanced && (
          <div id="advanced-params-panel" className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 animate-in fade-in duration-150">
            <div>
              <label htmlFor="input-species-hint" className="block text-xs font-medium text-stone-700 mb-1">
                Optional Species Clue / Subspecies:
              </label>
              <input
                id="input-species-hint"
                type="text"
                value={speciesHint}
                onChange={(e) => setSpeciesHint(e.target.value)}
                placeholder="e.g. Haliaeetus leucocephalus, Juvenile Bald Eagle"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Assists the AI if the specimen has ambiguous juvenile plumage.
              </span>
            </div>

            <div>
              <label htmlFor="input-focus-area" className="block text-xs font-medium text-stone-700 mb-1">
                Commercial Priority & Action Focus:
              </label>
              <input
                id="input-focus-area"
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g. Soaring flight, Hunting talons, Eye contact portrait"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Guides keyword prioritization for high-converting commercial themes.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
