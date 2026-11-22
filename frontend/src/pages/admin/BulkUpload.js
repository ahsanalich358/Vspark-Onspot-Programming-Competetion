import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a CSV or JSON file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await adminAPI.bulkUploadQuestions(formData);
      setResults(response.data.results);
    } catch (error) {
      alert(error.response?.data?.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = `title,problemStatement,difficulty,marks,validLanguages
"Sum of Array Elements","Given an integer array nums, return the sum of all elements.","Easy",10,"cpp,javascript,java,python"
"Two Sum Problem","Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.","Medium",20,"cpp,javascript,java,python"
"Binary Tree Maximum Path Sum (Tough Part 1)","Find the maximum path sum in a binary tree.","Tough",10,"cpp,javascript,java,python"
"Shortest Path with Obstacles (Tough Part 2)","Find the minimum steps to reach the destination walking through obstacles.","Tough",10,"cpp,javascript,java,python"
"Word Break II (Tough Part 3)","Given a string s and a dictionary of words, return all possible valid sentences.","Tough",10,"cpp,javascript,java,python"`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vspark-sample-questions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadSampleJSON = () => {
    const json = [
      {
        title: "Sum of Array Elements",
        problemStatement: "Given an integer array nums, return the sum of all elements.",
        difficulty: "Easy",
        marks: 10,
        validLanguages: ["cpp", "javascript", "java", "python"]
      },
      {
        title: "Two Sum Problem",
        problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Medium",
        marks: 20,
        validLanguages: ["cpp", "javascript", "java", "python"]
      },
      {
        title: "Binary Tree Maximum Path Sum",
        problemStatement: "Find the maximum path sum in a binary tree.",
        difficulty: "Tough",
        marks: 10,
        validLanguages: ["cpp", "javascript", "java", "python"]
      },
      {
        title: "Shortest Path with Obstacles",
        problemStatement: "Find the minimum steps to reach the destination walking through obstacles.",
        difficulty: "Tough",
        marks: 10,
        validLanguages: ["cpp", "javascript", "java", "python"]
      },
      {
        title: "Word Break II",
        problemStatement: "Given a string s and a dictionary of words, return all possible valid sentences.",
        difficulty: "Tough",
        marks: 10,
        validLanguages: ["cpp", "javascript", "java", "python"]
      }
    ];

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vspark-sample-questions.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 font-mono font-bold text-lg text-white">
              📂
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Bulk Question Importer
              </h1>
              <p className="text-xs text-slate-400">Import multiple programming challenges simultaneously via CSV or JSON</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/questions"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
            >
              View Questions
            </Link>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm font-medium border border-slate-700/60 transition shadow-sm"
            >
              <span>←</span> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Sample Templates Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>📋</span> Standardized Import Templates
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Required fields: <code className="text-purple-400">title</code>, <code className="text-purple-400">problemStatement</code>, <code className="text-purple-400">difficulty</code>, <code className="text-purple-400">marks</code> (Optional: Easy: 10, Medium: 20, Tough: 10 or 30), <code className="text-purple-400">validLanguages</code>. Total target = 60 marks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-2"
            >
              <span>📊</span> Download CSV Template
            </button>
            <button
              onClick={downloadSampleJSON}
              className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-2"
            >
              <span>{`{ }`}</span> Download JSON Template
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-8 shadow-xl">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-3xl mb-4 border border-slate-700">
              📁
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              Drag & Drop questions file here
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Supports .csv or .json files containing question definitions
            </p>

            <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 cursor-pointer transition shadow-sm">
              Browse Files
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-4 px-4 py-2 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-300 font-mono flex items-center gap-2">
                <span>✓ Selected:</span>
                <span className="font-bold text-white">{file.name}</span>
                <span className="text-purple-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Importing Questions...
                </>
              ) : (
                <>
                  <span>🚀</span> Import File into Competition
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Presentation */}
        {results && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>📊</span> Import Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-xs uppercase text-emerald-400 font-semibold tracking-wider">Successfully Added</span>
                <div className="text-2xl font-bold text-emerald-300 mt-1">{results.success?.length || 0} questions</div>
              </div>
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
                <span className="text-xs uppercase text-rose-400 font-semibold tracking-wider">Failed / Rejected</span>
                <div className="text-2xl font-bold text-rose-300 mt-1">{results.failed?.length || 0} rows</div>
              </div>
            </div>

            {results.success?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Imported Items:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {results.success.map((item, index) => (
                    <div key={index} className="text-xs text-slate-300 flex items-center justify-between py-1">
                      <span className="text-emerald-400 font-mono mr-2">Row {item.row}:</span>
                      <span className="font-medium text-white flex-1">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.failed?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">Errors:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950/60 p-3 rounded-xl border border-rose-900/40">
                  {results.failed.map((item, index) => (
                    <div key={index} className="text-xs text-rose-300 flex items-start gap-2 py-1">
                      <span className="font-mono text-rose-400">Row {item.row}:</span>
                      <span>{item.error || 'Validation error'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BulkUpload;
