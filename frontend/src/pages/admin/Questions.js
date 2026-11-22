import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [breakdown, setBreakdown] = useState({
    easyMarks: 0,
    mediumMarks: 0,
    toughMarks: 0,
    toughCount: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    problemStatement: '',
    difficulty: 'Easy',
    marks: 10,
    validLanguages: ['cpp', 'javascript', 'java', 'python']
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await adminAPI.getQuestions();
      setQuestions(response.data.questions || []);
      setTotalMarks(response.data.totalMarks || 0);
      if (response.data.breakdown) {
        setBreakdown(response.data.breakdown);
      } else {
        // Fallback calculation
        const qs = response.data.questions || [];
        setBreakdown({
          easyMarks: qs.filter(q => q.difficulty === 'Easy').reduce((s, q) => s + (q.marks || 0), 0),
          mediumMarks: qs.filter(q => q.difficulty === 'Medium').reduce((s, q) => s + (q.marks || 0), 0),
          toughMarks: qs.filter(q => q.difficulty === 'Tough').reduce((s, q) => s + (q.marks || 0), 0),
          toughCount: qs.filter(q => q.difficulty === 'Tough').length
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const lang = value;
      setFormData(prev => ({
        ...prev,
        validLanguages: checked
          ? [...prev.validLanguages, lang]
          : prev.validLanguages.filter(l => l !== lang)
      }));
    } else if (name === 'difficulty') {
      // Auto-suggest marks based on teacher selection
      let defaultMarks = 10;
      if (value === 'Medium') defaultMarks = 20;
      if (value === 'Tough') defaultMarks = 10; // Default to 10 for the 3-question mode (or teacher can toggle to 30)

      setFormData(prev => ({
        ...prev,
        difficulty: value,
        marks: defaultMarks
      }));
    } else if (name === 'marks') {
      setFormData(prev => ({
        ...prev,
        marks: parseInt(value, 10) || 0
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const setToughMarksPreset = (marksVal) => {
    setFormData(prev => ({ ...prev, marks: marksVal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.validLanguages.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one programming language' });
      return;
    }

    try {
      if (editingQuestion) {
        await adminAPI.updateQuestion(editingQuestion.id || editingQuestion._id, formData);
        setMessage({ type: 'success', text: 'Question updated successfully' });
      } else {
        await adminAPI.createQuestion(formData);
        setMessage({ type: 'success', text: 'Question created successfully' });
      }
      
      setShowForm(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      problemStatement: question.problemStatement,
      difficulty: question.difficulty,
      marks: question.marks !== undefined ? question.marks : (question.difficulty === 'Easy' ? 10 : question.difficulty === 'Medium' ? 20 : 10),
      validLanguages: question.validLanguages || ['cpp', 'javascript', 'java', 'python']
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await adminAPI.deleteQuestion(id);
        setMessage({ type: 'success', text: 'Question deleted successfully' });
        fetchQuestions();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete question' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      problemStatement: '',
      difficulty: 'Easy',
      marks: 10,
      validLanguages: ['cpp', 'javascript', 'java', 'python']
    });
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Tough':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Questions...</span>
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
                Manage Questions
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  {questions.length} Items
                </span>
              </h1>
              <p className="text-xs text-slate-400">Total 60 Marks Management • Easy (10) + Medium (20) + Tough (30)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`text-xs px-3.5 py-1.5 rounded-xl border font-mono font-semibold flex items-center gap-2 ${
              totalMarks === 60 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${totalMarks === 60 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              <span>Total Marks: {totalMarks} / 60</span>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditingQuestion(null);
                  resetForm();
                }
              }}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md shadow-purple-600/20"
            >
              {showForm ? 'Cancel Form' : '+ New Question'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
        {/* Marks Allocation Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Balance</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${totalMarks === 60 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {totalMarks === 60 ? 'Complete' : `${60 - totalMarks} pts needed`}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{totalMarks} <span className="text-sm font-normal text-slate-400">/ 60 pts</span></p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Easy Portion</span>
              <span className="text-[11px] font-mono text-slate-400">Target: 10 pts</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">{breakdown.easyMarks} <span className="text-sm font-normal text-slate-400">pts</span></p>
            <p className="text-[11px] text-slate-500 mt-1">1 question @ 10 marks</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Medium Portion</span>
              <span className="text-[11px] font-mono text-slate-400">Target: 20 pts</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{breakdown.mediumMarks} <span className="text-sm font-normal text-slate-400">pts</span></p>
            <p className="text-[11px] text-slate-500 mt-1">1 question @ 20 marks</p>
          </div>

          <div className={`p-4 rounded-xl border backdrop-blur-sm ${breakdown.toughMarks === 30 ? 'border-rose-500/30 bg-rose-950/20' : 'border-slate-800 bg-slate-900/60'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Tough Portion</span>
              <span className="text-[11px] font-mono text-slate-400">Target: 30 pts</span>
            </div>
            <p className="text-2xl font-extrabold text-rose-400 font-mono">{breakdown.toughMarks} <span className="text-sm font-normal text-slate-400">pts</span></p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              {breakdown.toughCount === 3 && breakdown.toughMarks === 30
                ? '✓ 3 questions @ 10 pts each'
                : breakdown.toughCount === 1 && breakdown.toughMarks === 30
                ? '✓ 1 question @ 30 pts'
                : `${breakdown.toughCount} added (Choice: 3 × 10 or 1 × 30)`}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-75">✕</button>
          </div>
        )}

        {/* Question Form */}
        {showForm && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingQuestion ? '✏️ Edit Question' : '✨ Create New Question'}</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Target: 60 total marks (Easy: 10, Medium: 20, Tough: 30)
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Question Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 text-sm"
                  placeholder="e.g. Reverse a Linked List"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Problem Statement *</label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 text-sm leading-relaxed"
                  placeholder="Describe the challenge, inputs, outputs, and constraints clearly..."
                />
              </div>

              {/* Difficulty and Marks Management */}
              <div className="grid sm:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Difficulty Tier *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="Easy" className="bg-slate-900">Easy (Standard: 10 Marks)</option>
                    <option value="Medium" className="bg-slate-900">Medium (Standard: 20 Marks)</option>
                    <option value="Tough" className="bg-slate-900">Tough (Total 30 Marks Portion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Assigned Marks *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="marks"
                      min="1"
                      max="60"
                      value={formData.marks}
                      onChange={handleChange}
                      required
                      className="w-28 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono text-base font-bold focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-xs text-slate-400 font-mono">pts</span>
                  </div>

                  {/* Teacher Choice presets when difficulty is Tough */}
                  {formData.difficulty === 'Tough' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Teacher Option for Tough Portion:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setToughMarksPreset(10)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                            formData.marks === 10
                              ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          3 Questions Mode (10 pts each)
                        </button>
                        <button
                          type="button"
                          onClick={() => setToughMarksPreset(30)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                            formData.marks === 30
                              ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          1 Question Mode (30 pts)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Allowed Languages *</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { id: 'cpp', label: 'C++' },
                    { id: 'javascript', label: 'JavaScript' },
                    { id: 'java', label: 'Java' },
                    { id: 'python', label: 'Python' }
                  ].map(lang => (
                    <label
                      key={lang.id}
                      className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer select-none font-medium transition ${
                        formData.validLanguages.includes(lang.id)
                          ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={lang.id}
                        checked={formData.validLanguages.includes(lang.id)}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span>{formData.validLanguages.includes(lang.id) ? '✓ ' : ''}{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/20"
                >
                  {editingQuestion ? 'Save Changes' : 'Publish Question'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id || question._id}
              className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-md hover:border-slate-700 transition shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                    Q{index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">{question.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getDifficultyBadge(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full border font-mono font-bold bg-slate-800 border-slate-700 text-purple-300">
                    {question.marks} pts
                  </span>
                </div>
              </div>

              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed mb-4 pl-10 border-l-2 border-slate-800">
                {question.problemStatement}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium mr-1">Languages:</span>
                  {(question.validLanguages || []).map(lang => (
                    <span key={lang} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {lang === 'cpp' ? 'C++' : lang}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id || question._id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl text-slate-400 mx-auto mb-3">
                📝
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Questions Added Yet</h3>
              <p className="text-xs text-slate-400 mb-4">Click below or use Bulk Upload to populate the competition questions.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                + Add First Question
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Questions;
