import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../utils/api';

const languages = [
  {
    id: 'cpp',
    name: 'C++',
    badge: 'ISO C++17',
    icon: '⚙️',
    description: 'Blazing-fast execution, low-level memory control, standard template library (STL).'
  },
  {
    id: 'python',
    name: 'Python',
    badge: 'Python 3.10+',
    icon: '🐍',
    description: 'Expressive syntax, rapid algorithmic prototyping, and comprehensive standard library.'
  },
  {
    id: 'java',
    name: 'Java',
    badge: 'OpenJDK 17',
    icon: '☕',
    description: 'Strongly-typed object-oriented language with robust collections and strict typing.'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    badge: 'Node.js LTS',
    icon: '🌐',
    description: 'Modern ECMAScript syntax with flexible array methods and functional paradigms.'
  }
];

const LanguageSelection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      setError('Please select a programming language');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await studentAPI.selectLanguage(selectedLanguage);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock language selection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-mono font-bold text-lg text-white">
              VS
            </div>
            <div>
              <h1 className="text-base font-bold text-white">VSPARK Language Selection</h1>
              <p className="text-xs text-slate-400">Step 1 of 2: Lock your contest language</p>
            </div>
          </div>
          <Link
            to="/student/dashboard"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-3">
            ⚡ Contest Requirement
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Select Your Programming Language
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            You will solve all competition questions in this language. Once confirmed, this choice cannot be modified.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠</span> {error}
            </span>
            <button onClick={() => setError('')} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <div
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`relative p-6 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
                        {lang.icon}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{lang.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">{lang.badge}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Supported Compiler / Interpreter</span>
                  <span className={`font-semibold ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advisory Warning */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-8 flex items-start gap-3">
          <span className="text-base">⚠️</span>
          <div>
            <span className="font-bold">Permanent Choice:</span> After clicking confirm, your contest profile will be bound to your chosen programming language for all 3 challenges.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedLanguage}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Locking Selection...
              </>
            ) : (
              <>
                <span>✓</span> Confirm & Save Language
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        VSPARK Competitive Coding Framework • Anti-Cheat Engine Active
      </footer>
    </div>
  );
};

export default LanguageSelection;
