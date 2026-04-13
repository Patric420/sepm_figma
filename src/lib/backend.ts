/**
 * Backend Service communicating with the local Node.js/Express API.
 * Uses JWT for authenticating sessions.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const backend = {
  
  /**
   * Logs in a user via the backend API.
   */
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Login failed.");
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  },

  /**
   * Registers a new user.
   */
  async signup(name: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Signup failed.");
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  },

  /**
   * Fetches the currently authenticated user if token exists.
   */
  async me(): Promise<User | null> {
    if (!localStorage.getItem('token')) return null;

    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      // Token invalid or expired
      localStorage.removeItem('token');
      return null;
    }

    const data = await response.json();
    return data.user;
  },

  /**
   * Simulates logging out on the frontend by destroying the local token.
   */
  async logout(): Promise<void> {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  /**
   * Submits an email to the lead list via the backend component.
   */
  async submitLead(email: string): Promise<{ success: boolean; id: string }> {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to submit lead. Please try again.");
    }

    return await response.json();
  },

  /**
   * Generates a Statement of Work from a meeting transcript.
   */
  async generateSOW(transcript: string): Promise<{ sow: string }> {
    const response = await fetch(`${API_URL}/sow/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transcript })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to generate SOW.");
    }

    return await response.json();
  }
};
