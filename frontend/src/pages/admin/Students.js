import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = students;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.university.toLowerCase().includes(term) ||
        (s.competitionCode && s.competitionCode.toLowerCase().includes(term)) ||
        (s.groupMemberName && s.groupMemberName.toLowerCase().includes(term))
      );
    }

    if (filterMode === 'individual') {
      result = result.filter(s => s.participationMode === 'individual');
    } else if (filterMode === 'group') {
      result = result.filter(s => s.participationMode === 'group');
    } else if (filterMode === 'submitted') {
      result = result.filter(s => s.quizSubmitted);
    } else if (filterMode === 'inprogress') {
      result = result.filter(s => s.quizStartTime && !s.quizSubmitted);
    }

    setFilteredStudents(result);
  }, [searchTerm, filterMode, students]);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Students Directory...</span>
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
                Registered Students
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  {students.length} Total
                </span>
              </h1>
              <p className="text-xs text-slate-400">Manage contestant credentials, teams, and progress</p>
            </div>
          </div>

          <Link
            to="/admin/codes"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md shadow-purple-600/20"
          >
            🎫 View Codes
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        {/* Search & Filters */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 mb-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name, email, code, university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs transition"
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Students' },
              { id: 'individual', label: 'Individual' },
              { id: 'group', label: 'Groups' },
              { id: 'submitted', label: 'Submitted' },
              { id: 'inprogress', label: 'In Progress' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border whitespace-nowrap font-medium transition ${
                  filterMode === tab.id
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Participant / Team</th>
                  <th className="px-6 py-3.5">University</th>
                  <th className="px-6 py-3.5">Mode</th>
                  <th className="px-6 py-3.5">Language</th>
                  <th className="px-6 py-3.5">Contest Code</th>
                  <th className="px-6 py-3.5">Quiz Status</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((student) => (
                  <tr key={student.id || student._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs">
                          {getInitials(student.fullName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{student.fullName}</div>
                          <div className="text-slate-500 text-[11px]">{student.email}</div>
                          {student.participationMode === 'group' && student.groupMemberName && (
                            <div className="text-indigo-400 text-[11px] font-medium mt-0.5 flex items-center gap-1">
                              <span>+</span> {student.groupMemberName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 max-w-xs truncate">
                      {student.university}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium ${
                        student.participationMode === 'group'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {student.participationMode === 'group' ? '👥 Group' : '👤 Solo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px]">
                      {student.selectedLanguage ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-semibold">
                          {student.selectedLanguage}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Pending</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      {student.competitionCode ? (
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-purple-300 font-bold text-[11px]">
                          {student.competitionCode}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.quizSubmitted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Submitted
                        </span>
                      ) : student.quizStartTime ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-400 font-medium">
                          Not Started
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-white">
                      {student.finalMarks} <span className="text-slate-500 text-xs font-normal">/ 60</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/admin/student-detail/${student.id || student._id}`}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold text-xs transition inline-flex items-center gap-1"
                      >
                        <span>Audit Dossier</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No matching students found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Students;
