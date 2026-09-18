import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AutomationNodeGraph } from './components/AutomationNodeGraph';
import { ImageUploader } from './components/ImageUploader';
import { BatchQueue } from './components/BatchQueue';
import { MetadataInspector } from './components/MetadataInspector';
import { N8nWorkflowModal } from './components/N8nWorkflowModal';
import { WebhookModal } from './components/WebhookModal';
import { BatchItem, AnalysisResult } from './types';
import { SampleWildlifeImage, SAMPLE_WILDLIFE_IMAGES } from './data/samples';
import { exportBatchToCsv } from './utils/csvExport';
import { Bird, Sparkles, Workflow, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<'idle' | 'ingesting' | 'analyzing' | 'validating' | 'ready'>('idle');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [speciesHint, setSpeciesHint] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [autoRun, setAutoRun] = useState(true);
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Selected item
  const selectedItem = queue.find((i) => i.id === selectedItemId) || queue[0];

  // Helper to read File into base64 Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper to process a single BatchItem
  const processBatchItem = async (item: BatchItem): Promise<AnalysisResult | null> => {
    try {
      setCurrentStage('analyzing');

      let payload: any = {
        fileName: item.fileName,
        speciesHint: speciesHint || item.speciesHint,
        focusArea,
      };

      if (item.file) {
        const base64 = await readFileAsDataUrl(item.file);
        payload.imageBase64 = base64;
      } else if (item.thumbnailUrl) {
        payload.imageUrl = item.thumbnailUrl;
      } else {
        throw new Error('No image data found.');
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      setCurrentStage('validating');
      const data = await res.json();
      const result: AnalysisResult = data.result;

      setCurrentStage('ready');
      return result;
    } catch (err: any) {
      console.error('Error processing item:', err);
      setCurrentStage('idle');
      throw err;
    }
  };

  // Handle files selected from dropzone or browse
  const handleFilesSelected = async (files: File[]) => {
    setCurrentStage('ingesting');

    const newItems: BatchItem[] = files.map((file) => ({
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      fileName: file.name,
      fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      thumbnailUrl: URL.createObjectURL(file),
      status: 'idle',
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newItems]);
    if (!selectedItemId && newItems.length > 0) {
      setSelectedItemId(newItems[0].id);
    }

    if (autoRun && newItems.length > 0) {
      // Process first item immediately or queue
      setTimeout(() => {
        runSingleItem(newItems[0]);
      }, 100);
    } else {
      setCurrentStage('idle');
    }
  };

  // Handle clicking one of the sample raptor photos
  const handleSampleSelected = async (sample: SampleWildlifeImage) => {
    setCurrentStage('ingesting');

    const newItem: BatchItem = {
      id: `sample-${Date.now()}-${sample.id}`,
      fileName: `${sample.title.toLowerCase().replace(/\s+/g, '_')}.jpg`,
      fileSizeFormatted: 'Sample HD',
      thumbnailUrl: sample.imageUrl,
      status: 'idle',
      progress: 0,
      speciesHint: sample.species,
    };

    setQueue((prev) => [newItem, ...prev]);
    setSelectedItemId(newItem.id);

    // Run analysis on this sample
    await runSingleItem(newItem);
  };

  const runSingleItem = async (targetItem: BatchItem) => {
    setQueue((prev) =>
      prev.map((i) => (i.id === targetItem.id ? { ...i, status: 'analyzing', error: undefined } : i))
    );

    try {
      const result = await processBatchItem(targetItem);
      if (result) {
        setQueue((prev) =>
          prev.map((i) => (i.id === targetItem.id ? { ...i, status: 'completed', result } : i))
        );
      }
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((i) =>
          i.id === targetItem.id ? { ...i, status: 'error', error: err.message } : i
        )
      );
    }
  };

  // Run all idle items in batch
  const handleRunBatch = async () => {
    setIsProcessingBatch(true);
    const idleItems = queue.filter((i) => i.status === 'idle' || i.status === 'error');

    for (const item of idleItems) {
      setSelectedItemId(item.id);
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'analyzing', error: undefined } : i))
      );

      try {
        const result = await processBatchItem(item);
        if (result) {
          setQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'completed', result } : i))
          );
        }
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'error', error: err.message } : i
          )
        );
      }
    }

    setIsProcessingBatch(false);
    setCurrentStage('ready');
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
    if (selectedItemId === id) {
      const remaining = queue.filter((i) => i.id !== id);
      setSelectedItemId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
    setSelectedItemId(null);
    setCurrentStage('idle');
  };

  const handleExportCsv = () => {
    exportBatchToCsv(queue);
  };

  const handleUpdateMetadata = (updatedResult: AnalysisResult) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === selectedItemId || (item.result && item.result.id === updatedResult.id)
          ? { ...item, result: updatedResult }
          : item
      )
    );
  };

  const completedItemsCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-gold-400 selection:text-brand-950">
      {/* Top Navigation */}
      <Header
        onOpenN8nModal={() => setIsN8nModalOpen(true)}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
        onExportBatchCsv={handleExportCsv}
        hasCompletedItems={completedItemsCount > 0}
        activeCount={completedItemsCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Automation Pipeline Node Graph */}
        <AutomationNodeGraph
          currentStage={currentStage}
          activeItemName={selectedItem?.fileName}
        />

        {/* Workspace 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Ingestion & Batch Queue (5 Cols on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Uploader Card */}
            <ImageUploader
              onFilesSelected={handleFilesSelected}
              onSampleSelected={handleSampleSelected}
              speciesHint={speciesHint}
              setSpeciesHint={setSpeciesHint}
              focusArea={focusArea}
              setFocusArea={setFocusArea}
              autoRun={autoRun}
              setAutoRun={setAutoRun}
              isProcessing={currentStage === 'analyzing'}
            />

            {/* Batch Queue Card */}
            <BatchQueue
              items={queue}
              selectedItemId={selectedItemId}
              onSelectItem={(id) => setSelectedItemId(id)}
              onRunBatch={handleRunBatch}
              onRemoveItem={handleRemoveItem}
              onClearQueue={handleClearQueue}
              onExportCsv={handleExportCsv}
              isProcessingBatch={isProcessingBatch}
            />
          </div>

          {/* Right Column: Metadata Inspector / Empty State (7 Cols on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedItem?.result ? (
              <MetadataInspector
                result={selectedItem.result}
                onUpdateMetadata={handleUpdateMetadata}
              />
            ) : selectedItem?.status === 'analyzing' ? (
              <div className="bg-white rounded-2xl p-12 border border-stone-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 animate-pulse">
                  <Bird className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Analyzing Wildlife & Raptors with Gemini 3.8 Flash
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    Verifying exact avian taxonomy, lighting, composition, and generating 30–45 microstock keywords...
                  </p>
                </div>
                <div className="w-48 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-500 h-1.5 rounded-full animate-indeterminate"></div>
                </div>
              </div>
            ) : selectedItem?.status === 'error' ? (
              <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-red-900">Processing Failed</h4>
                <p className="text-xs text-red-600 max-w-md mx-auto">
                  {selectedItem.error || 'Failed to analyze this image. Please ensure your Gemini API key has access.'}
                </p>
                <button
                  type="button"
                  onClick={() => runSingleItem(selectedItem)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            ) : (
              /* Fresh state prompt */
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-stone-200 shadow-sm text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-100 to-gold-100 text-brand-700 flex items-center justify-center mx-auto shadow-sm">
                  <Bird className="w-8 h-8 stroke-[2.2]" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-display text-xl font-semibold text-stone-900">
                    Ready for Microstock Wildlife Analysis
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Upload bird of prey or nature photos, or click any sample on the left to start the automated pipeline.
                    Strict compliance with <strong>Shutterstock, Adobe Stock, and Freepik</strong> specifications.
                  </p>
                </div>

                {/* Instant Action CTA */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    id="btn-empty-test-sample"
                    type="button"
                    onClick={() => handleSampleSelected(SAMPLE_WILDLIFE_IMAGES[0])}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-brand-200" />
                    <span>Test With Bald Eagle Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="btn-empty-open-n8n"
                    type="button"
                    onClick={() => setIsN8nModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <Workflow className="w-4 h-4 text-brand-600" />
                    <span>Explore n8n Integration</span>
                  </button>
                </div>

                {/* Microstock compliance checklist preview */}
                <div className="pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs text-stone-600">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <span className="font-semibold text-stone-900 block mb-1">5 to 15 Words Title</span>
                    <span className="text-[11px] text-stone-500">
                      Engaging, keyword-rich, highlighting behavior and natural environment.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <span className="font-semibold text-stone-900 block mb-1">25 to 50 Words Desc</span>
                    <span className="text-[11px] text-stone-500">
                      Details action, lighting, composition, and commercial viability.
                    </span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                    <span className="font-semibold text-stone-900 block mb-1">30 to 45 Keywords</span>
                    <span className="text-[11px] text-stone-500">
                      Scientific classification, common names, behavior, and buyer search terms.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <N8nWorkflowModal
        isOpen={isN8nModalOpen}
        onClose={() => setIsN8nModalOpen(false)}
      />

      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />
    </div>
  );
}
