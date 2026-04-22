const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
}

export type CampaignChannel = 'email' | 'sms' | 'whatsapp';

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
    phone?: string | null;
    role: string;
    is_active: boolean;
}

export interface ConsentFlags {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
}

export interface EngagementStats {
    open_count_total: number;
    click_count_total: number;
    unique_open_campaigns: string[];
    unique_click_campaigns: string[];
    clicked_domains: string[];
    tag_scores: Record<string, number>;
    tag_interaction_counts: Record<string, number>;
    topic_scores: Record<string, number>;
    last_open_at: string | null;
    last_click_at: string | null;
}

export interface Recipient {
    id: string;
    user_id: string;
    email: string;
    phone: string | null;
    first_name: string;
    last_name: string | null;
    attributes: Record<string, any>;
    tags: string[];
    consent_flags: ConsentFlags;
    status: string;
    engagement: EngagementStats;
    created_at: string;
    updated_at: string;
}

export interface RecipientCreate {
    email: string;
    phone: string;
    first_name: string;
    last_name?: string;
    attributes?: Record<string, any>;
    tags?: string[];
    consent_flags?: ConsentFlags;
}

export interface RecipientUpdate extends Partial<RecipientCreate> {
    status?: string;
}

export interface StaticGroup {
    id: string;
    name: string;
    description: string | null;
    type: 'static';
    recipient_ids: string[];
    recipient_emails: string[];
    recipient_count: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface StaticGroupCreatePayload {
    name: string;
    description?: string | null;
    recipient_ids?: string[];
    import_group_ids?: string[];
}

export interface StaticGroupUpdatePayload extends Partial<StaticGroupCreatePayload> { }

export interface DynamicGroupPreference {
    id: string;
    tag: string;
    tag_key: string;
    top_k: number;
    min_interactions: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface DynamicGroupRequest {
    tag: string;
    top_k?: number;
    min_interactions?: number;
}

export interface DynamicGroupResolvedRecipient {
    id: string;
    email: string;
    name: string;
    dynamic_score: number;
    tag_score: number;
    interaction_count: number;
    delivery_count: number;
    campaign_touchpoints: number;
    unique_open_count: number;
    unique_click_count: number;
    last_open_at: string | null;
    last_click_at: string | null;
}

export interface DynamicGroupResolvedAudience {
    tag: string;
    tag_key: string;
    top_k: number;
    min_interactions: number;
    used_saved_top_k: boolean;
    total_eligible: number;
    recipients: DynamicGroupResolvedRecipient[];
}

export interface DynamicGroupResolveResponse {
    groups: DynamicGroupResolvedAudience[];
}

export interface Campaign {
    id: string;
    _id?: string;
    name: string;
    subject: string;
    template_id: string;
    channels: CampaignChannel[];
    tags: string[];
    group_ids?: string[];
    dynamic_groups?: DynamicGroupResolvedAudience[];
    status: string;
    recipients: string[];
    merge_data: Record<string, string>;
    scheduled_at?: string | null;
    queue_summary?: {
        algorithm_version?: string;
        total: number;
        queued: number;
        processing: number;
        completed: number;
        failed: number;
        cancelled: number;
        levels?: Record<string, number>;
        next_available_at?: string | null;
    };
    delivery_summary?: {
        total_attempts: number;
        failed_attempts: number;
        successful_attempts: number;
    };
    priority_algorithm_version?: string | null;
    queue_prepared_at?: string | null;
    dispatch_started_at?: string | null;
    dispatch_completed_at?: string | null;
    created_by: string;
    created_at: string;
}

export interface CampaignCreatePayload {
    name: string;
    subject: string;
    template_id: string;
    channels: CampaignChannel[];
    tags?: string[];
    group_ids?: string[];
    dynamic_groups?: DynamicGroupRequest[];
    recipients?: string[];
    merge_data?: Record<string, string>;
    scheduled_at?: string | null;
}

export interface CampaignRecipientAnalytics {
    email: string;
    name: string;
    status: string;
    delivery_status: string;
    open_count: number;
    click_count: number;
    unique_open_count: number;
    unique_click_count: number;
    opened_at: string | null;
    clicked_at: string | null;
}

export interface CampaignAnalyticsResponse {
    supports_open_tracking: boolean;
    metrics: {
        total_sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        total_opens: number;
        total_clicks: number;
        bounced: number;
        delivery_rate: number;
        open_rate: number;
        click_rate: number;
        bounce_rate: number;
    };
    timeline: Array<{
        time: string;
        opens: number;
        clicks: number;
    }>;
    recipients: CampaignRecipientAnalytics[];
}

export interface GroupCsvImportResult {
    matched_recipient_ids: string[];
    matched_recipient_emails: string[];
    matched_count: number;
    skipped_count: number;
    unmatched_rows: string[];
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
        let errorMsg = `Error ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorData.detail || errorMsg;
        } catch (e) {
            // If response is not JSON, we just use the status code message
        }

        // Standardize handling of invalid credentials
        if (response.status === 401 && (errorMsg.toLowerCase().includes("credentials") || errorMsg.toLowerCase().includes("validate"))) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }

        throw new Error(errorMsg);
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
    list: async (type?: string, skip: number = 0, limit: number = 100) => {
        const query = new URLSearchParams();
        if (type) query.append('type', type);
        query.append('skip', skip.toString());
        query.append('limit', limit.toString());
        return fetchAPI<PaginatedResponse<Template>>(`/templates?${query.toString()}`);
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
    list: async (skip: number = 0, limit: number = 100) => {
        return fetchAPI<PaginatedResponse<Campaign>>(`/campaigns/?skip=${skip}&limit=${limit}`);
    },
    get: async (id: string) => {
        return fetchAPI<Campaign>(`/campaigns/${id}`);
    },
    create: async (data: CampaignCreatePayload) => {
        return fetchAPI<Campaign>('/campaigns/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    getAnalytics: async (id: string) => {
        return fetchAPI<CampaignAnalyticsResponse>(`/campaigns/${id}/analytics`, {
            cacheTTL: DEFAULT_CACHE_TTL,
        });
    },
};

export const userAPI = {
    list: async (skip: number = 0, limit: number = 100) => {
        return fetchAPI<PaginatedResponse<UserProfileData>>(`/users/?skip=${skip}&limit=${limit}`);
    }
};

export const analyticsAPI = {
    getOverview: async () => {
        return fetchAPI<any>('/analytics/overview', {
            cacheTTL: DEFAULT_CACHE_TTL,
        });
    },
    getCampaignAnalytics: async (id: string) => {
        return fetchAPI<any>(`/analytics/campaigns/${id}`, {
            cacheTTL: DEFAULT_CACHE_TTL,
        });
    },
    exportCampaignAnalytics: async (id: string, name: string) => {
        const access_token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const headers: HeadersInit = {};
        if (access_token) (headers as any)['Authorization'] = `Bearer ${access_token}`;

        const response = await fetch(`${API_BASE_URL}/analytics/campaigns/${id}/export`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            let errorMsg = 'Failed to export analytics';
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campaign_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};

export const settingsAPI = {
    getProfile: async () => {
        return authAPI.getProfile();
    },
    updateProfile: async (data: { full_name?: string; phone?: string }) => {
        return fetchAPI<any>('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    changePassword: async (data: { current_password: string; new_password: string }) => {
        return fetchAPI<any>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

export const recipientAPI = {
    list: async (skip: number = 0, limit: number = 100) => {
        return fetchAPI<PaginatedResponse<Recipient>>(`/recipients/?skip=${skip}&limit=${limit}`);
    },
    get: async (id: string) => {
        return fetchAPI<Recipient>(`/recipients/${id}`);
    },
    create: async (data: RecipientCreate) => {
        return fetchAPI<Recipient>('/recipients/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update: async (id: string, data: RecipientUpdate) => {
        return fetchAPI<Recipient>(`/recipients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return fetchAPI<any>(`/recipients/${id}`, {
            method: 'DELETE',
        });
    },
    importCSV: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchAPI<{ success: number, skipped: number, errors: string[] }>('/recipients/bulk-import', {
            method: 'POST',
            body: formData,
        });
    }
};

