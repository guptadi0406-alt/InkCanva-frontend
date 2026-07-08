
import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://inkcanva-backend.onrender.com/api";
export const SOCKET_URL = API_BASE_URL.replace("/api", "");


export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor to automatically add the Authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('whiteboard_user_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle 401 and 403 errors by redirecting to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem("whiteboard_user_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const isTokenExpired = () => {
    const token = localStorage.getItem('whiteboard_user_token');
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() > payload.exp * 1000;
    } catch {
        return true;
    }
};

export const updateCanvasData = async (canvasId, elements) => {
    if (!canvasId) {
        return;
    }
    try {
        const cleanElements = elements.map((el) => {
            const copy = { ...el };
            delete copy.roughElement;
            delete copy.path;
            return copy;
        });

        const response = await api.put(
            `/canvas/updatecanvas`,
            { canvasId, elements: cleanElements }
        );

        return response.data;

    } catch (error) {
        console.error("Error updating canvas:", error);
    }
}

export const fetchInitialCanvasElements = async (canvasId) => {
    try {
        const response = await api.get(`/canvas/load/${canvasId}`);
        return response.data.elements;
    } catch (error) {
        console.error("Error fetching initial canvas elements:", error);
    }
}