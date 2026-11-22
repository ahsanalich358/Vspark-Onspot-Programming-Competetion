import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
              VS
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                VSPARK
              </span>
              <p className="text-xs text-slate-400 font-medium">COMSATS University, Vehari Campus</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/student/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg transition"
            >
              Student Login
            </Link>
            <Link
              to="/admin/login"
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 px-4 py-2 rounded-lg border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 transition"
            >
              Admin Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 overflow-hidden">
          {/* Background Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>On-Spot Programming Competition Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Code. Compete. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Conquer the Challenge.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The official live coding arena for the On-Spot Programming Competition. Battle against time, tackle real-world algorithmic problems, and showcase your problem-solving mastery on the spot.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/student/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition transform hover:-translate-y-0.5"
              >
                Register as Student
              </Link>
              <Link
                to="/student/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition"
              >
                Sign In to Dashboard
              </Link>
            </div>

            {/* Role Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
              {/* Student Portal Card */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-md hover:border-indigo-500/40 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 text-xl">
                  👨‍💻
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Student Portal</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Participate individually or in pairs of two. Choose your programming language, solve multi-tiered challenges, and view evaluator feedback.
                </p>
                <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Individual or Group (2 members)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Choose from C++, Python, Java, JavaScript
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Server-enforced timer & answer auto-saving
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/student/register"
                    className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-center text-sm font-semibold transition"
                  >
                    Register
                  </Link>
                  <Link
                    to="/student/login"
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center text-sm font-medium border border-slate-700 transition"
                  >
                    Login
                  </Link>
                </div>
              </div>

              {/* Admin Portal Card */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-md hover:border-purple-500/40 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 text-xl">
                  ⚙️
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Evaluator / Admin</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Full control room for contest organizers. Create questions, bulk upload via CSV/JSON, generate student codes, and grade submissions.
                </p>
                <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> Manage contest questions & 60-point target
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> Monitor tab-switches & paste anti-cheat logs
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> In-depth student grading & custom feedback
                  </div>
                </div>
                <Link
                  to="/admin/login"
                  className="block w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-center text-sm font-semibold transition"
                >
                  Admin Sign In →
                </Link>
              </div>
            </div>

            {/* Competition Details Strip */}
            <div className="mt-16 rounded-2xl border border-slate-800/60 bg-slate-900/30 p-6 backdrop-blur-md max-w-3xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3">
                  <p className="text-2xl font-bold text-indigo-400">60</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Total Marks</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl font-bold text-emerald-400">3 Tiers</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Easy, Med, Tough</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl font-bold text-violet-400">4</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Allowed Languages</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl font-bold text-amber-400">120 Min</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Standard Duration</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="container mx-auto px-6">
          <p>© {new Date().getFullYear()} VSPARK Programming Competition • Developed for COMSATS University, Vehari Campus</p>
          <p className="mt-1 text-slate-600">Built with React, Express, PostgreSQL & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
