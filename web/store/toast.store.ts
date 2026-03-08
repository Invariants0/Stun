/**
 * Toast Store — Toast Notification State Management
 *
 * Manages toast notifications for user feedback (success, error, info, warning)
 */
import { create } from "zustand";

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number; // ms, defaults to 5000
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'info', title, duration) => {
    const id = `toast-${++toastCounter}`;
    const toastDuration = duration ?? 5000; // Ensure it's never undefined
    const newToast: Toast = {
      id,
      type,
      message,
      title,
      createdAt: Date.now(),
      duration: toastDuration,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto-remove after duration
    if (toastDuration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toastDuration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for common toast types
export const toast = {
  success: (message: string, title?: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'success', title, duration),
    
  error: (message: string, title?: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'error', title, duration),
    
  info: (message: string, title?: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'info', title, duration),
    
  warning: (message: string, title?: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'warning', title, duration),
};