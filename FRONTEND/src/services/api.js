import axios from "axios";

const API = axios.create({
  baseURL:"https://skitzoo-1.onrender.com/api"||"http://localhost:5000/api",
});

// Track if we're already handling logout to prevent infinite loops
let isLoggingOut = false;

// Request interceptor: Add token to all requests
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors and auto-logout
API.interceptors.response.use(
  (response) => {
    // Success response - pass through
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Check if this is a token expiration error
      const isTokenExpired = error.response?.data?.code === "TOKEN_EXPIRED" || 
                            error.response?.data?.msg?.toLowerCase().includes("expired");

      // Prevent infinite retry loops
      if (!originalRequest._retry && !isLoggingOut) {
        originalRequest._retry = true;
        isLoggingOut = true;

        // Clear token from localStorage
        localStorage.removeItem("token");

        // Clear any other auth-related data
        localStorage.removeItem("user");
        localStorage.removeItem("chat_bg");

        // Only redirect if we're not already on login/signup page
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
          // Use setTimeout to avoid navigation during render
          setTimeout(() => {
            window.location.href = "/login";
          }, 100);
        }

        // Reject the promise to stop further processing
        return Promise.reject({
          ...error,
          message: isTokenExpired 
            ? "Your session has expired. Please login again." 
            : "Unauthorized. Please login again.",
          isTokenExpired
        });
      }
    }

    // Handle 404 errors
    if (error.response?.status === 404) {
      console.error("API 404 Error:", error.config?.url, error.response?.data);
    }

    // For all other errors, reject normally
    return Promise.reject(error);
  }
);

export default API;
