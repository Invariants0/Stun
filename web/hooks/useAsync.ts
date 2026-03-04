import { useState, useCallback } from "react";
import { useToastStore } from "@/store/toast.store";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
  } = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { addToast } = useToastStore();

  const execute = useCallback(
    async (...args: Args) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });
        if (options.onSuccess) options.onSuccess(data);
        return data;
      } catch (error: any) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        
        if (options.showToast !== false) {
          addToast(err.message || "An unexpected error occurred", "error");
        }
        
        if (options.onError) options.onError(err);
        throw err;
      }
    },
    [asyncFn, options, addToast]
  );

  return { ...state, execute };
}
