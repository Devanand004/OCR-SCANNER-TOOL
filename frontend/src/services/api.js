import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle unauthorized errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const login = (username, password) => api.post('/auth/login', { username, password });
export const register = (username, email, password) => api.post('/auth/register', { username, email, password });

// File Upload Module
export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onUploadProgress) {
        onUploadProgress(percentCompleted);
      }
    },
  });
};

// History Dashboard Module
export const getAllFiles = (params = {}) => {
  const { page = 0, size = 10, search = '', date = '' } = params;
  return api.get(`/history?page=${page}&size=${size}&search=${search}&date=${date}`);
};
export const deleteFile = (fileId) => api.delete(`/history/${fileId}`);

// Processing & OCR Module
export const startPreprocessing = (fileId) => api.post(`/process/${fileId}`);
export const getProcessingStatus = (fileId) => api.get(`/process/status/${fileId}`);
export const startOCR = (fileId, lang) => api.post(`/ocr/extract/${fileId}?lang=${lang}`);
export const getOCRResult = (fileId) => api.get(`/ocr/result/${fileId}`);
export const getFileMetadata = (fileId) => api.get(`/files/${fileId}`);
export const processText = (fileId, manualText) => api.post(`/process-text/${fileId}`, { text: manualText });
export const saveProcessedText = (fileId, text) => api.put(`/process-text/save/${fileId}`, { text });

// Output Display & Translation
export const fetchTextData = (fileId) => api.get(`/text/${fileId}`);
export const updateEditedText = (fileId, text) => api.put(`/text/${fileId}`, { text });
export const translateText = (text, targetLanguage) => api.post('/translate', { text, targetLanguage });

// Export Module
export const exportAsTxt = (fileId) => api.get(`/export/txt/${fileId}`, { responseType: 'blob' });
export const exportAsPdf = (fileId) => api.get(`/export/pdf/${fileId}`, { responseType: 'blob' });
export const exportAsDocx = (fileId) => api.get(`/export/docx/${fileId}`, { responseType: 'blob' });

// Live OCR Module
export const performLiveOCR = (base64Image) => api.post('/ocr/live', { image: base64Image });

export default api;
