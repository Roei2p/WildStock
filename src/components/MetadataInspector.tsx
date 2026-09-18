import React, { useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Tag,
  Share2,
  Layers,
  Plus,
  X,
  Compass,
  Zap,
  Info,
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface MetadataInspectorProps {
  result: AnalysisResult;
  onUpdateMetadata?: (updated: AnalysisResult) => void;
}

export const MetadataInspector: React.FC<MetadataInspectorProps> = ({
  result,
  onUpdateMetadata,
}) => {
  const [activeTab, setActiveTab] = useState<'microstock' | 'raw-json' | 'platforms'>('microstock');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'species' | 'behavior' | 'concepts'>('all');

  // Copy helper
  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Keyword modification
  const handleRemoveKeyword = (indexToRemove: number) => {
    if (!onUpdateMetadata) return;
    const currentList = [...result.stats.keywordsList];
    currentList.splice(indexToRemove, 1);
    const updatedKeywordsStr = currentList.join(', ');
    onUpdateMetadata({
      ...result,
      rawJson: {
        ...result.rawJson,
        keywords: updatedKeywordsStr,
      },
      stats: {
        ...result.stats,
        keywordCount: currentList.length,
        isKeywordCountValid: currentList.length >= 30 && currentList.length <= 45,
        keywordsList: currentList,
      },
    });
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim() || !onUpdateMetadata) return;
    const currentList = [...result.stats.keywordsList, newKeywordInput.trim()];
    const updatedKeywordsStr = currentList.join(', ');
    onUpdateMetadata({
      ...result,
      rawJson: {
        ...result.rawJson,
        keywords: updatedKeywordsStr,
      },
      stats: {
        ...result.stats,
        keywordCount: currentList.length,
        isKeywordCountValid: currentList.length >= 30 && currentList.length <= 45,
        keywordsList: currentList,
      },
    });
    setNewKeywordInput('');
  };

  const handleTitleChange = (newTitle: string) => {
    if (!onUpdateMetadata) return;
    const words = newTitle.trim().split(/\s+/).filter(Boolean).length;
    onUpdateMetadata({
      ...result,
      rawJson: {
        ...result.rawJson,
        title: newTitle,
      },
      stats: {
        ...result.stats,
        titleWordCount: words,
        isTitleValid: words >= 5 && words <= 15,
      },
    });
  };

  const handleDescriptionChange = (newDesc: string) => {
    if (!onUpdateMetadata) return;
    const words = newDesc.trim().split(/\s+/).filter(Boolean).length;
    onUpdateMetadata({
      ...result,
      rawJson: {
        ...result.rawJson,
        description: newDesc,
      },
      stats: {
        ...result.stats,
        descriptionWordCount: words,
        isDescriptionValid: words >= 25 && words <= 50,
      },
    });
  };

  // Exact raw JSON string requested by user prompt
  const rawJsonFormatted = JSON.stringify(result.rawJson, null, 2);

  // Filter keywords
  const filteredKeywords = result.stats.keywordsList.filter((kw) => {
    if (keywordFilter === 'species') {
      return (
        kw.includes(' ') ||
        kw.toLowerCase().includes('eagle') ||
        kw.toLowerCase().includes('falcon') ||
        kw.toLowerCase().includes('hawk') ||
        kw.toLowerCase().includes('owl') ||
        kw.toLowerCase().includes('raptor') ||
        kw.toLowerCase().includes('bird')
      );
    }
    if (keywordFilter === 'behavior') {
      return (
        kw.toLowerCase().includes('flight') ||
        kw.toLowerCase().includes('soar') ||
        kw.toLowerCase().includes('hunt') ||
        kw.toLowerCase().includes('perch') ||
        kw.toLowerCase().includes('wing') ||
        kw.toLowerCase().includes('talon')
      );
    }
    if (keywordFilter === 'concepts') {
      return (
        kw.toLowerCase().includes('predator') ||
        kw.toLowerCase().includes('wilderness') ||
        kw.toLowerCase().includes('nature') ||
        kw.toLowerCase().includes('freedom') ||
        kw.toLowerCase().includes('power') ||
        kw.toLowerCase().includes('wildlife')
      );
    }
    return true;
  });

  return (
    <div id="metadata-inspector-card" className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden space-y-0">
      {/* Top Banner with Image preview & identified Species */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700 shadow-sm relative group">
            <img
              src={result.thumbnailUrl}
              alt={result.fileName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-white tracking-tight">
                {result.species.commonName}
              </span>
              <span className="text-xs italic text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                {result.species.scientificName}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
              <span>{result.fileName}</span>
              <span>•</span>
              <span>Processed in {(result.processingTimeMs / 1000).toFixed(2)}s</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{result.technical.behavior}</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60 self-stretch sm:self-auto justify-center">
          <button
            id="tab-microstock-view"
            type="button"
            onClick={() => setActiveTab('microstock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'microstock'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio Metadata</span>
          </button>

          <button
            id="tab-raw-json-view"
            type="button"
            onClick={() => setActiveTab('raw-json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'raw-json'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON Prompt Output</span>
          </button>

          <button
            id="tab-platforms-view"
            type="button"
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'platforms'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Stock Agency Formats</span>
          </button>
        </div>
      </div>

      {/* Validation Checklist Strip */}
      <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Title target */}
          <div className="flex items-center gap-1.5 font-medium">
            {result.stats.isTitleValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-zinc-600">Title Words:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                result.stats.isTitleValid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {result.stats.titleWordCount} (Target: 5–15)
            </span>
          </div>

          {/* Description target */}
          <div className="flex items-center gap-1.5 font-medium">
            {result.stats.isDescriptionValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-zinc-600">Description Words:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                result.stats.isDescriptionValid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {result.stats.descriptionWordCount} (Target: 25–50)
            </span>
          </div>

          {/* Keywords target */}
          <div className="flex items-center gap-1.5 font-medium">
            {result.stats.isKeywordCountValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-zinc-600">Keywords:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                result.stats.isKeywordCountValid
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {result.stats.keywordCount} tags (Target: 30–45)
            </span>
          </div>
        </div>

        {/* Quick Raw Copy */}
        <button
          id="btn-quick-copy-json"
          type="button"
          onClick={() => handleCopy(rawJsonFormatted, 'raw-json-top')}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-emerald-700 transition-colors"
        >
          {copiedKey === 'raw-json-top' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied JSON!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Raw JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-5 sm:p-6">
        {/* TAB 1: STUDIO METADATA */}
        {activeTab === 'microstock' && (
          <div className="space-y-6">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <span>Stock Photography Title</span>
                  <span className="text-zinc-400 font-normal lowercase">(5 to 15 words)</span>
                </label>
                <button
                  id="btn-copy-title"
                  type="button"
                  onClick={() => handleCopy(result.rawJson.title, 'title')}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'title' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'title' ? 'Copied' : 'Copy Title'}</span>
                </button>
              </div>

              <textarea
                id="textarea-title"
                rows={2}
                value={result.rawJson.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-sm font-medium text-zinc-900 bg-zinc-50/50 p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <span>Stock Description</span>
                  <span className="text-zinc-400 font-normal lowercase">(25 to 50 words)</span>
                </label>
                <button
                  id="btn-copy-description"
                  type="button"
                  onClick={() => handleCopy(result.rawJson.description, 'description')}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-emerald-600 transition-colors"
                >
                  {copiedKey === 'description' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'description' ? 'Copied' : 'Copy Description'}</span>
                </button>
              </div>

              <textarea
                id="textarea-description"
                rows={3}
                value={result.rawJson.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="w-full text-sm text-zinc-800 bg-zinc-50/50 p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Keywords Section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Stock Keywords ({result.stats.keywordCount} tags)
                  </label>
                  {/* Category filter pills */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-[11px] font-medium text-zinc-600">
                    <button
                      type="button"
                      onClick={() => setKeywordFilter('all')}
                      className={`px-2 py-0.5 rounded-md ${
                        keywordFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : ''
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeywordFilter('species')}
                      className={`px-2 py-0.5 rounded-md ${
                        keywordFilter === 'species' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : ''
                      }`}
                    >
                      Species
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeywordFilter('behavior')}
                      className={`px-2 py-0.5 rounded-md ${
                        keywordFilter === 'behavior' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : ''
                      }`}
                    >
                      Behavior
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeywordFilter('concepts')}
                      className={`px-2 py-0.5 rounded-md ${
                        keywordFilter === 'concepts' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : ''
                      }`}
                    >
                      Commercial
                    </button>
                  </div>
                </div>

                {/* Bulk Copy formats */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-keywords-comma"
                    type="button"
                    onClick={() => handleCopy(result.rawJson.keywords, 'comma-kw')}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors"
                  >
                    {copiedKey === 'comma-kw' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Comma-Separated</span>
                  </button>

                  <button
                    id="btn-copy-keywords-space"
                    type="button"
                    onClick={() =>
                      handleCopy(result.stats.keywordsList.join(' '), 'space-kw')
                    }
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 transition-colors"
                  >
                    {copiedKey === 'space-kw' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Space-Separated</span>
                  </button>
                </div>
              </div>

              {/* Keyword chips with remove ability */}
              <div className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200 flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                {filteredKeywords.map((kw, idx) => {
                  const isTop5 = idx < 5;
                  return (
                    <span
                      key={`${kw}-${idx}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isTop5
                          ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300/80 font-semibold'
                          : 'bg-white text-zinc-700 border border-zinc-200 shadow-xs'
                      }`}
                    >
                      <span>{kw}</span>
                      {isTop5 && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-800 font-mono">
                          #{idx + 1}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-zinc-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
                        title="Remove keyword"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>

              {/* Add custom keyword input */}
              <form onSubmit={handleAddKeyword} className="flex items-center gap-2">
                <input
                  id="input-add-keyword"
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Add custom keyword or tag..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  id="btn-add-keyword"
                  type="submit"
                  disabled={!newKeywordInput.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-white hover:bg-zinc-900 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: RAW JSON OUTPUT (Strictly matching user prompt) */}
        {activeTab === 'raw-json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-600">
                <p className="font-semibold text-zinc-800">
                  Exact Raw JSON Object as specified by prompt:
                </p>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  No markdown formatting block, directly usable for n8n automation pipelines and APIs.
                </p>
              </div>

              <button
                id="btn-copy-raw-json-tab"
                type="button"
                onClick={() => handleCopy(rawJsonFormatted, 'raw-tab')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm"
              >
                {copiedKey === 'raw-tab' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Raw JSON!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre
                id="raw-json-display"
                className="bg-zinc-950 text-emerald-400 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-zinc-800 leading-relaxed max-h-96"
              >
                {rawJsonFormatted}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK AGENCY FORMATS */}
        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Adobe Stock */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                    St
                  </div>
                  <h5 className="font-bold text-xs text-zinc-900">Adobe Stock</h5>
                </div>
                <button
                  id="btn-copy-adobe"
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `Title: ${result.rawJson.title}\nKeywords: ${result.rawJson.keywords}`,
                      'adobe'
                    )
                  }
                  className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'adobe' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 space-y-1">
                <p><strong>Top 5 Critical Rank Tags:</strong></p>
                <div className="flex flex-wrap gap-1">
                  {result.stats.keywordsList.slice(0, 5).map((k) => (
                    <span key={k} className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px]">
                      {k}
                    </span>
                  ))}
                </div>
                <p className="pt-1 text-[10px] text-zinc-400">
                  Adobe Stock weights the first 5 keywords heaviest in search algorithm.
                </p>
              </div>
            </div>

            {/* Shutterstock */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                    S
                  </div>
                  <h5 className="font-bold text-xs text-zinc-900">Shutterstock</h5>
                </div>
                <button
                  id="btn-copy-shutterstock"
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `Description: ${result.rawJson.title}\nKeywords: ${result.rawJson.keywords}`,
                      'shutter'
                    )
                  }
                  className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'shutter' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 space-y-1">
                <p><strong>Recommended Description:</strong></p>
                <p className="text-zinc-800 line-clamp-2">{result.rawJson.title}</p>
                <p className="text-[10px] text-zinc-400 pt-1">
                  Shutterstock uses title as primary search description (up to 200 characters).
                </p>
              </div>
            </div>

            {/* Freepik */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    Fp
                  </div>
                  <h5 className="font-bold text-xs text-zinc-900">Freepik</h5>
                </div>
                <button
                  id="btn-copy-freepik"
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `Title: ${result.rawJson.title}\nTags: ${result.rawJson.keywords}`,
                      'freepik'
                    )
                  }
                  className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'freepik' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 space-y-1">
                <p><strong>Tag Count:</strong> {result.stats.keywordCount} tags</p>
                <p className="text-[10px] text-zinc-400">
                  Freepik accepts comma-delimited metadata matching general commercial concepts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
