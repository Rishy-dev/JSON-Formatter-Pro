import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatters = {
  python: (data, name = 'data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '    '.repeat(indent);
      if (val === null) return 'None';
      if (typeof val === 'boolean') return val ? 'True' : 'False';
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        const items = val.map(item => `${spaces}    ${formatValue(item, indent + 1)}`).join(',\n');
        return `[\n${items}\n${spaces}]`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}    "${k}": ${formatValue(v, indent + 1)}`
        ).join(',\n');
        return `{\n${entries}\n${spaces}}`;
      }
      return String(val);
    };
    return `${name} = ${formatValue(data)}`;
  },

  javascript: (data, name = 'data') => {
    return `const ${name} = ${JSON.stringify(data, null, 2)};`;
  },

  typescript: (data, name = 'data') => {
    const inferType = (val) => {
      if (val === null) return 'null';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        return `${inferType(val[0])}[]`;
      }
      if (typeof val === 'object') return 'object';
      return typeof val;
    };
    const type = inferType(data);
    return `const ${name}: ${type} = ${JSON.stringify(data, null, 2)};`;
  },

  java: (data, className = 'Data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '    '.repeat(indent);
      if (val === null) return 'null';
      if (typeof val === 'boolean') return String(val);
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        const arrayType = val.length > 0 ? (typeof val[0] === 'string' ? 'String' : 'Object') : 'Object';
        const items = val.map(item => formatValue(item, indent + 1)).join(', ');
        return `Arrays.asList(${items})`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}    put("${k}", ${formatValue(v, indent + 1)});`
        ).join('\n');
        return `new HashMap<String, Object>() {{\n${entries}\n${spaces}}}`;
      }
      return String(val);
    };
    return `// Java representation\nMap<String, Object> data = ${formatValue(data)};`;
  },

  csharp: (data, name = 'data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '    '.repeat(indent);
      if (val === null) return 'null';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        const items = val.map(item => formatValue(item, indent + 1)).join(', ');
        return `new[] { ${items} }`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}    ["${k}"] = ${formatValue(v, indent + 1)}`
        ).join(',\n');
        return `new Dictionary<string, object>\n${spaces}{\n${entries}\n${spaces}}`;
      }
      return String(val);
    };
    return `var ${name} = ${formatValue(data)};`;
  },

  cpp: (data, name = 'data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '    '.repeat(indent);
      if (val === null) return 'nullptr';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        const items = val.map(item => formatValue(item, indent + 1)).join(', ');
        return `{${items}}`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}    {"${k}", ${formatValue(v, indent + 1)}}`
        ).join(',\n');
        return `{\n${entries}\n${spaces}}`;
      }
      return String(val);
    };
    return `// C++ representation (using std::map)\nstd::map<std::string, std::any> ${name} = ${formatValue(data)};`;
  },

  go: (data, name = 'data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '\t'.repeat(indent);
      if (val === null) return 'nil';
      if (typeof val === 'boolean') return String(val);
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        const items = val.map(item => `${spaces}\t${formatValue(item, indent + 1)}`).join(',\n');
        return `[]interface{}{\n${items},\n${spaces}}`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}\t"${k}": ${formatValue(v, indent + 1)}`
        ).join(',\n');
        return `map[string]interface{}{\n${entries},\n${spaces}}`;
      }
      return String(val);
    };
    return `${name} := ${formatValue(data)}`;
  },

  ruby: (data, name = 'data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '  '.repeat(indent);
      if (val === null) return 'nil';
      if (typeof val === 'boolean') return String(val);
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        const items = val.map(item => `${spaces}  ${formatValue(item, indent + 1)}`).join(',\n');
        return `[\n${items}\n${spaces}]`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}  "${k}" => ${formatValue(v, indent + 1)}`
        ).join(',\n');
        return `{\n${entries}\n${spaces}}`;
      }
      return String(val);
    };
    return `${name} = ${formatValue(data)}`;
  },

  php: (data, name = 'data') => {
    const formatValue = (val, indent = 0) => {
      const spaces = '    '.repeat(indent);
      if (val === null) return 'null';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) {
        const items = val.map(item => `${spaces}    ${formatValue(item, indent + 1)}`).join(',\n');
        return `[\n${items}\n${spaces}]`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val).map(([k, v]) => 
          `${spaces}    "${k}" => ${formatValue(v, indent + 1)}`
        ).join(',\n');
        return `[\n${entries}\n${spaces}]`;
      }
      return String(val);
    };
    return `$${name} = ${formatValue(data)};`;
  },
