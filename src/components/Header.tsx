import React from 'react';
import { Bird, Workflow, Terminal, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenN8nModal: () => void;
  onOpenWebhookModal: () => void;
  onExportBatchCsv: () => void;
  hasCompletedItems: boolean;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenN8nModal,
  onOpenWebhookModal,
  onExportBatchCsv,
  hasCompletedItems,
  activeCount,
}) => {
  return (
    <header id="main-header" className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-gold-500 flex items-center justify-center text-white shadow-sm shadow-brand-900/30">
            <Bird className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-xl tracking-tight text-stone-900">WildStock</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                Microstock AI
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Raptor & Wildlife Metadata Automation
            </p>
          </div>
        </div>

        {/* Engine status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs font-medium text-stone-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span>Gemini 3.8 Flash Vision</span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500">Stock Platforms: Adobe • Shutterstock • Freepik</span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-n8n-modal"
            onClick={onOpenN8nModal}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 transition-colors"
            title="View & Download n8n Workflow"
          >
            <Workflow className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">n8n Automation</span>
          </button>

          <button
            id="btn-open-webhook-modal"
            onClick={onOpenWebhookModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 transition-colors"
            title="Webhook / API endpoint details"
          >
            <Terminal className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">API Webhook</span>
          </button>

          {hasCompletedItems && (
            <button
              id="btn-header-export-csv"
              onClick={onExportBatchCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV ({activeCount})</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
