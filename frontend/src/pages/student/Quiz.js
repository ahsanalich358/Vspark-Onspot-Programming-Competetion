import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import { setupAntiCheat } from '../../utils/antiCheat';
import CodeEditor from '../../components/CodeEditor';
import Timer from '../../components/Timer';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [quizStatus, setQuizStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestionsAndSubmissions();
    const cleanup = setupAntiCheat();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchQuestionsAndSubmissions = async () => {
    try {
      const [questionsRes, statusRes, mySubsRes] = await Promise.all([
        studentAPI.getQuestions(),
        studentAPI.getQuizStatus(),
        studentAPI.getMySubmissions().catch(() => ({ data: [] }))
      ]);

      const fetchedQuestions = questionsRes.data.questions || [];
      setQuestions(fetchedQuestions);
      setQuizStatus(statusRes.data);

      // Pre-fill answers from existing submissions or blanks
      const initialAnswers = {};
      const initialSaved = {};
      fetchedQuestions.forEach((q) => {
        const qId = q.id || q._id;
        initialAnswers[qId] = '';
        initialSaved[qId] = false;
      });

      if (mySubsRes?.data?.length) {
        mySubsRes.data.forEach((sub) => {
          const qId = sub.questionId;
          if (qId && sub.code) {
            initialAnswers[qId] = sub.code;
            initialSaved[qId] = true;
          }
        });
      }

      setAnswers(initialAnswers);
      setSavedStatus(initialSaved);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert(error.response?.data?.message || 'Failed to load quiz session');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (code) => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    const questionId = currentQ.id || currentQ._id;
    setAnswers((prev) => ({ ...prev, [questionId]: code }));
    setSavedStatus((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleSaveAnswer = async () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    const questionId = currentQ.id || currentQ._id;
    const code = answers[questionId];

    if (!code || !code.trim()) {
      showToast('Please type your solution code before saving.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await studentAPI.submitAnswer({
        questionId: questionId,
        code: code
      });
      setSavedStatus((prev) => ({ ...prev, [questionId]: true }));
      showToast(`Question ${currentQuestionIndex + 1} code saved to server!`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save solution', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await studentAPI.submitQuiz();
      navigate('/student/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const handleTimeUp = async () => {
    alert('Time has expired! Your quiz solutions are being finalized and submitted automatically.');
    try {
      await studentAPI.submitQuiz();
    } catch (e) {
      console.error('Auto-submit error:', e);
    } finally {
      navigate('/student/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Entering competition IDE...</span>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion ? (currentQuestion.id || currentQuestion._id) : null;
  const currentCode = currentQuestionId ? (answers[currentQuestionId] || '') : '';
  const isCurrentSaved = currentQuestionId ? savedStatus[currentQuestionId] : false;

  const answeredCount = Object.values(savedStatus).filter(Boolean).length;
  const progressPercent = questions.length ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col no-select">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition-all ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
        }`}>
          <span>{toastMessage.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top IDE Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-white shadow-md">
            VS
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              VSPARK Competition IDE
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {quizStatus?.selectedLanguage?.toUpperCase() || 'CODE'}
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Anti-Cheat Active • Full Screen Monitored
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Digital Timer */}
          {quizStatus?.endTime && (
            <Timer endTime={quizStatus.endTime} onTimeUp={handleTimeUp} />
          )}

          {/* Final Finish Button */}
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-600/20"
          >
            Submit Contest
          </button>
        </div>
      </header>

      {/* Question Selector Pill Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {questions.map((q, idx) => {
            const qId = q.id || q._id;
            const isSaved = savedStatus[qId];
            const isSelected = idx === currentQuestionIndex;

            return (
              <button
                key={qId}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : isSaved
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>Q{idx + 1}</span>
                <span className="text-[10px] opacity-75">
                  ({q.difficulty} • {q.marks}pts)
                </span>
                {isSaved && <span className="text-emerald-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Saved: <strong className="text-emerald-400">{answeredCount}/{questions.length}</strong></span>
          <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Coding Area */}
      {currentQuestion && (
        <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
          {/* Left Column: Problem Statement (5 columns) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    currentQuestion.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                    {currentQuestion.marks} Points
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {currentQuestionIndex + 1}. {currentQuestion.title}
                  </h2>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Problem Specification
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-sans">
                    {currentQuestion.problemStatement}
                  </div>
                </div>
              </div>

              {/* Tips & Notice */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
                <p>• Write standard algorithmic solution code in your selected language.</p>
                <p>• Save your solution frequently using the button below before moving forward.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Code Editor & Actions (7 columns) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Solution Editor</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isCurrentSaved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {isCurrentSaved ? '✓ Saved to server' : '● Unsaved changes'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Language: {quizStatus?.selectedLanguage || 'generic'}
                  </span>
                </div>

                {/* Modern Dark Code Editor */}
                <CodeEditor
                  value={currentCode}
                  onChange={handleAnswerChange}
                  language={quizStatus?.selectedLanguage}
                />
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleSaveAnswer}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving Solution...
                    </>
                  ) : (
                    <>
                      <span>💾</span> Save Answer (Q{currentQuestionIndex + 1})
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Final Contest Submission</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have saved answers for <strong className="text-white">{answeredCount} of {questions.length}</strong> questions.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              Once submitted, your session will conclude permanently and your code will be locked for evaluation. This action cannot be reversed.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30"
              >
                Yes, Submit Everything Now
              </button>
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                Keep Coding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
