"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchAdminPayload, safeAdminErrorMessage, type AdminPayload } from "@/lib/admin";

interface UseAdminDataState {
  data: AdminPayload | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export function useAdminData(): UseAdminDataState {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await fetchAdminPayload();
      setData(payload);
    } catch (loadError) {
      setError(safeAdminErrorMessage(loadError));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
