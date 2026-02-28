const API_BASE = 'http://127.0.0.1:8000/api/v1';

// ── Token management ─────────────────────────────────────
export function getToken() {
  return localStorage.getItem('ot_token');
}

export function setToken(token) {
  localStorage.setItem('ot_token', token);
}

export function clearToken() {
  localStorage.removeItem('ot_token');
  localStorage.removeItem('ot_user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('ot_user'));
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem('ot_user', JSON.stringify(user));
}

// ── Base request helper ──────────────────────────────────
async function request(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${url}`, config);

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      typeof errorData.detail === 'string'
        ? errorData.detail
        : Array.isArray(errorData.detail)
        ? errorData.detail.map((e) => e.msg).join(', ')
        : `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

// ── Auth ──────────────────────────────────────────────────
export const authRegister = (data) =>
  request('/auth/register', { method: 'POST', body: data });

export const authLogin = (data) =>
  request('/auth/login', { method: 'POST', body: data });

// ── Users ─────────────────────────────────────────────────
export const getMe = () => request('/users/me');

export const updateMe = (data) =>
  request('/users/me', { method: 'PUT', body: data });

export const searchUsers = (q, skip = 0, limit = 20) =>
  request(`/users/search?q=${encodeURIComponent(q)}&skip=${skip}&limit=${limit}`);

export const getUser = (id) => request(`/users/${id}`);

// ── Applications ──────────────────────────────────────────
export const getApplications = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.skip != null) qs.set('skip', params.skip);
  if (params.limit != null) qs.set('limit', params.limit);
  if (params.status) qs.set('status', params.status);
  if (params.priority) qs.set('priority', params.priority);
  return request(`/applications/?${qs}`);
};

export const getApplication = (id) => request(`/applications/${id}`);

export const createApplication = (data) =>
  request('/applications/', { method: 'POST', body: data });

export const updateApplication = (id, data) =>
  request(`/applications/${id}`, { method: 'PUT', body: data });

export const deleteApplication = (id) =>
  request(`/applications/${id}`, { method: 'DELETE' });

// ── Stages ────────────────────────────────────────────────
export const addStage = (appId, data) =>
  request(`/applications/${appId}/stages`, { method: 'POST', body: data });

export const updateStage = (appId, stageId, data) =>
  request(`/applications/${appId}/stages/${stageId}`, { method: 'PUT', body: data });

export const deleteStage = (appId, stageId) =>
  request(`/applications/${appId}/stages/${stageId}`, { method: 'DELETE' });

// ── Outcome ───────────────────────────────────────────────
export const createOutcome = (appId, data) =>
  request(`/applications/${appId}/outcome`, { method: 'POST', body: data });

export const updateOutcome = (appId, outcomeId, data) =>
  request(`/applications/${appId}/outcome/${outcomeId}`, { method: 'PUT', body: data });

export const deleteOutcome = (appId, outcomeId) =>
  request(`/applications/${appId}/outcome/${outcomeId}`, { method: 'DELETE' });

// ── Reflection ────────────────────────────────────────────
export const createReflection = (appId, data) =>
  request(`/applications/${appId}/reflection`, { method: 'POST', body: data });

export const updateReflection = (appId, reflectionId, data) =>
  request(`/applications/${appId}/reflection/${reflectionId}`, { method: 'PUT', body: data });

export const deleteReflection = (appId, reflectionId) =>
  request(`/applications/${appId}/reflection/${reflectionId}`, { method: 'DELETE' });

// ── Resumes ───────────────────────────────────────────────
export const getResumes = (skip = 0, limit = 100) =>
  request(`/resumes/?skip=${skip}&limit=${limit}`);

export const getResume = (id) => request(`/resumes/${id}`);

export const createResume = (data) =>
  request('/resumes/', { method: 'POST', body: data });

export const updateResume = (id, data) =>
  request(`/resumes/${id}`, { method: 'PUT', body: data });

export const deleteResume = (id) =>
  request(`/resumes/${id}`, { method: 'DELETE' });

export const uploadResumeFile = (resumeId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request(`/upload/resumes/${resumeId}`, {
    method: 'POST',
    body: formData,
  });
};

// ── Contacts ──────────────────────────────────────────────
export const getContacts = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.application_id) qs.set('application_id', params.application_id);
  if (params.contact_type) qs.set('contact_type', params.contact_type);
  if (params.skip != null) qs.set('skip', params.skip);
  if (params.limit != null) qs.set('limit', params.limit);
  return request(`/contacts/?${qs}`);
};

export const getContact = (id) => request(`/contacts/${id}`);

export const createContact = (data) =>
  request('/contacts/', { method: 'POST', body: data });

export const updateContact = (id, data) =>
  request(`/contacts/${id}`, { method: 'PUT', body: data });

export const deleteContact = (id) =>
  request(`/contacts/${id}`, { method: 'DELETE' });

// ── Documents ─────────────────────────────────────────────
export const getDocuments = (applicationId) =>
  request(`/documents/${applicationId}`);

export const createDocument = (data) =>
  request('/documents/', { method: 'POST', body: data });

export const updateDocument = (id, data) =>
  request(`/documents/${id}`, { method: 'PUT', body: data });

export const deleteDocument = (id) =>
  request(`/documents/${id}`, { method: 'DELETE' });

// ── Reminders ─────────────────────────────────────────────
export const getReminders = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.is_completed != null) qs.set('is_completed', params.is_completed);
  if (params.reminder_type) qs.set('reminder_type', params.reminder_type);
  if (params.skip != null) qs.set('skip', params.skip);
  if (params.limit != null) qs.set('limit', params.limit);
  return request(`/reminders/?${qs}`);
};

