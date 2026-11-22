import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../utils/api';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await studentAPI.getMySubmissions();
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span>Loading your submissions...</span>
        </div>
      </div>
    );
  }

  const totalMarks = submissions.reduce((sum, sub) => sum + (sub.marksAwarded || 0), 0);
  const isAnyGraded = submissions.some(sub => (sub.marksAwarded || 0) > 0 || sub.feedback);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-mono font-bold text-lg text-white">
              VS
            </div>
            <div>
              <h1 className="text-base font-bold text-white">My Submissions & Results</h1>
              <p className="text-xs text-slate-400">Review your submitted contest solutions and evaluator feedback</p>
            </div>
          </div>
          <Link
            to="/student/dashboard"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60 transition shadow-sm"
          >
            <span>←</span> Back to Hub
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Score Overview Banner */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contest Performance
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 flex items-baseline gap-2">
              <span className="text-indigo-400 font-mono">{totalMarks}</span>
              <span className="text-slate-500 text-base font-normal">/ 60 total marks</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              You submitted {submissions.length} question solution{submissions.length === 1 ? '' : 's'}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${isAnyGraded
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
              {isAnyGraded ? '✓ Evaluation Recorded' : '⏳ Awaiting Evaluation'}
            </span>
          </div>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-4 text-slate-400">
              📭
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Submissions Found</h3>
            <p className="text-xs text-slate-400 mb-6">
              You haven't submitted any solutions yet for this competition.
            </p>
            <Link
              to="/student/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((sub, index) => {
              const subId = sub.id || sub._id;
              const isCopied = copiedId === subId;

              return (
                <div
                  key={subId}
                  className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4"
                >
                  {/* Submission Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                        <h3 className="text-base font-bold text-white">
                          {sub.question?.title || `Question ${index + 1}`}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sub.question?.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : sub.question?.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                          {sub.question?.difficulty || 'Medium'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()} • Language: <strong className="text-slate-300 uppercase">{sub.language}</strong>
                      </div>
                    </div>

                    {/* Marks Pill */}
                    <div className="bg-slate-950/70 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs text-slate-400 font-medium">Marks:</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {sub.marksAwarded ?? 0}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        / {sub.question?.marks || 0}
                      </span>
                    </div>
                  </div>

                  {/* Code Container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Your Submitted Source Code:</span>
                      <button
                        onClick={() => handleCopyCode(subId, sub.code)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1"
                      >
                        {isCopied ? '✓ Copied' : '📋 Copy Code'}
                      </button>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
                          <span className="ml-2">solution.{sub.language === 'python' ? 'py' : sub.language === 'cpp' ? 'cpp' : sub.language === 'java' ? 'java' : 'js'}</span>
                        </div>
                        <span className="uppercase">{sub.language}</span>
                      </div>
                      <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-72 overflow-y-auto leading-relaxed">
                        {sub.code}
                      </pre>
                    </div>
                  </div>

                  {/* Evaluator Feedback */}
                  {sub.feedback && (
                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <span>💬</span> Evaluator Feedback:
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans pl-5">
                        {sub.feedback}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MySubmissions;
