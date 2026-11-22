import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const QuizSettings = () => {
  const [settings, setSettings] = useState({ duration: 120, isActive: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getQuizSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load quiz settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await adminAPI.updateQuizSettings(settings);
      setMessage({ type: 'success', text: 'Contest settings saved and broadcasted successfully!' });
      fetchSettings();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const hours = Math.floor((settings.duration || 0) / 60);
  const minutes = (settings.duration || 0) % 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <span>Loading configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 font-mono font-bold text-lg text-white">
              ⚙️
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Contest Rules & Control Panel
              </h1>
              <p className="text-xs text-slate-400">Manage competition timing, accessibility, and platform state</p>
            </div>
          </div>
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm font-medium border border-slate-700/60 transition shadow-sm"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {message.text && (
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <span className="flex items-center gap-2">
              <span>{message.type === 'success' ? '✓' : '⚠'}</span>
              <span>{message.text}</span>
            </span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Live Status Banner */}
        <div className={`p-6 rounded-2xl border transition shadow-xl ${
          settings.isActive
            ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-slate-900 border-emerald-500/40'
            : 'bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                settings.isActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {settings.isActive ? '🟢' : '⚪'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Current Competition Status: {settings.isActive ? 'ACTIVE & LIVE' : 'PAUSED / INACTIVE'}
                  </h2>
                  {settings.isActive && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {settings.isActive
                    ? 'Students who have chosen their language can actively start solving questions.'
                    : 'The portal is in lockdown. Students cannot begin new test sessions.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSettings({ ...settings, isActive: !settings.isActive })}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg flex items-center gap-2 self-start sm:self-auto ${
                settings.isActive
                  ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {settings.isActive ? '⏸ Switch to Inactive' : '▶ Activate Competition Now'}
            </button>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span>⏱️</span> Contest Time Budget
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quiz Duration (minutes per session)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <input
                  type="number"
                  value={settings.duration}
                  onChange={(e) => setSettings({ ...settings, duration: Math.max(1, parseInt(e.target.value) || 0) })}
                  min="1"
                  max="600"
                  className="w-full sm:w-48 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-base focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60"
                />
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
                  <span className="text-purple-400 font-semibold">{settings.duration} minutes</span>
                  <span>=</span>
                  <span className="text-slate-200 font-medium">
                    {hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''} {minutes} mins
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                The countdown begins the instant a student clicks "Start Quiz". Server-side timestamps prevent clock manipulation.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.isActive}
                  onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm font-medium text-slate-200">
                  Allow student participation (Active Mode)
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span>💾</span> Save Contest Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Integrity Notes */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <span>🛡️</span> Security & Competition Enforcement Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-200 block mb-1">Server-Side Strict Deadline</span>
              Submissions are rejected automatically by the backend once the allocated duration elapses from the student's recorded start time.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-200 block mb-1">Language Selection Lock</span>
              Students lock in their chosen programming language (C++, Python, Java, or JavaScript) before starting.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-200 block mb-1">Anti-Cheat Telemetry</span>
              Tab switches, blur events, developer console shortcuts, and clipboard paste attempts are logged in real-time.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-slate-200 block mb-1">Contest Conclusion</span>
              Deactivate the quiz when the competition ends to prevent new attempts while reviewing and grading submissions.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizSettings;
