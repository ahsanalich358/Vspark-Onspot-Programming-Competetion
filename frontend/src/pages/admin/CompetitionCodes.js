import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const CompetitionCodes = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStudents();
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    setGenerating(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await adminAPI.generateCodes();
      setMessage({ type: 'success', text: response.data.message || 'Codes generated successfully!' });
      await fetchStudents();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate codes' });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownload = async (format) => {
    try {
      const response = await adminAPI.downloadCodes(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `competition-codes.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: 'success', text: `Downloaded competition codes as .${format.toUpperCase()}` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download codes' });
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.competitionCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssigned = students.filter(s => !!s.competitionCode).length;
  const totalMissing = students.length - totalAssigned;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 font-mono font-bold text-lg text-white">
              VS
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Competition Access Codes
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Secure Dispatch
                </span>
              </h1>
              <p className="text-xs text-slate-400">Generate, assign, and distribute access tokens to registered students</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

        {/* Top Summary Cards & Quick Action */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Registered</span>
            <div className="text-3xl font-extrabold text-white mt-1">{students.length}</div>
            <p className="text-xs text-slate-500 mt-1">Students enrolled in portal</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium">Codes Issued</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{totalAssigned}</div>
            <p className="text-xs text-slate-500 mt-1">Ready for contest entry</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">Pending Codes</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">{totalMissing}</div>
            <p className="text-xs text-slate-500 mt-1">{totalMissing > 0 ? 'Action required' : 'All assigned'}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-purple-300 font-medium">Bulk Generator</span>
              <p className="text-xs text-slate-300 mt-1">Auto-assign unique codes to unassigned students</p>
            </div>
            <button
              onClick={handleGenerateCodes}
              disabled={generating || totalMissing === 0}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>⚡</span> Generate Missing Codes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar & Exports */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by student name, email, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Export:</span>
            <button
              onClick={() => handleDownload('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
            >
              <span>📊</span> CSV
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition"
            >
              <span>{`{ }`}</span> JSON
            </button>
            <button
              onClick={() => handleDownload('txt')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
            >
              <span>📄</span> Plain TXT
            </button>
          </div>
        </div>

        {/* Codes Table */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">
              Student Access Credentials
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({filteredStudents.length} {filteredStudents.length === 1 ? 'record' : 'records'})
              </span>
            </h3>
            <span className="text-xs text-slate-400">Click any code to copy</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <span>Loading credentials...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No matching students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6 font-semibold">Student</th>
                    <th className="py-3.5 px-6 font-semibold">University</th>
                    <th className="py-3.5 px-6 font-semibold">Mode</th>
                    <th className="py-3.5 px-6 font-semibold">Assigned Competition Code</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredStudents.map((st) => (
                    <tr key={st.id || st._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-purple-400 text-xs">
                            {st.fullName?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{st.fullName}</div>
                            <div className="text-xs text-slate-400 font-mono">{st.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-300">
                        {st.university || '—'}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          st.participationMode === 'group'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {st.participationMode === 'group' ? '👥 Group' : '👤 Individual'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {st.competitionCode ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-purple-400 tracking-wider bg-purple-950/50 border border-purple-500/30 px-3 py-1 rounded-lg">
                              {st.competitionCode}
                            </span>
                            <button
                              onClick={() => handleCopy(st.competitionCode)}
                              title="Copy code"
                              className={`p-1.5 rounded-lg border text-xs transition ${
                                copiedCode === st.competitionCode
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              }`}
                            >
                              {copiedCode === st.competitionCode ? '✓ Copied' : '📋'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          to={`/admin/students/${st.id || st._id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                          View Student →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompetitionCodes;
