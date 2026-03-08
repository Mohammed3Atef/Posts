function Pagination({ page, onPageChange, hasNext = true, canGoBack = true }) {
  const shouldShowPagination = hasNext || canGoBack || page > 1;
  if (!shouldShowPagination) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoBack || page <= 1}
      >
        Previous
      </button>

      <span className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-200">
        Page {page}
      </span>

      <button
        type="button"
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
