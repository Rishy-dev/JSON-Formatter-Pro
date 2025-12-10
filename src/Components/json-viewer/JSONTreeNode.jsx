import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const getValueType = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const getValueColor = (type) => {
  const colors = {
    string: 'text-amber-400',
    number: 'text-emerald-400',
    boolean: 'text-rose-400',
    null: 'text-slate-500',
    object: 'text-slate-300',
    array: 'text-slate-300',
  };
  return colors[type] || 'text-slate-300';
};

const renderValue = (value, type) => {
  if (type === 'string') return `"${value}"`;
  if (type === 'null') return 'null';
  if (type === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

export default function JSONTreeNode({ keyName, value, isLast = true, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  const isEmpty = isExpandable && (type === 'array' ? value.length === 0 : Object.keys(value).length === 0);

  const entries = isExpandable 
    ? (type === 'array' ? value.map((v, i) => [i, v]) : Object.entries(value))
    : [];

  const bracketOpen = type === 'array' ? '[' : '{';
  const bracketClose = type === 'array' ? ']' : '}';
  const itemCount = entries.length;

  return (
    <div className="font-mono text-sm leading-relaxed">
      <div 
        className={cn(
          "flex items-start gap-1 group hover:bg-slate-800/50 rounded px-1 -mx-1 transition-colors",
          isExpandable && "cursor-pointer"
        )}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse Icon */}
        <span className="w-4 h-5 flex items-center justify-center flex-shrink-0">
          {isExpandable && !isEmpty && (
            isExpanded 
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
        </span>

        {/* Key */}
        {keyName !== undefined && (
          <>
            <span className="text-cyan-400">
              {typeof keyName === 'string' ? `"${keyName}"` : keyName}
            </span>
            <span className="text-slate-500">:</span>
            <span className="w-1" />
          </>
        )}

        {/* Value */}
        {isExpandable ? (
          <span className="text-slate-400">
            {isEmpty ? (
              <span>{bracketOpen}{bracketClose}{!isLast && ','}</span>
            ) : isExpanded ? (
              <span>{bracketOpen}</span>
            ) : (
              <span>
                {bracketOpen}
                <span className="text-slate-600 text-xs mx-1">
                  {itemCount} {type === 'array' ? (itemCount === 1 ? 'item' : 'items') : (itemCount === 1 ? 'key' : 'keys')}
                </span>
                {bracketClose}{!isLast && ','}
              </span>
            )}
          </span>
        ) : (
          <span className={getValueColor(type)}>
            {renderValue(value, type)}
            {!isLast && <span className="text-slate-500">,</span>}
          </span>
        )}
      </div>

      {/* Children */}
      {isExpandable && isExpanded && !isEmpty && (
        <div className="ml-4 border-l border-slate-700/50 pl-2">
          {entries.map(([key, val], index) => (
            <JSONTreeNode
              key={key}
              keyName={key}
              value={val}
              isLast={index === entries.length - 1}
              depth={depth + 1}
            />
          ))}
          <div className="flex items-center">
            <span className="w-4" />
            <span className="text-slate-400">
              {bracketClose}{!isLast && ','}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
