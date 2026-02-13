import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

export default function AppointmentConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  submitting = false,
  onConfirm,
  onClose,
}) {
  const confirmVariant = tone === "warning" ? "default" : tone;

  return (
    <Modal open={open} onClose={onClose} title={title} variant="dashboard" size="md">
      <div className="space-y-5">
        <p className="text-sm text-gray-700">{description}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            loading={submitting}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
