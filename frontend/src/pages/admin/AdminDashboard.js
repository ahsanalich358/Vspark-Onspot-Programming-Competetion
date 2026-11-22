import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-600/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">VSPARK</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold uppercase tracking-wider">
                  Admin Command Center
                </span>
              </div>
              <p className="text-xs text-slate-400">COMSATS University Vehari Campus</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Signed in as: <strong className="text-slate-200 font-semibold">{user?.username || 'admin'}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center gap-1.5"
            >
              <span>Logout</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Competition Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Live metrics, submission evaluations, and contest telemetry</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/questions"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition shadow-md shadow-purple-600/20"
            >
              + Add Question
            </Link>
            <Link
              to="/admin/quiz-settings"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
            >
              ⚙️ Quiz Controls
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-base border border-blue-500/20">
                👥
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats?.totalStudents || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Registered participants</p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base border border-emerald-500/20">
                📝
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats?.totalQuestions || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active contest challenges</p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submissions</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-base border border-purple-500/20">
                📄
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats?.totalSubmissions || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Answers submitted</p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-base border border-amber-500/20">
                🏆
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats?.studentsSubmitted || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Final quiz submitted</p>
          </div>
        </div>

        {/* Marks Balance Bar */}
        {stats && (
          <div className={`p-5 rounded-2xl border mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition ${
            stats.isMarksValid
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full mt-1 sm:mt-0 ${stats.isMarksValid ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`}></div>
              <div>
                <p className="font-bold text-sm flex items-center gap-2 flex-wrap">
                  <span>Contest Score Allocation:</span>
                  <span className="font-mono text-base font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-white">
                    {stats.totalMarks} / {stats.targetMarks} Points
                  </span>
                </p>
                <p className="text-xs opacity-80 mt-1">
                  {stats.isMarksValid
                    ? 'Target 60 marks met! Easy: 10 pts • Medium: 20 pts • Tough: 30 pts (either 3 × 10 pts or 1 × 30 pts).'
                    : `Warning: Total marks equal ${stats.totalMarks} / 60 points. Adjust Easy (10), Medium (20), or Tough (30) to balance.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {stats.breakdown && (
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Easy: {stats.breakdown.easyMarks}/10
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Med: {stats.breakdown.mediumMarks}/20
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    Tough: {stats.breakdown.toughMarks}/30 ({stats.breakdown.toughCount}Q)
                  </span>
                </div>
              )}
              <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                stats.isMarksValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {stats.isMarksValid ? '✓ Target Valid (60)' : '! Needs Balance'}
              </span>
            </div>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/admin/questions"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900 transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
              📝
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition">Manage Questions</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Create, edit, or configure programming questions. Choose difficulty tiers and valid programming languages.
            </p>
            <div className="mt-4 text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <span>Open Question Manager</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/admin/submissions"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-900 transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
              ⚖️
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition">Grade Submissions</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Review code submitted by students, award points out of question marks, and write personalized evaluation feedback.
            </p>
            <div className="mt-4 text-xs font-semibold text-purple-400 flex items-center gap-1">
              <span>View Submissions ({stats?.totalSubmissions || 0})</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/admin/students"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 hover:bg-slate-900 transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
              👥
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition">Student Directory</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Full roster of registered participants. View individual/group members, contest codes, progress status, and anti-cheat event logs.
            </p>
            <div className="mt-4 text-xs font-semibold text-blue-400 flex items-center gap-1">
              <span>Browse Students ({stats?.totalStudents || 0})</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/admin/codes"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-900 transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
              🎫
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition">Competition Codes</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Generate unique student entrance codes. Download code list in CSV, JSON, or TXT for printed competition desk passes.
            </p>
            <div className="mt-4 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Generate & Download</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/admin/quiz-settings"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
              ⏱️
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition">Contest Timer & Settings</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Configure contest duration (e.g. 120 mins). Turn competition status ON/OFF to control when students can start.
            </p>
            <div className="mt-4 text-xs font-semibold text-cyan-400 flex items-center gap-1">
              <span>Configure Timer</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/admin/bulk-upload"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900 transition-all shadow-md group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition">
              📤
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition">Bulk Upload Questions</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upload multiple questions at once using CSV or JSON files. Automated validator checks format and language lists.
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Upload CSV / JSON</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
