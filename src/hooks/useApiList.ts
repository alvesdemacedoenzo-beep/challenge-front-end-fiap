import { useEffect, useState } from "react";

export default function useApiList<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    load()
      .then((values) => {
        if (active) setItems(values);
      })
      .catch((cause: unknown) => {
        if (active) {
          setItems([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível consultar os dados.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, attempt]);

  return {
    items,
    loading,
    error,
    reload: () => setAttempt((value) => value + 1),
  };
}
