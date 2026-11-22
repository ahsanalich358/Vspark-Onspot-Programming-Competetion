import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if a protected request fails with 401 and is NOT a login attempt
    const isLoginRequest = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      // Token expired or invalid on a protected page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminRoute ? '/admin/login' : '/student/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Admin API calls
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  register: (data) => api.post('/admin/register', data),
  
  // Questions
  getQuestions: () => api.get('/admin/questions'),
  createQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  bulkUploadQuestions: (formData) => api.post('/admin/questions/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Quiz settings
  getQuizSettings: () => api.get('/admin/quiz-settings'),
  updateQuizSettings: (data) => api.put('/admin/quiz-settings', data),
  
  // Students
  getStudents: () => api.get('/admin/students'),
  reviewStudent: (id) => api.put(`/admin/students/${id}/review`),
  
  // Submissions
  getSubmissions: () => api.get('/admin/submissions'),
  getStudentSubmissions: (studentId) => api.get(`/admin/submissions/student/${studentId}`),
  gradeSubmission: (id, data) => api.put(`/admin/submissions/${id}/grade`, data),
  
  // Event logs
  getEventLogs: (studentId) => api.get(`/admin/event-logs/${studentId}`),
  
  // Competition codes
  generateCodes: () => api.post('/admin/generate-codes'),
  downloadCodes: (format) => api.get(`/admin/download-codes?format=${format}`, { responseType: 'blob' }),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard-stats')
};

// Student API calls
export const studentAPI = {
  register: (data) => api.post('/students/register', data),
  login: (credentials) => api.post('/students/login', credentials),
  getProfile: () => api.get('/students/profile'),
  
  // Quiz
  selectLanguage: (language) => api.post('/students/select-language', { language }),
  startQuiz: () => api.post('/students/start-quiz'),
  getQuestions: () => api.get('/students/questions'),
  submitAnswer: (data) => api.post('/students/submit-answer', data),
  submitQuiz: () => api.post('/students/submit-quiz'),
  getMySubmissions: () => api.get('/students/my-submissions'),
  getQuizStatus: () => api.get('/students/quiz-status'),
  
  // Event logging
  logEvent: (eventType, details) => api.post('/students/log-event', { eventType, details })
};
