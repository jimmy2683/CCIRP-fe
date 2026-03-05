const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// CCIRP Template Types
export interface Template {
    _id: string;
    name: string;
    category: string;
    channel: string;
    subject?: string;
    body_html: string;
    design_json?: any;
    version: number;
    created_at: string;
    updated_at: string;
    created_by: string;
    is_common: boolean;
}

export interface TemplateCreate {
    name: string;
    category: string;
    channel: string;
    subject?: string;
    body_html: string;
    design_json?: any;
    is_common?: boolean;
}

// User-provided Types
export interface UserProfileData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

// Simple in-memory cache
const apiCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

interface FetchOptions extends RequestInit {
    cacheTTL?: number;
    forceRefresh?: boolean;
}

export const clearApiCache = () => apiCache.clear();

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { cacheTTL, forceRefresh, ...fetchOptions } = options;
    let access_token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const isFormData = fetchOptions.body instanceof FormData;
    const headers: HeadersInit = {};

    if (access_token) (headers as any)['Authorization'] = `Bearer ${access_token}`;
    if (!isFormData) (headers as any)['Content-Type'] = 'application/json';

    const isGetRequest = !options.method || options.method === 'GET';
    const shouldCache = isGetRequest && cacheTTL !== undefined && cacheTTL > 0;
    const cacheKey = `${API_BASE_URL}${endpoint}`;

    if (shouldCache && !forceRefresh) {
        const cachedItem = apiCache.get(cacheKey);
        if (cachedItem && (Date.now() - cachedItem.timestamp < cacheTTL)) return cachedItem.data as T;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...fetchOptions, headers, credentials: 'include' });

    if (response.status === 401) {
        const refresh_token = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (refresh_token) {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refresh_token }),
            }).catch(() => null);

            if (refreshResponse?.ok) {
                const data = await refreshResponse.json();
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', data.access_token);
                    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
                }
                (headers as any)['Authorization'] = `Bearer ${data.access_token}`;
                response = await fetch(`${API_BASE_URL}${endpoint}`, { ...fetchOptions, headers, credentials: 'include' });
            }
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || errorData.detail || `Error ${response.status}`);
    }

    if (response.status == 204) return {} as T;
    const data = await response.json();
    if (shouldCache) apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

// API Modules
export const authAPI = {
    login: async (data: any) => {
        const formData = new URLSearchParams();
        formData.append('username', data.email);
        formData.append('password', data.password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Login failed');
        }

        return response.json();
    },
    register: async (data: any) => {
        return fetchAPI<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    getProfile: async () => {
        return fetchAPI<any>('/auth/me');
    },
};

export const templateAPI = {
    list: async (type?: string) => {
        const query = type ? `?type=${type}` : '';
        return fetchAPI<Template[]>(`/templates${query}`);
    },
    get: async (id: string) => {
        return fetchAPI<Template>(`/templates/${id}`);
    },
    create: async (data: TemplateCreate) => {
        return fetchAPI<Template>('/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update: async (id: string, data: Partial<TemplateCreate>) => {
        return fetchAPI<Template>(`/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return fetchAPI<{ message: string }>(`/templates/${id}`, {
            method: 'DELETE',
        });
    },
    preview: async (id: string, sampleData: Record<string, any>) => {
        return fetchAPI<{ rendered_body: string }>('/templates/preview', {
            method: 'POST',
            body: JSON.stringify({ template_id: id, sample_data: sampleData }),
        });
    },
    testSend: async (id: string, email: string, sampleData?: Record<string, any>) => {
        return fetchAPI<{ success: boolean; message: string; rendered_html?: string }>(`/templates/${id}/test-send`, {
            method: 'POST',
            body: JSON.stringify({ email, sample_data: sampleData }),
        });
    },
    getHistory: async (id: string) => {
        return fetchAPI<any[]>(`/templates/${id}/history`);
    },
    rollback: async (id: string, version: number) => {
        return fetchAPI<Template>(`/templates/${id}/rollback/${version}`, {
            method: 'POST',
        });
    },
    getAvailableFields: async () => {
        return fetchAPI<any[]>('/templates/fields');
    },
};

export const campaignAPI = {
    list: async () => {
        return fetchAPI<any[]>('/campaigns/');
    },
    get: async (id: string) => {
        return fetchAPI<any>(`/campaigns/${id}`);
    },
    create: async (data: any) => {
        return fetchAPI<any>('/campaigns/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
};

export const userAPI = {
    list: async () => {
        return fetchAPI<UserProfileData[]>('/users/');
    }
};

// Main Export
export const api = {
    auth: authAPI,
    templates: templateAPI,
    campaigns: campaignAPI,
    users: userAPI,
    // Discussion, Contest, etc. can be added as needed following this pattern
};

export default api;
