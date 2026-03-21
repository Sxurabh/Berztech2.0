/**
 * Generic API fetch wrapper with retry logic
 * @param {string} endpoint 
 * @param {RequestInit} options 
 * @param {Object} retryOptions
 */
async function fetchWithRetry(endpoint, options = {}, retryOptions = {}) {
    const {
        maxRetries = 3,
        initialDelay = 100,
        backoffMultiplier = 2,
        retryableStatuses = [408, 429, 500, 502, 503, 504],
    } = retryOptions;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    }

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(`/api${endpoint}`, {
                ...options,
                headers,
            });

            if (!res.ok) {
                if (retryableStatuses.includes(res.status) && attempt < maxRetries) {
                    const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt - 1), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    lastError = new Error(`Request failed with status ${res.status}`);
                    continue;
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed with status ${res.status}`);
            }

            const text = await res.text();
            if (!text) return null;
            try {
                return JSON.parse(text);
            } catch {
                throw new Error('Failed to parse response');
            }
        } catch (error) {
            lastError = error;
            
            if (retryableStatuses.includes(error.response?.status) && attempt < maxRetries) {
                const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw error;
        }
    }

    throw lastError;
}

async function fetchJson(endpoint, options = {}) {
    return fetchWithRetry(endpoint, options);
}

export const projectsApi = {
    list: () => fetchJson("/projects"),
    get: (id) => fetchJson(`/projects/${id}`),
    create: (data) => fetchJson("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => fetchJson(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => fetchJson(`/projects/${id}`, { method: "DELETE" }),
};

export const blogApi = {
    list: () => fetchJson("/blog"),
    get: (id) => fetchJson(`/blog/${id}`),
    create: (data) => fetchJson("/blog", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => fetchJson(`/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => fetchJson(`/blog/${id}`, { method: "DELETE" }),
};

export const uploadApi = {
    upload: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return fetchWithRetry("/upload", {
            method: "POST",
            body: formData
        });
    }
};

export const testimonialsApi = {
    list: () => fetchJson("/testimonials"),
    get: (id) => fetchJson(`/testimonials/${id}`),
    create: (data) => fetchJson("/testimonials", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => fetchJson(`/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => fetchJson(`/testimonials/${id}`, { method: "DELETE" }),
};

export { fetchWithRetry, fetchJson };
