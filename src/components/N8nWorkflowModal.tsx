import React, { useState } from 'react';
import { X, Workflow, Download, Copy, Check, Terminal, ExternalLink, Play, Loader2 } from 'lucide-react';
import { generateN8nWorkflow } from '../data/n8nWorkflow';

interface N8nWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const N8nWorkflowModal: React.FC<N8nWorkflowModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [testUrl, setTestUrl] = useState('https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=1000&q=80');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const webhookUrl = `${currentOrigin}/api/webhook/process`;
  const workflowJson = JSON.stringify(generateN8nWorkflow(webhookUrl), null, 2);

  const curlCommand = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1611689342806-0863700ce1e4",
    "fileName": "bald_eagle_flight.jpg"
  }'`;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  const handleDownloadWorkflow = () => {
    const blob = new Blob([workflowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wildstock-n8n-workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunTestWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/webhook/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: testUrl,
          fileName: 'test_raptor.jpg',
        }),
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                n8n Automation Workflow Setup
              </h3>
              <p className="text-xs text-stone-400">
                Integrate with your local or cloud n8n automation instances
              </p>
            </div>
          </div>
          <button
            id="btn-close-n8n-modal"
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800">
          {/* Architecture info */}
          <div className="bg-brand-50 border border-brand-200/80 rounded-xl p-4 text-xs text-brand-900 space-y-1.5">
            <p className="font-semibold text-sm text-brand-950 flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-brand-700" />
              Automated Raptor & Microstock Pipeline Architecture
            </p>
            <p className="text-brand-800 leading-relaxed">
              This system is built to plug directly into <strong>n8n workflows</strong> (via Webhooks or HTTP Request nodes).
              Images ingested from Google Drive, Dropbox, SFTP, or local folder watchers are sent to this server,
              which analyzes the wildlife with Gemini 3.8 Flash and outputs raw, validated microstock JSON.
            </p>
          </div>

          {/* Download and Copy n8n Workflow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                1. Ready-to-Import n8n Workflow JSON
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyWorkflow}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  id="btn-download-workflow-json"
                  type="button"
                  onClick={handleDownloadWorkflow}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-500">
              In your n8n canvas, click <strong>Workflow Settings &gt; Import from File</strong> or paste this JSON directly onto the canvas.
            </p>
          </div>

          {/* Webhook cURL Endpoint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>2. Automated Webhook Endpoint</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                {curlCopied ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{curlCopied ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-900 text-brand-400 font-mono text-xs rounded-xl overflow-x-auto border border-stone-800">
              {curlCommand}
            </pre>
          </div>

          {/* Interactive Webhook Simulator */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-brand-600" />
                <span>Test Webhook Response Live</span>
              </span>
              <span className="text-[11px] font-mono text-stone-500">{webhookUrl}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Image URL to test..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
              <button
                type="button"
                disabled={isTesting || !testUrl}
                onClick={handleRunTestWebhook}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Trigger Webhook</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Webhook Response:
                </span>
                <pre className="p-3 bg-stone-950 text-brand-400 font-mono text-xs rounded-lg overflow-x-auto border border-stone-800 max-h-48">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
