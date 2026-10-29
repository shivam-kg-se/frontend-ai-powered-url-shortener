import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    const storedToken = window.localStorage.getItem("JWT_TOKEN");
    const token = storedToken ? JSON.parse(storedToken) : null;

    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || "";

        if (
            error.response?.status === 401 &&
            !requestUrl.includes("/api/auth/public/")
        ) {
            window.localStorage.removeItem("JWT_TOKEN");
            window.dispatchEvent(new Event("linklytics:unauthorized"));
        }

        return Promise.reject(error);
    }
);

export default api;