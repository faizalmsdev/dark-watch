const API_BASE_URL = 'http://209.74.95.163:5000';

export interface User {
  user_id: string;
  email: string;
  created_at: string;
  last_login?: string;
  total_jobs?: number;
  running_jobs?: number;
  total_changes?: number;
}

export interface Job {
  job_id: string;
  user_id: string;
  name: string;
  url: string;
  check_interval_minutes: number;
  created_at: string;
  status: 'created' | 'running' | 'paused' | 'stopped' | 'error';
  last_check?: string;
  total_checks: number;
  changes_detected: number;
  error_message?: string;
}

export interface JobResult {
  type: string;
  description: string;
  old_content?: string;
  new_content?: string;
  detected_at: string;
  ai_analysis?: {
    new_companies_detected: boolean;
    companies: string[];
    summary: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string; // The user_id token for API access
}

class ApiClient {
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearStoredToken(): void {
    localStorage.removeItem('auth_token');
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private setStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearStoredUser(): void {
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return this.getStoredToken() !== null;
  }

  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getStoredToken();
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies for session-based auth as fallback
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add token authentication if we have a token and it's not a login/register endpoint
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`, // Using Bearer token method
        // Alternative methods (uncomment to use instead):
        // 'X-User-Token': token,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.clearStoredToken();
          this.clearStoredUser();
          throw new Error('Authentication failed. Please login again.');
        }
        
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        // Re-throw auth errors
        throw error;
      }
      // Handle network errors
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Auth endpoints
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      this.setStoredToken(response.token);
      this.setStoredUser(response.user);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      this.setStoredToken(response.token);
      this.setStoredUser(response.user);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request<ApiResponse>('/api/auth/logout', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.warn('Logout request failed:', error);
      return { success: false, message: 'Logout request failed but local session cleared' };
    } finally {
      // Always clear local storage on logout
      this.clearStoredToken();
      this.clearStoredUser();
    }
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/api/auth/profile');
  }

  // Job endpoints
  async createJob(name: string, url: string, check_interval_minutes: number): Promise<ApiResponse<{ job: Job }>> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify({ name, url, check_interval_minutes }),
    });
  }

  async getJobs(): Promise<ApiResponse<{ jobs: Job[]; total: number }>> {
    return this.request('/api/jobs');
  }

  async getJob(jobId: string): Promise<ApiResponse<{ job: Job }>> {
    return this.request(`/api/jobs/${jobId}`);
  }

  async startJob(jobId: string, apiKey?: string): Promise<ApiResponse<{ job: Job }>> {
    return this.request(`/api/jobs/${jobId}/start`, {
      method: 'POST',
      body: JSON.stringify(apiKey ? { api_key: apiKey } : {}),
    });
  }

  async stopJob(jobId: string): Promise<ApiResponse<{ job: Job }>> {
    return this.request(`/api/jobs/${jobId}/stop`, {
      method: 'POST',
    });
  }

  async pauseJob(jobId: string): Promise<ApiResponse<{ job: Job }>> {
    return this.request(`/api/jobs/${jobId}/pause`, {
      method: 'POST',
    });
  }

  async deleteJob(jobId: string): Promise<ApiResponse> {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  async getJobResults(jobId: string, limit?: number): Promise<ApiResponse<{ results: JobResult[]; total_results: number }>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/api/jobs/${jobId}/results${params}`);
  }

  async getJobStats(jobId: string): Promise<ApiResponse> {
    return this.request(`/api/jobs/${jobId}/stats`);
  }

  // System endpoints
  async getStatus(): Promise<ApiResponse> {
    return this.request('/api/status');
  }

  async getHealth(): Promise<ApiResponse> {
    return this.request('/api/health');
  }

  // Utility methods
  getAuthToken(): string | null {
    return this.getStoredToken();
  }

  // Manual token login (if you get a token from elsewhere)
  loginWithToken(token: string, user: User): void {
    this.setStoredToken(token);
    this.setStoredUser(user);
  }

  // Check if current token is valid
  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch {
      this.clearStoredToken();
      this.clearStoredUser();
      return false;
    }
  }
}

export const apiClient = new ApiClient();

// Optional: Auto-validate token on app start
export const initializeAuth = async (): Promise<boolean> => {
  if (apiClient.isAuthenticated()) {
    return await apiClient.validateToken();
  }
  return false;
};
