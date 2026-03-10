import { useToast } from "../context/ToastContext";

const toastColors = {
  success: "border-emerald-700 bg-emerald-900/40 text-emerald-200",
  error: "border-red-700 bg-red-900/40 text-red-200",
  info: "border-blue-700 bg-blue-900/40 text-blue-200",
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
