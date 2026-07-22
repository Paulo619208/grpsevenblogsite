const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function requestJson(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function fetchPaymentArticle() {
  return requestJson("/articles/payment-methods");
}

export async function signupUser(payload) {
  return requestJson("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload) {
  return requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchPosts(token) {
  return requestJson("/posts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export async function createPost(payload, token) {
  return requestJson("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
