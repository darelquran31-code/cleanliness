const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
  // Auth
  login: async (nationalId, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nationalId, password }),
    });
    return response.json();
  },

  changePassword: async (nationalId, oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nationalId, oldPassword, newPassword }),
    });
    return response.json();
  },

  // Admin
  addUser: async (nationalId, name, mosque, role) => {
    const response = await fetch(`${API_BASE_URL}/admin/add-user`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nationalId, name, mosque, role }),
    });
    return response.json();
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  addMaterial: async (name, unit, quantity) => {
    const response = await fetch(`${API_BASE_URL}/admin/add-material`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, unit, quantity }),
    });
    return response.json();
  },

  getMaterials: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/materials`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  updateMaterial: async (id, name, unit, quantity) => {
    const response = await fetch(`${API_BASE_URL}/admin/update-material/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, unit, quantity }),
    });
    return response.json();
  },

  deleteMaterial: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/delete-material/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },

  getAllocations: async (mosque) => {
    const response = await fetch(`${API_BASE_URL}/admin/allocations/${mosque}`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  // User
  addReceipt: async (mosque, governorate, zone, section, mosqueName, registrarPhone, workerName, workerNationalId, secondWorkerName, secondWorkerNationalId, materials, month, year) => {
    const response = await fetch(`${API_BASE_URL}/user/add-receipt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mosque, governorate, zone, section, mosqueName, registrarPhone, workerName, workerNationalId, secondWorkerName, secondWorkerNationalId, materials, month, year }),
    });
    return response.json();
  },

  getReceipts: async () => {
    const response = await fetch(`${API_BASE_URL}/user/receipts`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  getGovernoratesZones: async () => {
    const response = await fetch(`${API_BASE_URL}/user/governorates-zones`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  // Reports
  getReportsSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/summary`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  getReportsByMonth: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/by-month`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  getReportsByGovernorate: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/by-governorate`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  getReportsByMosque: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/by-mosque`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  getMaterialsByGovernorate: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/materials-by-governorate`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  searchReceipts: async (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/search-receipts?${queryParams}`, {
      headers: getHeaders(),
    });
    return response.json();
  },
};