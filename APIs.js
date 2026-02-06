// --------------------------- CONFIG ---------------------------
const API_URL = "http://localhost:5001"; // your backend base URL

// --------------------------- AUTH HELPERS ---------------------------
function getToken() {
  return localStorage.getItem("token");
}

function setAuth(token, role) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

function getRole() {
  return localStorage.getItem("role");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  alert("Logged out successfully");
  window.location.href = "login.html";
}

// --------------------------- GENERIC REQUEST WRAPPER ---------------------------
async function apiRequest(endpoint, method = "GET", data = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || "API Error");
  return json;
}

// --------------------------- AUTH ---------------------------

// Register User
async function registerUser(fullname, email, password, role) {
  return apiRequest("/register", "POST", { fullname, email, password, role });
}

// Login User
async function loginUser(email, password) {
  const res = await apiRequest("/api/users/login", "POST", { email, password });
  setAuth(res.token, res.role);
  return res;
}

// --------------------------- IDEAS (CREATOR) ---------------------------

// Add new idea
async function addIdea(title, description) {
  return apiRequest("/api/ideas", "POST", { title, description }, true);
}

// Get all ideas
async function getAllIdeas() {
  return apiRequest("/api/ideas", "GET", null, true);
}

// Update idea
async function updateIdea(id, data) {
  return apiRequest(`/api/ideas/${id}`, "PUT", data, true);
}

// Delete idea
async function deleteIdea(id) {
  return apiRequest(`/api/ideas/${id}`, "DELETE", null, true);
}

// --------------------------- REQUIREMENTS (COMPANY) ---------------------------

// Add new requirement
async function addRequirement(title, details) {
  return apiRequest("/api/requirements", "POST", { title, details }, true);
}

// Get all requirements
async function getAllRequirements() {
  return apiRequest("/api/requirements", "GET", null, true);
}

// Update requirement
async function updateRequirement(id, data) {
  return apiRequest(`/api/requirements/${id}`, "PUT", data, true);
}

// Delete requirement
async function deleteRequirement(id) {
  return apiRequest(`/api/requirements/${id}`, "DELETE", null, true);
}
