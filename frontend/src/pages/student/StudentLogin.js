import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../utils/api';

const StudentLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await studentAPI.login(formData);
      login(response.data.token, response.data.student, 'student');
      navigate('/student/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setError(serverMsg || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative selection:bg-indigo-600 selection:text-white">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-8 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center text-xl mb-4 font-bold shadow-sm">
            🎓
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Student Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">Access your VSPARK competition exam room</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
              placeholder="e.g. fatima.noor@comsats.edu.pk"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Arena'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex flex-col gap-2">
          <Link to="/student/register" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
            Don't have an account? <span className="underline font-semibold">Register as student</span>
          </Link>
          <Link to="/" className="text-slate-500 hover:text-slate-300 text-xs transition mt-1">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
