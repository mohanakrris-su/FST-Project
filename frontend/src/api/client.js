const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api";
const TOKEN_KEY = "smartcareq_admin_token";

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (auth) {
    const token = tokenStorage.get();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { message: "Unexpected response from server." };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export const tokenStorage = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const adminApi = {
  bootstrapStatus() {
    return request("/admin/auth/bootstrap-status", { auth: false });
  },
  bootstrapAdmin(data) {
    return request("/admin/auth/bootstrap", {
      method: "POST",
      auth: false,
      body: data
    });
  },
  login(data) {
    return request("/admin/auth/login", {
      method: "POST",
      auth: false,
      body: data
    });
  },
  me() {
    return request("/admin/auth/me");
  },
  logout() {
    return request("/admin/auth/logout", { method: "POST" });
  },
  getOverview(date) {
    return request(`/admin/dashboard/overview${date ? `?date=${date}` : ""}`);
  },
  getQueues(date) {
    return request(`/admin/resources/queues${date ? `?date=${date}` : ""}`);
  },
  getAppointments(query = {}) {
    const search = new URLSearchParams(query).toString();
    return request(`/admin/resources/appointments${search ? `?${search}` : ""}`);
  },
  getQueuePrediction(queueId, manualAverageMinutes) {
    const query = manualAverageMinutes
      ? `?manualAverageMinutes=${encodeURIComponent(manualAverageMinutes)}`
      : "";

    return request(`/admin/predictions/queue/${queueId}${query}`);
  },
  getAppointmentPrediction(appointmentId, manualAverageMinutes) {
    const query = manualAverageMinutes
      ? `?manualAverageMinutes=${encodeURIComponent(manualAverageMinutes)}`
      : "";

    return request(`/admin/predictions/appointment/${appointmentId}${query}`);
  }
};
