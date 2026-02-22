const API_BASE = 'http://localhost:8000/api/v1';

async function request(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Applications
export const getApplications = (skip = 0, limit = 100) =>
  request(`/applications/?skip=${skip}&limit=${limit}`);

export const getApplication = (id) =>
  request(`/applications/${id}`);

export const createApplication = (data) =>
  request('/applications/', { method: 'POST', body: data });

export const updateApplication = (id, data) =>
  request(`/applications/${id}`, { method: 'PUT', body: data });

// Application Stages
export const addStage = (applicationId, data) =>
  request(`/applications/${applicationId}/stages`, {
    method: 'POST',
    body: { ...data, application_id: applicationId },
  });

// Outcomes
export const setOutcome = (applicationId, data) =>
  request(`/applications/${applicationId}/outcome`, {
    method: 'POST',
    body: { ...data, application_id: applicationId },
  });

// Reflections
export const addReflection = (applicationId, data) =>
  request(`/applications/${applicationId}/reflection`, {
    method: 'POST',
    body: { ...data, application_id: applicationId },
  });

// Resumes
export const getResumes = (skip = 0, limit = 100) =>
  request(`/resumes/?skip=${skip}&limit=${limit}`);

export const getResume = (id) =>
  request(`/resumes/${id}`);

export const createResume = (data) =>
  request('/resumes/', { method: 'POST', body: data });

export const updateResume = (id, data) =>
  request(`/resumes/${id}`, { method: 'PUT', body: data });
