import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../utils/api';

const universities = [
  'COMSATS University Islamabad, Vehari Campus',
  'COMSATS University Islamabad (Main / Other Campuses)',
  'NUST Islamabad',
  'FAST-NUCES',
  'LUMS Lahore',
  'UET Lahore',
  'University of the Punjab',
  'Bahauddin Zakariya University (BZU)',
  'Other'
];

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: 'COMSATS University Islamabad, Vehari Campus',
    customUniversity: '',
    password: '',
    confirmPassword: '',
    participationMode: 'individual',
    groupMember: {
      fullName: '',
      email: '',
      phone: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('groupMember.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        groupMember: { ...formData.groupMember, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.participationMode === 'group') {
      if (!formData.groupMember.fullName || !formData.groupMember.email || !formData.groupMember.phone) {
        setError('Please provide all details for the 2nd group member');
        return;
      }
    }

    setLoading(true);

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university === 'Other' ? formData.customUniversity : formData.university,
        password: formData.password,
        participationMode: formData.participationMode
      };

      if (formData.participationMode === 'group') {
        registrationData.groupMember = formData.groupMember;
      }

      const response = await studentAPI.register(registrationData);
      login(response.data.token, response.data.student, 'student');
      navigate('/student/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setError(serverMsg || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 py-12 relative selection:bg-indigo-600 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-8 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center text-xl mb-4 font-bold shadow-lg shadow-indigo-600/10">
            ✍️
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Student Registration</h2>
          <p className="text-xs text-slate-400 mt-1">Join the VSPARK On-Spot Programming Competition</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Participation Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Participation Mode *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-medium ${
                formData.participationMode === 'individual'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="participationMode"
                  value="individual"
                  checked={formData.participationMode === 'individual'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span>👤 Individual</span>
              </label>

              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-medium ${
                formData.participationMode === 'group'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="participationMode"
                  value="group"
                  checked={formData.participationMode === 'group'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span>👥 Group (2 Members)</span>
              </label>
            </div>
          </div>

          {/* Primary Student Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {formData.participationMode === 'group' ? 'Leader / Member 1 Full Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                placeholder="Muhammad Ali"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                  placeholder="ali@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                  placeholder="03001234567 (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">University / Institute *</label>
              <select
                name="university"
                value={formData.university}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm transition"
              >
                {universities.map((uni) => (
                  <option key={uni} value={uni} className="bg-slate-900">{uni}</option>
                ))}
              </select>
            </div>

            {formData.university === 'Other' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Custom University Name *</label>
                <input
                  type="text"
                  name="customUniversity"
                  value={formData.customUniversity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                  placeholder="Enter your university or college name"
                />
              </div>
            )}
          </div>

          {/* Group Member 2 Details */}
          {formData.participationMode === 'group' && (
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Group Partner (Member 2) Information</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Partner Full Name *</label>
                <input
                  type="text"
                  name="groupMember.fullName"
                  value={formData.groupMember.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Bilal Ahmed"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Partner Email *</label>
                  <input
                    type="email"
                    name="groupMember.email"
                    value={formData.groupMember.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="bilal@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Partner Phone</label>
                  <input
                    type="tel"
                    name="groupMember.phone"
                    value={formData.groupMember.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="03129876543 (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Create Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Submitting Registration...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex flex-col gap-2">
          <Link to="/student/login" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
            Already have an account? <span className="underline font-semibold">Sign in here</span>
          </Link>
          <Link to="/" className="text-slate-500 hover:text-slate-300 text-xs transition mt-1">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
