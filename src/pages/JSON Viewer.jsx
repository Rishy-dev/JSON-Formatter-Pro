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
  Trash2,
  GitCompare,
  FileCode2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import JSONInput from '@/components/json-viewer/JSONInput';
import JSONTreeView from '@/components/json-viewer/JSONTreeView';
import JSONDiff from '@/components/json-viewer/JSONDiff';
import LanguageFormatter from '@/components/json-viewer/LanguageFormatter';
import { compareJSON } from '@/components/json-viewer/jsonDiffUtils';

export default function JSONViewer() {
  const [rawInput, setRawInput] = useState('');
  const [rawInput2, setRawInput2] = useState('');
  const [mode, setMode] = useState('viewer'); // 'viewer', 'compare', 'format'
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

  // Parse second JSON for comparison
  const { parsedData: parsedData2, error: error2, isValid: isValid2 } = useMemo(() => {
    if (!rawInput2.trim()) {
      return { parsedData: null, error: null, isValid: null };
    }
    try {
      const parsed = JSON.parse(rawInput2);
      return { parsedData: parsed, error: null, isValid: true };
    } catch (e) {
      return { parsedData: null, error: e.message, isValid: false };
    }
  }, [rawInput2]);

  // Compare JSONs
  const comparisonResult = useMemo(() => {
    if (!parsedData || !parsedData2) return null;
    return compareJSON(parsedData, parsedData2);
  }, [parsedData, parsedData2]);

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
 
