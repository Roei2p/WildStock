import React from 'react';
import { Layers, Play, CheckCircle, AlertCircle, Loader2, Trash2, Download, FileText, Check } from 'lucide-react';
import { BatchItem } from '../types';

interface BatchQueueProps {
  items: BatchItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onRunBatch: () => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onExportCsv: () => void;
  isProcessingBatch: boolean;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onRunBatch,
  onRemoveItem,
  onClearQueue,
  onExportCsv,
  isProcessingBatch,
}) => {
  if (items.length === 0) {
    return null;
  }

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const pendingCount = items.filter((i) => i.status === 'idle').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  return (
    <div id="batch-queue-container" className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              Batch Processing Queue ({items.length})
              {completedCount > 0 && (
                <span className="text-xs font-normal text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                  {completedCount} Done
                </span>
              )}
            </h4>
            <p className="text-xs text-stone-500">
              {pendingCount > 0
                ? `${pendingCount} awaiting automated stock analysis`
                : 'All photos analyzed and ready for agency submission'}
            </p>
          </div>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              id="btn-run-batch-queue"
              type="button"
              disabled={isProcessingBatch}
              onClick={onRunBatch}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isProcessingBatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Process Queue ({pendingCount})</span>
                </>
              )}
            </button>
          )}

          {completedCount > 0 && (
            <button
              id="btn-export-batch-csv"
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              title="Download full CSV compatible with Adobe Stock, Shutterstock, Freepik"
            >
              <Download className="w-3.5 h-3.5 text-brand-600" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            id="btn-clear-queue"
            type="button"
            disabled={isProcessingBatch}
            onClick={onClearQueue}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
            title="Clear Queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue items horizontal / grid scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;

          return (
            <div
              key={item.id}
              id={`batch-item-${item.id}`}
              onClick={() => onSelectItem(item.id)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/40 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/40 hover:bg-stone-50'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0 relative">
                <img
                  src={item.thumbnailUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
                {item.status === 'analyzing' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-stone-800 truncate">
                  {item.fileName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-700 bg-brand-100/60 px-1.5 py-0.2 rounded">
                      <Check className="w-2.5 h-2.5" />
                      {item.result?.species.commonName || 'Done'}
                    </span>
                  )}
                  {item.status === 'analyzing' && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      AI Analyzing...
                    </span>
                  )}
                  {item.status === 'idle' && (
                    <span className="text-[10px] text-stone-400 font-medium">
                      Queued
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-[10px] text-red-600 font-medium truncate">
                      Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="text-stone-300 hover:text-stone-500 p-1 rounded-md hover:bg-stone-100 transition-colors"
                title="Remove from queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