export const groupAPI = {
    list: async (skip: number = 0, limit: number = 100) => {
        return fetchAPI<PaginatedResponse<StaticGroup>>(`/groups/?skip=${skip}&limit=${limit}`);
    },
    get: async (id: string) => {
        return fetchAPI<StaticGroup>(`/groups/${id}`);
    },
    create: async (data: StaticGroupCreatePayload) => {
        return fetchAPI<StaticGroup>('/groups/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    update: async (id: string, data: StaticGroupUpdatePayload) => {
        return fetchAPI<StaticGroup>(`/groups/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return fetchAPI<any>(`/groups/${id}`, {
            method: 'DELETE',
        });
    },
    importCSV: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetchAPI<GroupCsvImportResult>('/groups/import-csv', {
            method: 'POST',
            body: formData,
        });
    },
    listDynamicPreferences: async () => {
        return fetchAPI<DynamicGroupPreference[]>('/groups/dynamic/preferences');
    },
    saveDynamicPreference: async (data: DynamicGroupRequest & { top_k: number }) => {
        return fetchAPI<DynamicGroupPreference>('/groups/dynamic/preferences', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    resolveDynamicGroups: async (groups: DynamicGroupRequest[]) => {
        return fetchAPI<DynamicGroupResolveResponse>('/groups/dynamic/resolve', {
            method: 'POST',
            body: JSON.stringify({ groups }),
        });
    },
};

// Main Export
export const api = {
    auth: authAPI,
    templates: templateAPI,
    campaigns: campaignAPI,
    users: userAPI,
    analytics: analyticsAPI,
    settings: settingsAPI,
    recipients: recipientAPI,
    groups: groupAPI,
};

export default api;
