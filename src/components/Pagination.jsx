function Pagination({ page, onPageChange, hasNext = true, canGoBack = true }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        className="btn-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoBack || page <= 1}
      >
        Previous
      </button>

      <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
        Page {page}
      </span>

      <button
        type="button"
        className="btn-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
