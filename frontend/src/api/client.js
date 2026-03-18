import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateEpic = async (requirement) => {
  const response = await api.post('/generate-epic', { requirement });
  return response.data;
};

export const validateEpic = async (epicId) => {
  const response = await api.post(`/validate-epic/${epicId}`);
  return response.data;
};

export const replanEpic = async (epicId) => {
  const response = await api.post(`/replan-epic/${epicId}`);
  return response.data;
};

export const approveEpic = async (epicId, approved, feedback = null) => {
  const response = await api.post(`/approve-epic/${epicId}`, { approved, feedback });
  return response.data;
};

export const enrichTasks = async (epicId) => {
  const response = await api.post(`/enrich-tasks/${epicId}`);
  return response.data;
};

export const assignTasks = async (epicId) => {
  const response = await api.post(`/assign-tasks/${epicId}`);
  return response.data;
};

export const computeWaves = async (epicId) => {
  const response = await api.post(`/compute-waves/${epicId}`);
  return response.data;
};

export const getEpic = async (epicId) => {
  const response = await api.get(`/epic/${epicId}`);
  return response.data;
};

export const getValidationHistory = async (epicId) => {
  const response = await api.get(`/epic/${epicId}/validation-history`);
  return response.data;
};

export const getDAG = async (epicId) => {
  const response = await api.get(`/epic/${epicId}/dag`);
  return response.data;
};

export default api;
