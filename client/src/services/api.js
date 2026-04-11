import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refreshToken = localStorage.getItem('refreshToken');

    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
          refreshToken
        });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  registerDoctor: (payload) => api.post('/auth/register-doctor', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  updateMe: (payload) => api.put('/auth/me', payload)
};

export const doctorAPI = {
  list: (params) => api.get('/doctors', { params }),
  detail: (id) => api.get(`/doctors/${id}`),
  create: (payload) => api.post('/doctors', payload),
  update: (id, payload) => api.put(`/doctors/${id}`, payload),
  updateApproval: (id, payload) => api.patch(`/doctors/${id}/approval`, payload),
  setAllAvailableToday: () => api.patch('/doctors/availability/today/all'),
  remove: (id) => api.delete(`/doctors/${id}`)
};

export const hospitalAPI = {
  list: () => api.get('/hospitals'),
  detail: (id) => api.get(`/hospitals/${id}`),
  create: (payload) => api.post('/hospitals', payload),
  update: (id, payload) => api.put(`/hospitals/${id}`, payload),
  remove: (id) => api.delete(`/hospitals/${id}`)
};

export const appointmentAPI = {
  listMine: () => api.get('/appointments'),
  availability: (doctorId, params) => api.get(`/appointments/availability/${doctorId}`, { params }),
  book: (payload) => api.post('/appointments', payload),
  update: (id, payload) => api.put(`/appointments/${id}`, payload),
  doctorEarnings: (doctorId) => api.get(`/appointments/doctor/${doctorId}/earnings`),
  doctorToday: (doctorId, date) => api.get(`/appointments/doctor/${doctorId}`, { params: { date } }),
  listAdmin: (params) => api.get('/appointments/admin', { params })
};

export const queueAPI = {
  getByDoctorDate: (doctorId, date) => api.get(`/queue/${doctorId}/${date}`),
  patientStatus: (appointmentId) => api.get(`/queue/patient/${appointmentId}`),
  next: (doctorId, payload) => api.post(`/queue/next/${doctorId}`, payload),
  walkIn: (payload) => api.post('/queue/walkin', payload),
  updateStatus: (appointmentId, payload) => api.put(`/queue/status/${appointmentId}`, payload),
  reset: (payload) => api.post('/queue/reset', payload)
};

export const notificationAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all')
};

export const reportAPI = {
  flow: (params) => api.get('/reports/flow', { params }),
  consultations: () => api.get('/reports/consultations'),
  queueMetrics: () => api.get('/reports/queue-metrics'),
  revenue: () => api.get('/reports/revenue')
};

export default api;
