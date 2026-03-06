"use client";

import { useCallback, useEffect, useState } from "react";

interface UseResourceOptions {
  query?: string;
  autoLoad?: boolean;
}

export function useResource<T extends { id: string }>(
  endpoint: string,
  options: UseResourceOptions = {},
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState(options.query ?? "");

  const load = useCallback(
    async (queryOverride?: string) => {
      const query = queryOverride ?? activeQuery;

      if (queryOverride !== undefined) {
        setActiveQuery(queryOverride);
      }

      setLoading(true);
      setError("");

      try {
        const queryPrefix = query ? `?${query}` : "";
        const response = await fetch(`${endpoint}${queryPrefix}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Falha ao carregar dados.");
          setLoading(false);
          return;
        }

        setData(payload.data ?? []);
      } catch (requestError) {
        setError(String(requestError));
      } finally {
        setLoading(false);
      }
    },
    [activeQuery, endpoint],
  );

  useEffect(() => {
    if (options.autoLoad === false) {
      return;
    }

    void load(options.query);
  }, [load, options.autoLoad, options.query]);

  async function create(payload: Record<string, unknown>) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error ?? "Falha ao criar registro.");
    }

    await load(activeQuery);
  }

  async function update(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`${endpoint}?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error ?? "Falha ao atualizar registro.");
    }

    await load(activeQuery);
  }

  async function remove(id: string) {
    const response = await fetch(`${endpoint}?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error ?? "Falha ao remover registro.");
    }

    await load(activeQuery);
  }

  return {
    data,
    loading,
    error,
    load,
    create,
    update,
    remove,
  };
}
