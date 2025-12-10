import React, { useRef } from 'react';
import { Upload, FileJson, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function JSONInput({ value, onChange, onFormat, error }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const sampleJSON = `{
  "name": "JSON Viewer",
  "version": "1.0.0",
  "features": [
    "Syntax Highlighting",
    "Collapsible Tree",
    "Validation"
  ],
  "config": {
    "theme": "dark",
    "autoFormat": true,
    "maxDepth": null
  },
  "active": true
}`;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-800">Input</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(sampleJSON)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Text Area */}
      <div 
        className="flex-1 p-4 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your JSON here or drag & drop a .json file..."
          className={cn(
            "h-full min-h-[300px] font-mono text-sm resize-none",
            "bg-slate-50 border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20",
            "placeholder:text-slate-400",
            error && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/20"
          )}
          spellCheck={false}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 pb-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
            <p className="text-rose-600 text-sm font-medium">Validation Error</p>
            <p className="text-rose-500 text-xs mt-1 font-mono">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
