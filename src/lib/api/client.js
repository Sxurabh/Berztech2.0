/**
 * Generic API fetch wrapper
 * @param {string} endpoint 
 * @param {RequestInit} options 
 */
async function fetchJson(endpoint, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Handle FormData (don't set Content-Type)
    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    }

    const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    // Handle empty responses (like 204 No Content for DELETE?)
    // But our API returns JSON even for delete usually. 
    // If explicit null/empty body, handle it:
    const text = await res.text();
    return text ? JSON.parse(text) : null;
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
        return fetchJson("/upload", {
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
