import { useToast } from '../context/ToastContext';

const toastColors = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  error: 'border-rose-300 bg-rose-50 text-rose-800',
  info: 'border-indigo-300 bg-indigo-50 text-indigo-800',
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[92vw] max-w-sm flex-col gap-2 sm:w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-sm ${
            toastColors[toast.type] || toastColors.info
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              className="text-xs font-semibold opacity-70 hover:opacity-100"
              onClick={() => removeToast(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
