import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Home
import Home from './pages/Home';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Questions from './pages/admin/Questions';
import QuizSettings from './pages/admin/QuizSettings';
import Students from './pages/admin/Students';
import Submissions from './pages/admin/Submissions';
import StudentDetail from './pages/admin/StudentDetail';
import CompetitionCodes from './pages/admin/CompetitionCodes';
import BulkUpload from './pages/admin/BulkUpload';

// Student Pages
import StudentRegister from './pages/student/StudentRegister';
import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import LanguageSelection from './pages/student/LanguageSelection';
import StartQuiz from './pages/student/StartQuiz';
import Quiz from './pages/student/Quiz';
import MySubmissions from './pages/student/MySubmissions';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute requireAdmin>
                <Questions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quiz-settings"
            element={
              <ProtectedRoute requireAdmin>
                <QuizSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute requireAdmin>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute requireAdmin>
                <Submissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/student-detail/:studentId"
            element={
              <ProtectedRoute requireAdmin>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/codes"
            element={
              <ProtectedRoute requireAdmin>
                <CompetitionCodes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bulk-upload"
            element={
              <ProtectedRoute requireAdmin>
                <BulkUpload />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requireStudent>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/language-selection"
            element={
              <ProtectedRoute requireStudent>
                <LanguageSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/start-quiz"
            element={
              <ProtectedRoute requireStudent>
                <StartQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz"
            element={
              <ProtectedRoute requireStudent>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-submissions"
            element={
              <ProtectedRoute requireStudent>
                <MySubmissions />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
