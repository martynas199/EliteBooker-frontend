import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function UnsavedChangesModal({
  isOpen,
  onStay,
  onDiscard,
  title = "Discard unsaved changes?",
  message = "You have unsaved changes. If you leave now, those changes will be lost.",
  discardLabel = "Discard changes",
  stayLabel = "Keep editing",
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onStay}
      title={title}
      size="sm"
      variant="dashboard"
      fullScreen={false}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onStay}>
            {stayLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onDiscard}>
            {discardLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">{message}</p>
    </Modal>
  );
}