/**
 * useMpesa — React hook for calling M-Pesa API routes from client components.
 * Works with Next.js App Router (Client Components only).
 * @author lucysees
 */

"use client";

import { useState, useCallback } from "react";
import type {
  ApiResponse,
  STKPushRequestBody,
  STKPushResponse,
} from "@/lib/mpesa/types";

// ─── State shape ─────────────────────────────────────────────────────────────

interface MpesaState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ─── Generic fetch helper ────────────────────────────────────────────────────

async function callMpesaRoute<T>(
  path: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json: ApiResponse<T> = await response.json();
  return json;
}

// ─── STK Push hook ───────────────────────────────────────────────────────────

export function useSTKPush() {
  const [state, setState] = useState<MpesaState<STKPushResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const initiatePayment = useCallback(
    async (params: STKPushRequestBody): Promise<ApiResponse<STKPushResponse>> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await callMpesaRoute<STKPushResponse>(
          "/api/mpesa/stk-push",
          params as unknown as Record<string, unknown>
        );

        if (result.success) {
          setState({ data: result.data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: result.message });
        }

        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setState({ data: null, loading: false, error: message });
        return { success: false, message };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, initiatePayment, reset };
}

// ─── Generic M-Pesa action hook ──────────────────────────────────────────────

/**
 * A generic hook for any M-Pesa route that takes a POST body and returns JSON.
 * Use this for B2C, B2B, balance queries, etc.
 *
 * @example
 * const { execute, loading, error, data } = useMpesaAction<MyResponse>("/api/mpesa/b2c");
 */
export function useMpesaAction<T = unknown>(route: string) {
  const [state, setState] = useState<MpesaState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (body: Record<string, unknown>): Promise<ApiResponse<T>> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await callMpesaRoute<T>(route, body);

        if (result.success) {
          setState({ data: result.data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: result.message });
        }

        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setState({ data: null, loading: false, error: message });
        return { success: false, message };
      }
    },
    [route]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
