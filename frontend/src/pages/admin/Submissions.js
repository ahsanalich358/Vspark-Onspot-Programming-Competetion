import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ marksAwarded: 0, feedback: '' });
  const [filterGraded, setFilterGraded] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await adminAPI.getSubmissions();
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId) => {
    try {
      await adminAPI.gradeSubmission(submissionId, gradeData);
      alert('Submission graded successfully!');
      setGradingSubmission(null);
      fetchSubmissions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const openGrading = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      marksAwarded: submission.marksAwarded,
      feedback: submission.feedback || ''
    });
  };

  const filtered = submissions.filter(s => {
    if (filterGraded === 'pending') return s.marksAwarded === 0 && !s.feedback;
    if (filterGraded === 'graded') return s.marksAwarded > 0 || !!s.feedback;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/admin/dashboard" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Submission Evaluation
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  {submissions.length} Total
                </span>
              </h1>
              <p className="text-xs text-slate-400">Review student code and assign marks with feedback</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'graded', label: 'Graded' },
              { id: 'pending', label: 'Needs Grading' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterGraded(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                  filterGraded === tab.id
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
        {/* Grading Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚖️ Grade Submission</span>
                </h2>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Student:</span>
                  <span className="font-bold text-white text-sm">{gradingSubmission.student?.fullName}</span>
                  <span className="text-slate-400 block">{gradingSubmission.student?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Question:</span>
                  <span className="font-bold text-indigo-400 text-sm">{gradingSubmission.question?.title}</span>
                  <span className="text-slate-400 block">
                    Tier: {gradingSubmission.question?.difficulty} (Max {gradingSubmission.question?.marks} Marks)
                  </span>
                </div>
              </div>

              {/* Submitted Code Viewer */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold uppercase tracking-wider">Submitted Code ({gradingSubmission.language}):</span>
                </div>
                <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto border border-slate-800 leading-relaxed selection:bg-purple-600">
                  {gradingSubmission.code}
                </pre>
              </div>

              {/* Marks Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Marks Awarded (0 to {gradingSubmission.question?.marks}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradingSubmission.question?.marks}
                  value={gradeData.marksAwarded}
                  onChange={(e) => setGradeData({ ...gradeData, marksAwarded: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-base font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Feedback Input */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Evaluator Feedback / Remarks:
                </label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
                  placeholder="e.g. Optimal approach, good code readability..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleGrade(gradingSubmission.id || gradingSubmission._id)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/20"
                >
                  Save & Confirm Grade
                </button>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          {filtered.map((submission) => (
            <div
              key={submission.id || submission._id}
              className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-md hover:border-slate-700 transition shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{submission.question?.title}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {submission.language}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Student: <strong className="text-slate-200">{submission.student?.fullName}</strong> ({submission.student?.email}) • Code: <span className="font-mono text-purple-400 font-bold">{submission.student?.competitionCode || 'N/A'}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span className="font-mono text-sm font-bold text-purple-400">
                      {submission.marksAwarded} / {submission.question?.marks}
                    </span>
                  </div>
                </div>
              </div>

              {/* Code Preview */}
              <div className="mb-4">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto border border-slate-800/80 leading-relaxed">
                  {submission.code}
                </pre>
              </div>

              {/* Feedback if any */}
              {submission.feedback && (
                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300 mb-4 flex items-start gap-2">
                  <strong className="text-indigo-400">Feedback:</strong>
                  <span>{submission.feedback}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                <span className="text-xs text-slate-500">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </span>

                <button
                  onClick={() => openGrading(submission)}
                  className="px-4 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
                >
                  {submission.marksAwarded > 0 || submission.feedback ? '✏️ Edit Grade' : '⚖️ Grade This Code'}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-500 text-xs">
              No submissions match the selected filter.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Submissions;
