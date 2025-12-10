import React from 'react';
import JSONTreeNode from './JSONTreeNode';

export default function JSONTreeView({ data }) {
  if (data === undefined || data === null) {
    return (
      <div className="text-slate-500 font-mono text-sm">
        null
      </div>
    );
  }

  return (
    <div className="p-4">
      <JSONTreeNode value={data} isLast={true} depth={0} />
    </div>
  );
}
