import { useCallback, useEffect, useRef, useState } from "react";
import { getCompraDetalle } from "../api/ventas";

export default function useCompraStatus(compraId, token) {
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollRef = useRef({ timerId: null, attempts: 0 });

  const clearPolling = useCallback(() => {
    if (pollRef.current.timerId) {
      clearTimeout(pollRef.current.timerId);
      pollRef.current.timerId = null;
    }
    pollRef.current.attempts = 0;
    setIsPolling(false);
  }, []);

  const fetchDetail = useCallback(async () => {
    if (!compraId) return null;
    const data = await getCompraDetalle(compraId, token);
    setCompra(data);
    return data;
  }, [compraId, token]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!compraId) {
        setCompra(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      clearPolling();

      try {
        const detail = await fetchDetail();
        if (cancelled || !detail) return;

        if (detail.estado === "CONFIRMADA") {
          setIsPolling(true);

          const poll = async () => {
            if (cancelled) return;

            try {
              const next = await getCompraDetalle(compraId, token);
              if (cancelled) return;

              setCompra(next);

              if (next.estado === "RECHAZADA") {
                clearPolling();
                return;
              }

              pollRef.current.attempts += 1;
              if (pollRef.current.attempts >= 10) {
                clearPolling();
                return;
              }

              pollRef.current.timerId = setTimeout(poll, 1000);
            } catch (err) {
              if (cancelled) return;
              setError(err);
              clearPolling();
            }
          };

          pollRef.current.timerId = setTimeout(poll, 1000);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      clearPolling();
    };
  }, [compraId, token, clearPolling, fetchDetail]);

  return {
    compra,
    loading,
    error,
    isPolling,
    refresh: fetchDetail
  };
}
