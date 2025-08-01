const API_BASE_URL = 'http://localhost:8000';

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

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string): Promise<ApiResponse<{ user: User }>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
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
}

export const apiClient = new ApiClient();