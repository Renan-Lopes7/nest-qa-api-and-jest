const API_URL = 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || 'Algo deu errado. Tente novamente.';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}

export const api = {
  signin: (credentials) => request('/auth/signin', { method: 'POST', body: credentials }),
  signup: (user) => request('/user/signup', { method: 'POST', body: user }),

  getQuestions: (page = 1, limit = 10) =>
    request(`/questions?page=${page}&limit=${limit}`),
  getQuestion: (id) => request(`/questions/${id}`),
  createQuestion: (dto) => request('/questions', { method: 'POST', body: dto, auth: true }),
  updateQuestion: (id, dto) =>
    request(`/questions/${id}`, { method: 'PATCH', body: dto, auth: true }),
  deleteQuestion: (id) => request(`/questions/${id}`, { method: 'DELETE', auth: true }),

  createAnswer: (questionId, dto) =>
    request(`/answers/${questionId}`, { method: 'POST', body: dto, auth: true }),
  updateAnswer: (id, dto) =>
    request(`/answers/${id}`, { method: 'PATCH', body: dto, auth: true }),
  deleteAnswer: (id) => request(`/answers/${id}`, { method: 'DELETE', auth: true }),
};
