import { useState, useCallback } from "react";
import toast from "react-hot-toast";

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
          toast.error(err.message || "An unexpected error occurred");
        }
        
        if (options.onError) options.onError(err);
        throw err;
      }
    },
    [asyncFn, options]
  );

  return { ...state, execute };
}
