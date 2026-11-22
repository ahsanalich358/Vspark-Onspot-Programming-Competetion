import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentAPI } from '../../utils/api';

const StartQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!acknowledged) {
      setError('You must acknowledge and agree to the competition rules before starting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await studentAPI.startQuiz();
      navigate('/student/quiz');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-mono font-bold text-lg text-white">
              VS
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Pre-Flight Briefing</h1>
              <p className="text-xs text-slate-400">Step 2 of 2: Competition Entry</p>
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
      <main className="max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
              🚀
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Launch Your Contest Session?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Please thoroughly review the competition rules, timing constraints, and anti-cheating protocols below.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>⚠</span> {error}
              </span>
              <button onClick={() => setError('')} className="opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Rules Checklist */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contest Guidelines & Rules
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Unstoppable Timer:</strong> Once started, your countdown clock starts on the server and cannot be paused or reset.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Save Code Regularly:</strong> Use the "Save Answer" button on each question to save your progress at any time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>3 Questions (60 Marks):</strong> Easy (10 pts), Medium (20 pts), and Tough (30 pts).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Automatic Submission:</strong> If your timer reaches 00:00, your code will be automatically finalized and submitted.</span>
              </li>
            </ul>
          </div>

          {/* Anti-Cheating Protocol Warning */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold mb-2">
              <span>🛡️</span> Anti-Cheating Telemetry Active
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed mb-3">
              The platform actively monitors and reports suspicious activities to the contest administrators:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-rose-200/70">
              <div className="flex items-center gap-1.5">
                <span>•</span> Tab switching & window defocusing
              </div>
              <div className="flex items-center gap-1.5">
                <span>•</span> Clipboard paste & copy shortcuts
              </div>
              <div className="flex items-center gap-1.5">
                <span>•</span> Developer tools inspection attempts
              </div>
              <div className="flex items-center gap-1.5">
                <span>•</span> Multi-device simultaneous logins
              </div>
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <span className="text-xs text-slate-300 leading-normal">
                I understand and agree to all competition guidelines, and I am ready to begin the exam session now.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleStart}
              disabled={loading || !acknowledged}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Starting Session...
                </>
              ) : (
                <>
                  <span>🚀</span> Start Quiz Now
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition"
            >
              Return to Hub
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        VSPARK Secure Exam Environment • Session integrity protected
      </footer>
    </div>
  );
};

export default StartQuiz;
