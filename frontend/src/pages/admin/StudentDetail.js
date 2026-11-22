import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const StudentDetail = () => {
  const { studentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [eventLogs, setEventLogs] = useState({ logs: [], summary: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [submissionsRes, logsRes] = await Promise.all([
        adminAPI.getStudentSubmissions(studentId),
        adminAPI.getEventLogs(studentId)
      ]);
      setSubmissions(submissionsRes.data);
      setEventLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Student Dossier...</span>
        </div>
      </div>
    );
  }

  const totalMarks = submissions.reduce((sum, sub) => sum + (sub.marksAwarded || 0), 0);
  const totalEvents = eventLogs.totalEvents || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/admin/students" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition">
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Participant Audit & Evaluation
              </h1>
              <p className="text-xs text-slate-400">Anti-cheating audit trail and code evaluation</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-bold">
              Total Score: {totalMarks} / 60 Pts
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl space-y-8">
        {/* Anti-Cheating Telemetry Banner */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Anti-Cheating Security Audit
              </h2>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              totalEvents > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {totalEvents > 0 ? `⚠️ ${totalEvents} Suspicious Events Detected` : '✓ Clean Session Record'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Tab Switches</span>
              <span className="text-xl font-bold font-mono text-amber-400">{eventLogs.summary?.tab_switch || 0}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Window Blurs</span>
              <span className="text-xl font-bold font-mono text-orange-400">{eventLogs.summary?.window_blur || 0}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Copy Attempts</span>
              <span className="text-xl font-bold font-mono text-rose-400">{eventLogs.summary?.copy_attempt || 0}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Paste Attempts</span>
              <span className="text-xl font-bold font-mono text-purple-400">{eventLogs.summary?.paste_attempt || 0}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Shortcuts Blocked</span>
              <span className="text-xl font-bold font-mono text-blue-400">{eventLogs.summary?.shortcut_blocked || 0}</span>
            </div>
          </div>

          {/* Event Log Items */}
          {eventLogs.logs && eventLogs.logs.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Chronological Audit Log:</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {eventLogs.logs.map((log) => (
                  <div key={log.id} className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="text-rose-400 font-semibold">{log.eventType}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{log.details || 'Detected event'}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submissions Section */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Student Code Submissions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Submitted code files and evaluator remarks</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {submissions.length} Questions Answered
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No answers submitted yet by this student.
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <div key={submission.id || submission._id} className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{submission.question.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {submission.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold font-mono">
                        Awarded: {submission.marksAwarded} / {submission.question.marks} Pts
                      </span>
                    </div>
                  </div>

                  {/* Code View */}
                  <div className="relative mb-3">
                    <pre className="bg-slate-900/90 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 overflow-y-auto border border-slate-800/80 leading-relaxed selection:bg-indigo-600 selection:text-white">
                      {submission.code}
                    </pre>
                  </div>

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                      <strong className="text-indigo-400">Teacher's Feedback:</strong>
                      <span>{submission.feedback}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDetail;
