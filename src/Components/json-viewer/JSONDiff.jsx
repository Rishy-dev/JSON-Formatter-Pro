import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Minus, Edit } from 'lucide-react';
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

function DiffNode({ keyName, diff, isLast = true, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  const { type, oldValue, newValue, children } = diff;
  const isExpandable = children && Object.keys(children).length > 0;
  
  let icon = null;
  let bgColor = '';
  
  if (type === 'added') {
    icon = <Plus className="w-3 h-3" />;
    bgColor = 'bg-emerald-500/10 border-l-2 border-emerald-500';
  } else if (type === 'removed') {
    icon = <Minus className="w-3 h-3" />;
    bgColor = 'bg-rose-500/10 border-l-2 border-rose-500';
  } else if (type === 'modified') {
    icon = <Edit className="w-3 h-3" />;
    bgColor = 'bg-amber-500/10 border-l-2 border-amber-500';
  }

  return (
    <div className={cn("font-mono text-sm leading-relaxed", bgColor && 'pl-2')}>
      <div 
        className={cn(
          "flex items-start gap-1 group hover:bg-slate-800/50 rounded px-1 -mx-1 transition-colors",
          isExpandable && "cursor-pointer"
        )}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {/* Change Icon */}
        <span className="w-4 h-5 flex items-center justify-center flex-shrink-0">
          {icon || (isExpandable && (
            isExpanded 
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          ))}
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
        {type === 'modified' ? (
          <span className="flex items-center gap-2">
            <span className={cn(getValueColor(getValueType(oldValue)), "line-through opacity-60")}>
              {renderValue(oldValue, getValueType(oldValue))}
            </span>
            <span className="text-slate-600">→</span>
            <span className={getValueColor(getValueType(newValue))}>
              {renderValue(newValue, getValueType(newValue))}
            </span>
            {!isLast && <span className="text-slate-500">,</span>}
          </span>
        ) : type === 'added' ? (
          <span className={getValueColor(getValueType(newValue))}>
            {renderValue(newValue, getValueType(newValue))}
            {!isLast && <span className="text-slate-500">,</span>}
          </span>
        ) : type === 'removed' ? (
          <span className={cn(getValueColor(getValueType(oldValue)), "line-through opacity-60")}>
            {renderValue(oldValue, getValueType(oldValue))}
            {!isLast && <span className="text-slate-500">,</span>}
          </span>
        ) : (
          <span className={getValueColor(getValueType(newValue))}>
            {renderValue(newValue, getValueType(newValue))}
            {!isLast && <span className="text-slate-500">,</span>}
          </span>
        )}
      </div>

      {/* Children */}
      {isExpandable && isExpanded && (
        <div className="ml-4 border-l border-slate-700/50 pl-2">
          {Object.entries(children).map(([key, childDiff], index, arr) => (
            <DiffNode
              key={key}
              keyName={key}
              diff={childDiff}
              isLast={index === arr.length - 1}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JSONDiff({ diff, summary }) {
  if (!diff) {
    return (
      <div className="text-slate-500 font-mono text-sm p-4">
        No differences found
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Summary */}
      {summary && (summary.added > 0 || summary.removed > 0 || summary.modified > 0) && (
        <div className="mb-4 flex gap-4 text-sm">
          {summary.added > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-4 h-4" />
              <span>{summary.added} added</span>
            </div>
          )}
          {summary.removed > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Minus className="w-4 h-4" />
              <span>{summary.removed} removed</span>
            </div>
          )}
          {summary.modified > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Edit className="w-4 h-4" />
              <span>{summary.modified} modified</span>
            </div>
          )}
        </div>
      )}

      {/* Diff Tree */}
      {diff.children ? (
        Object.entries(diff.children).map(([key, childDiff], index, arr) => (
          <DiffNode
            key={key}
            keyName={key}
            diff={childDiff}
            isLast={index === arr.length - 1}
            depth={0}
          />
        ))
      ) : (
        <div className="text-slate-400 text-center py-8">
          No differences found
        </div>
      )}
    </div>
  );
}
