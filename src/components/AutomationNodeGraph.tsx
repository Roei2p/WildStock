import React, { useState } from 'react';
import { Workflow, Eye, ShieldCheck, ArrowRight, Check, Sparkles, FileText, Share2, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface AutomationNodeGraphProps {
  currentStage: 'idle' | 'ingesting' | 'analyzing' | 'validating' | 'ready';
  activeItemName?: string;
}

export const AutomationNodeGraph: React.FC<AutomationNodeGraphProps> = ({
  currentStage,
  activeItemName,
}) => {
  const [showGuidelines, setShowGuidelines] = useState(false);

  const nodes = [
    {
      id: 'node-trigger',
      title: '1. Ingest Trigger',
      subtitle: 'Upload / Webhook / Batch',
      icon: Workflow,
      active: currentStage === 'ingesting',
      done: currentStage === 'analyzing' || currentStage === 'validating' || currentStage === 'ready',
    },
    {
      id: 'node-vision',
      title: '2. Gemini 3.8 Vision',
      subtitle: 'Raptor Identification',
      icon: Eye,
      active: currentStage === 'analyzing',
      done: currentStage === 'validating' || currentStage === 'ready',
    },
    {
      id: 'node-prompt',
      title: '3. Microstock Prompt',
      subtitle: 'Title • Desc • 30-45 Keys',
      icon: Sparkles,
      active: currentStage === 'analyzing',
      done: currentStage === 'validating' || currentStage === 'ready',
    },
    {
      id: 'node-validator',
      title: '4. Rule Validation',
      subtitle: '5-15w • 25-50w • Stock QA',
      icon: ShieldCheck,
      active: currentStage === 'validating',
      done: currentStage === 'ready',
    },
    {
      id: 'node-export',
      title: '5. Multi-Agency Export',
      subtitle: 'Adobe • Shutter • Freepik • CSV',
      icon: Share2,
      active: currentStage === 'ready',
      done: currentStage === 'ready',
    },
  ];

  return (
    <div id="automation-pipeline-container" className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm relative overflow-hidden">
      {/* Background subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              n8n-Compatible Automation Pipeline
              {currentStage !== 'idle' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Processing {activeItemName || 'Photo'}
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              Deterministic wildlife species verification & microstock metadata generation
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-pipeline-rules"
          onClick={() => setShowGuidelines(!showGuidelines)}
          className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Prompt Guidelines</span>
          {showGuidelines ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Interactive Node Graph */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative z-10">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <React.Fragment key={node.id}>
              <div
                id={node.id}
                className={`flex flex-col p-3 rounded-xl border transition-all duration-300 relative ${
                  node.active
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-lg shadow-emerald-950/50'
                    : node.done
                    ? 'bg-zinc-800/60 border-zinc-700/80 text-zinc-200'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      node.active
                        ? 'bg-emerald-500 text-zinc-950 animate-pulse'
                        : node.done
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {node.done ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    {node.active ? 'Running' : node.done ? 'Verified' : 'Ready'}
                  </span>
                </div>
                <div className="font-semibold text-xs text-zinc-100">{node.title}</div>
                <div className="text-[11px] text-zinc-400 truncate">{node.subtitle}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Collapsible Guidelines Box */}
      {showGuidelines && (
        <div id="pipeline-guidelines-box" className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-300 space-y-2 relative z-10 animate-in fade-in duration-200">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Exact Target Validation Criteria Configured:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="space-y-1">
              <span className="text-emerald-400 font-semibold font-mono">1. Title: 5 to 15 Words</span>
              <p className="text-zinc-400 text-[11px]">
                Highlights subject, exact species behavior (soaring, perched, hunting), and environment in professional English.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-emerald-400 font-semibold font-mono">2. Description: 25 to 50 Words</span>
              <p className="text-zinc-400 text-[11px]">
                Explains subject, action, lighting conditions, photographic composition, and high commercial potential.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-emerald-400 font-semibold font-mono">3. Keywords: 30 to 45 Items</span>
              <p className="text-zinc-400 text-[11px]">
                Scientific genus/species, common names, behavior, environment, lighting, and buyer search terms (predator, wilderness, freedom).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
