/**
 * Central API Client with retry logic and error normalization
 * 
 * Features:
 * - Axios with automatic Bearer token injection
 * - 3 retry attempts with exponential backoff
 * - Normalized error responses
 * - TypeScript-safe request/response types
 */

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getStoredToken } from "@/lib/auth";

// ============================================================================
// Error Response Type
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
}

// ============================================================================
// Axios Instance Configuration
// ============================================================================

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: attach Firebase ID token
  client.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // dev log
    if (process.env.NODE_ENV !== "production") {
      console.log("[api] request", config.method, config.url, config.data || "");
    }
    return config;
  });

  // Response interceptor: normalize errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const normalized = normalizeError(error);
      return Promise.reject(normalized);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// ============================================================================
// Error Normalization
// ============================================================================

function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    // Server responded with error status
    const data = error.response.data as any;
    return {
      error: data?.error || `HTTP ${error.response.status}`,
      message: data?.message || error.message || "Server error occurred",
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      error: "NetworkError",
      message: "No response from server. Please check your connection.",
    };
  } else {
    // Error in request setup
    return {
      error: "RequestError",
      message: error.message || "Failed to make request",
    };
  }
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as ApiError;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (lastError.error.startsWith("HTTP 4") && lastError.error !== "HTTP 429") {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// Typed API Methods
// ============================================================================

export const api = {
  /**
   * GET request with retry
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return retryRequest(async () => {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    });
  },

  /**
   * POST request with retry
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return retryRequest(async () => {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    });
  },

  /**
   * PUT request with retry
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return retryRequest(async () => {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    });
  },

  /**
   * PATCH request with retry
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return retryRequest(async () => {
      const response = await apiClient.patch<T>(url, data, config);
      return response.data;
    });
  },

  /**
   * DELETE request with retry
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return retryRequest(async () => {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    });
  },
};
