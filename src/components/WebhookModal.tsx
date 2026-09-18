import React, { useState } from 'react';
import { X, Terminal, Copy, Check, FileJson, ArrowRight, ShieldCheck } from 'lucide-react';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const samplePayload = `{
  "imageBase64": "data:image/jpeg;base64,...", // Optional if imageUrl provided
  "imageUrl": "https://example.com/wildlife/peregrine_falcon.jpg", // Optional if imageBase64 provided
  "fileName": "falcon_cliff.jpg",
  "speciesHint": "Falco peregrinus", // Optional
  "focusArea": "Hunting / Prey Capture" // Optional
}`;

  const expectedResponse = `{
  "title": "Peregrine Falcon perched on a rugged cliff ledge surveying territory",
  "description": "Adult peregrine falcon resting on weathered mountain granite overlooking vast wilderness valley, illuminated by dramatic morning sunlight, ideal for nature editorial, wildlife conservation, and predator concepts.",
  "keywords": "peregrine falcon, Falco peregrinus, bird of prey, raptor, predator, cliff, perch, alert, keen eye, hunting, plumage, feathers, mountain, wilderness, nature, wildlife, avian, ecology, biodiversity, majestic, freedom, outdoor, sky, telephoto, sharp focus, animal, falconiformes, apex predator, conservation, endangered, plumage, talons, beak"
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-zinc-200">
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">API & Webhook Documentation</h3>
              <p className="text-xs text-zinc-400">Microstock Metadata Automation Service</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-zinc-700">
          <div>
            <span className="font-bold text-zinc-900 uppercase tracking-wider block mb-1">
              Endpoint URL:
            </span>
            <div className="flex items-center justify-between p-2.5 bg-zinc-100 rounded-lg font-mono text-xs text-zinc-800 border border-zinc-200">
              <span>POST {currentOrigin}/api/analyze</span>
              <button
                type="button"
                onClick={() => handleCopy(`${currentOrigin}/api/analyze`, 'url')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                {copied === 'url' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-zinc-900 uppercase tracking-wider">
                Request JSON Payload:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(samplePayload, 'req')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied === 'req' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-zinc-800">
              {samplePayload}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-zinc-900 uppercase tracking-wider">
                Strict Target Response Structure:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(expectedResponse, 'res')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied === 'res' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-zinc-800">
              {expectedResponse}
            </pre>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
