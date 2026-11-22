import React, { useState, useEffect } from 'react';
import { handleCopy, handlePaste, handleCut } from '../utils/antiCheat';

const CodeEditor = ({ value, onChange, language, readOnly = false }) => {
  const [code, setCode] = useState(value || '');

  useEffect(() => {
    setCode(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'cpp': return 'C++ (g++ 17)';
      case 'javascript': return 'JavaScript (Node.js)';
      case 'java': return 'Java (OpenJDK 17)';
      case 'python': return 'Python 3.10';
      default: return 'Code Editor';
    }
  };

  const getPlaceholder = () => {
    switch (language) {
      case 'cpp':
        return '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solution code here\n    return 0;\n}';
      case 'javascript':
        return '// Write your JavaScript solution here\nfunction solution() {\n    // Your code here\n}';
      case 'java':
        return '// Write your Java code here\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}';
      case 'python':
        return '# Write your Python code here\ndef solution():\n    # Your code here\n    pass';
      default:
        return '// Write your solution here...';
    }
  };

  const lineCount = (code.match(/\n/g) || []).length + 1;
  const charCount = code.length;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 font-mono transition-all">
      {/* Top IDE Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:opacity-100 transition"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:opacity-100 transition"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:opacity-100 transition"></div>
          <span className="ml-3 text-xs font-sans font-medium text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            solution.{language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-sans">
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            {getLanguageLabel()}
          </span>
          {readOnly && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
              Read Only
            </span>
          )}
        </div>
      </div>

      {/* Editor Main Textarea */}
      <div className="relative">
        <textarea
          value={code}
          onChange={handleChange}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onCut={handleCut}
          readOnly={readOnly}
          placeholder={getPlaceholder()}
          className="w-full h-96 p-4 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none text-sm leading-relaxed tracking-wide font-mono selection:bg-indigo-600 selection:text-white"
          spellCheck="false"
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-sans select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Lines:</span>
            <span className="text-slate-200 font-mono">{lineCount}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500">Characters:</span>
            <span className="text-slate-200 font-mono">{charCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Clipboard Protected (Copy/Paste Disabled)</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
