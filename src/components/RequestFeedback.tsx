export default function RequestFeedback({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading: boolean;
  error: string;
  empty?: string;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <p
        role="status"
        className="rounded-2xl border border-white/10 p-5 text-mint"
      >
        Carregando dados da API...
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-300/20 p-5 text-red-200"
      >
        <p className="break-words text-sm leading-6">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-full border border-red-200/40 px-4 py-2 text-sm font-semibold hover:bg-white/5"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  if (empty)
    return (
      <p className="rounded-2xl border border-white/10 p-5 text-muted">
        {empty}
      </p>
    );
  return null;
}
