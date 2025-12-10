import React, { useState, useMemo, useCallback } from 'react';
import { 
  Braces, 
  TreePine, 
  Code2, 
  Copy, 
  Check, 
  Minimize2, 
  Maximize2,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import JSONInput from '@/components/json-viewer/JSONInput';
import JSONTreeView from '@/components/json-viewer/JSONTreeView';

export default function JSONViewer() {
  const [rawInput, setRawInput] = useState('');
  const [viewMode, setViewMode] = useState('tree');
  const [copied, setCopied] = useState(false);

  // Parse and validate JSON
  const { parsedData, error, isValid } = useMemo(() => {
    if (!rawInput.trim()) {
      return { parsedData: null, error: null, isValid: null };
    }
    try {
      const parsed = JSON.parse(rawInput);
      return { parsedData: parsed, error: null, isValid: true };
    } catch (e) {
      return { parsedData: null, error: e.message, isValid: false };
    }
  }, [rawInput]);

  // Format JSON (pretty print)
  const handleFormat = useCallback(() => {
    if (parsedData !== null) {
      setRawInput(JSON.stringify(parsedData, null, 2));
    }
  }, [parsedData]);

  // Minify JSON
  const handleMinify = useCallback(() => {
    if (parsedData !== null) {
      setRawInput(JSON.stringify(parsedData));
    }
  }, [parsedData]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    const textToCopy = parsedData !== null 
      ? JSON.stringify(parsedData, null, 2) 
      : rawInput;
    
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [parsedData, rawInput]);

  // Clear input
  const handleClear = useCallback(() => {
    setRawInput('');
  }, []);

  // Syntax highlighted raw view
  const syntaxHighlightedJSON = useMemo(() => {
    if (!parsedData) return null;
    const formatted = JSON.stringify(parsedData, null, 2);
    
    return formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
        if (/:$/.test(match)) {
          return `<span class="text-cyan-400">${match.slice(0, -1)}</span><span class="text-slate-500">:</span>`;
        }
        return `<span class="text-amber-400">${match}</span>`;
      })
      .replace(/\b(true|false)\b/g, '<span class="text-rose-400">$1</span>')
      .replace(/\b(null)\b/g, '<span class="text-slate-500">$1</span>')
      .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="text-emerald-400">$1</span>');
  }, [parsedData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Braces className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">JSON Viewer</h1>
                <p className="text-xs text-slate-500">Format, validate & explore</p>
              </div>
            </div>

            {/* Validation Status */}
            <div className="flex items-center gap-4">
              {isValid !== null && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isValid 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-rose-50 text-rose-600"
                )}>
                  {isValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valid JSON</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Invalid JSON</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <JSONInput 
              value={rawInput} 
              onChange={setRawInput} 
              error={error}
            />
          </div>

          {/* Output Panel */}
          <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            {/* Output Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger 
                    value="tree" 
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    <TreePine className="w-4 h-4 mr-1.5" />
                    Tree
                  </TabsTrigger>
                  <TabsTrigger 
                    value="raw"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    <Code2 className="w-4 h-4 mr-1.5" />
                    Raw
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFormat}
                  disabled={!isValid}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <Maximize2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Format</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinify}
                  disabled={!isValid}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <Minimize2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Minify</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!rawInput}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={!rawInput}
                  className="text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-auto">
              {!rawInput.trim() ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <Braces className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-medium">No JSON to display</p>
                    <p className="text-slate-600 text-sm mt-1">Paste or upload JSON on the left</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-rose-400" />
                    </div>
                    <p className="text-rose-400 font-medium">Invalid JSON</p>
                    <p className="text-slate-500 text-sm mt-2 font-mono">{error}</p>
                  </div>
                </div>
              ) : viewMode === 'tree' ? (
                <JSONTreeView data={parsedData} />
              ) : (
                <pre 
                  className="p-4 font-mono text-sm leading-relaxed overflow-auto"
                  dangerouslySetInnerHTML={{ __html: syntaxHighlightedJSON || '' }}
                />
              )}
            </div>

            {/* Stats Footer */}
            {isValid && parsedData && (
              <div className="px-4 py-2 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-500">
                <span>
                  Size: {new Blob([JSON.stringify(parsedData)]).size.toLocaleString()} bytes
                </span>
                <span>
                  Type: {Array.isArray(parsedData) ? 'Array' : typeof parsedData}
                </span>
                {Array.isArray(parsedData) && (
                  <span>Length: {parsedData.length}</span>
                )}
                {typeof parsedData === 'object' && parsedData && !Array.isArray(parsedData) && (
                  <span>Keys: {Object.keys(parsedData).length}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
