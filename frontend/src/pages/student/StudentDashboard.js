import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../utils/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, statusRes] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getQuizStatus()
      ]);
      setProfile(profileRes.data);
      setQuizStatus(statusRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  const handleCopyCode = () => {
    if (profile?.competitionCode) {
      navigator.clipboard.writeText(profile.competitionCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span>Loading student portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-mono font-bold text-lg text-white">
              VS
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                VSPARK Student Hub
              </h1>
              <p className="text-xs text-slate-400">Programming Competition Arena</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
              {profile?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-rose-300 text-xs font-medium border border-slate-700/60 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Card & Profile Bar */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                <span>🎓</span> {profile?.university || 'VSPARK Contestant'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome, {profile?.fullName}!
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span>📧 {profile?.email}</span>
                <span>•</span>
                <span>
                  {profile?.participationMode === 'group' ? '👥 Group Mode' : '👤 Individual Mode'}
                </span>
                {profile?.selectedLanguage && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">
                      Language: {profile.selectedLanguage.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Competition Code Pill */}
            {profile?.competitionCode && (
              <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-center min-w-[240px]">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-1">
                  <span className="uppercase tracking-wider font-semibold text-indigo-400">
                    Competition Code
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium underline flex items-center gap-1"
                  >
                    {copiedCode ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-2xl font-black text-white tracking-widest">
                  {profile.competitionCode}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Keep this token handy during the event</div>
              </div>
            )}
          </div>

          {/* Group Partner Information (if applicable) */}
          {profile?.participationMode === 'group' && profile?.groupMember && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-lg">👥</span>
                <div>
                  <span className="text-xs uppercase text-slate-400 font-semibold">Team Partner:</span>
                  <div className="text-sm font-medium text-white">{profile.groupMember.fullName}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {profile.groupMember.email} {profile.groupMember.phone && `• ${profile.groupMember.phone}`}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Contest Status Panel */}
        {quizStatus?.hasSubmitted ? (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Contest Successfully Submitted!</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your answers have been stored and submitted for administrative evaluation.
                  </p>
                  <div className="text-emerald-400 font-semibold text-sm mt-1">
                    Recorded Score: {profile?.finalMarks ?? 0} / 60
                  </div>
                </div>
              </div>
              <Link
                to="/student/my-submissions"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20 text-center"
              >
                View Submitted Code & Feedback →
              </Link>
            </div>
          </div>
        ) : quizStatus?.hasStarted ? (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shadow-lg animate-pulse">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Competition Session In Progress!</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your quiz countdown is active. Re-enter the coding arena to continue solving questions.
                  </p>
                </div>
              </div>
              <Link
                to="/student/quiz"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 text-center"
              >
                Continue Solving →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!profile?.selectedLanguage ? (
              <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl">
                    1️⃣
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Step 1: Select Your Programming Language</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose C++, Python, Java, or JavaScript before entering the contest arena.
                    </p>
                  </div>
                </div>
                <Link
                  to="/student/language-selection"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 text-center"
                >
                  Select Language →
                </Link>
              </div>
            ) : quizStatus?.isActive ? (
              <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl">
                    2️⃣
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Competition is Active & Ready!</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {profile.selectedLanguage.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click below to review the anti-cheat guidelines and launch your session.
                    </p>
                  </div>
                </div>
                <Link
                  to="/student/start-quiz"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/25 text-center"
                >
                  Enter Competition Exam →
                </Link>
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-xl">
                  ⏳
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Contest Has Not Started Yet</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your language is locked to <strong className="text-indigo-400">{profile.selectedLanguage.toUpperCase()}</strong>. The administrator will activate the competition shortly.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <Link
            to="/student/my-submissions"
            className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 transition shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
              📄
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
              My Submissions & Code History
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Inspect submitted solutions, marks awarded, and evaluator remarks.
            </p>
          </Link>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mb-4">
              📊
            </div>
            <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
              Contest Score Overview
            </span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {profile?.finalMarks ?? 0} <span className="text-base font-normal text-slate-500">/ 60 points</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calculated across Easy (10), Medium (20), and Tough (30) challenges.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
