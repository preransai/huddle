import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  pending = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6">
        <h2 className="type-h3">{title}</h2>
        <p className="mt-2 text-[15px] text-ink-2">{message}</p>
        <div className="mt-6 flex flex-col gap-3">
          {/* Danger fill is the pink x yellow overprint; it always carries riso-black text. */}
          <button type="button" onClick={onConfirm} disabled={pending} className="btn-danger py-3 disabled:opacity-70">
            {pending && <Spinner className="size-4" />}
            {confirmLabel}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary py-3">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