export const getUpcomingReminders = (limit = 10) =>
  request(`/reminders/upcoming?limit=${limit}`);

export const getReminder = (id) => request(`/reminders/${id}`);

export const createReminder = (data) =>
  request('/reminders/', { method: 'POST', body: data });

export const updateReminder = (id, data) =>
  request(`/reminders/${id}`, { method: 'PUT', body: data });

export const completeReminder = (id) =>
  request(`/reminders/${id}/complete`, { method: 'POST' });

export const deleteReminder = (id) =>
  request(`/reminders/${id}`, { method: 'DELETE' });

// ── Tags ──────────────────────────────────────────────────
export const getTags = () => request('/tags/');

export const createTag = (data) =>
  request('/tags/', { method: 'POST', body: data });

export const updateTag = (id, data) =>
  request(`/tags/${id}`, { method: 'PUT', body: data });

export const deleteTag = (id) =>
  request(`/tags/${id}`, { method: 'DELETE' });

export const getApplicationTags = (applicationId) =>
  request(`/tags/application/${applicationId}`);

export const assignTag = (applicationId, tagId) =>
  request(`/tags/application/${applicationId}/assign/${tagId}`, { method: 'POST' });

export const removeTag = (applicationId, tagId) =>
  request(`/tags/application/${applicationId}/remove/${tagId}`, { method: 'DELETE' });

// ── Saved Jobs ────────────────────────────────────────────
export const getSavedJobs = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.priority) qs.set('priority', params.priority);
  if (params.skip != null) qs.set('skip', params.skip);
  if (params.limit != null) qs.set('limit', params.limit);
  return request(`/saved-jobs/?${qs}`);
};

export const getSavedJob = (id) => request(`/saved-jobs/${id}`);

export const createSavedJob = (data) =>
  request('/saved-jobs/', { method: 'POST', body: data });

export const updateSavedJob = (id, data) =>
  request(`/saved-jobs/${id}`, { method: 'PUT', body: data });

export const deleteSavedJob = (id) =>
  request(`/saved-jobs/${id}`, { method: 'DELETE' });

export const convertSavedJob = (id) =>
  request(`/saved-jobs/${id}/convert`, { method: 'POST' });

// ── Analytics ─────────────────────────────────────────────
export const getDashboardAnalytics = () => request('/analytics/dashboard');

export const getActivityLog = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.application_id) qs.set('application_id', params.application_id);
  if (params.skip != null) qs.set('skip', params.skip);
  if (params.limit != null) qs.set('limit', params.limit);
  return request(`/analytics/activity?${qs}`);
};

export const getInterviewQuestions = () => request('/analytics/questions');

// ── Social — Follows ──────────────────────────────────────
export const followUser = (userId) =>
  request(`/social/follow/${userId}`, { method: 'POST' });

export const unfollowUser = (userId) =>
  request(`/social/follow/${userId}`, { method: 'DELETE' });

export const getFollowers = (userId, skip = 0, limit = 50) =>
  request(`/social/followers/${userId}?skip=${skip}&limit=${limit}`);

export const getFollowing = (userId, skip = 0, limit = 50) =>
  request(`/social/following/${userId}?skip=${skip}&limit=${limit}`);

export const getFollowStats = (userId) =>
  request(`/social/follow-stats/${userId}`);

// ── Social — Groups ──────────────────────────────────────
export const createGroup = (data) =>
  request('/social/groups', { method: 'POST', body: data });

export const getGroups = (skip = 0, limit = 50) =>
  request(`/social/groups?skip=${skip}&limit=${limit}`);

export const getMyGroups = () => request('/social/groups/mine');

export const getGroup = (id) => request(`/social/groups/${id}`);

export const updateGroup = (id, data) =>
  request(`/social/groups/${id}`, { method: 'PUT', body: data });

export const deleteGroup = (id) =>
  request(`/social/groups/${id}`, { method: 'DELETE' });

export const joinGroup = (id) =>
  request(`/social/groups/${id}/join`, { method: 'POST' });

export const leaveGroup = (id) =>
  request(`/social/groups/${id}/leave`, { method: 'DELETE' });

export const getGroupMembers = (id) =>
  request(`/social/groups/${id}/members`);

// ── Social — Posts ────────────────────────────────────────
export const createPost = (data) =>
  request('/social/posts', { method: 'POST', body: data });

export const getFeed = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.group_id) qs.set('group_id', params.group_id);
  if (params.skip != null) qs.set('skip', params.skip);
  if (params.limit != null) qs.set('limit', params.limit);
  return request(`/social/posts/feed?${qs}`);
};

export const getMyPosts = (skip = 0, limit = 50) =>
  request(`/social/posts/mine?skip=${skip}&limit=${limit}`);

export const updatePost = (id, data) =>
  request(`/social/posts/${id}`, { method: 'PUT', body: data });

export const deletePost = (id) =>
  request(`/social/posts/${id}`, { method: 'DELETE' });

export const reactToPost = (postId, reaction = 'Like') =>
  request(`/social/posts/${postId}/react`, { method: 'POST', body: { reaction } });

export const removeReaction = (postId) =>
  request(`/social/posts/${postId}/react`, { method: 'DELETE' });

// ── Progress & Milestones ─────────────────────────────────
export const getMilestones = () => request('/progress/milestones');

export const getMyMilestones = () => request('/progress/milestones/mine');

export const getCommunity = (limit = 20) =>
  request(`/progress/community?limit=${limit}`);

export const getMyStats = () => request('/progress/stats');
