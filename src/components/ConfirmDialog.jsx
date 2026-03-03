function ConfirmDialog({
  open,
  title = 'Please confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="btn-danger px-4 py-2 text-sm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
