const toneStyles = {
  info: {
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-700',
    confirmBtn: 'bg-sky-600 hover:bg-sky-700'
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700'
  },
  danger: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-700',
    confirmBtn: 'bg-red-600 hover:bg-red-700'
  },
  success: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700'
  }
};

const SoftPopup = ({
  open,
  title = 'Please Confirm',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  tone = 'info',
  busy = false,
  onConfirm,
  onClose
}) => {
  if (!open) return null;

  const styles = toneStyles[tone] || toneStyles.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.iconBg} ${styles.iconText}`}>
            !
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          {showCancel ? (
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${styles.confirmBtn}`}
          >
            {busy ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoftPopup;
